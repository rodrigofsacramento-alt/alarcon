import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/docs necessarios/Âncoras a.md';
const outputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/analise_comportamental/app/backend/data/questions_ancoras.json';

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const questions = [];
let currentQuestion = null;
let qNum = 1;
let currentConstruct = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const constructMatch = line.match(/^\d+️⃣ ÂNCORA: (.*)$/);
  if (constructMatch) {
    currentConstruct = constructMatch[1].trim();
    continue;
  }

  const pMatch = line.match(/^(P\d+[A-B])/);
  if (pMatch) {
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    const isInverse = line.includes('INVERSO');
    currentQuestion = {
      id: `ancoras_${pMatch[1].toLowerCase()}`,
      tool: 'ANCORAS',
      number: qNum++,
      construct: currentConstruct,
      scoring: isInverse ? 'INVERSE' : 'DIRECT',
      text: '',
      options: []
    };
    continue;
  }

  if (currentQuestion) {
    if (line.includes('Pergunta:') || line.includes('Opções:')) continue;

    const optMatch = line.match(/^(?:•|-|\*)\s*\[([A-B])\](.*)$/);
    if (optMatch) {
      currentQuestion.options.push({
        id: optMatch[1],
        text: optMatch[2].trim(),
        construct: optMatch[1]
      });
    } else if (currentQuestion.options.length === 0) {
      if (!currentQuestion.text) currentQuestion.text = line;
      else currentQuestion.text += ' ' + line;
    }
  }
}
if (currentQuestion) {
  questions.push(currentQuestion);
}

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Parsed ${questions.length} Ancoras questions.`);
