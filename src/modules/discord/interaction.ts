import { Interaction } from 'discord.js';

interface ParsedInteractionId {
  name: string;
  payload: string[];
}

export function parseInteractionId(interaction: Interaction): ParsedInteractionId {
  const customId = (interaction as any).customId || 'none:none';
  const [type, rest] = customId.split(':');
  const payload = rest.split(',');

  return { name: type, payload };
}
