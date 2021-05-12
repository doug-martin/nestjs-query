(window.webpackJsonp=window.webpackJsonp||[]).push([[49],{122:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return p}));var o=n(3),r=n(7),a=(n(0),n(219)),i=(n(223),n(224),{title:"v0.22.x to v0.23.x"}),s={unversionedId:"migration-guides/v0.22.x-to-v0.23.x",id:"migration-guides/v0.22.x-to-v0.23.x",isDocsHomePage:!1,title:"v0.22.x to v0.23.x",description:"Offset Paging Strategy [BREAKING CHANGE]",source:"@site/docs/migration-guides/v0.22.x-to-v0.23.x.mdx",slug:"/migration-guides/v0.22.x-to-v0.23.x",permalink:"/nestjs-query/docs/migration-guides/v0.22.x-to-v0.23.x",editUrl:"https://github.com/doug-martin/nestjs-query/edit/master/documentation/docs/migration-guides/v0.22.x-to-v0.23.x.mdx",version:"current",sidebar:"docs",previous:{title:"v0.23.x to v0.24.x",permalink:"/nestjs-query/docs/migration-guides/v0.23.x-to-v0.24.x"},next:{title:"v0.15.x to v0.16.x",permalink:"/nestjs-query/docs/migration-guides/v0.15.x-to-v0.16.x"}},l=[{value:"Offset Paging Strategy BREAKING CHANGE",id:"offset-paging-strategy-breaking-change",children:[]},{value:"Total Count with OFFSET Strategy",id:"total-count-with-offset-strategy",children:[]},{value:"Relation Decorator Changes BREAKING CHANGE",id:"relation-decorator-changes-breaking-change",children:[]},{value:"Authorizers",id:"authorizers",children:[]},{value:"Hook Updates",id:"hook-updates",children:[]},{value:"Registering DTOs When Using Custom Resolvers",id:"registering-dtos-when-using-custom-resolvers",children:[]}],c={toc:l};function p(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(a.b)("wrapper",Object(o.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h2",{id:"offset-paging-strategy-breaking-change"},"Offset Paging Strategy ","[BREAKING CHANGE]"),Object(a.b)("p",null,"In previous versions of ",Object(a.b)("inlineCode",{parentName:"p"},"nestjs-query")," the ",Object(a.b)("inlineCode",{parentName:"p"},"OFFSET")," paging strategy returned an array of nodes, this proved to not be\nextensible, especially when wanting to expose other attributes such as ",Object(a.b)("inlineCode",{parentName:"p"},"totalCount"),", or paging meta such has\n",Object(a.b)("inlineCode",{parentName:"p"},"hasNextPage")," or ",Object(a.b)("inlineCode",{parentName:"p"},"hasPreviousPage"),"."),Object(a.b)("p",null,"In ",Object(a.b)("inlineCode",{parentName:"p"},"v0.23.0")," the graphql response now returns an ",Object(a.b)("inlineCode",{parentName:"p"},"OffsetConnection")," that looks like the following"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-graphql"},"type OffsetPageInfo {\n  hasNextPage: Boolean\n  hasPreviousPage: Boolean\n}\n\ntype TodoItemConnection {\n  pageInfo: OffsetPageInfo!\n  nodes: [TodoItem!]!\n}\n\ntype TodoItem {\n  id: ID!\n  title: String!\n  description: String\n  completed: Boolean!\n  created: DateTime!\n  updated: DateTime!\n}\n")),Object(a.b)("h2",{id:"total-count-with-offset-strategy"},"Total Count with OFFSET Strategy"),Object(a.b)("p",null,"In previous versions of the nestjs-query the ",Object(a.b)("inlineCode",{parentName:"p"},"enableTotalCount")," option only worked with the ",Object(a.b)("inlineCode",{parentName:"p"},"CURSOR")," paging strategy.\nIn ",Object(a.b)("inlineCode",{parentName:"p"},"v0.23.0")," the ",Object(a.b)("inlineCode",{parentName:"p"},"enableTotalCount")," option now also works with the ",Object(a.b)("inlineCode",{parentName:"p"},"OFFSET")," paging strategy."),Object(a.b)("p",null," When ",Object(a.b)("inlineCode",{parentName:"p"},"enableTotalCount")," is set to true the following graphql schema will be generated"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-graphql"},"type OffsetPageInfo {\n  hasNextPage: Boolean\n  hasPreviousPage: Boolean\n}\n\ntype TodoItemConnection {\n  totalCount: Int!\n  pageInfo: OffsetPageInfo!\n  nodes: [TodoItem!]!\n}\n\ntype TodoItem {\n  id: ID!\n  title: String!\n  description: String\n  completed: Boolean!\n  created: DateTime!\n  updated: DateTime!\n}\n")),Object(a.b)("h2",{id:"relation-decorator-changes-breaking-change"},"Relation Decorator Changes ","[BREAKING CHANGE]"),Object(a.b)("p",null,"In previous versions of ",Object(a.b)("inlineCode",{parentName:"p"},"nestjs-query")," there were four relation decorators ",Object(a.b)("inlineCode",{parentName:"p"},"@Relation"),", ",Object(a.b)("inlineCode",{parentName:"p"},"@FilterableRelation"),",\n",Object(a.b)("inlineCode",{parentName:"p"},"@Connection"),", and ",Object(a.b)("inlineCode",{parentName:"p"},"@FilterableConnection")," all four of the decorators have been changed to be more explicit in naming\nto be clear in what they are doing."),Object(a.b)("p",null,"In ",Object(a.b)("inlineCode",{parentName:"p"},"v0.23.0")," the decorators have been renamed to be more explicit."),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@Relation")," - A relation that is a single value (one-to-one, many-to-one)"),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@FilterableRelation")," - A ",Object(a.b)("inlineCode",{parentName:"li"},"@Relation")," that enables filtering the parent by fields of the relation ",Object(a.b)("inlineCode",{parentName:"li"},"DTO"),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@UnPagedRelation")," - An array of relations (e.g, many-to-many, one-to-many) that returns all the related records."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@FilterableUnPagedRelation")," - An ",Object(a.b)("inlineCode",{parentName:"li"},"@UnPagedRelation")," that enables filtering the parent by fields of the relation\n",Object(a.b)("inlineCode",{parentName:"li"},"DTO"),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@OffsetConnection")," - A connection that represents a collection (e.g, many-to-many, one-to-many) that uses ",Object(a.b)("inlineCode",{parentName:"li"},"offset"),"\nbased pagination."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@FilterableOffsetConnection")," - An ",Object(a.b)("inlineCode",{parentName:"li"},"@OffsetConnection")," that enables filtering the parent by fields of the connection\n",Object(a.b)("inlineCode",{parentName:"li"},"DTO"),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@CursorConnection")," - A connection that represents a collection (e.g, many-to-many, one-to-many) that uses ",Object(a.b)("inlineCode",{parentName:"li"},"cursor"),"\nbased pagination."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@FilterableCursorConnection")," - A ",Object(a.b)("inlineCode",{parentName:"li"},"@CursorConnection")," that enables filtering the parent by fields of the\nconnection ",Object(a.b)("inlineCode",{parentName:"li"},"DTO"),".")),Object(a.b)("p",null,"Below is a mapping of the old definition to the new one"),Object(a.b)("div",{className:"admonition admonition-warning alert alert--danger"},Object(a.b)("div",{parentName:"div",className:"admonition-heading"},Object(a.b)("h5",{parentName:"div"},Object(a.b)("span",{parentName:"h5",className:"admonition-icon"},Object(a.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},Object(a.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"}))),"warning")),Object(a.b)("div",{parentName:"div",className:"admonition-content"},Object(a.b)("p",{parentName:"div"},"In previous versions the ",Object(a.b)("inlineCode",{parentName:"p"},"OFFSET")," paging strategy returned an array of relations, the new version returns an\n",Object(a.b)("inlineCode",{parentName:"p"},"OffsetConnection")))),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"//old\n@Relation('subTasks', () => [TodoItem])\n//new\n@OffsetConnection('subTasks', () => TodoItem)\n")),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"//old\n@FilterableRelation('subTasks', () => [TodoItem])\n//new\n@FilterableOffsetConnection('subTasks', () => TodoItem)\n")),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"//old\n@Relation('subTasks', () => [TodoItem], {pagingStrategy: PagingStrategies.NONE})\n//new\n@UnPagedRelation('subTasks', () => TodoItem)\n")),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"//old\n@FilterableRelation('subTasks', () => [TodoItem], {pagingStrategy: PagingStrategies.NONE})\n//new\n@FilterableUnPagedRelation('subTasks', () => TodoItem)\n")),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"//old\n@Connection('subTasks', () => TodoItem)\n//new\n@CursorConnection('subTasks', () => TodoItem)\n")),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"//old\n@FilterableConnection('subTasks', () => TodoItem)\n//new\n@FilterableCursorConnection('subTasks', () => TodoItem)\n")),Object(a.b)("h2",{id:"authorizers"},"Authorizers"),Object(a.b)("p",null,"In previous versions of ",Object(a.b)("inlineCode",{parentName:"p"},"nestjs-query")," the resolvers relied on an AuthorizerService to be injected and the filters\nwere created manually within the resolver."),Object(a.b)("p",null,"In the latest version, we have transitioned to a interceptor/param decorator pattern. This provides:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"Better separation of concerns, auth filters are now just params passed to the resolver method."),Object(a.b)("li",{parentName:"ul"},"More flexibility when extending the resolvers to reuse the same logic that the auto-generated resolvers use\nwithout having to worry about internal implementation details."),Object(a.b)("li",{parentName:"ul"},"Easier extension of the ",Object(a.b)("inlineCode",{parentName:"li"},"CRUDResolver")," by not having to worry about injecting the authorizerService, it will\nautomatically add the interceptor and param decorators to auto generated methods, you just need to decorate your DTO."),Object(a.b)("li",{parentName:"ul"},"Familiar patterns that are laid out in the core nestjs documentation.")),Object(a.b)("p",null,"Old way"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"import { QueryService, InjectQueryService } from '@nestjs-query/core';\nimport { CRUDResolver } from '@nestjs-query/query-graphql';\nimport { Resolver, Query, Args } from '@nestjs/graphql';\nimport { TodoItemDTO } from './dto/todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Resolver(() => TodoItemDTO)\nexport class TodoItemResolver {\n  constructor(\n    @InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>,\n    @InjectAuthorizer(TodoItemDTO) readonly authorizer: Authorizer<TodoItemDTO>\n  ) {}\n\n  @Query(() => TodoItemConnection)\n   async uncompletedTodoItems(@Args() query: TodoItemQuery, @Context() context: unknown): Promise<ConnectionType<TodoItemDTO>> {\n     // add the completed filter the user provided filter\n     const authFilter = this.authorizer.authorize(context);\n     const filter: Filter<TodoItemDTO> = mergeFilter(query.filter ?? {}, { completed: { is: false } });\n     const uncompletedQuery = mergeQuery(query, { filter: mergeFilter(filter, authFilter) });\n     return TodoItemConnection.createFromPromise(\n       (q) => this.service.query(q),\n       uncompletedQuery,\n       (q) => this.service.count(q),\n     );\n   }\n}\n")),Object(a.b)("p",null,"New"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"import { Filter, InjectQueryService, mergeFilter, mergeQuery, QueryService } from '@nestjs-query/core';\nimport { AuthorizerInterceptor, AuthorizerFilter, ConnectionType } from '@nestjs-query/query-graphql';\nimport { Args, Query, Resolver } from '@nestjs/graphql';\nimport { UseInterceptors } from '@nestjs/common';\nimport { TodoItemDTO } from './dto/todo-item.dto';\nimport { TodoItemConnection, TodoItemQuery } from './types';\n\n@Resolver(() => TodoItemDTO)\n@UseInterceptors(AuthorizerInterceptor(TodoItemDTO))\nexport class TodoItemResolver {\n  constructor(@InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>) {}\n\n  // Set the return type to the TodoItemConnection\n  @Query(() => TodoItemConnection)\n  async uncompletedTodoItems(\n    @Args() query: TodoItemQuery,\n    @AuthorizerFilter() authFilter: Filter<TodoItemDTO>,\n  ): Promise<ConnectionType<TodoItemDTO>> {\n    // add the completed filter the user provided filter\n    const filter: Filter<TodoItemDTO> = mergeFilter(query.filter ?? {}, { completed: { is: false } });\n    const uncompletedQuery = mergeQuery(query, { filter: mergeFilter(filter, authFilter) });\n    return TodoItemConnection.createFromPromise(\n      (q) => this.service.query(q),\n      uncompletedQuery,\n      (q) => this.service.count(q),\n    );\n  }\n}\n")),Object(a.b)("h2",{id:"hook-updates"},"Hook Updates"),Object(a.b)("p",null,"In previous versions of nestjs-query hooks were not very flexible, and could not be used by custom resolver endpoints."),Object(a.b)("p",null,"In the latest version the hooks pipeline has been re-worked to enable the following:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"Hook decorators now accept either a hook funciton OR a custom hook class that can use dependency injection."),Object(a.b)("li",{parentName:"ul"},"Reusing hooks in custom endpoints.")),Object(a.b)("p",null,"As a demonstration of the flexibility of the new hooks implementation, lets use a hook in a custom endpoint (this\nwould not have been possible previously)"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:"{14-15}","{14-15}":!0},"import { InjectQueryService, mergeFilter, QueryService, UpdateManyResponse } from '@nestjs-query/core';\nimport { HookTypes, HookInterceptor, MutationHookArgs, UpdateManyResponseType } from '@nestjs-query/query-graphql';\nimport { UseInterceptors } from '@nestjs/common';\nimport { Mutation, Resolver } from '@nestjs/graphql';\nimport { TodoItemDTO } from './dto/todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\nimport { UpdateManyTodoItemsArgs } from './types';\n\n@Resolver(() => TodoItemDTO)\nexport class TodoItemResolver {\n  constructor(@InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemDTO>) {}\n\n  @Mutation(() => UpdateManyResponseType())\n  @UseInterceptors(HookInterceptor(HookTypes.BEFORE_UPDATE_MANY, TodoItemDTO))\n  markTodoItemsAsCompleted(@MutationHookArgs() { input }: UpdateManyTodoItemsArgs): Promise<UpdateManyResponse> {\n    return this.service.updateMany(\n      { ...input.update, completed: false },\n      mergeFilter(input.filter, { completed: { is: false } }),\n    );\n  }\n}\n")),Object(a.b)("p",null,"The two important things are:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"The ",Object(a.b)("inlineCode",{parentName:"li"},"HookInterceptor")," in this example we reuse the ",Object(a.b)("inlineCode",{parentName:"li"},"BEFORE_UPDATE_MANY")," hook on the ",Object(a.b)("inlineCode",{parentName:"li"},"TodoItemDTO"),", the interceptor\nadds a DI hook instance to the context that can be used downstream by any guards or param decorators."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"@MutationHookArgs")," will apply the correct hook to the args and provide it to the resolver endpoint.")),Object(a.b)("p",null,"In this next example we can demonstrate the DI capability, we'll keep the example simple, but with ",Object(a.b)("inlineCode",{parentName:"p"},"nestjs"),"'s DI\nfunctionality you can inject other services to look up information and transform the incoming request as much as you\nneed."),Object(a.b)("p",null,"In this example we create a simple hook that will work for both ",Object(a.b)("inlineCode",{parentName:"p"},"createOne")," and ",Object(a.b)("inlineCode",{parentName:"p"},"createMany")," endpoints to set the\n",Object(a.b)("inlineCode",{parentName:"p"},"createdBy")," attribute. In this example we look up the userEmail from the ",Object(a.b)("inlineCode",{parentName:"p"},"userService")," and set ",Object(a.b)("inlineCode",{parentName:"p"},"createdBy")," attribute\non the input."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"interface CreatedBy {\n  createdBy: string;\n}\n\n@Injectable()\nexport class CreatedByHook<T extends CreatedBy>\n  implements BeforeCreateOneHook<T, GqlContext>, BeforeCreateManyHook<T, GqlContext> {\n  constructor(readonly userService: UserService) {}\n\n  run(instance: CreateManyInputType<T>, context: GqlContext): Promise<CreateManyInputType<T>>;\n  run(instance: CreateOneInputType<T>, context: GqlContext): Promise<CreateOneInputType<T>>;\n  async run(\n    instance: CreateOneInputType<T> | CreateManyInputType<T>,\n    context: GqlContext,\n  ): Promise<CreateOneInputType<T> | CreateManyInputType<T>> {\n    const createdBy = await this.userService.getUserEmail(context.req.userId);\n    if (Array.isArray(instance.input)) {\n      // eslint-disable-next-line no-param-reassign\n      instance.input = instance.input.map((c) => ({ ...c, createdBy }));\n      return instance;\n    }\n    // eslint-disable-next-line no-param-reassign\n    instance.input.createdBy = createdBy;\n    return instance;\n  }\n}\n")),Object(a.b)("p",null,"Now we can use this generic hook on any DTO that has a ",Object(a.b)("inlineCode",{parentName:"p"},"createdBy")," field"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts"},"@InputType('TodoItemInput')\n@BeforeCreateOne(CreatedByHook)\n@BeforeCreateMany(CreatedByHook)\nexport class TodoItemInputDTO {\n  @IsString()\n  @MaxLength(20)\n  @Field()\n  title!: string;\n\n  @IsBoolean()\n  @Field()\n  completed!: boolean;\n\n  // don't annotate with field because its set by the hook\n  createdBy!: string;\n}\n")),Object(a.b)("h2",{id:"registering-dtos-when-using-custom-resolvers"},"Registering DTOs When Using Custom Resolvers"),Object(a.b)("p",null,"In previous versions of ",Object(a.b)("inlineCode",{parentName:"p"},"nestjs-query")," you could extend ",Object(a.b)("inlineCode",{parentName:"p"},"CRUDResolver")," but there was not a way to set up the\nappropriate providers for many of the newer features (hooks, authorizers etc.)."),Object(a.b)("p",null,"In the latest version you now have the option to register your DTOs with ",Object(a.b)("inlineCode",{parentName:"p"},"@nestjs-query/query-graphql")," without it\ngenerating a resolver automatically."),Object(a.b)("p",null,"In this example we create a custom resolver that extends ",Object(a.b)("inlineCode",{parentName:"p"},"CRUDResolver"),"."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.resolver.ts"',title:'"todo-item.resolver.ts"'},"import { QueryService, InjectQueryService } from '@nestjs-query/core';\nimport { CRUDResolver } from '@nestjs-query/query-graphql';\nimport { Resolver, Query, Args } from '@nestjs/graphql';\nimport { TodoItemDTO } from './dto/todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Resolver(() => TodoItemDTO)\nexport class TodoItemResolver extends CRUDResolver(TodoItemDTO) {\n  constructor(\n    @InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>\n  ) {\n    super(service);\n  }\n}\n\n")),Object(a.b)("p",null,"Because the ",Object(a.b)("inlineCode",{parentName:"p"},"TodoItemResolver")," extends ",Object(a.b)("inlineCode",{parentName:"p"},"CRUDResolver")," there is no need to have ",Object(a.b)("inlineCode",{parentName:"p"},"nestjs-query")," also create a resolver,\ninstead you can specify the ",Object(a.b)("inlineCode",{parentName:"p"},"dtos")," option which just takes in ",Object(a.b)("inlineCode",{parentName:"p"},"DTOClass"),", ",Object(a.b)("inlineCode",{parentName:"p"},"CreateDTOClass"),", and ",Object(a.b)("inlineCode",{parentName:"p"},"UpdateDTOClass")," to\nset up all of additional providers to hooks, authorizers and other features."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.module.ts" {9,13}',title:'"todo-item.module.ts"',"{9,13}":!0},"import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';\nimport { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';\nimport { Module } from '@nestjs/common';\nimport { TodoItemDTO } from './todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\nimport { TodoItemResolver } from './todo-item.resolver'\n\n@Module({\n  providers: [TodoItemResolver],\n  imports: [\n    NestjsQueryGraphQLModule.forFeature({\n      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],\n      dtos: [{ DTOClass: TodoItemDTO }],\n    }),\n  ],\n})\nexport class TodoItemModule {}\n")))}p.isMDXComponent=!0},219:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return b}));var o=n(0),r=n.n(o);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=r.a.createContext({}),p=function(e){var t=r.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},u=function(e){var t=p(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),m=o,b=u["".concat(i,".").concat(m)]||u[m]||d[m]||a;return n?r.a.createElement(b,s(s({ref:t},c),{},{components:n})):r.a.createElement(b,s({ref:t},c))}));function b(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var c=2;c<a;c++)i[c]=n[c];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},220:function(e,t,n){"use strict";function o(e){var t,n,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=o(e[t]))&&(r&&(r+=" "),r+=n);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.a=function(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=o(e))&&(r&&(r+=" "),r+=t);return r}},221:function(e,t,n){"use strict";var o=n(0),r=n(222);t.a=function(){const e=Object(o.useContext)(r.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},222:function(e,t,n){"use strict";var o=n(0);const r=Object(o.createContext)(void 0);t.a=r},223:function(e,t,n){"use strict";var o=n(0),r=n.n(o),a=n(221),i=n(220),s=n(56),l=n.n(s);const c=37,p=39;t.a=function(e){const{lazy:t,block:n,defaultValue:s,values:u,groupId:d,className:m}=e,{tabGroupChoices:b,setTabGroupChoices:h}=Object(a.a)(),[y,g]=Object(o.useState)(s),O=o.Children.toArray(e.children),f=[];if(null!=d){const e=b[d];null!=e&&e!==y&&u.some((t=>t.value===e))&&g(e)}const j=e=>{const t=e.target,n=f.indexOf(t),o=O[n].props.value;g(o),null!=d&&(h(d,o),setTimeout((()=>{(function(e){const{top:t,left:n,bottom:o,right:r}=e.getBoundingClientRect(),{innerHeight:a,innerWidth:i}=window;return t>=0&&r<=i&&o<=a&&n>=0})(t)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(l.a.tabItemActive),setTimeout((()=>t.classList.remove(l.a.tabItemActive)),2e3))}),150))},v=e=>{var t;let n;switch(e.keyCode){case p:{const t=f.indexOf(e.target)+1;n=f[t]||f[0];break}case c:{const t=f.indexOf(e.target)-1;n=f[t]||f[f.length-1];break}}null===(t=n)||void 0===t||t.focus()};return r.a.createElement("div",{className:"tabs-container"},r.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(i.a)("tabs",{"tabs--block":n},m)},u.map((({value:e,label:t})=>r.a.createElement("li",{role:"tab",tabIndex:y===e?0:-1,"aria-selected":y===e,className:Object(i.a)("tabs__item",l.a.tabItem,{"tabs__item--active":y===e}),key:e,ref:e=>f.push(e),onKeyDown:v,onFocus:j,onClick:j},t)))),t?Object(o.cloneElement)(O.filter((e=>e.props.value===y))[0],{className:"margin-vert--md"}):r.a.createElement("div",{className:"margin-vert--md"},O.map(((e,t)=>Object(o.cloneElement)(e,{key:t,hidden:e.props.value!==y})))))}},224:function(e,t,n){"use strict";var o=n(0),r=n.n(o);t.a=function({children:e,hidden:t,className:n}){return r.a.createElement("div",{role:"tabpanel",hidden:t,className:n},e)}}}]);