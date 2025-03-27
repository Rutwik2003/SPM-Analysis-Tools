declare module 'numpy-financial' {
    export function irr(values: number[]): number;
    export function npv(rate: number, values: number[]): number;
  }