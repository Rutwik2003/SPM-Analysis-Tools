import { irr } from 'financial';

export const calculateROI = (netProfit: number, investment: number, duration: number): number | null => {
  if (duration <= 0 || investment <= 0) {
    return null;
  }
  const averageAnnualProfit = netProfit / duration;
  return (averageAnnualProfit / investment) * 100;
};

export const calculateNPVDetailed = (
  initialInvestment: number,
  annualCashflow: number,
  discountRate: number,
  duration: number
): { npv: number | null; yearlyData: [number, number, number][] } => {
  if (duration <= 0 || initialInvestment < 0) {
    return { npv: null, yearlyData: [] };
  }

  const rate = discountRate / 100;
  let npv = -initialInvestment;
  const yearlyData: [number, number, number][] = [];

  for (let t = 1; t <= duration; t++) {
    const discountFactor = 1 / Math.pow(1 + rate, t);
    const discountedCashflow = discountFactor * annualCashflow;
    npv += discountedCashflow;
    yearlyData.push([t, Number(discountFactor.toFixed(4)), Math.round(discountedCashflow)]);
  }

  return { npv, yearlyData };
};

export const calculateProductivity = (sloc: number, workMonths: number): number => {
  return workMonths > 0 ? sloc / workMonths : 0;
};

export const calculateIRR = (initialInvestment: number, annualCashflow: number, duration: number): number | null => {
  if (duration <= 0) return null;
  const cashflows = [-initialInvestment, ...Array(duration).fill(annualCashflow)];
  const irrValue = irr(cashflows);
  return irrValue === null || isNaN(irrValue) ? null : irrValue * 100;
};