import { Router } from 'express';

const router = Router();

// Stub auth routes (simplified for now)
router.post('/auth/register', (req, res) => {
  res.json({ message: 'Registration successful', user_id: 'demo-user' });
});

router.post('/auth/login', (req, res) => {
  res.json({ access_token: 'demo-token', token_type: 'bearer' });
});

export default router;
