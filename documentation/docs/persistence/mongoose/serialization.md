---
title: Serialization
---

Using `class-transformer` is a popular libarary used in `nestjs`, unfortunately `class-transformer` does not place nicely with `mongoose` documents.

For most use cases `nestjs-query` will take care of the serialization for you through [assemblers](../../concepts/assemblers.mdx). If you find yourself in a situation where you want to use `class-transformer` with a model you should use the following patterns.


To convert your DTO into a model you can inject your Model and create a new instance.
```ts
new TodoItemModel(todoItemDTO);
```

When converting your entity into a DTO you can use the following.

```ts
const dto = plainToClass(TodoItemDTO, todoItemEntity.toObject({ virtuals: true }));
```
