(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{219:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return b}));var o=n(0),r=n.n(o);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=r.a.createContext({}),u=function(e){var t=r.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=u(e.components);return r.a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,a=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),d=u(n),m=o,b=d["".concat(a,".").concat(m)]||d[m]||p[m]||i;return n?r.a.createElement(b,l(l({ref:t},s),{},{components:n})):r.a.createElement(b,l({ref:t},s))}));function b(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=m;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var s=2;s<i;s++)a[s]=n[s];return r.a.createElement.apply(null,a)}return r.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},220:function(e,t,n){"use strict";function o(e){var t,n,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=o(e[t]))&&(r&&(r+=" "),r+=n);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}t.a=function(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=o(e))&&(r&&(r+=" "),r+=t);return r}},221:function(e,t,n){"use strict";var o=n(0),r=n(222);t.a=function(){const e=Object(o.useContext)(r.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},222:function(e,t,n){"use strict";var o=n(0);const r=Object(o.createContext)(void 0);t.a=r},223:function(e,t,n){"use strict";var o=n(0),r=n.n(o),i=n(221),a=n(220),l=n(56),c=n.n(l);const s=37,u=39;t.a=function(e){const{lazy:t,block:n,defaultValue:l,values:d,groupId:p,className:m}=e,{tabGroupChoices:b,setTabGroupChoices:f}=Object(i.a)(),[y,g]=Object(o.useState)(l),O=o.Children.toArray(e.children),v=[];if(null!=p){const e=b[p];null!=e&&e!==y&&d.some((t=>t.value===e))&&g(e)}const h=e=>{const t=e.target,n=v.indexOf(t),o=O[n].props.value;g(o),null!=p&&(f(p,o),setTimeout((()=>{(function(e){const{top:t,left:n,bottom:o,right:r}=e.getBoundingClientRect(),{innerHeight:i,innerWidth:a}=window;return t>=0&&r<=a&&o<=i&&n>=0})(t)||(t.scrollIntoView({block:"center",behavior:"smooth"}),t.classList.add(c.a.tabItemActive),setTimeout((()=>t.classList.remove(c.a.tabItemActive)),2e3))}),150))},j=e=>{var t;let n;switch(e.keyCode){case u:{const t=v.indexOf(e.target)+1;n=v[t]||v[0];break}case s:{const t=v.indexOf(e.target)-1;n=v[t]||v[v.length-1];break}}null===(t=n)||void 0===t||t.focus()};return r.a.createElement("div",{className:"tabs-container"},r.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(a.a)("tabs",{"tabs--block":n},m)},d.map((({value:e,label:t})=>r.a.createElement("li",{role:"tab",tabIndex:y===e?0:-1,"aria-selected":y===e,className:Object(a.a)("tabs__item",c.a.tabItem,{"tabs__item--active":y===e}),key:e,ref:e=>v.push(e),onKeyDown:j,onFocus:h,onClick:h},t)))),t?Object(o.cloneElement)(O.filter((e=>e.props.value===y))[0],{className:"margin-vert--md"}):r.a.createElement("div",{className:"margin-vert--md"},O.map(((e,t)=>Object(o.cloneElement)(e,{key:t,hidden:e.props.value!==y})))))}},224:function(e,t,n){"use strict";var o=n(0),r=n.n(o);t.a=function({children:e,hidden:t,className:n}){return r.a.createElement("div",{role:"tabpanel",hidden:t,className:n},e)}},80:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return l})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return u}));var o=n(3),r=n(7),i=(n(0),n(219)),a=(n(223),n(224),{title:"v0.23.x to v0.24.x"}),l={unversionedId:"migration-guides/v0.23.x-to-v0.24.x",id:"migration-guides/v0.23.x-to-v0.24.x",isDocsHomePage:!1,title:"v0.23.x to v0.24.x",description:"Removed Public ConnectionType and SortType function.",source:"@site/docs/migration-guides/v0.23.x-to-v0.24.x.mdx",slug:"/migration-guides/v0.23.x-to-v0.24.x",permalink:"/nestjs-query/docs/migration-guides/v0.23.x-to-v0.24.x",editUrl:"https://github.com/doug-martin/nestjs-query/edit/master/documentation/docs/migration-guides/v0.23.x-to-v0.24.x.mdx",version:"current",sidebar:"docs",previous:{title:"v0.24.x to v0.25.x",permalink:"/nestjs-query/docs/migration-guides/v0.24.x-to-v0.25.x"},next:{title:"v0.22.x to v0.23.x",permalink:"/nestjs-query/docs/migration-guides/v0.22.x-to-v0.23.x"}},c=[{value:"Removed Public ConnectionType and SortType function.",id:"removed-public-connectiontype-and-sorttype-function",children:[{value:"Old",id:"old",children:[]},{value:"New",id:"new",children:[]}]},{value:"<code>@QueryOptions</code> Decorator",id:"queryoptions-decorator",children:[{value:"Old",id:"old-1",children:[]},{value:"New",id:"new-1",children:[]}]}],s={toc:c};function u(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(o.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h2",{id:"removed-public-connectiontype-and-sorttype-function"},"Removed Public ConnectionType and SortType function."),Object(i.b)("p",null,"In versions prior to ",Object(i.b)("inlineCode",{parentName:"p"},"v0.24.0")," the ",Object(i.b)("inlineCode",{parentName:"p"},"ConnectionType")," and ",Object(i.b)("inlineCode",{parentName:"p"},"SortType")," functions could be used to get a reference to a\n",Object(i.b)("inlineCode",{parentName:"p"},"Connection")," and ",Object(i.b)("inlineCode",{parentName:"p"},"Sort")," graphql implementation. In ",Object(i.b)("inlineCode",{parentName:"p"},"v0.24.0")," there public methods were removed in favor of pulling\nthem off of the ",Object(i.b)("inlineCode",{parentName:"p"},"QueryArgs"),"."),Object(i.b)("p",null,"This change was made to remove possibility of creating ConnectionTypes and SortTypes that are incompatible with the\nQueryArgsType."),Object(i.b)("h3",{id:"old"},"Old"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-ts"},"import { ConnectionType, SortType } from '@nestjs-query/query-graphql';\nimport { TodoItemDTO } from './dto/todo-item.dto';\n\nexport const TodoItemConnection = ConnectionType(TodoItemDTO);\nexport const TodoItemSort = SortType(TodoItemDTO);\n")),Object(i.b)("h3",{id:"new"},"New"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-ts"},"import { QueryArgsType } from '@nestjs-query/query-graphql';\nimport { TodoItemDTO } from './dto/todo-item.dto';\n\nexport const TodoItemQueryArgs = QueryArgsType(TodoItemDTO)\nexport const TodoItemConnection = TodoItemQueryArgs.ConnectionType;\nexport const TodoItemSort = TodoItemQueryArgs.SortType;\n")),Object(i.b)("h2",{id:"queryoptions-decorator"},Object(i.b)("inlineCode",{parentName:"h2"},"@QueryOptions")," Decorator"),Object(i.b)("p",null,"In previous versions you had to specify options for querying and connections in your resolver. In ",Object(i.b)("inlineCode",{parentName:"p"},"v0.24.0")," a new\n",Object(i.b)("inlineCode",{parentName:"p"},"@QueryOptions")," decorator was  introduced to allow specifying all query related options along side the DTO, instead of splitting the configuration between the resolver and ",Object(i.b)("inlineCode",{parentName:"p"},"DTO"),".  The new ",Object(i.b)("inlineCode",{parentName:"p"},"@QueryOptions")," provides a few benefits."),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"Better re-use across types by avoiding passing configuration options all the way through the code to each piece that may need them."),Object(i.b)("li",{parentName:"ul"},"Decoupling query options from the resolver. This puts us in a better position to decouple the DTO definition from the transport layer (e.g. graphql)"),Object(i.b)("li",{parentName:"ul"},"Keeps DTO configuration options closer to the source.")),Object(i.b)("h3",{id:"old-1"},"Old"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.module.ts"',title:'"todo-item.module.ts"'},"import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';\nimport { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';\nimport { Module } from '@nestjs/common';\nimport { TodoItemDTO } from './todo-item.dto';\nimport { TodoItemEntity } from './todo-item.entity';\n\n@Module({\n  imports: [\n    NestjsQueryGraphQLModule.forFeature({\n      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],\n      resolvers: [{\n        DTOClass: TodoItemDTO,\n        EntityClass: TodoItemEntity,\n        pagingStrategy: PagingStrategies.OFFSET,\n        enableTotalCount: true,\n        defaultResultSize: 5,\n        maxResultSize: 100,\n        defaultFilter: { completed: { is: true } },\n        defaultSort: [{ field: 'title', direction: SortDirection.ASC }],\n      }],\n    }),\n  ],\n})\nexport class TodoItemModule {}\n")),Object(i.b)("h3",{id:"new-1"},"New"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-ts",metastring:'title="todo-item.dto.ts"',title:'"todo-item.dto.ts"'},"import { FilterableField, QueryOptions, PagingStrategies } from '@nestjs-query/query-graphql';\nimport { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';\n\n@ObjectType('TodoItem')\n@QueryOptions({\n  pagingStrategy: PagingStrategies.OFFSET, // use offset based paging for this DTO\n  enableTotalCount: true, // enable querying for totalCount\n  defaultResultSize: 5, // return 5 records by default\n  maxResultSize: 100, // do not allow querying for more than 100 records at a time\n  defaultFilter: { completed: { is: true } }, // default filter when one is not provided\n  defaultSort: [{ field: 'title', direction: SortDirection.ASC }], // default sort when one is not provided.\n})\nexport class TodoItemDTO {\n  @FilterableField(() => ID)\n  id!: string;\n\n  @FilterableField()\n  title!: string;\n\n  @FilterableField()\n  completed!: boolean;\n\n  @FilterableField(() => GraphQLISODateTime)\n  created!: Date;\n\n  @FilterableField(() => GraphQLISODateTime)\n  updated!: Date;\n}\n")))}u.isMDXComponent=!0}}]);