import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/docs necessarios/OPQ A.md';
const outputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/analise_comportamental/app/backend/data/questions_opq.json';

const content = fs.readFileSync(inputPath, 'utf8');
const rawLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// Fix glued PXX
const lines = [];
for (let l of rawLines) {
  const gluedMatch = l.match(/^(.*?[A-Za-z0-9])(P\d{2,3}\s*\\?\[.*)$/);
  if (gluedMatch) {
    lines.push(gluedMatch[1].trim());
    lines.push(gluedMatch[2]);
  } else {
    lines.push(l);
  }
}

const questions = [];
let currentQuestion = null;
let qNum = 1;
let currentConstruct = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const constructMatch = line.match(/^CONSTRUTO \d+: (.*)$/);
  if (constructMatch) {
    currentConstruct = constructMatch[1].trim();
    continue;
  }

  const pMatch = line.match(/^P\d{2,3} \\?\[(.*?)\\?\]/);
  if (pMatch) {
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    const isInverse = pMatch[1] === 'INVERSO';
    currentQuestion = {
      id: `opq_${qNum.toString().padStart(3, '0')}`,
      tool: 'OPQ',
      number: qNum++,
      construct: currentConstruct,
      scoring: isInverse ? 'INVERSE' : 'DIRECT',
      text: '',
      options: [
        { id: "0", text: "Discordo Totalmente", value: 0 },
        { id: "1", text: "Discordo Parcialmente", value: 1 },
        { id: "2", text: "Concordo Parcialmente", value: 2 },
        { id: "3", text: "Concordo Totalmente", value: 3 }
      ]
    };
    continue;
  }

  if (currentQuestion) {
    if (line.includes('[0] Discordo Totalmente') || line.includes('Concordo Totalmente')) continue;
    
    if (!currentQuestion.text) {
      currentQuestion.text = line;
    } else {
      currentQuestion.text += ' ' + line;
    }
  }
}
if (currentQuestion) {
  questions.push(currentQuestion);
}

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Parsed ${questions.length} OPQ questions.`);
