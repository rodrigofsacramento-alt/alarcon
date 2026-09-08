const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const BASE = "/opt/data/ahut-ecosystem-remodel-copy/00_ANTIGRAVITY_FASE3_CORRECCION";
const SRC = path.join(BASE, "check", "src");
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
  }
}
walk(SRC);

let total = 0, syntaxOk = 0, syntaxErr = 0;
const bad = [];
const countByCode = {};

for (const f of files.sort()) {
  total++;
  const code = fs.readFileSync(f, "utf8");
  const ext = path.extname(f) === ".tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(f, code, ts.ScriptTarget.Latest, true, ext);
  const sd = sf.parseDiagnostics || [];
  if (sd.length === 0) {
    syntaxOk++;
  } else {
    syntaxErr++;
    const d0 = sd[0];
    const pos = sf.getLineAndCharacterOfPosition(d0.start || 0);
    bad.push(`${f} :: ${ts.flattenDiagnosticMessageText(d0.message, "\n")} @ L${pos.line + 1}:${pos.character + 1}`);
    for (const d of sd) countByCode[d.code] = (countByCode[d.code] || 0) + 1;
  }
}

console.log("=== PRUEBA DE PARSE SINTACTICO (REIDRATACION) ===");
console.log("TOTAL archivos ts/tsx:", total);
console.log("PARSE OK (sintaxis valida):", syntaxOk);
console.log("PARSE FAIL (sintaxis invalida):", syntaxErr);
console.log("Por codigo:", JSON.stringify(countByCode));
if (bad.length) {
  console.log("Detalle de fails:");
  bad.forEach(b => console.log("  - " + b));
} else {
  console.log(">>> 0 ERROS DE SINTAXE nos " + total + " arquivos <<<");
}