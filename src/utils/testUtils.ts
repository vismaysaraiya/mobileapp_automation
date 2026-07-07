export function randomEmail(): string {
  return `qa.${Math.random().toString(36).slice(2, 10)}@example.com`;
}
