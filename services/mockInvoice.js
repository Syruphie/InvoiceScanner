export function buildMockInvoiceData(source = 'camera') {
  const confidence = source === 'gallery' ? 95 : 97;

  return {
    vendor: 'Staples Inc.',
    invoiceNo: '#INV-20483',
    date: 'Apr 9, 2026',
    dueDate: 'May 9, 2026',
    subtotal: '$128.57',
    tax: '$13.93',
    total: '$142.50',
    confidence,
  };
}
