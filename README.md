graphql-compose-relay
======================
This is a plugin for `graphql-compose`, which wraps GraphQL types with Relay specific things, like `Node` type and interface, `globalId`, `clientMutationId`.


Example
=======
```js
import composeWithRelay from 'graphql-compose-relay';

composeWithRelay(rootQueryTypeComposer); // add `node` field to RootQuery
composeWithRelay(userTypeComposer); // wrap Type with middlewares, that add fields and tune resolver.
composeWithRelay(someOtherTypeComposer);
```
That's all!
- No annoying `clientMutationId` manipulations (declaration, passthru, stripping from input).
- Add `id` field to type (or wrap it). This field returns globally unique ID among all types in format `base64(TypeName + ':' + recordId)`  
All done internally by middleware for you.

Requirements
============
TypeComposer should follow following requirements:
- has defined `recordIdFn` (function that from object gives you id)
- should have `findById` resolver

About `TypeComposer` you may read here [graphql-compose](https://github.com/nodkz/graphql-compose)

Compatible plugins
==================
- [graphql-compose-mongoose](https://github.com/nodkz/graphql-compose-mongoose)


[CHANGELOG](https://github.com/nodkz/graphql-compose-relay/blob/master/CHANGELOG.md)

License
=======
[MIT](https://github.com/nodkz/graphql-compose-relay/blob/master/LICENSE.md)
