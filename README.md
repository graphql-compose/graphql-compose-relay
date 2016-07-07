graphql-compose-relay
======================
This is a plugin for `graphql-compose`, which wraps GraphQL types with Relay specific things, like `Node` type and interface, `globalId`, `clientMutationId`.

[CHANGELOG](https://github.com/nodkz/graphql-compose-relay/blob/master/CHANGELOG.md)

Example
=======
```js
import composeWithRelay from 'graphql-compose-relay';

composeWithRelay(rootQueryTypeComposer); // add `node` field to RootQuery
composeWithRelay(userTypeComposer); // wrap Type with middlewares, that add relay's fields and tune resolver.
composeWithRelay(someOtherTypeComposer);
```
That's all!

No annoying `clientMutationId` manipulations (declaration, passthru, stripping from input).
No manual adding/wrapping `id` field. This field returns globally unique ID among all types in format `base64(TypeName + ':' + recordId)`.  
All relay magic done internally by middleware for you.

Requirements
============
Method `composeWithRelay` accept `TypeComposer` as input argument. So `TypeComposer` should meet following requirements:
- has defined `recordIdFn` (function that from object gives you id)
- should have `findById` resolver

If something is missing `composeWithRelay` throws error.

`TypeComposer` is [graphql-compose](https://github.com/nodkz/graphql-compose) utility, that wraps GraphQL type and provide bunch of useful methods for type manipulation.

Compatible plugins
==================
- [graphql-compose-mongoose](https://github.com/nodkz/graphql-compose-mongoose)


License
=======
[MIT](https://github.com/nodkz/graphql-compose-relay/blob/master/LICENSE.md)
