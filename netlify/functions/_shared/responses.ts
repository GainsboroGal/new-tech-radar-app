export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=30",
      ...headers,
    },
  });
}

export function error(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, status);
}

export function unauthorized(message = "Unauthorized") {
  return error(message, 401);
}
