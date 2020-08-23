# gh-action-ask-stackoverflow

GitHub Action for searching on [Stack Overflow](https://stackoverflow.com/).

## Usage

Set up a workflow to pull in this action:

```yaml
on:
  issue_comment:
    types: [created]

jobs:
  ask-stackoverflow:
    runs-on: ubuntu-latest
    steps:
      - uses: neverendingqs/gh-action-ask-stackoverflow@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Then search anything on Stack Overflow using the `/so` command, and the action will post back with the top 3 matching results, each with the top 3 answers.

Try it out by running the `/so` command on this [issue](https://github.com/neverendingqs/gh-action-ask-stackoverflow/issues/1) or [pull request](https://github.com/neverendingqs/gh-action-ask-stackoverflow/pull/2)!
