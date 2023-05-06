import { Types } from 'mongoose';

export abstract class Chat {
  private id!: string;

  /**
   * Whether or not this utterance should be run at this time.
   */
  abstract shouldRun(): Promise<boolean>;
  /**
   * Generate the utterance.
   */
  abstract generate(): Promise<string>;
  /**
   * Get the default cooldown for this utterance.
   */
  abstract getDefaultCooldown(): number;
  /**
   * Get the new cooldown for this utterance based on context.
   */
  abstract getNewCooldown(): Promise<number>;

  protected generateId() {
    return new Types.ObjectId().toHexString();
  }
}
