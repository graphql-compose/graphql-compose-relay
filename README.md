graphql-compose-relay
======================
This is a plugin for [graphql-compose](https://github.com/nodkz/graphql-compose), which wraps GraphQL types with Relay specific things, like `Node` type and interface, `globalId`, `clientMutationId`.

[CHANGELOG](https://github.com/nodkz/graphql-compose-relay/blob/master/CHANGELOG.md)

Example
=======
`TypeComposer` is a [graphql-compose](https://github.com/nodkz/graphql-compose) utility, that wraps GraphQL types and provide bunch of useful methods for type manipulation.
```js
import composeWithRelay from 'graphql-compose-relay';
import { TypeComposer } from 'graphql-compose';
import { RootQueryType, UserType } from './my-graphq-object-types';

const rootQueryTypeComposer = new TypeComposer(RootQueryType);
const userTypeComposer = new TypeComposer(UserType); 

// If passed RootQuery, then will be added only `node` field to this type. 
// Via RootQuery.node you may find objects by globally unique ID among all types.
composeWithRelay(rootQueryTypeComposer); 

// Other types, like User, will be wrapped with middlewares that:
// - add relay's id field. Field will be added or wrapped to return Relay's globally unique ID.
// - for mutations will be added clientMutationId to input and output objects types
// - this type will be added to NodeInterface for resolving via RootQuery.node
composeWithRelay(userTypeComposer); 
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

Compatible plugins
==================
- [graphql-compose-mongoose](https://github.com/nodkz/graphql-compose-mongoose)


License
=======
[MIT](https://github.com/nodkz/graphql-compose-relay/blob/master/LICENSE.md)
