/**
 * == ANTIGRAVITY RECOVERED v2.1 — LIB/SANITIZE.JS ==
 * Módulo de segurança e sanitização de secrets antes de commits.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// RegEx oficial da Seção 5.2 do SOP de Engenharia Reversa
const SECRET_REGEX = /(eyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}|service_role|sb_publishable|password[=:]["'][^"']{4,}|sk-[A-Za-z0-9]{20,})/gi;

/**
 * Varre um diretório recursivamente e redige qualquer secret encontrado.
 * @param {string} dirPath Caminho do diretório a sanitizar.
 * @returns {Promise<{ scannedFiles: number, secretsFound: number, redactedCount: number }>}
 */
export async function sanitizeDirectory(dirPath) {
  const report = { scannedFiles: 0, secretsFound: 0, redactedCount: 0 };

  if (!dirPath) {
    return report;
  }

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subReport = await sanitizeDirectory(fullPath);
        report.scannedFiles += subReport.scannedFiles;
        report.secretsFound += subReport.secretsFound;
        report.redactedCount += subReport.redactedCount;
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        report.scannedFiles++;
        const content = await fs.readFile(fullPath, 'utf8');
        const matches = content.match(SECRET_REGEX);

        if (matches && matches.length > 0) {
          report.secretsFound += matches.length;
          const sanitized = content.replace(SECRET_REGEX, (match) => {
            report.redactedCount++;
            return `[REDACTED: SECRET_${match.length}]`;
          });
          await fs.writeFile(fullPath, sanitized, 'utf8');
        }
      }
    }
  } catch (err) {
    console.error('[SANITIZE ERROR]', err.message);
  }

  return report;
}
