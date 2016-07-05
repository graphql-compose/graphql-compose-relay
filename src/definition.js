/* @flow */

// RE-EXPORT graphql-compose definitions
import type {
  ResolveParams as _ResolveParams,
  ResolverMWArgsFn as _ResolverMWArgsFn,
  ResolverMWArgs as _ResolverMWArgs,
  ResolverMWResolveFn as _ResolverMWResolveFn,
  ResolverMWResolve as _ResolverMWResolve,
  ResolverMWOutputTypeFn as _ResolverMWOutputTypeFn,
  ResolverMWOutputType as _ResolverMWOutputType,
} from 'graphql-compose/lib/definition.js';

export type ResolverMWArgsFn = _ResolverMWArgsFn;
export type ResolverMWArgs = _ResolverMWArgs;

export type ResolverMWResolveFn = _ResolverMWResolveFn;
export type ResolverMWResolve = _ResolverMWResolve;

export type ResolverMWOutputTypeFn = _ResolverMWOutputTypeFn;
export type ResolverMWOutputType = _ResolverMWOutputType;


import type {
  TypeComposer as _TypeComposer,
  Resolver as _Resolver,
} from 'graphql-compose';

export type Resolver = _Resolver;
export type ResolveParams = _ResolveParams;
export type TypeComposer = _TypeComposer;
export type TypeFindByIdMap = {[typeName: string]: Resolver};


// INTERNAL TYPES
export type Base64String = string;
export type ResolvedGlobalId = {
  type: string,
  id: string,
};
