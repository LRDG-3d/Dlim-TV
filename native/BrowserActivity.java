package com.lrdg.dlimtv;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Navegador propio: detecta videos (no YouTube) y ofrece descargar en Dlim TV, abrir en 1DM/ADM u otro, o copiar el enlace.
public class BrowserActivity extends AppCompatActivity {
  static final int SKY = 0xFF00E8FF;
  static final String SCAN =
    "(function(){if(window.__dlimScan)return;"
    + "function add(u){try{if(u&&!/^(blob:|data:)/.test(u))Dlim.found(new URL(u,location.href).href)}catch(e){}}"
    + "window.__dlimScan=function(){document.querySelectorAll('video,video source').forEach(function(el){add(el.currentSrc||el.src||el.getAttribute('src'))})};"
    + "setInterval(window.__dlimScan,2000);window.__dlimScan();})();";

  static class Item {
    String url, type, name;
    Item(String u, String t) { url = u; type = t; }
  }

  public class Bridge {
    @JavascriptInterface public void found(String u) { runOnUiThread(() -> addUrl(u, true)); }
  }

  final List<Item> found = new ArrayList<>();
  WebView web;
  EditText urlBox;
  ProgressBar bar;
  TextView fab, backBtn, fwdBtn;
  FrameLayout root;
  LinearLayout col;
  View customView;
  WebChromeClient.CustomViewCallback customCb;

