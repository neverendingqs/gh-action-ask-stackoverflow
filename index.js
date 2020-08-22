const core = require('@actions/core');
const github = require('@actions/github');

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

    await octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: `Received query '${query}!'`
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

main().catch(err => {
  console.log(err);
  process.exit(-1);
});
