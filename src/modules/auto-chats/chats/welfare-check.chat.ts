import { OperationalLog } from '../../../models';
import conversationModule from '../../conversation/conversation-module';
import { openAIService } from '../../openai/openai';
import { OpenAIRoles } from '../../openai/types';
import { Chat } from './chat';

const KAF = '517599684961894400';

export class WelfareCheckChat extends Chat {
  getId() {
    return 'welfare-check';
  }

  async shouldRun() {
    // don't run if the last message in Ember's context (with Kaf) was in the last 3 minutes
    const context = await conversationModule.getContext(KAF);

    if (context.messages.length === 0) return true;

    const lastMessage = context.messages[context.messages.length - 1];
    const lastMessageTimestamp = new Date(lastMessage.timestamp);
    const now = new Date();
    const diff = now.getTime() - lastMessageTimestamp.getTime();
    const diffMinutes = Math.floor(diff / 1000 / 60);

    if (diffMinutes > 3) {
      return true;
    }

    // check if the last welfare utterance was more than 2 hours ago
    const lastUtterance = await OperationalLog.findOne({
      type: 'autonomy:chat',
      'meta.utteranceId': this.getId(),
    });

    if (!lastUtterance) return true;

    const lastUtteranceTimestamp = new Date(lastUtterance.createdAt!);
    const diff2 = now.getTime() - lastUtteranceTimestamp.getTime();
    const diffMinutes2 = Math.floor(diff2 / 1000 / 60);

    if (diffMinutes2 > 120) {
      return true;
    }

    return false;
  }

  async generate() {
    const res = await openAIService.chatCompletion(
      [
        {
          role: OpenAIRoles.SYSTEM,
          content: 'Reassure the user that they are doing well and everything will be okay.',
        },
      ],
      KAF, // dw about this
      'Kaf',
      true,
    );

    return res.choices[0].message.content;
  }

  getDefaultCooldown() {
    return 0;
  }

  async getNewCooldown() {
    return 5 * 60;
  }
}
