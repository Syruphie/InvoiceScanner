import * as FileSystem from 'expo-file-system/legacy';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function analyzeInvoiceFromImage(imageUri) {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64 }),
  });

  if (!response.ok) {
    throw new Error('Backend failed');
  }

  return await response.json();
}


export async function getInvoices() {
  const response = await fetch(`${API_URL}/invoices`);

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return await response.json();
}

export function mapAzureToInvoiceData(result) {
  const doc = result?.documents?.[0];
  const f = doc?.fields || {};

  return {
    vendor: f?.VendorName?.content || 'Unknown Vendor',
    invoiceNo: f?.InvoiceId?.content || 'N/A',
    date: f?.InvoiceDate?.content || 'N/A',
    dueDate: f?.DueDate?.content || 'N/A',
    subtotal: f?.SubTotal?.content || 'N/A',
    tax: f?.TotalTax?.content || 'N/A',
    total: f?.InvoiceTotal?.content || 'N/A',
    confidence: doc?.confidence ? Math.round(doc.confidence * 100) : 0,
  };
}
