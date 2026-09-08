/**
 * == ANTIGRAVITY RECOVERED v2.1 — LIB/BUNDLER.JS ==
 * Módulo de fingerprinting e auditoria estática de bundlers (Vite/Rollup vs Webpack).
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Detecta o tipo de bundler e extrai o mapa de chunks do diretório dist.
 * @param {string} distPath Caminho da pasta de assets/dist.
 * @returns {Promise<{ type: string, entryChunk: string, chunks: string[], count: number }>}
 */
export async function detectBundler(distPath) {
  if (!distPath) {
    return { type: 'unknown', entryChunk: '', chunks: [], count: 0 };
  }

  try {
    const files = await fs.readdir(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    let isVite = false;
    let entryChunk = '';

    for (const file of jsFiles) {
      const fullPath = path.join(distPath, file);
      const content = await fs.readFile(fullPath, 'utf8');

      if (content.includes('_jsx') || content.includes('_jsxs') || content.includes('import(')) {
        isVite = true;
      }

      if (file.startsWith('index-') && !entryChunk) {
        entryChunk = file;
      }
    }

    return {
      type: isVite ? 'Vite/Rollup' : 'Webpack/Other',
      entryChunk,
      chunks: jsFiles,
      count: jsFiles.length
    };
  } catch (err) {
    console.error('[BUNDLER DETECT ERROR]', err.message);
    return { type: 'error', entryChunk: '', chunks: [], count: 0 };
  }
}
