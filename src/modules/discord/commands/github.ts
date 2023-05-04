import { Message } from 'discord.js';
import { Command } from '../command';
import { githubService } from '../../sources/github/github.service';

class GithubCommand extends Command {
  constructor() {
    super({ name: 'github' });
  }

  async execute(message: Message) {
    const res = await githubService.getCommitsLast24HoursForAllRepos();
    let msg = '';
    for (const repo of res) {
      msg += `**${repo!.repository.name}**\n${repo!.commits
        .map((commit) => `- ${commit.commit.committer?.date} ${commit.commit.message}`)
        .join('\n')}\n`;
    }
    await message.channel.send(msg);
  }
}

export default new GithubCommand();
