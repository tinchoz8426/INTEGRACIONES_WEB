/**
 * Justificación de Promesas (async/await) vs Callbacks:
 *
 * Con Callbacks (node:fs):
 * fs.readFile(path, 'utf-8', (err, data) => {
 *   if (err) return console.error(err);
 *   // Procesamiento anidado... (Callback Hell)
 * });
 *
 * Con Promesas / async await (node:fs/promises):
 * El flujo es secuencial, legible, mantenible y permite centralizar el manejo de errores
 * mediante bloques try...catch sin anidar múltiples niveles de indentación.
 */
import fs from 'node:fs';

export function leerConCallback(
  path: string,
  callback: (err: Error | null, data?: string) => void
): void {
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}
