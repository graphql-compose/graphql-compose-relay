// RE-EXPORT graphql-compose definitions
import type {
  ResolveParams as _ResolveParams,
} from 'graphql-compose/lib/definition.js';

export type ResolveParams = _ResolveParams;


// INTERNAL TYPES
export type Base64String = string;
export type ResolvedGlobalId = {
  type: string,
  id: string,
};
