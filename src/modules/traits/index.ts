import { Module, ModuleStatus } from '../module';
import conversationModule from '../conversation/conversation-module';
import { PersonalityTrait } from '../../models/personality-traits.model';

class TraitsModule extends Module {
  name = 'Traits';
  status = ModuleStatus.ENABLED;
  dependencies?: Module[] | undefined = [conversationModule];

  init() {
    // :)
  }

  async getUserTraits(userId: string): Promise<Record<string, string[]> | undefined> {
    const aggregation = await PersonalityTrait.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: '$userId',
          traits: {
            $push: {
              k: '$trait',
              v: '$value',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          traits: {
            $arrayToObject: '$traits',
          },
        },
      },
    ]);

    const traits = aggregation[0]?.traits;

    if (Object.keys(traits).length === 0) {
      return undefined;
    }
    return traits;
  }
}

export default new TraitsModule();
