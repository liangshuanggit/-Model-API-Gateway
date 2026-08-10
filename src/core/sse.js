export function writeSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function endSSE(res) {
  res.write('data: [DONE]\n\n');
  res.end();
}
