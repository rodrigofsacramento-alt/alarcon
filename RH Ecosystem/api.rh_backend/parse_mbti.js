import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/docs necessarios/MBTI A.md';
const outputPath = 'C:/Users/Rafael_Livre/Downloads/RECOURSES APEX/analise_comportamental/app/backend/data/questions_mbti.json';

const content = fs.readFileSync(inputPath, 'utf8');
const rawLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// Fix glued PXX
const lines = [];
for (let l of rawLines) {
  const gluedMatch = l.match(/^(.*?[A-Za-z0-9])(P\d{2})$/);
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

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.match(/^P\d+$/)) {
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    const id = line;
    currentQuestion = {
      id: `mbti_${id.replace('P', '')}`,
      tool: 'MBTI',
      number: qNum++,
      text: '',
      options: []
    };
    continue;
  }
  
  if (!currentQuestion) continue;

  let matchA = line.match(/^(.*?)\s*A\)\s*(.*)$/);
  if (matchA) {
    if (matchA[1]) {
      if (!currentQuestion.text) {
        currentQuestion.text = matchA[1];
      } else {
        currentQuestion.text += ' ' + matchA[1];
      }
    }
    currentQuestion.options.push({
      id: 'A',
      text: matchA[2],
      construct: 'A'
    });
    continue;
  }

  const matchB = line.match(/^([A-B])\)\s+(.*)$/);
  if (matchB) {
    currentQuestion.options.push({
      id: matchB[1],
      text: matchB[2],
      construct: matchB[1]
    });
    continue;
  }

  if (line.match(/^(ANALISTAS|DIPLOMATAS|GUARDIÕES|ARTESÃOS|INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)/) && !line.includes('?')) {
    continue;
  }
  if (line === 'NOTA IMPORTANTE' || line.includes('80 perguntas do MBTI')) {
    break;
  }

  if (currentQuestion.options.length === 0) {
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
console.log(`Parsed ${questions.length} MBTI questions.`);
