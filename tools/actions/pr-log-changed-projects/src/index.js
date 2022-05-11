const core = require('@actions/core')
const { execSync } = require('child_process')

const { GITHUB_HEAD_REF } = process.env

const latestTag = execSync(`git describe --tags $(git rev-list --tags --max-count=1)`)
  .toString('utf8')
  .trim()

const tagSha = execSync(`git rev-list -n 1 ${latestTag}`)
  .toString('utf8')
  .trim()

core.info(`"${latestTag}" is the latest tag with "${tagSha}" sha`)
core.info(`"${GITHUB_HEAD_REF}" is the current head`)

core.info(`Fetching changed projects between https://github.com/tripss/nestjs-query/compare/${latestTag}...${GITHUB_HEAD_REF}`)

const affected = execSync(`npx nx print-affected --target=version --head=origin/${GITHUB_HEAD_REF} --base=${tagSha}`)
  .toString('utf8')
  .trim()

const affectedProjects = JSON.parse(affected)
  .tasks.map((task) => task.target.project)
  .sort()

execSync(`npx nx run-many --target=version --projects=${affectedProjects.join(',')} --baseBranch="${latestTag}" --dryRun`, { stdio: 'inherit' })
