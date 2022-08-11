`nestjs-query` examples.

## Usage

From the root of the repo run

```sh
npm run bootstrap
```

Then from this directory start the docker containers.

```
docker-compose up -d
```

### Running Examples

To run an example execute `npm run start -- {example_name}` where example name is one of the following.

* [`basic`](./basic`) - A basic todo graphql API.
* Federation
    * [`federation:gateway`](../documentation/federation/gateway) - Graphql federation gateway
    * [`federation:sub-task`](../documentation/federation/sub-task-graphql) - Federated sub-task GraphQL API
    * [`federation:tag`](../documentation/federation/tag-graphql) - Federated tag GraphQL API
    * [`federation:todo-item`](../documentation/federation/todo-item-graphql) - Federated todo-item GraphQL API
* [`offset-paging`](../documentation/offset-paging) - Example GraphQL API that uses offset based paging with array
  connections
* [`no-paging`](../documentation/no-paging) - Example GraphQL API without paging
* [`sequelize`](../documentation/sequelize) - Example GraphQL API using sequelize
* [`subscriptions`](../documentation/subscriptions) - Example todo-item GraphQL API with subscriptions.
* [`typeorm`](../documentation/typeorm) - Example todo-item GraphQL API using typeorm
* [`typeorm-multidb`](../documentation/typeorm-multidb) - Example GraphQL API using typeorm with mutliple databases
* [`typeorm-soft-delete`](../documentation/typeorm-soft-delete) - - Example todo-item GraphQL API using typeorm with
  soft deletes.
* [`custom-service`](../documentation/custom-service) - - Example todo with a custom-implemented service class.

For example to run the `basic` example

```sh
npm run start -- basic
```

To read more about `nestjs-query` checkout
the [docs](https://tripss.github.io/nestjs-query/docs/introduction/getting-started)



