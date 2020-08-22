const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

const prefix = '/so ';

async function main() {
  const githubToken = core.getInput('github-token');
  const octokit = github.getOctokit(githubToken);

  try {
    const { comment, issue, repository } = github.context.payload;

    if(!comment.body.startsWith(prefix)) {
      console.log(`Comment '${comment.body}' did not begin with '${prefix}'. No action taken.`);
      return;
    }

    const query = comment.body.substring(prefix.length);

    const response = await fetch(`https://api.stackexchange.com/2.2/search/advanced?pagesize=3&order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow`);
    const { items } = await response.json();

    const entries = items.reduce(
      (acc, { link, title }) => {
        const entry = [
          `## [${title}](${link})`,
          '<details>',
          '<summary>Answers</summary>',
          '</details>'
        ];
        acc.push(...entry, '');
        return acc;
      },
      [`# ${query}`]
    );

    await octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: entries.join('\n')
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

main().catch(err => {
  console.log(err);
  process.exit(-1);
});
