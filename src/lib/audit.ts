export function audit(event: string, fields: Record<string, string>) {
  // Structured, secret-free logs. Do not pass credentials, customer payment data, or wallet data here.
  console.info(JSON.stringify({ audit: true, event, ...fields, timestamp: new Date().toISOString() }));
}
