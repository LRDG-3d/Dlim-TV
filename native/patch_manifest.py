# Agrega al AndroidManifest los permisos y el servicio de descargas.
p = 'android/app/src/main/AndroidManifest.xml'
s = open(p, encoding='utf-8').read()
perms = '''    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
'''
service = '''        <service android:name=".DownloadService" android:exported="false" android:foregroundServiceType="dataSync" />
'''
if 'DownloadService' not in s:
    s = s.replace('</application>', service + '    </application>', 1)
    s = s.replace('</manifest>', perms + '</manifest>', 1)
open(p, 'w', encoding='utf-8').write(s)
print('Manifest listo')
