export function parseDeepSeekResponse(data) {
  const root = data?.data ?? data?.result ?? data ?? {};
  return {
    content: root.answer ?? root.content ?? root.text ?? root.message?.content ?? root.choices?.[0]?.message?.content ?? "",
    sessionId: root.chat_session_id ?? root.session_id ?? root.sessionId ?? root.conversation_id ?? root.conversationId,
    messageId: root.parent_message_id ?? root.message_id ?? root.messageId ?? root.id,
    usage: root.usage ?? root.token_usage ?? root.tokenUsage,
    finishReason: root.finish_reason ?? root.finishReason ?? root.choices?.[0]?.finish_reason
  };
}

export function parseDeepSeekChunk(data) {
  return { ...parseDeepSeekResponse(data), raw: data };
}
