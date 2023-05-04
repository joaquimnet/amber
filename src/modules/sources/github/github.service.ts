import { Octokit } from '@octokit/rest';
import { github } from '../../../config';

class GithubService {
  client: Octokit;

  constructor() {
    this.client = new Octokit({
      auth: github.GITHUB_TOKEN,
      log: console,
    });
  }

  async readRepositories() {
    const { data } = await this.client.repos.listForAuthenticatedUser({
      per_page: 999,
      sort: 'pushed',
    });
    return data.filter((repo) => !BLACKLIST.includes(repo.name));
  }

  async readRepository(owner: string, repository: string) {
    const { data } = await this.client.repos.get({
      owner,
      repo: repository,
    });

    return data;
  }

  async getCommits(owner: string, repository: string) {
    const { data } = await this.client.repos.listCommits({
      owner,
      repo: repository,
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      per_page: 999,
    });

    return data;
  }

  async getCommitsLast24HoursForAllRepos() {
    const repositories = await this.readRepositories();

    const commits = await Promise.all(
      repositories.map(async (repository) => {
        const repositoryCommits = await this.getCommits(repository.owner.login, repository.name)
          .then((c) => {
            return {
              repository,
              commits: c,
            };
          })
          .catch((err) => {
            if (err.status === 409) {
              return {
                repository,
                commits: [],
              };
            }
          });
        return repositoryCommits;
      }),
    );

    return commits.filter((c: any) => c.commits.length > 0).filter(Boolean)!;
  }
}

const BLACKLIST = ['joaquimnet', 'vault', 'studious-spoon', 'fictional-guide', 'verbose-eureka'];

export const githubService = new GithubService();
