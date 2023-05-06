import autonomy from '../autonomy';
import conversationModule from '../conversation/conversation-module';
import { Module, ModuleStatus } from '../module';

class AutoChatsModule extends Module {
  name = 'AutoChats';
  status = ModuleStatus.DISABLED;
  dependencies = [autonomy, conversationModule];

  init() {
    // TODO: Implement
  }
}

export default new AutoChatsModule();
