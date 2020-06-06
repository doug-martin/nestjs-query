Example nest app using `@nestjs-query/query-graphql` and `@nestjs-query/query-typeorm` to create `Todo App` graphql CRUD application.

## Usage

### Installation

Start the backing services

```
docker-compose up -d
```

From the root of the repo run the following commands.

```sh
npm install & npm run bootstrap && npm run build && npx lerna run reset
```

In this directory `nestjs-query/examples/nest-graphql-typeorm` run.

```
npm start
```

Visit http://localhost:3000/graphql and start exploring the endpoints.

To read more about `nestjs-query` checkout the [docs](https://doug-martin.github.io/nestjs-query/docs/introduction/getting-started)


