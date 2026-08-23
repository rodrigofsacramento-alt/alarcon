// Validation Service - Anti-fraud detection and cross-validation

export function validateCompleteness(responses, toolName) {
  const required = { DISC: 30, MBTI: 80, BIG_FIVE: 35, ANCORAS: 16, OPQ: 128, VALORES: 60 };
  const count = required[toolName] || 0;
  if (responses.length < count) {
    return { valid: false, message: `Faltam ${count - responses.length} respostas` };
  }
  return { valid: true, message: 'Completo' };
}

export function detectAutomaticResponse(responses) {
  const values = responses.map(r => r.answer_value ?? r.selected_option ?? r.value);
  const unique = new Set(values);
  if (unique.size === 1 && responses.length > 5) {
    return { detected: true, message: 'Padrão automático: mesma resposta em todas as perguntas' };
  }
  return { detected: false, message: 'OK' };
}

export function detectInverseInconsistency(responses, toolName) {
  if (toolName !== 'BIG_FIVE') return { detected: false, inconsistencies: [] };
  const pairs = [[0, 15], [1, 16], [2, 17], [3, 18], [4, 19]];
  const inconsistencies = [];
  for (const [direct, inverse] of pairs) {
    const dVal = responses[direct]?.answer_value ?? 0;
    const iVal = 3 - (responses[inverse]?.answer_value ?? 0);
    if ((dVal >= 2 && iVal <= 1) || (dVal <= 1 && iVal >= 2)) {
      inconsistencies.push(`Inconsistência entre P${direct + 1} e P${inverse + 1}`);
    }
  }
  return { detected: inconsistencies.length > 0, inconsistencies };
}

export function detectSuspiciouslyFast(startTime, endTime, questionCount) {
  const durationMs = new Date(endTime) - new Date(startTime);
  const secondsPerQuestion = (durationMs / 1000) / questionCount;
  if (secondsPerQuestion < 5) {
    return { detected: true, message: `Tempo médio: ${secondsPerQuestion.toFixed(1)}s/pergunta (suspeito)` };
  }
  return { detected: false, message: `Tempo médio: ${secondsPerQuestion.toFixed(1)}s/pergunta (OK)` };
}

export function detectExtremeValues(scores) {
  const vals = Object.values(scores);
  const extremeCount = vals.filter(v => v <= 10 || v >= 90).length;
  const pct = (extremeCount / vals.length) * 100;
  if (pct > 50) {
    return { detected: true, message: `${pct.toFixed(1)}% de valores extremos` };
  }
  return { detected: false, message: 'Distribuição normal' };
}

export function validateCrossCorrelations(results) {
  const warnings = [];
  // DISC D/I vs MBTI E
  if (results.disc && results.mbti) {
    if ((results.disc.scores.D > 70 || results.disc.scores.I > 70) && results.mbti.type.includes('I')) {
      warnings.push('DISC sugere Extroversão, mas MBTI indica Introversão');
    }
    if (results.disc.scores.S > 70 && results.mbti.type.includes('P')) {
      warnings.push('DISC sugere Estabilidade/Julgamento, mas MBTI indica Percepção');
    }
  }
  // Big Five vs Valores
  if (results.big_five && results.valores) {
    if (results.big_five.openness < 30 && results.valores.intrinsic > 70) {
      warnings.push('Big Five baixa Abertura, mas Valores altos Intrínsecos');
    }
  }
  return warnings;
}

export function calculateReliabilityScore(assessmentData) {
  let score = 100;
  if (!assessmentData.completenessValid) score -= 20;
  if (assessmentData.automaticResponseDetected) score -= 30;
  if (assessmentData.inverseInconsistencyDetected) score -= 25;
  if (assessmentData.suspiciouslyFast) score -= 15;
  if (assessmentData.extremeValuesDetected) score -= 20;
  if (assessmentData.crossValidationWarnings?.length > 0) {
    score -= 10 * assessmentData.crossValidationWarnings.length;
  }
  return Math.max(0, score);
}
