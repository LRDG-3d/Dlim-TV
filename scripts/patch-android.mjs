// Se ejecuta tras `npx cap add android`: engancha la firma de release en app/build.gradle.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const f = 'android/app/build.gradle';
if (!existsSync(f)) { console.error('Falta android/. Ejecuta primero: npx cap add android'); process.exit(1); }
const line = "apply from: '../../signing.gradle'";
const src = readFileSync(f, 'utf8');
if (!src.includes(line)) { writeFileSync(f, src + `\n${line}\n`); console.log('Firma de release enlazada.'); }
else console.log('Ya estaba enlazada.');
