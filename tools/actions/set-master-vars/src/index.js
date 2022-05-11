const core = require('@actions/core')
const { execSync } = require('child_process')

const { GITHUB_REF } = process.env

core.info('Fetching latest tag...')
const latestTag = execSync(`git describe --tags $(git rev-list --tags --max-count=1)`)
  .toString('utf8')
  .trim()

const tagSha = execSync(`git rev-list -n 1 ${latestTag}`)
  .toString('utf8')
  .trim()

const headRef = GITHUB_REF.replace('refs/heads/', '')

core.info(`"${latestTag}" is the latest tag with "${tagSha}" sha`)
core.info(`"${headRef}" is the head ref`)

core.setOutput('tag', latestTag)
core.setOutput('tagHash', tagSha)
core.setOutput('headRef', headRef)
