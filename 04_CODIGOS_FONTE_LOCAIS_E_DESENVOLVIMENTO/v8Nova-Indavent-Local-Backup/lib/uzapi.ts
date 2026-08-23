/**
 * Uzapi WhatsApp API Utility
 */

const UZAPI_ENDPOINT = process.env.UZAPI_ENDPOINT || 'https://digitech.uzapi.com.br:3333';
const UZAPI_SESSION = process.env.UZAPI_SESSION || 'indaventtesteswpp01';
const UZAPI_TOKEN = process.env.UZAPI_TOKEN;

/**
 * Interface for Uzapi Message
 */
export interface UzapiMessage {
  id: string;
  session: string;
  phone: string;
  sender?: string;
  name?: string;
  content: string;
  timestamp: number;
  type: string;
  isGroupMsg?: boolean;
  status: string;
  datetime?: string;
}

/**
 * Fetch all chats for a session
 */
export async function getAllChats() {
  if (!UZAPI_TOKEN) {
    throw new Error('UZAPI_TOKEN is not configured');
  }

  const response = await fetch(`${UZAPI_ENDPOINT}/getAllChats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UZAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session: UZAPI_SESSION })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Uzapi Error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch messages for a specific chat
 */
export async function getMessagesChat(phone: string) {
  if (!UZAPI_TOKEN) {
    throw new Error('UZAPI_TOKEN is not configured');
  }

  const response = await fetch(`${UZAPI_ENDPOINT}/getMessagesChat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UZAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      session: UZAPI_SESSION,
      number: phone
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Uzapi Error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Filter logic: Determine if a message indicates sales interest
 */
export function isLeadInterest(content: string): boolean {
  if (!content) return false;
  
  const keywords = [
    'comprar', 'preço', 'valor', 'orçamento', 'cotar', 'cotação',
    'drywall', 'perfil', 'exaustor', 'eólico', 'proposta',
    'catálogo', 'lista de preços', 'interessado', 'interesse'
  ];
  
  const normalizedContent = content.toLowerCase();
  
  // High weight keywords
  const highWeight = ['comprar', 'orçamento', 'drywall', 'exaustor'];
  
  // Count matches
  const matches = keywords.filter(k => normalizedContent.includes(k));
  
  // Logic: At least one high weight keyword OR two total keywords
  return highWeight.some(k => normalizedContent.includes(k)) || matches.length >= 2;
}

/**
 * Parse Uzapi phone to standard format
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  // Remove @c.us or other suffixes
  return phone.split('@')[0].replace(/\D/g, '');
}

/**
 * Parse Uzapi datetime string to ISO
 * Format: 29-11-2025 00:58:08
 */
export function parseUzapiDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('-');
  
  const isoStr = `${year}-${month}-${day}T${timePart}`;
  return new Date(isoStr).toISOString();
}
