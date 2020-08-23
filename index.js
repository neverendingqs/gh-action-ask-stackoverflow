const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

const prefix = '/so';

async function getSoQuestions(query) {
  const response = await fetch(`https://api.stackexchange.com/2.2/search/advanced?pagesize=3&order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&filter=withbody`);
  const { items } = await response.json();
  return items;
}

async function getSoAnswers(questionId) {
  const response = await fetch(`https://api.stackexchange.com/2.2/questions/${questionId}/answers?pagesize=3&order=desc&sort=votes&site=stackoverflow&filter=withbody`);
  const { items } = await response.json();
  return items;
}

function formatSoAnswer({ answer_id, body, owner, score }) {
  return `### [By \`${owner.display_name}\` (Votes: ${score})](https://stackoverflow.com/a/${answer_id})\n${body}\n`;
}

async function main() {
  const githubToken = core.getInput('github-token');
  const octokit = github.getOctokit(githubToken);

  try {
    const { comment, issue, repository } = github.context.payload;

    if(!comment.body.startsWith(prefix)) {
      console.log(`Comment '${comment.body}' did not begin with '${prefix}'. No action taken.`);
      return;
    }

    await octokit.reactions.createForIssueComment({
      owner: repository.owner.login,
      repo: repository.name,
      comment_id: comment.id,
      content: '+1',
    });

    const query = comment.body.substring(prefix.length).trim();
    if(query.length === 0) {
      await octokit.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: 'Search anything on Stack Overflow using the `/so` command!\n\nUsage: `/so <query>`'
      });

      return;
    }

    const questions = await getSoQuestions(query);

    const entries = [`# Results for \`${query}\``];

    for(const { body, link, question_id, owner, score, title } of questions) {
      const answers = await getSoAnswers(question_id);

      const entry = [
        `## [${title} (Votes: ${score})](${link})\n`,
        `_Asked by ${owner.display_name}_.\n`,

        '<details>',
        '<summary>Question</summary>\n',
        `${body}\n`,
        '</details>',

        '<details>',
        '<summary>Answers</summary>\n',
        answers.map(formatSoAnswer).join('\n'),
        '</details>'
      ];

      entries.push(...entry, '');
    }

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
