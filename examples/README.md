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
  * [`federation:gateway`](./federation/gateway) - Graphql federation gateway
  * [`federation:sub-task`](./federation/sub-task-graphql) - Federated sub-task  GraphQL API
  * [`federation:tag`](./federation/tag-graphql) - Federated tag  GraphQL API
  * [`federation:todo-item`](./federation/todo-item-graphql) - Federated todo-item  GraphQL API
* [`offset-paging`](./offset-paging) - Example  GraphQL API that uses offset based paging with array connections
* [`no-paging`](./no-paging) - Example  GraphQL API without paging
* [`sequelize`](./sequelize) - Example  GraphQL API using sequelize 
* [`subscriptions`](./subscriptions) - Example todo-item GraphQL API with subscriptions.
* [`typeorm`](./typeorm) - Example todo-item  GraphQL API using typeorm
* [`typeorm-multidb`](./typeorm-multidb) - Example GraphQL API using typeorm with mutliple databases
* [`typeorm-soft-delete`](./typeorm-soft-delete) -  - Example todo-item GraphQL API using typeorm with soft deletes.
* [`custom-service`](./custom-service) -  - Example todo with a custom-implemented service class.

For example to run the `basic` example

```sh
npm run start -- basic
```

To read more about `nestjs-query` checkout the [docs](https://doug-martin.github.io/nestjs-query/docs/introduction/getting-started)



