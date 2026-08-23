import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');

const router = Router();

// Load question banks
function loadQuestions(filename) {
  try {
    const raw = readFileSync(join(dataDir, filename), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${filename}:`, err.message);
    return [];
  }
}

// GET /api/v1/questions - List all tools and question counts
router.get('/questions', (req, res) => {
  const tools = [
    { id: 'disc', name: 'DISC', questions: 30, description: 'Perfil comportamental: Dominância, Influência, Estabilidade, Conformidade' },
    { id: 'mbti', name: 'MBTI', questions: 80, description: '16 tipos de personalidade baseados em 4 dimensões' },
    { id: 'big_five', name: 'Big Five', questions: 35, description: '5 fatores de personalidade: Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo' },
    { id: 'ancoras', name: 'Âncoras de Carreira', questions: 16, description: '8 âncoras de carreira de Edgar Schein' },
    { id: 'opq', name: 'OPQ', questions: 128, description: '32 construtos ocupacionais em 3 áreas' },
    { id: 'valores', name: 'Valores', questions: 60, description: 'Valores Intrínsecos vs Extrínsecos' },
  ];
  res.json({ tools, totalQuestions: 349 });
});

// GET /api/v1/questions/:tool - Get questions for a specific tool
router.get('/questions/:tool', (req, res) => {
  const toolMap = {
    disc: 'questions_disc.json',
    mbti: 'questions_mbti.json',
    big_five: 'questions_bigfive.json',
    ancoras: 'questions_ancoras.json',
    opq: 'questions_opq.json',
    valores: 'questions_valores.json',
  };
  const filename = toolMap[req.params.tool];
  if (!filename) {
    return res.status(404).json({ error: `Tool '${req.params.tool}' not found` });
  }
  const questions = loadQuestions(filename);
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;
  const start = (page - 1) * perPage;
  const paginated = questions.slice(start, start + perPage);
  
  res.json({
    tool: req.params.tool,
    total: questions.length,
    page,
    per_page: perPage,
    total_pages: Math.ceil(questions.length / perPage),
    questions: paginated,
  });
});

export default router;
