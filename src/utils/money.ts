import type { HydratedCartLine, Product } from '../types/catalog';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatInr(amountInr: number | null | undefined): string {
  if (amountInr === null || amountInr === undefined || Number.isNaN(amountInr)) {
    return 'Enquire for price';
  }
  return inrFormatter.format(Math.round(amountInr));
}

export function clampQuantity(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(10, Math.round(qty)));
}

export function hydrateCartLine(product: Product, rawQuantity: number): HydratedCartLine {
  const quantity = clampQuantity(rawQuantity);
  const unitPaise = product.pricePaise ?? (product.priceInr ? product.priceInr * 100 : 0);
  const lineTotalPaise = unitPaise * quantity;
  const lineTotalInr = Math.round(lineTotalPaise / 100);
  return {
    product,
    quantity,
    lineTotalPaise,
    lineTotalInr,
    lineTotalFormatted: formatInr(lineTotalInr),
  };
}

export function computeBagSubtotal(lines: HydratedCartLine[]): {
  subtotalInr: number;
  subtotalPaise: number;
  subtotalFormatted: string;
  totalUnits: number;
} {
  let subtotalPaise = 0;
  let totalUnits = 0;
  for (const line of lines) {
    subtotalPaise += line.lineTotalPaise;
    totalUnits += line.quantity;
  }
  const subtotalInr = Math.round(subtotalPaise / 100);
  return {
    subtotalInr,
    subtotalPaise,
    subtotalFormatted: formatInr(subtotalInr),
    totalUnits,
  };
}

