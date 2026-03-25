export function getServerApiBaseUrl(): string {
  return process.env.MARKETPLACE_API_BASE_URL ?? "http://localhost:3000";
}

export function getClientApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_MARKETPLACE_API_BASE_URL ?? process.env.MARKETPLACE_API_BASE_URL ?? "";
}
