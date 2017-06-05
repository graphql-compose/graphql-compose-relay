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
  GraphQLResolveInfo as _GraphQLResolveInfo,
} from 'graphql-compose/lib/definition';

import type {
  TypeComposer as _TypeComposer,
  Resolver as _Resolver,
} from 'graphql-compose';


export type ObjectMap = { [optName: string]: mixed };
export type WrapMutationResolverOpts = {
  resolverName: string,
  rootTypeName: string,
  [optName: string]: mixed,
};

export type ResolverMWArgsFn = _ResolverMWArgsFn;
export type ResolverMWArgs = _ResolverMWArgs;

export type ResolverMWResolveFn<TSource, TContext> = _ResolverMWResolveFn<TSource, TContext>;
export type ResolverMWResolve<TSource, TContext> = _ResolverMWResolve<TSource, TContext>;

export type ResolverMWOutputTypeFn = _ResolverMWOutputTypeFn;
export type ResolverMWOutputType = _ResolverMWOutputType;

export type GraphQLResolveInfo = _GraphQLResolveInfo;

export type Resolver<TSource, TContext> = _Resolver<TSource, TContext>;
export type ResolveParams<TSource, TContext> = _ResolveParams<TSource, TContext>;
export type TypeComposer = _TypeComposer;
export type TypeMapForNode = {[typeName: string]: { resolver: Resolver<*, *>, tc: TypeComposer } };


// INTERNAL TYPES
export type Base64String = string;
export type ResolvedGlobalId = {
  type: string,
  id: string,
};