  int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }

  TextView btn(String text) {
    TextView t = new TextView(this);
    t.setText(text); t.setTextColor(Color.WHITE); t.setTextSize(22); t.setGravity(Gravity.CENTER);
    t.setLayoutParams(new LinearLayout.LayoutParams(dp(42), dp(42)));
    return t;
  }

  static boolean blocked(String l) {
    return l.contains("youtube.com") || l.contains("youtu.be") || l.contains("googlevideo.com") || l.contains("ytimg.com");
  }

  static String kind(String u) {
    String l = u.toLowerCase(Locale.ROOT);
    if (blocked(l)) return null;
    int q = l.indexOf('?'); String p = q >= 0 ? l.substring(0, q) : l;
    int h = p.indexOf('#'); if (h >= 0) p = p.substring(0, h);
    if (p.endsWith(".m3u8")) return "hls";
    if (p.endsWith(".mpd")) return "dash";
    for (String e : new String[] { ".mp4", ".m4v", ".webm", ".mkv", ".mov", ".avi", ".3gp", ".flv" }) if (p.endsWith(e)) return "video";
    return null;
  }

  void addUrl(String u, boolean fromPage) {
    if (u == null || blocked(u.toLowerCase(Locale.ROOT))) return;
    String t = kind(u);
    if (t == null && fromPage) t = "video";
    if (t == null || found.size() >= 40) return;
    for (Item i : found) if (i.url.equals(u)) return;
    found.add(new Item(u, t));
    refreshFab();
  }

  void refreshFab() {
    fab.setVisibility(found.isEmpty() ? View.GONE : View.VISIBLE);
    fab.setText("⬇  Descargar (" + found.size() + ")");
  }

  void updateNav() {
    backBtn.setAlpha(web.canGoBack() ? 1f : 0.35f);
    fwdBtn.setAlpha(web.canGoForward() ? 1f : 0.35f);
  }

  static String norm(String s) {
    s = s.trim();
    if (s.isEmpty()) return null;
    if (s.matches("(?i)^[a-z][a-z0-9+.-]*://.*")) return s;
    if (s.contains(" ") || !s.contains(".")) return "https://www.google.com/search?q=" + Uri.encode(s);
    return "https://" + s;
  }

  void load(String s) {
    String u = norm(s == null ? "" : s);
    if (u == null) return;
    web.loadUrl(u);
    web.requestFocus();
    InputMethodManager im = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
    if (im != null) im.hideSoftInputFromWindow(urlBox.getWindowToken(), 0);
  }

  @SuppressLint("SetJavaScriptEnabled")
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    getWindow().setStatusBarColor(Color.BLACK);
    getWindow().setNavigationBarColor(Color.BLACK);
    WindowInsetsControllerCompat wc = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    wc.setAppearanceLightStatusBars(false);
    wc.setAppearanceLightNavigationBars(false);

    root = new FrameLayout(this);
    root.setBackgroundColor(Color.BLACK);
    col = new LinearLayout(this);
    col.setOrientation(LinearLayout.VERTICAL);
    root.addView(col, new FrameLayout.LayoutParams(-1, -1));

    LinearLayout top = new LinearLayout(this);
    top.setOrientation(LinearLayout.HORIZONTAL);
    top.setGravity(Gravity.CENTER_VERTICAL);
    top.setBackgroundColor(0xFF111111);
    top.setPadding(dp(4), dp(4), dp(4), dp(4));
    backBtn = btn("‹"); fwdBtn = btn("›");
    TextView reload = btn("↻"), close = btn("✕");
    urlBox = new EditText(this);
    urlBox.setSingleLine(true);
    urlBox.setTextColor(Color.WHITE); urlBox.setHintTextColor(0xFF888888);
    urlBox.setHint("Buscar o escribir dirección");
    urlBox.setTextSize(14);
    urlBox.setSelectAllOnFocus(true);
    urlBox.setImeOptions(EditorInfo.IME_ACTION_GO);
    urlBox.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_URI);
    GradientDrawable pill = new GradientDrawable();
    pill.setColor(0xFF222222); pill.setCornerRadius(dp(20));
    urlBox.setBackground(pill);
    urlBox.setPadding(dp(14), 0, dp(14), 0);
    top.addView(backBtn); top.addView(fwdBtn);
    top.addView(urlBox, new LinearLayout.LayoutParams(0, dp(40), 1f));
    top.addView(reload); top.addView(close);
    col.addView(top, new LinearLayout.LayoutParams(-1, -2));

    bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
    bar.setMax(100);
    bar.setProgressTintList(ColorStateList.valueOf(SKY));
    bar.setVisibility(View.GONE);
    col.addView(bar, new LinearLayout.LayoutParams(-1, dp(3)));

    web = new WebView(this);
    col.addView(web, new LinearLayout.LayoutParams(-1, 0, 1f));

    fab = new TextView(this);
    fab.setTextColor(0xFF001018); fab.setTextSize(15); fab.setTypeface(null, android.graphics.Typeface.BOLD);
    fab.setPadding(dp(22), dp(14), dp(22), dp(14));
    GradientDrawable fb = new GradientDrawable();
    fb.setColor(SKY); fb.setCornerRadius(dp(28));
    fab.setBackground(fb);
    fab.setElevation(dp(8));
    fab.setVisibility(View.GONE);
    FrameLayout.LayoutParams fp = new FrameLayout.LayoutParams(-2, -2, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL);
    fp.bottomMargin = dp(28);
    root.addView(fab, fp);
    setContentView(root);

    ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
      Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
      Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
      v.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
      return WindowInsetsCompat.CONSUMED;
    });

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);
    s.setBuiltInZoomControls(true);
    s.setDisplayZoomControls(false);
    s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
    CookieManager cm = CookieManager.getInstance();
    cm.setAcceptCookie(true);
    cm.setAcceptThirdPartyCookies(web, true);
    web.addJavascriptInterface(new Bridge(), "Dlim");

    web.setWebViewClient(new WebViewClient() {
      @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
        final String u = r.getUrl().toString();
        if (kind(u) != null) runOnUiThread(() -> addUrl(u, false));
        return null;
      }
      @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
        String sc = r.getUrl().getScheme();
        return sc == null || !(sc.equals("http") || sc.equals("https"));
      }
      @Override public void onPageStarted(WebView v, String u, Bitmap f) {
        found.clear(); refreshFab();
        if (!urlBox.hasFocus()) urlBox.setText(u);
      }
      @Override public void onPageFinished(WebView v, String u) {
        v.evaluateJavascript(SCAN, null);
        updateNav();
      }
    });
    web.setWebChromeClient(new WebChromeClient() {
      @Override public void onProgressChanged(WebView v, int p) {
        bar.setProgress(p);
        bar.setVisibility(p >= 100 ? View.GONE : View.VISIBLE);
      }
      @Override public void onShowCustomView(View v, CustomViewCallback cb) {
        customView = v; customCb = cb;
        col.setVisibility(View.GONE); fab.setVisibility(View.GONE);
        root.addView(v, new FrameLayout.LayoutParams(-1, -1));
      }
      @Override public void onHideCustomView() {
        if (customView == null) return;
        root.removeView(customView); customView = null;
        col.setVisibility(View.VISIBLE); refreshFab();
        if (customCb != null) customCb.onCustomViewHidden();
      }
    });
    // Enlaces de descarga directa (archivos) también abren el menú
    web.setDownloadListener((url, ua, cd, mime, len) -> {
      if (blocked(url.toLowerCase(Locale.ROOT))) return;
      String k = kind(url);
      Item it = new Item(url, k == null ? "file" : k);
      it.name = URLUtil.guessFileName(url, cd, mime);
      showActions(it);
    });

    backBtn.setOnClickListener(v -> { if (web.canGoBack()) web.goBack(); });
    fwdBtn.setOnClickListener(v -> { if (web.canGoForward()) web.goForward(); });
    reload.setOnClickListener(v -> web.reload());
    close.setOnClickListener(v -> finish());
    fab.setOnClickListener(v -> showList());
    urlBox.setOnEditorActionListener((v, a, e) -> { load(urlBox.getText().toString()); return true; });

    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override public void handleOnBackPressed() {
        if (customView != null) web.getWebChromeClient().onHideCustomView();
        else if (web.canGoBack()) web.goBack();
        else finish();
      }
    });

    String u = getIntent().getStringExtra("url");
    load(u == null || u.trim().isEmpty() ? "https://www.google.com" : u);
    updateNav();
  }

  @Override protected void onDestroy() {
    if (web != null) { col.removeView(web); web.destroy(); }
    super.onDestroy();
  }

  String fileName(Item it) {
    if (it.name != null && !it.name.isEmpty()) return it.name;
    String p = Uri.parse(it.url).getLastPathSegment();
    if (p != null && !p.isEmpty()) return p;
    String h = Uri.parse(it.url).getHost();
    return h == null ? "video" : h;
  }

  String label(Item it) {
    String t = "hls".equals(it.type) ? "HLS" : "dash".equals(it.type) ? "DASH" : "VIDEO";
    return "[" + t + "] " + fileName(it);
  }

  AlertDialog.Builder dialog() {
    return new AlertDialog.Builder(this, androidx.appcompat.R.style.Theme_AppCompat_Dialog_Alert);
  }

  void showList() {
    if (found.isEmpty()) return;
    if (found.size() == 1) { showActions(found.get(0)); return; }
    String[] labels = new String[found.size()];
    for (int i = 0; i < labels.length; i++) labels[i] = label(found.get(i));
    dialog().setTitle("Videos detectados").setItems(labels, (d, w) -> showActions(found.get(w))).setNegativeButton("Cerrar", null).show();
  }

  void showActions(Item it) {
    final boolean stream = "hls".equals(it.type) || "dash".equals(it.type);
    String[] opts = stream
      ? new String[] { "Abrir con otro administrador (1DM, ADM…)", "Compartir enlace…", "Copiar enlace" }
      : new String[] { "Descargar en Dlim TV", "Abrir con otro administrador (1DM, ADM…)", "Compartir enlace…", "Copiar enlace" };
    String title = stream ? "Lista de streaming: solo se puede abrir en otro administrador" : fileName(it);
    dialog().setTitle(title).setItems(opts, (d, w) -> {
      int k = stream ? w + 1 : w;
      if (k == 0) download(it);
      else if (k == 1) external(it);
      else if (k == 2) share(it);
      else copy(it);
    }).setNegativeButton("Cancelar", null).show();
  }

  String uniqueName(Item it) {
    String stem, ext = "mp4";
    Pattern ep = Pattern.compile("\\.([a-z0-9]{2,5})$", Pattern.CASE_INSENSITIVE);
    if (it.name != null && !it.name.isEmpty()) {
      Matcher m = ep.matcher(it.name);
      if (m.find()) { ext = m.group(1).toLowerCase(Locale.ROOT); stem = it.name.substring(0, m.start()); } else stem = it.name;
    } else {
      String p = Uri.parse(it.url).getLastPathSegment();
      if (p != null) { Matcher m = Pattern.compile("\\.(mp4|m4v|webm|mkv|mov|avi|3gp|flv)$", Pattern.CASE_INSENSITIVE).matcher(p); if (m.find()) ext = m.group(1).toLowerCase(Locale.ROOT); }
      String t = web.getTitle();
      stem = (t != null && !t.trim().isEmpty()) ? t.trim() : (p != null ? p : "video");
      stem = stem.replaceAll("(?i)\\.(mp4|m4v|webm|mkv|mov|avi|3gp|flv)$", "");
    }
    stem = DownloadService.clean(stem);
    if (stem.length() > 80) stem = stem.substring(0, 80);
    if (stem.isEmpty()) stem = "video";
    File d = DownloadService.dir(this);
    String name = stem + "." + ext;
    int n = 2;
    while (new File(d, name).exists() || new File(d, name + ".part").exists() || DownloadService.TASKS.containsKey(name)) name = stem + " (" + (n++) + ")." + ext;
    return name;
  }

  void download(Item it) {
    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
      ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.POST_NOTIFICATIONS }, 77);
    String id = uniqueName(it);
    String ck = CookieManager.getInstance().getCookie(it.url);
    DownloadService.enqueue(this, id, it.url, web.getUrl(), web.getSettings().getUserAgentString(), ck == null ? "" : ck);
    Toast.makeText(this, "Descargando en Dlim TV: " + id, Toast.LENGTH_LONG).show();
  }

  void external(Item it) {
    Intent v = new Intent(Intent.ACTION_VIEW).setDataAndType(Uri.parse(it.url), "video/*");
    String ref = web.getUrl();
    v.putExtra("headers", new String[] { "Referer", ref == null ? "" : ref, "User-Agent", web.getSettings().getUserAgentString() });
    try { startActivity(Intent.createChooser(v, "Abrir con…")); }
    catch (Exception e) { Toast.makeText(this, "No hay una app para abrirlo", Toast.LENGTH_LONG).show(); }
  }

  void share(Item it) {
    Intent s = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, it.url);
    try { startActivity(Intent.createChooser(s, "Compartir enlace")); }
    catch (Exception e) { Toast.makeText(this, "No se pudo compartir", Toast.LENGTH_SHORT).show(); }
  }

  void copy(Item it) {
    ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
    if (cb != null) cb.setPrimaryClip(ClipData.newPlainText("Enlace", it.url));
    Toast.makeText(this, "Enlace copiado", Toast.LENGTH_SHORT).show();
  }
}
