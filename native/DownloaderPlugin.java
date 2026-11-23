package com.lrdg.dlimtv;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import java.net.URLConnection;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.File;
import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "Downloader", permissions = {
  @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications")
})
public class DownloaderPlugin extends Plugin {
  @Override public void load() {
    DownloadService.sink = o -> notifyListeners("progress", o);
  }

  @PluginMethod public void start(PluginCall call) {
    if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
      requestPermissionForAlias("notifications", call, "permDone");
    } else go(call);
  }

  @PermissionCallback private void permDone(PluginCall call) { go(call); }

  private void go(PluginCall call) {
    String id = call.getString("id"), url = call.getString("url");
    if (id == null || url == null) { call.reject("Faltan datos"); return; }
    DownloadService.enqueue(getContext(), id, url, null, null, null);
    call.resolve();
  }

  private void send(String action, PluginCall call) {
    String id = call.getString("id");
    if (id == null) { call.reject("Falta id"); return; }
    Intent i = new Intent(getContext(), DownloadService.class).setAction(action).putExtra("id", DownloadService.clean(id));
    try { getContext().startService(i); } catch (Exception e) { /* servicio no disponible */ }
    call.resolve();
  }

  @PluginMethod public void pause(PluginCall call) { send(DownloadService.ACT_PAUSE, call); }
  @PluginMethod public void cancel(PluginCall call) { send(DownloadService.ACT_CANCEL, call); }

  @PluginMethod public void remove(PluginCall call) {
    String id = call.getString("id");
    if (id == null) { call.reject("Falta id"); return; }
    id = DownloadService.clean(id);
    DownloadService.Task t = DownloadService.TASKS.remove(id);
    if (t != null) t.state = "canceled";
    File d = DownloadService.dir(getContext());
    new File(d, id).delete();
    new File(d, id + ".part").delete();
    getContext().getSharedPreferences("dlim_dl", Context.MODE_PRIVATE).edit().remove(id).apply();
    call.resolve();
  }

  @PluginMethod public void list(PluginCall call) {
    JSArray arr = new JSArray();
    Set<String> seen = new HashSet<>();
    for (DownloadService.Task t : DownloadService.TASKS.values()) { arr.put(DownloadService.json(t)); seen.add(t.id); }
    File[] fs = DownloadService.dir(getContext()).listFiles();
    if (fs != null) {
      for (File f : fs) {
        String n = f.getName();
        boolean part = n.endsWith(".part");
        String id = part ? n.substring(0, n.length() - 5) : n;
        if (seen.contains(id)) continue;
        seen.add(id);
        JSObject o = new JSObject();
        o.put("id", id);
        o.put("url", getContext().getSharedPreferences("dlim_dl", Context.MODE_PRIVATE).getString(id, ""));
        o.put("state", part ? "paused" : "done");
        o.put("done", f.length());
        o.put("total", part ? 0 : f.length());
        o.put("speed", 0);
        arr.put(o);
      }
    }
    JSObject r = new JSObject();
    r.put("items", arr);
    call.resolve(r);
  }

  @PluginMethod public void openBrowser(PluginCall call) {
    String url = call.getString("url", "");
    Intent i = new Intent(getContext(), BrowserActivity.class).putExtra("url", url);
    getActivity().startActivity(i);
    call.resolve();
  }

  @PluginMethod public void open(PluginCall call) {
    String id = call.getString("id");
    if (id == null) { call.reject("Falta id"); return; }
    File f = new File(DownloadService.dir(getContext()), DownloadService.clean(id));
    if (!f.exists()) { call.reject("El archivo no existe"); return; }
    try {
      Uri u = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
      String mime = URLConnection.guessContentTypeFromName(f.getName());
      if (mime == null) mime = f.getName().toLowerCase().endsWith(".zip") ? "application/zip" : "video/*";
      Intent v = new Intent(Intent.ACTION_VIEW).setDataAndType(u, mime).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      Intent ch = Intent.createChooser(v, "Abrir con…");
      ch.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      getActivity().startActivity(ch);
      call.resolve();
    } catch (Exception e) { call.reject("No hay una app para abrir este archivo"); }
  }
}
