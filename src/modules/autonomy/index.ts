import { Module, ModuleStatus } from '../module';

// dummy module to bar autonomy dependent submodules

class AutonomyModule extends Module {
  name = 'Autonomy';
  status = ModuleStatus.DISABLED;
  dependencies?: Module[] | undefined;

  init() {
    // TODO: Implement
  }
}

export default new AutonomyModule();
