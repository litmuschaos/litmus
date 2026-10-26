const chalk = require('chalk');
const COMMIT_MSG = process.argv[2];
const COMMIT_REGEX = /^(revert: )?(feat|fix|docs|style|refac|perf|test|chore)(\(.+\))?:\s\[.*-\d*\]: .{1,50}/;
const ERROR_MSG =
  'Commit messages must be "fix/feat/docs/style/refac/perf/test/chore: [CHAOS-<ticket number>]: <changes>"';
if (!COMMIT_REGEX.test(COMMIT_MSG)) {
  console.log(chalk.red(ERROR_MSG));
  console.log(`But got: "${COMMIT_MSG}"\n`);
  process.exit(1);
}
