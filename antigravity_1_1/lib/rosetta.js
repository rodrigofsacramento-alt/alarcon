/**
 * == ANTIGRAVITY RECOVERED v2.1 — LIB/ROSETTA.JS ==
 * Módulo de extração de assinaturas e entidades usando o backend preservado (Pedra de Roseta).
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Constrói o dicionário de símbolos e tabelas (Pedra de Roseta).
 * @param {string} rosettaPath Caminho para o backend 02.2 preservado.
 * @returns {Promise<Map<string, string>>} Mapa de símbolos ofuscados -> nomes semânticos.
 */
export async function buildRosettaMap(rosettaPath) {
  const map = new Map();

  // Mapeamentos padrão extraídos da Seção 4.2 do SOP (Entidades do CRM)
  map.set('conversations', 'conversations');
  map.set('leads', 'leads');
  map.set('proposals', 'proposals');
  map.set('sales_records', 'sales_records');
  map.set('profiles', 'profiles');

  if (!rosettaPath) {
    return map;
  }

  try {
    const srcPath = path.join(rosettaPath, 'src');
    const files = await fs.readdir(srcPath);

    for (const file of files) {
      if (file.endsWith('.ts')) {
        const content = await fs.readFile(path.join(srcPath, file), 'utf8');
        // Extrai tabelas Supabase .from("...")
        const matches = content.matchAll(/\.from\(["']([^"']+)["']\)/g);
        for (const match of matches) {
          const tableName = match[1];
          map.set(tableName, tableName);
        }
      }
    }
  } catch (err) {
    console.warn('[ROSETTA WARNING] Não foi possível ler pasta rosetta:', err.message);
  }

  return map;
}
