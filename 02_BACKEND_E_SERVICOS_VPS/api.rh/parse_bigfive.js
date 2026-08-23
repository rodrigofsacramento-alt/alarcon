import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/docs necessarios/big five .md';
const outputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/analise_comportamental/app/backend/data/questions_bigfive.json';

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const questions = [];
let currentQuestion = null;
let qNum = 1;
let currentConstruct = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const constructMatch = line.match(/^## .*CONSTRUTO \d+: (.*?)\s*\(/);
  if (constructMatch) {
    currentConstruct = constructMatch[1].trim();
    continue;
  }

  const pMatch = line.match(/^### (P\d{2})/);
  if (pMatch) {
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    const isInverse = line.includes('INVERSO');
    currentQuestion = {
      id: `bigfive_${pMatch[1].replace('P', '')}`,
      tool: 'BIG_FIVE',
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

  if (currentQuestion && line.startsWith('Pergunta:')) {
    currentQuestion.text = line.replace(/^Pergunta:\s*/, '');
  }
}
if (currentQuestion) {
  questions.push(currentQuestion);
}

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Parsed ${questions.length} Big Five questions.`);
