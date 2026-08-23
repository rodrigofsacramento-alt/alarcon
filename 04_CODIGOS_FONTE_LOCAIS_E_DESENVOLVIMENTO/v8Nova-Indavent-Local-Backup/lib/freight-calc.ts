/**
 * Indavent Freight Calculation Utility
 * Based on logicadecalculo-embalagem-frete.md
 */

export interface FreightDimensions {
  caixasAro: number;
  caixasBase: number;
  totalVolumes: number;
  cubagemTotal: number;
  packagingCost: number;
}

const CAIXA_ARO_VOL = 0.296; // m3
const CAIXA_BASE_VOL = 0.097; // m3
const PACKAGING_COST_PER_PIECE = 300; // BRL

/**
 * Calculates volumes and cubage for a given quantity of exhaust fans
 * @param quantity Number of pieces (Exaustor Eólico)
 * @returns FreightDimensions object
 */
export function calculateFreight(quantity: number): FreightDimensions {
  if (quantity <= 0) {
    return {
      caixasAro: 0,
      caixasBase: 0,
      totalVolumes: 0,
      cubagemTotal: 0,
      packagingCost: 0
    };
  }

  // Formula: Arredondar para cima (Q / Capacidade)
  const caixasAro = Math.ceil(quantity / 5);
  const caixasBase = Math.ceil(quantity / 15);
  
  const totalVolumes = caixasAro + caixasBase;
  
  // Cubagem_Total = (Caixas_Aro * 0.296) + (Caixas_Base * 0.097)
  const cubagemTotal = (caixasAro * CAIXA_ARO_VOL) + (caixasBase * CAIXA_BASE_VOL);
  
  // Custo_Embalagem_Total = Q * 300
  const packagingCost = quantity * PACKAGING_COST_PER_PIECE;

  return {
    caixasAro,
    caixasBase,
    totalVolumes,
    cubagemTotal: parseFloat(cubagemTotal.toFixed(3)),
    packagingCost
  };
}

/**
 * Formatted dimensions for transport carriers
 */
export function getFormattedDimensions(caixasAro: number, caixasBase: number) {
  const lines = [];
  if (caixasAro > 0) lines.push(`${String(caixasAro).padStart(2, '0')} volumes de 62x62x77 cm`);
  if (caixasBase > 0) lines.push(`${String(caixasBase).padStart(2, '0')} volumes de 120x10x81 cm`);
  return lines.join('\n');
}
