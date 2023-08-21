import pc from 'picocolors';
import cron from './modules/cron';
import { ModuleStatus } from './modules/module';
import conversationModule from './modules/conversation/conversation-module';
import conversationFlowModule from './modules/conversation/conversation-flow-module';
import autoChats from './modules/auto-chats';

const modules = [cron, conversationModule, conversationFlowModule, autoChats];

for (const mod of modules) {
  const status = mod.checkDependencies();
  if (status === ModuleStatus.ENABLED) {
    mod.init();
  }
}

const moduleStatusMessage = modules
  .map((mod) => {
    const colors = {
      [ModuleStatus.ENABLED]: pc.green,
      [ModuleStatus.DISABLED]: pc.red,
      [ModuleStatus.MISSING_DEPENDENCY]: pc.yellow,
    };

    const msg = `${pc.bold(mod.name)}: ${colors[mod.status](mod.status)}`;

    if (mod.status === ModuleStatus.MISSING_DEPENDENCY) {
      const dependencies = mod.dependencies!.map((dep) => dep.name);
      return `${msg} (${dependencies.join(', ')})`;
    }

    return msg;
  })
  .join('\n');

export default moduleStatusMessage;
