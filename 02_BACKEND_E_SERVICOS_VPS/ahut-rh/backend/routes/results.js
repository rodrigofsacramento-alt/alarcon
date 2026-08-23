import { Router } from 'express';
import { assessments } from './assessments.js';
import { calculateAll } from '../services/calculationService.js';
import { 
  validateCompleteness, detectAutomaticResponse, 
  validateCrossCorrelations, calculateReliabilityScore 
} from '../services/validationService.js';

const router = Router();

// POST /api/v1/assessments/:id/process - Calculate results
router.post('/assessments/:id/process', (req, res) => {
  const a = assessments.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assessment not found' });
  
  try {
    // Calculate all tools
    const results = calculateAll(a.responses);
    
    // Run validations
    const validationData = {
      completenessValid: true,
      automaticResponseDetected: false,
      inverseInconsistencyDetected: false,
      suspiciouslyFast: false,
      extremeValuesDetected: false,
      crossValidationWarnings: [],
    };
    
    // Check automatic responses for each tool
    for (const [tool, responses] of Object.entries(a.responses)) {
      const autoCheck = detectAutomaticResponse(responses);
      if (autoCheck.detected) validationData.automaticResponseDetected = true;
    }
    
    // Cross validation
    validationData.crossValidationWarnings = validateCrossCorrelations(results);
    
    // Reliability score
    const reliabilityScore = calculateReliabilityScore(validationData);
    
    // Update assessment
    a.status = 'ANALYZED';
    a.results = {
      ...results,
      reliability: {
        score: reliabilityScore,
        validation_status: reliabilityScore > 70 ? 'VALIDATED' : 'REVIEW_NEEDED',
        warnings: validationData.crossValidationWarnings,
        flags: [],
      },
      calculated_at: new Date().toISOString(),
    };
    
    res.json(a.results);
  } catch (err) {
    console.error('Calculation error:', err);
    res.status(500).json({ error: 'Calculation failed', details: err.message });
  }
});

// GET /api/v1/assessments/:id/results - Get results
router.get('/assessments/:id/results', (req, res) => {
  const a = assessments.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assessment not found' });
  if (!a.results) return res.status(404).json({ error: 'Results not calculated yet' });
  res.json(a.results);
});

export default router;
