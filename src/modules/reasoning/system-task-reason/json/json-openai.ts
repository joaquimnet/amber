import { OpenAIRoles } from '../../../awareness/conversation';
import { OpenAIMessages, openAIClient } from '../../../core/openai/openai';

export async function openAIJsonTaskResolution(task: string, context?: object) {
  const commonPrompt = {
    role: OpenAIRoles.SYSTEM,
    // content: `Given this background context: \n${JSON.stringify(
    //   context,
    //   null,
    //   2,
    // )}\n\nPlot out steps to perform the following action: ${task}\n\nOutput your answer in JSON format: [{"action":".."}]`,
    content: `Plot out steps to perform the following action: ${task}\n\nOutput your answer in JSON format: [{"action":".."}]`,
  };

  const response = await openAIClient.systemCompletion([commonPrompt]);
  console.log('response.choices: ', response.choices);
  return response.choices[0].text;
}
