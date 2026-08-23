// Calculation Service - All 6 tool formulas
// Based on BLOCO 3 specifications

export function calculateDisc(responses) {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  responses.forEach(r => {
    const construct = r.construct || r.response_construct;
    if (construct && counts.hasOwnProperty(construct)) {
      counts[construct]++;
    }
  });
  const total = responses.length || 1;
  const scores = {
    D: Math.round((counts.D / total) * 100),
    I: Math.round((counts.I / total) * 100),
    S: Math.round((counts.S / total) * 100),
    C: Math.round((counts.C / total) * 100),
  };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    scores,
    primary: sorted[0][0],
    secondary: sorted[1][0],
    type_code: `${sorted[0][0]}/${sorted[1][0]}`,
  };
}

export function calculateMbti(responses) {
  const dims = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  responses.forEach(r => {
    const c = r.construct || r.response_construct;
    if (c && dims.hasOwnProperty(c)) dims[c]++;
  });
  const ei = dims.E >= dims.I ? 'E' : 'I';
  const sn = dims.S >= dims.N ? 'S' : 'N';
  const tf = dims.T >= dims.F ? 'T' : 'F';
  const jp = dims.J >= dims.P ? 'J' : 'P';
  const total = responses.length / 4 || 1;
  return {
    type: `${ei}${sn}${tf}${jp}`,
    scores: {
      E_I: Math.round((Math.max(dims.E, dims.I) / total) * 100),
      S_N: Math.round((Math.max(dims.S, dims.N) / total) * 100),
      T_F: Math.round((Math.max(dims.T, dims.F) / total) * 100),
      J_P: Math.round((Math.max(dims.J, dims.P) / total) * 100),
    },
    dimensions: { E: dims.E, I: dims.I, S: dims.S, N: dims.N, T: dims.T, F: dims.F, J: dims.J, P: dims.P },
  };
}

export function calculateBigFive(responses) {
  // Inverse items mapping (0-indexed): P16→15, P17→16, P18→17, P19→18, P20→19, P21→20, P22→21, P23→22, P24→23, P25→24, P33→32, P34→33
  const inverseItems = new Set([15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 32, 33]);
  const factors = {
    openness: [0, 5, 10, 15, 20, 25, 31],       // P01,P06,P11,P16*,P21*,P26,P32
    conscientiousness: [1, 6, 11, 16, 21, 26, 30], // P02,P07,P12,P17*,P22*,P27,P31
    extraversion: [2, 7, 12, 17, 22, 27, 32],     // P03,P08,P13,P18*,P23*,P28,P33*
    agreeableness: [3, 8, 13, 18, 23, 28, 33],    // P04,P09,P14,P19*,P24*,P29,P34*
    neuroticism: [4, 9, 14, 19, 24, 29, 34],      // P05,P10,P15,P20*,P25*,P30,P35
  };
  const values = responses.map((r, i) => {
    const val = r.answer_value ?? r.value ?? 0;
    return inverseItems.has(i) ? (3 - val) : val;
  });
  const result = {};
  for (const [factor, indices] of Object.entries(factors)) {
    const sum = indices.reduce((acc, idx) => acc + (values[idx] || 0), 0);
    const avg = sum / indices.length;
    result[factor] = Math.round((avg / 3) * 100);
  }
  return result;
}

export function calculateAncoras(responses) {
  const anchors = {
    tecnica: [0, 8],
    gerencial: [1, 9],
    autonomia: [2, 10],
    seguranca: [3, 11],
    criatividade: [4, 12],
    servico: [5, 13],
    desafio: [6, 14],
    equilibrio: [7, 15],
  };
  const result = {};
  for (const [name, indices] of Object.entries(anchors)) {
    const sum = indices.reduce((acc, idx) => {
      const val = responses[idx]?.answer_value ?? responses[idx]?.value ?? 0;
      return acc + val;
    }, 0);
    result[name] = Math.round((sum / 2) * 100);
  }
  const sorted = Object.entries(result).sort((a, b) => b[1] - a[1]);
  return {
    scores: result,
    primary: sorted[0][0],
    secondary: sorted[1][0],
    tertiary: sorted[2][0],
    ranking: sorted.map(([name]) => name),
  };
}

export function calculateOpq(responses) {
  const constructs = {};
  for (let i = 0; i < 32; i++) {
    const start = i * 4;
    const items = responses.slice(start, start + 4);
    const sum = items.reduce((acc, r) => acc + (r.answer_value ?? r.value ?? 0), 0);
    constructs[`construct_${i + 1}`] = Math.round((sum / 12) * 100);
  }
  return constructs;
}

export function calculateValores(responses) {
  const intrinsic = responses.slice(0, 30);
  const extrinsic = responses.slice(30, 60);
  const intrSum = intrinsic.reduce((acc, r) => acc + (r.answer_value ?? r.value ?? 0), 0);
  const extrSum = extrinsic.reduce((acc, r) => acc + (r.answer_value ?? r.value ?? 0), 0);
  const intrAvg = intrSum / (intrinsic.length || 1);
  const extrAvg = extrSum / (extrinsic.length || 1);
  const intrScore = Math.round(intrAvg * 10);
  const extrScore = Math.round(extrAvg * 10);
  const orientation = (intrScore - extrScore) / 100;
  let orientationLabel;
  if (orientation > 0.1) orientationLabel = 'Valores Intrínsecos';
  else if (orientation < -0.1) orientationLabel = 'Valores Extrínsecos';
  else orientationLabel = 'Equilíbrio';
  return {
    intrinsic: intrScore,
    extrinsic: extrScore,
    orientation,
    orientationLabel,
  };
}

export function calculateAll(groupedResponses) {
  return {
    disc: calculateDisc(groupedResponses.disc || []),
    mbti: calculateMbti(groupedResponses.mbti || []),
    big_five: calculateBigFive(groupedResponses.big_five || []),
    ancoras: calculateAncoras(groupedResponses.ancoras || []),
    opq: calculateOpq(groupedResponses.opq || []),
    valores: calculateValores(groupedResponses.valores || []),
  };
}
