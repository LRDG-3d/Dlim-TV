package com.lrdg.dlimtv;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;
import com.getcapacitor.JSObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// Descarga episodios dentro de la app, uno a la vez, con notificación celeste (progreso, velocidad, pausar y cancelar).
public class DownloadService extends Service {
  static final String ACT_START = "DLIM_START", ACT_PAUSE = "DLIM_PAUSE", ACT_CANCEL = "DLIM_CANCEL";
  static final String CH = "dlim_dl", CH_DONE = "dlim_done";
  static final int NOTIF_ID = 4001;
  static final int SKY = 0xFF38BDF8;

  static class Task {
    String id, url = "", err = "";
    volatile String state = "queued";
    volatile long done, total;
    volatile double speed;
  }

  interface Sink { void emit(JSObject o); }

  static final Map<String, Task> TASKS = new ConcurrentHashMap<>();
  static final ExecutorService EXEC = Executors.newSingleThreadExecutor();
  static volatile Sink sink;

  static File dir(Context c) {
    File d = c.getExternalFilesDir("downloads");
    if (d == null) d = new File(c.getFilesDir(), "downloads");
    d.mkdirs();
    return d;
  }

  static String clean(String n) { return n.replaceAll("[\\\\/:*?\"<>|]", "_"); }

  static JSObject json(Task t) {
    JSObject o = new JSObject();
    o.put("id", t.id); o.put("url", t.url); o.put("state", t.state);
    o.put("done", t.done); o.put("total", t.total); o.put("speed", t.speed); o.put("error", t.err);
    return o;
  }

  static void emit(Task t) { Sink s = sink; if (s != null) s.emit(json(t)); }

  static Task current() {
    Task q = null, p = null;
    for (Task t : TASKS.values()) {
      if ("downloading".equals(t.state)) return t;
      if ("queued".equals(t.state) && q == null) q = t;
      if ("paused".equals(t.state) && p == null) p = t;
    }
    return q != null ? q : p;
  }

  @Override public IBinder onBind(Intent i) { return null; }

