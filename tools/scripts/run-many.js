const { logger } = require('@nrwl/devkit')
const { execSync } = require('child_process')
const core = require('@actions/core')

const target = process.argv[2]
const headRef = process.argv[5]
const baseRef = process.argv[6]

const nxArgs = headRef !== baseRef && baseRef !== 'empty' ? `--head=${headRef} --base=${baseRef}` : '--all'

const buildAffectedCommand = ['npx nx print-affected', `--target=${target !== 'publish' ? target : 'version'}`, nxArgs]

const affectedCommand = buildAffectedCommand.join(' ')

logger.info(`Running: ${affectedCommand}`)

const affected = execSync(affectedCommand).toString('utf-8')

const affectedProjects = JSON.parse(affected)
  .tasks.map((task) => task.target.project)
  .slice()
  .sort()

if (affectedProjects.length > 0) {
  if (target === 'publish') {
    while (affectedProjects.length > 0) {
      const project = affectedProjects.shift()

      if (['workspace', 'documentation'].includes(project)) {
        continue
      }

      // Try to Publish the package
      try {
        execSync(`npm publish ./dist/packages/${project} --access public`, { stdio: 'inherit' })
      } catch (err) {
        core.warning(`Error publishing ${project}`, err)
      }
    }
  } else {
    const execCommand = ['npx nx run-many', `--target=${target}`, `--projects=${affectedProjects.join(',')}`]

    const command = execCommand.join(' ')

    logger.info(`Running: ${command}`)

    execSync(command, { stdio: 'inherit' })
  }
}
