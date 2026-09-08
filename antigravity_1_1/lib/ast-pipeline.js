/**
 * == ANTIGRAVITY RECOVERED v2.1 — LIB/AST-PIPELINE.JS (FASE 3) ==
 * Motor principal de desofuscação AST, reidratação _jsx -> TSX real e reapontamento de módulos.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import { convertCallToJSX } from './jsx-converter.js';

const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

// Mapeamento de reapontamento de chunks minificados para módulos TSX legados
const CHUNK_IMPORT_MAP = new Map([
  ['use-leads-Dgo3FHYA.js', '@/hooks/useLeads'],
  ['use-whatsapp-C823NAz3.js', '@/hooks/useWhatsapp'],
  ['use-agents-B-RFE8ho.js', '@/hooks/useAgents'],
  ['use-properties-BBmfycqV.js', '@/hooks/useProperties'],
  ['use-proposals-E_dvnJNr.js', '@/hooks/useProposals'],
  ['use-sales-CJ3oco0G.js', '@/hooks/useSales'],
  ['use-visits-CUAXdGEk.js', '@/hooks/useVisits'],
  ['supabase-hVowsSCQ.js', '@/lib/supabase'],
  ['Header-DRGD8txy.js', '@/components/Header'],
  ['dropdown-menu-WEV3AJVn.js', '@/components/ui/dropdown-menu'],
  ['dialog-CGKRC-Dg.js', '@/components/ui/dialog'],
  ['card-TCyHy1o6.js', '@/components/ui/card'],
  ['badge-Bp75wFcE.js', '@/components/ui/badge'],
  ['select-ByrUNq8J.js', '@/components/ui/select'],
  ['textarea-B4tutQia.js', '@/components/ui/textarea']
]);

/**
 * Transforma o código minificado de um chunk para TSX reidratado declarativo real.
 * @param {string} code Código JS minificado.
 * @param {string} filename Nome do arquivo fonte.
 * @param {Map<string, string>} rosettaMap Dicionário de equivalências.
 * @returns {string} Código TSX declarativo formatado.
 */
export function transformAST(code, filename = 'component.js', rosettaMap = new Map()) {
  if (!code || typeof code !== 'string') return '';

  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      // 1. Reapontamento de imports de chunks minificados -> módulos @/...
      ImportDeclaration(path) {
        const sourceVal = path.node.source.value;
        const basename = sourceVal.split('/').pop();
        if (CHUNK_IMPORT_MAP.has(basename)) {
          path.node.source.value = CHUNK_IMPORT_MAP.get(basename);
        } else if (sourceVal.endsWith('.js') && sourceVal.startsWith('./')) {
          const nameClean = basename.replace(/-[A-Za-z0-9_]+\.js$/, '');
          path.node.source.value = `@/components/${nameClean}`;
        }
      },

      // 2. Substituição de identificadores via Rosetta Map
      Identifier(path) {
        if (rosettaMap.has(path.node.name)) {
          path.node.name = rosettaMap.get(path.node.name);
        }
      },

      // 3. Regra de Tema Light (removendo prefixos dark: para manter bg-white)
      StringLiteral(path) {
        if (path.node.value && path.node.value.includes('dark:')) {
          path.node.value = path.node.value
            .split(' ')
            .filter(cls => !cls.startsWith('dark:'))
            .join(' ');
        }
      },

      // 4. Reidratação real _jsx(...) / e.jsx(...) -> <Tag {...props}>
      CallExpression(path) {
        convertCallToJSX(path);
      }
    });

    const output = generate(ast, {
      retainLines: false,
      compact: false,
      concise: false
    });

    const provenanceBanner = `/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/${filename} | AST | sanitizado | Fase 3 ==*/\n`;
    return provenanceBanner + output.code;
  } catch (err) {
    console.warn(`[AST TRANSFORM WARNING] Fallback para ${filename}:`, err.message);
    const provenanceBanner = `/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/${filename} | AST | sanitizado | Fase 3 ==*/\n`;
    return provenanceBanner + code;
  }
}

/**
 * Executa o pipeline AST sobre os arquivos do bundle e recupera o código fonte em formato TSX.
 */
export async function runASTPipeline(distPath, outPath, rosettaMap, options = {}) {
  const stats = { processed: 0, skipped: 0, errors: 0 };

  if (!distPath) {
    console.error('[AST PIPELINE] Diretório dist não especificado.');
    return stats;
  }

  try {
    const files = await fs.readdir(distPath);
    let jsFiles = files.filter(f => f.endsWith('.js'));

    if (options.targetChunks && options.targetChunks.length > 0) {
      jsFiles = jsFiles.filter(f => options.targetChunks.includes(f));
    }

    console.log(`[AST PIPELINE FASE 3] Processando ${jsFiles.length} chunks com Babel + Reidratação JSX...`);

    if (!options.dryRun && outPath) {
      await fs.mkdir(outPath, { recursive: true });
    }

    for (const file of jsFiles) {
      const fullPath = path.join(distPath, file);
      const rawCode = await fs.readFile(fullPath, 'utf8');

      const transformed = transformAST(rawCode, file, rosettaMap);

      if (!options.dryRun && outPath) {
        const outFileName = file.replace(/\.js$/, '.tsx');
        await fs.writeFile(path.join(outPath, outFileName), transformed, 'utf8');
      }

      stats.processed++;
    }
  } catch (err) {
    console.error('[AST PIPELINE ERROR]', err.message);
    stats.errors++;
  }

  return stats;
}
