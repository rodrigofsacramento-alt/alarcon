import { Router } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

// In-memory store (will be replaced with Supabase in production)
const assessments = new Map();

// POST /api/v1/assessments - Create new assessment
router.post('/assessments', (req, res) => {
  const id = uuid();
  const assessment = {
    id,
    user_id: req.body.user_id || 'anonymous',
    status: 'INITIATED',
    started_at: new Date().toISOString(),
    completed_at: null,
    responses: {},
    created_at: new Date().toISOString(),
  };
  assessments.set(id, assessment);
  res.status(201).json(assessment);
});

// GET /api/v1/assessments/:id - Get assessment
router.get('/assessments/:id', (req, res) => {
  const a = assessments.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assessment not found' });
  const responseCounts = {};
  for (const [tool, resps] of Object.entries(a.responses)) {
    responseCounts[tool] = resps.length;
  }
  res.json({ ...a, responses: undefined, response_counts: responseCounts });
});

// POST /api/v1/assessments/:id/responses - Submit responses for a tool
router.post('/assessments/:id/responses', (req, res) => {
  const a = assessments.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assessment not found' });
  const { tool, responses } = req.body;
  if (!tool || !responses) {
    return res.status(400).json({ error: 'Missing tool or responses' });
  }
  a.responses[tool.toLowerCase()] = responses;
  a.status = 'IN_PROGRESS';
  a.updated_at = new Date().toISOString();
  
  // Check if all tools completed
  const toolsCompleted = Object.keys(a.responses).length;
  if (toolsCompleted >= 6) {
    a.status = 'COMPLETED';
    a.completed_at = new Date().toISOString();
  }
  res.json({ 
    message: `Responses for ${tool} saved`,
    tools_completed: toolsCompleted,
    status: a.status,
  });
});

// GET /api/v1/assessments/:id/responses - Get all responses
router.get('/assessments/:id/responses', (req, res) => {
  const a = assessments.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assessment not found' });
  res.json({ assessment_id: a.id, responses: a.responses });
});

export { assessments };
export default router;
