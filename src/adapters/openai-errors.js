export function toOpenAIError(error, { status = 502, requestId } = {}) {
  const message = error?.message || "Upstream provider error";
  const type = error?.type || (status >= 500 ? "server_error" : "invalid_request_error");
  return {
    status,
    body: {
      error: { message, type, param: error?.param ?? null, code: error?.code ?? null },
      ...(requestId ? { request_id: requestId } : {})
    }
  };
}