  @Override public void onCreate() {
    super.onCreate();
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationManager nm = getSystemService(NotificationManager.class);
      nm.createNotificationChannel(new NotificationChannel(CH, "Descargas", NotificationManager.IMPORTANCE_LOW));
      nm.createNotificationChannel(new NotificationChannel(CH_DONE, "Descargas completas", NotificationManager.IMPORTANCE_DEFAULT));
    }
  }

  @Override public int onStartCommand(Intent i, int flags, int startId) {
    String a = i == null ? null : i.getAction();
    String id = i == null ? null : i.getStringExtra("id");
    if (ACT_START.equals(a) && id != null) {
      Task t = TASKS.get(id);
      boolean go = false;
      if (t == null) { t = new Task(); t.id = id; TASKS.put(id, t); go = true; }
      else if ("paused".equals(t.state) || "error".equals(t.state) || "canceled".equals(t.state)) go = true;
      String url = i.getStringExtra("url");
      if (url != null && !url.isEmpty()) t.url = url;
      if (go) { t.state = "queued"; t.err = ""; final Task tt = t; EXEC.submit(() -> run(tt)); }
      Task cur = current();
      ServiceCompat.startForeground(this, NOTIF_ID, build(cur != null ? cur : t), ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
      emit(t);
    } else if (ACT_PAUSE.equals(a) && id != null) {
      Task t = TASKS.get(id);
      if (t != null && ("downloading".equals(t.state) || "queued".equals(t.state))) { t.state = "paused"; emit(t); }
    } else if (ACT_CANCEL.equals(a) && id != null) {
      Task t = TASKS.get(id);
      if (t != null) { t.state = "canceled"; emit(t); TASKS.remove(id); }
      new File(dir(this), id + ".part").delete();
    }
    refresh();
    return START_NOT_STICKY;
  }

  void refresh() {
    Task cur = current();
    if (cur == null) {
      ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
      stopSelf();
      return;
    }
    getSystemService(NotificationManager.class).notify(NOTIF_ID, build(cur));
  }

  void run(Task t) {
    if (!"queued".equals(t.state)) return;
    t.state = "downloading"; t.speed = 0; emit(t); refresh();
    File d = dir(this);
    File part = new File(d, t.id + ".part"), out = new File(d, t.id);
    HttpURLConnection c = null;
    try {
      long have = part.exists() ? part.length() : 0;
      c = (HttpURLConnection) new URL(t.url).openConnection();
      c.setConnectTimeout(15000); c.setReadTimeout(20000);
      c.setRequestProperty("User-Agent", "DlimTV");
      if (have > 0) c.setRequestProperty("Range", "bytes=" + have + "-");
      int code = c.getResponseCode();
      if (code == 416) { part.delete(); t.state = "queued"; EXEC.submit(() -> run(t)); return; }
      if (code != 200 && code != 206) throw new IOException("HTTP " + code);
      boolean append = code == 206;
      if (!append) have = 0;
      long len = c.getContentLengthLong();
      t.done = have; t.total = len > 0 ? len + have : 0;
      try (InputStream in = c.getInputStream(); FileOutputStream fo = new FileOutputStream(part, append)) {
        byte[] buf = new byte[65536]; int n;
        long lt = System.currentTimeMillis(), lb = t.done;
        while ((n = in.read(buf)) > 0 && "downloading".equals(t.state)) {
          fo.write(buf, 0, n); t.done += n;
          long now = System.currentTimeMillis();
          if (now - lt >= 700) {
            double s = (t.done - lb) * 1000.0 / (now - lt);
            t.speed = t.speed == 0 ? s : t.speed * 0.6 + s * 0.4;
            lt = now; lb = t.done;
            emit(t); refresh();
          }
        }
      }
      if (!"downloading".equals(t.state)) { if ("canceled".equals(t.state)) part.delete(); return; }
      if (t.total > 0 && t.done < t.total) throw new IOException("Conexión interrumpida");
      if (out.exists()) out.delete();
      if (!part.renameTo(out)) throw new IOException("No se pudo guardar el archivo");
      t.state = "done"; t.speed = 0; emit(t); notifyEnd(t, true);
    } catch (Exception e) {
      if ("downloading".equals(t.state)) { t.state = "error"; t.err = String.valueOf(e.getMessage()); emit(t); notifyEnd(t, false); }
    } finally {
      if (c != null) c.disconnect();
      refresh();
    }
  }

  PendingIntent openApp() {
    Intent open = new Intent(this, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    return PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
  }

  PendingIntent act(String a, Task t) {
    Intent i = new Intent(this, DownloadService.class).setAction(a).putExtra("id", t.id).putExtra("url", t.url);
    return PendingIntent.getService(this, (a + t.id).hashCode(), i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
  }

  Notification build(Task t) {
    boolean paused = "paused".equals(t.state), queued = "queued".equals(t.state);
    int pct = t.total > 0 ? (int) (t.done * 100 / t.total) : 0;
    String txt;
    if (paused) txt = "Pausado · " + pct + "%";
    else if (queued) txt = "En cola";
    else txt = (t.total > 0 ? pct + "% · " : "") + speed(t.speed) + " · " + mb(t.done) + (t.total > 0 ? " / " + mb(t.total) : "");
    return new NotificationCompat.Builder(this, CH)
      .setSmallIcon(android.R.drawable.stat_sys_download)
      .setContentTitle(t.id.replaceAll("\\.zip$", ""))
      .setContentText(txt)
      .setProgress(100, pct, t.total <= 0 && !paused)
      .setOngoing(true).setOnlyAlertOnce(true)
      .setColor(SKY).setColorized(true)
      .setContentIntent(openApp())
      .addAction(0, paused ? "Reanudar" : "Pausar", act(paused ? ACT_START : ACT_PAUSE, t))
      .addAction(0, "Cancelar", act(ACT_CANCEL, t))
      .build();
  }

  void notifyEnd(Task t, boolean ok) {
    Notification n = new NotificationCompat.Builder(this, CH_DONE)
      .setSmallIcon(ok ? android.R.drawable.stat_sys_download_done : android.R.drawable.stat_notify_error)
      .setContentTitle(ok ? "Descarga completa" : "Error al descargar")
      .setContentText(t.id.replaceAll("\\.zip$", ""))
      .setColor(SKY).setAutoCancel(true).setContentIntent(openApp())
      .build();
    getSystemService(NotificationManager.class).notify(t.id.hashCode(), n);
  }

  static String mb(long b) { return String.format(Locale.US, "%.1f MB", b / 1048576.0); }
  static String speed(double s) {
    return s >= 1048576 ? String.format(Locale.US, "%.1f MB/s", s / 1048576.0) : String.format(Locale.US, "%.0f KB/s", s / 1024.0);
  }
}
