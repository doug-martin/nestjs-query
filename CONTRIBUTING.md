`nestjs-query` welcomes any contribution!

For all feature, bug and pull requests please adhere to the following **golden rule**:

**Be polite** - All work on this library is done in contributors free time. Please respect the effort they have put into this library.

## Development Process 

We use [github issues](https://github.com/tripss/nestjs-query/issues) and [pull requests](https://github.com/tripss/nestjs-query/pulls) to track all bugs and feature. All changes should be reflected in an issue or pull request.

As such, you must adhere to the following guidelines.

### Bug Reports

Bug reports are essential to the success of this libary, please follow these guidelines:
* A single bug report per issue
  * Multiple bugs per issue makes it difficult to prioritize and track progress.     
  * Contributors will most likely end up splitting your bug report up into multiple fixes, if you can save them some time by splitting your report up beforehand it is greatly appreciated.  
* A concise description of the bug
  * A clear and concise description of the bug reduces the amount of research required to come to a resolution.
* A reproducible example 
  * Without a reproducible example a lot of time can be spent trying to reproduce the reported issue. This will ultimately lead to a prolonged resolution time. If you provide a good example your issue is much more likely to be fixed quickly. 

### Feature Requests

We're always looking for new feature requests! We ask that you adhere to the following guidelines when issuing a feature request:
* A single feature request per issue
  * Multiple features per issue makes it difficult to prioritize and track progress.   
  * If you request multiple features in a single issue you may only end up with a partial implementation of all of your request.
  * Contributors will most likely end up splitting your feature request up into multiple release, if you can save them some time by splitting your request up beforehand it is greatly appreciated.
  * Multiple issues can ultimately look bad for the repository, if 3 out of the 4 requests have been implemented, the issue can still look stale deterring other users from using the libraries. 
* A concise description of the feature
  * A clear and concise description of the feature reduces the amount of back and forth required to come to a decision on the best path forward, ultimately leading to a faster turn around time. 
* An example use case
  * A concrete use case helps in creating tests cases. When included with a good description, the chances of your feature being worked on next increases dramatically.


Finally, its ok if your feature request gets rejected. You may think your feature is the best, but, it may not fit into the long term vision of the project. It may also be limited by features in other libraries. If your feature gets rejected but you see a clear path forward feel free to issue a PR the chances of it being merged once the work is done is very high as long as you have followed the guidelines laid out below.

### Pull Requests
Pull Requests are the best way to contribute to this library. When issuing a pull request you need to follow these guidelines otherwise your PR may not be merged:
* A link to the original issue that sparked the change.
  * If there is not an issue you are addressing please include the details required when issuing a [feature request](#feature-requests) or [bug report](#bug-reports).
* Write tests!
  * Tests are essential to the success of this library. All PRs that modify code must include tests to ensure no regressions occur, from external or internal changes. See [writing tests](#writing-tests).     
* All tests must pass. See [running tests](#running-tests) 
  * If your PR does not pass the automated checks it will not be merged.  
* All commits must follow the [Conventional Commits Guidelines](https://www.conventionalcommits.org/en/v1.0.0/).
  * You should think deeply about your change to determine if it is a breaking change. If it is please include a [BREAKING CHANGE](https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-both--and-breaking-change-footer) footer. 
* Include relevant [docs for new features](#documentation)

## Installation

Before you begin writing any new code you will need to run the following

```
npm install
npm run bootstrap
npm run build
```

## Writing Tests

### Unit Tests

:::note
Unit tests should not rely on any persistent storage. If you want to test the full stack write an e2e test.
:::

If you have created a new class you should create a corresponding `.spec.ts` file in the packages test directory. The test file should be located in a test directory that matches the path in the `src` directory.

For example if you created a new class with the following directory structure

```
/src
  /my
    /cool.feature.ts
```

Your test file would be located in

```
/test
  /my 
    /cool.feature.spec.ts
```

Your unit tests should cover as many code paths as possible including error cases and conditionals

### E2E Tests

`e2e` test cases should cover high level functionaly not focusing on all code paths but ensuring that your code is covered when called all the way through the stack as you expect.

Most test cases can be included in an example that already exists. If you are including an entirely new feature that you cannot integration tested without changing existing functionality feel free to create a new example.  

To add a new example follow these steps
* Create a new directory in the `examples` directory.
  * The name should be short but enough to describe the use case.
* Add your example to the `examples/nest-cli.json` `projects` array.
  * If your example requires `typeorm` or `sequelize` add your init scripts to:
    * `examples/init-scripts/mysql` - See the [basic example](https://github.com/tripss/nestjs-query/blob/master/examples/init-scripts/mysql/init-basic.sql)
    * `examples/init-scripts/postgres` - See the [basic example](https://github.com/tripss/nestjs-query/blob/master/examples/init-scripts/postgres/init-basic.sql)
  * All files should match the following format `init-{example-name}.sql`
    * Your init script should create a `USER`, `DATABASE` and `GRANT PRIVELAGES` to the user for the database.
    * Be sure to use the user you created in your `app.module.ts` file. See [the basic example](https://github.com/tripss/nestjs-query/blob/master/examples/basic/src/app.module.ts) 
* Add your modules and tests.

To run your tests follow [these instructions](#running-e2e-tests)

To start your example run the following

`npm run start -- {example-name}`



## Running Tests

`nestjs-query` includes both `unit` and `integration` tests. 

### Running Lint 

`npm run lint`

### Running Unit Tests

`npm run jest:unit`

### Running E2E Tests

All `e2e` tests are located in the `examples` directory. 

The first time you run the `e2e` tests you will need to start all backing services. 

```
cd ./examples
docker-compose up -d
```  

To run the tests you can issue the following from the root 

```
npm run jest:e2e
```

### Running All Tests

:::note
You will need to start the backing services described in `Running E2E Tests` first.
:::

```
npm run jest
```

## Conventional Commits

`nestjs-query` follows the [Conventional Commits Guidelines](https://www.conventionalcommits.org/en/v1.0.0/)

Format: `<type>(<scope>): <subject>`

`<scope>` is optional, but is typically the scope of the feature either package (e.g. `core`, `grapqql`, `typeorm` etc)

Example
```
feat: allow overriding of webpack config
^--^  ^--------------------------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```
The various types of commits:

* `feat`: (new feature for the user, not a new feature for build script)
* `fix`: (bug fix for the user, not a fix to a build script)
* `docs`: (changes to the documentation)
* `style`: (formatting, missing semi colons, etc; no production code change)
* `refactor`: (refactoring production code, eg. renaming a variable)
* `test`: (adding missing tests, refactoring tests; no production code change)
* `chore`: (updating grunt tasks etc; no production code change)

## Documentation

All new features require documentation so other users can take advantage of them.

:::info
`nestjs-query` uses [docusaurus](https://v2.docusaurus.io/) for documentation.
::: 

### Serving Docs Locally

Running the documentation locally is the easiest way to view your changes to ensure they render as you expect.

To run the docs locally do the following:
```
cd ./documentation
npm run install # first time only
npm run start
```

### Creating A New Page

If you find yourself in a situation where you are adding a new feature or documentation that requires its own page feel free to create a doc in the appropriate directory

* `introduction` - A quick introduction for developers with installation guides, a feature list and example application.
* `concepts` - Core concepts required to get started in `nestjs-query`
* `graphql` - All documentation that is graphql specific.
* `persistence` - Documentation related to the different persistence libary adapters.
* `utilities` - Miscellaneous utilties that are useful when building an application.
* `migration-guides` - Documentation on how to upgrade between versions when breaking changes are introduced.
* `faq.md` - Common questions with links to the relevant documentation.

If you are unsure where to add documentation, feel free to issue a draft PR and include a question on where to add the relevant documentation!

:::info
When creating a new page you need to be sure to add it to the `documentation/sidebars.js`.
:::
