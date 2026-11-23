# Agrega al AndroidManifest los permisos, el servicio de descargas y la actividad del navegador.
p = 'android/app/src/main/AndroidManifest.xml'
s = open(p, encoding='utf-8').read()
perms = '''    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
'''
service = '''        <service android:name=".DownloadService" android:exported="false" android:foregroundServiceType="dataSync" />
'''
activity = '''        <activity android:name=".BrowserActivity" android:exported="false" android:theme="@style/AppTheme.NoActionBar" android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|screenLayout|uiMode|navigation" android:windowSoftInputMode="adjustResize" />
'''
if 'DownloadService' not in s:
    s = s.replace('</application>', service + '    </application>', 1)
    s = s.replace('</manifest>', perms + '</manifest>', 1)
if 'BrowserActivity' not in s:
    s = s.replace('</application>', activity + '    </application>', 1)
if 'usesCleartextTraffic' not in s:
    s = s.replace('<application', '<application android:usesCleartextTraffic="true"', 1)
open(p, 'w', encoding='utf-8').write(s)
print('Manifest listo')
