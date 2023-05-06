export function splitMessage(content: string) {
  const messages = content.split('\n');
  const messageChunks = [];
  let currentChunk = [];
  let currentChunkLength = 0;
  for (const message of messages) {
    if (currentChunkLength + message.length > 2000) {
      messageChunks.push(currentChunk.join('\n'));
      currentChunk = [];
      currentChunkLength = 0;
    }
    currentChunk.push(message);
    currentChunkLength += message.length;
  }
  messageChunks.push(currentChunk.join('\n'));
  return messageChunks;
}