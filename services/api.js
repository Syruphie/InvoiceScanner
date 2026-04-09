export async function scanInvoice(imageUri) {
  const form = new FormData();
  form.append('invoice', {
    uri: imageUri,
    name: 'invoice.jpg',
    type: 'image/jpeg',
  });

  const res = await fetch('https://YOUR_BACKEND_URL/upload', {
    method: 'POST',
    body: form,
  });

  return res.json();
}
