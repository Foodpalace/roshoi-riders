export function nid(): string {
  return crypto.randomUUID();
}

export function orderCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `RSH-${n}`;
}
