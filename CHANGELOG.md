## master

## 1.0.6 (August 15, 2016)
- fix: babel build via the workaround https://phabricator.babeljs.io/T2877#78089 Huh, it's too tricky to use Map/Set in ES5.

## 1.0.5 (August 13, 2016)
- fix: babel build process

## 1.0.4 (August 10, 2016)
- Update packages, add `babel-plugin-transform-runtime` for build process. Fix [issue](https://github.com/nodkz/graphql-compose-connection/issues/2) for vanilla node.js users without babel (thanks @jacobbubu).

## 1.0.3 (July 21, 2016)
- Fix: unwrapping args for the underlying resolvers

## 1.0.2 (July 20, 2016)
- Expose `NodeInterface`, `nodeFieldConfig`, `fromGlobalId`, `toGlobalId`.

## 1.0.1 (July 18, 2016)
- Fix flow-type errors
- Update `flow-bin` till 0.29
- Fix `peerDependencies`
- Update `graphql-compose` till 0.0.7

## 1.0.0 (July 15, 2016)
- update `graphql-compose` till 0.0.6
- small fixes

## 0.0.3 (July 08, 2016)
- mutationMiddleware move all args into `input!` arg, if `input` exists add only `clientMutationId` to it and leave rest args untouched.

## 0.0.2 (July 07, 2016)
- realized `RootQuery.node` field
- mutationMiddleware for adding `clientMutationId` to input/output object types
- added `NodeInterface` with object type resolving
- add or wrap `id` field to return Relay's globally unique ID  
- exports `flow` annotations

## 0.0.1 (July 04, 2016)
- Initial commit
