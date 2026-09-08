#!/usr/bin/env node

/**
 * == ANTIGRAVITY RECOVERED v2.1 CLI — PROJETO ANTIGRAVITY ==
 * Ponto de entrada tático para engenharia reversa AST e reidratação de bundle Vite/React.
 */

import path from 'node:path';
import process from 'node:process';
import { detectBundler } from './lib/bundler.js';
import { buildRosettaMap } from './lib/rosetta.js';
import { runASTPipeline } from './lib/ast-pipeline.js';
import { sanitizeDirectory } from './lib/sanitize.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: args[0] || 'help',
    dist: '',
    rosetta: '',
    out: 'src_recovered_1_1',
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dist' && args[i + 1]) {
      options.dist = args[i + 1];
      i++;
    } else if (args[i] === '--rosetta' && args[i + 1]) {
      options.rosetta = args[i + 1];
      i++;
    } else if (args[i] === '--out' && args[i + 1]) {
      options.out = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log(`[ANTIGRAVITY CLI] Comando: ${options.command}`);

  if (options.command === 'help') {
    console.log(`
Uso:
  node antigravity_1_1/cli.mjs recover --dist <caminho_dist> --rosetta <caminho_backend> --out <caminho_saida> [--dry-run]
  node antigravity_1_1/cli.mjs sanitize --in <caminho_saida> --report report.json
    `);
    process.exit(0);
  }

  if (options.command === 'recover') {
    console.log(`[ANTIGRAVITY CLI] Iniciando reconhecimento e recuperação...`);
    console.log(`  - Dist Target: ${options.dist}`);
    console.log(`  - Rosetta Pair: ${options.rosetta}`);
    console.log(`  - Out Directory: ${options.out}`);
    console.log(`  - Dry Run: ${options.dryRun}`);

    const bundlerInfo = await detectBundler(options.dist);
    console.log(`[ANTIGRAVITY CLI] Bundler detectado:`, bundlerInfo);

    const rosettaMap = await buildRosettaMap(options.rosetta);
    console.log(`[ANTIGRAVITY CLI] Mapeamento Rosetta construído (${rosettaMap.size} entradas).`);

    const results = await runASTPipeline(options.dist, options.out, rosettaMap, { dryRun: options.dryRun });
    console.log(`[ANTIGRAVITY CLI] Pipeline AST concluído:`, results);
  } else if (options.command === 'sanitize') {
    console.log(`[ANTIGRAVITY CLI] Iniciando varredura de sanitização...`);
    const sanitizeResults = await sanitizeDirectory(options.out);
    console.log(`[ANTIGRAVITY CLI] Sanitização concluída:`, sanitizeResults);
  } else {
    console.error(`[ANTIGRAVITY CLI] Comando desconhecido: ${options.command}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[ANTIGRAVITY CLI ERROR]', err);
  process.exit(1);
});
