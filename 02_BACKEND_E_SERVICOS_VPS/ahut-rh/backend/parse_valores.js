import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/docs necessarios/VALORES - QUESTIONÁRIO COMPLETO.md';
const outputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/analise_comportamental/app/backend/data/questions_valores.json';

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const questions = [];
let currentQuestion = null;
let qNum = 1;
let currentTheme = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const themeMatch = line.match(/^## 🎯 TEMA \d+: (.*?)\s*\(/);
  if (themeMatch) {
    currentTheme = themeMatch[1].trim();
    continue;
  }

  const pMatch = line.match(/^### P\d{2} \\?- (.*)$/);
  if (pMatch) {
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    currentQuestion = {
      id: `valores_${qNum.toString().padStart(2, '0')}`,
      tool: 'VALORES',
      number: qNum++,
      theme: currentTheme,
      text: '',
      options: []
    };
    continue;
  }

  if (currentQuestion) {
    if (line.startsWith('Pergunta:')) {
      currentQuestion.text = line.replace(/^Pergunta:\s*/, '');
    } else if (line.startsWith('| A |') || line.startsWith('| B |') || line.startsWith('| C |') || line.startsWith('| D |')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length >= 2) {
        currentQuestion.options.push({
          id: parts[0],
          text: parts[1],
          construct: parts[0]
        });
      }
    }
  }
}
if (currentQuestion) {
  questions.push(currentQuestion);
}

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Parsed ${questions.length} Valores questions.`);
