import type { HydratedCartLine, Product } from '../types/catalog';
import { formatInr } from './money';

const WHATSAPP_NUMBER_RAW = '917904957928';
export const WHATSAPP_DISPLAY_NUMBER = '+91 79049 57928';
export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/maheshdesigners_online_/';
export const INSTAGRAM_HANDLE = '@maheshdesigners_online_';

export function buildWhatsAppUrlFromText(message: string): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER_RAW}?text=${encoded}`;
}

export function buildProductWhatsAppUrl(product: Product, quantity = 1): string {
  const lines = [
    `Hello Mahesh Designers,`,
    `I would like to enquire about the following piece from your catalog:`,
    ``,
    `• Product: ${product.displayTitle} (${product.sourceTitle ?? product.id})`,
    `• Archive ID: ${product.id}`,
    product.productCode ? `• Product Code: ${product.productCode}` : null,
    `• Listed Price: ${product.priceFormatted}`,
    quantity > 1 ? `• Quantity of Interest: ${quantity}` : null,
    product.sourceUrl ? `• Reference Link: ${product.sourceUrl}` : null,
    ``,
    `Please share current availability and ordering details.`,
  ].filter(Boolean);

  return buildWhatsAppUrlFromText(lines.join('\n'));
}

export function buildBagWhatsAppUrl(lines: HydratedCartLine[], subtotalInr: number): string {
  if (lines.length === 0) {
    return buildGeneralWhatsAppUrl();
  }
  const itemBullets = lines.map((item, idx) => {
    const codeStr = item.product.productCode ? ` [Code: ${item.product.productCode}]` : '';
    return `${idx + 1}. ${item.product.displayTitle}${codeStr} — Qty: ${item.quantity} × ${item.product.priceFormatted} = ${item.lineTotalFormatted}`;
  });

  const msg = [
    `Hello Mahesh Designers,`,
    `I would like to enquire about availability and ordering for these selected pieces:`,
    ``,
    ...itemBullets,
    ``,
    `Illustrative Merchandise Subtotal: ${formatInr(subtotalInr)}`,
    `(Please confirm stock availability, shipping charges, and final payable amount.)`,
  ].join('\n');

  return buildWhatsAppUrlFromText(msg);
}

export function buildGeneralWhatsAppUrl(customTopic?: string): string {
  const text = customTopic
    ? `Hello Mahesh Designers, I have a question regarding: ${customTopic}`
    : `Hello Mahesh Designers, I was browsing your saree, dress material, and fabric collection and would like assistance.`;
  return buildWhatsAppUrlFromText(text);
}

