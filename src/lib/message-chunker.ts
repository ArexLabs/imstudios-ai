const MAX_CHUNK_LENGTH = 2000;

export function chunkMessage(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) {
    return [text];
  }

  const chunks: string[] = [];
  let buffer = "";

  const segments = text.split("\n");

  for (const segment of segments) {
    const candidate = buffer ? `${buffer}\n${segment}` : segment;

    if (candidate.length > MAX_CHUNK_LENGTH) {
      if (buffer) {
        chunks.push(buffer);
        buffer = "";
      }

      if (segment.length > MAX_CHUNK_LENGTH) {
        for (let i = 0; i < segment.length; i += MAX_CHUNK_LENGTH) {
          chunks.push(segment.slice(i, i + MAX_CHUNK_LENGTH));
        }
      } else {
        buffer = segment;
      }
    } else {
      buffer = candidate;
    }
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks;
}
