const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  try {
    const { issue, repository } = github.context.payload;

    await octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: 'Received!',
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

main().catch(err => {
  console.log(err);
  process.exit(-1);
})
