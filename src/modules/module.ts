export abstract class Module {
  abstract readonly name: string;
  abstract status: ModuleStatus;
  abstract readonly dependencies?: Module[];

  abstract init(): void;

  checkDependencies() {
    if (this.status === ModuleStatus.DISABLED) return;
    if (this.dependencies) {
      this.dependencies.forEach((dependency) => {
        if (dependency.status === ModuleStatus.DISABLED || dependency.status === ModuleStatus.MISSING_DEPENDENCY) {
          this.status = ModuleStatus.MISSING_DEPENDENCY;
        }
      });
    }
    return this.status;
  }
}

export enum ModuleStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  MISSING_DEPENDENCY = 'MISSING_DEPENDENCY',
}
