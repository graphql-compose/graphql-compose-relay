/* @flow */
/* eslint-disable no-param-reassign */

import { ResolverMiddleware, TypeComposer, InputTypeComposer } from 'graphql-compose';
import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  getNamedType,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { toGlobalId } from './globalId';
import type {
  ResolverMWArgsFn,
  ResolverMWArgs,
  ResolverMWResolveFn,
  ResolverMWResolve,
  ResolverMWOutputTypeFn,
  ResolverMWOutputType,
} from './definition';

export default class MutationMiddleware extends ResolverMiddleware {
  // middleware has constructor
  // constructor(typeComposer, typeResolver, opts = {}) {
  //   super(typeComposer, opts);
  //   // some setup staff
  // }

  args:ResolverMWArgs = (next: ResolverMWArgsFn) => (args) => {
    const nextArgs = next(args);
    let inputTC: InputTypeComposer;
    let newNextArgs = {};

    if (nextArgs.input && nextArgs.input.type) {
      // pass args unchanged
      inputTC = new InputTypeComposer(getNamedType(nextArgs.input.type));
      newNextArgs = nextArgs;
    } else {
      // create input arg, and put into all current args
      inputTC = new InputTypeComposer(new GraphQLInputObjectType({
        name: `Relay${this.typeResolver.getNameCamelCase()}${this.typeComposer.getTypeName()}Input`,
        fields: nextArgs,
      }));
      newNextArgs = {
        input: {
          name: 'input',
          type: new GraphQLNonNull(inputTC.getType()),
        },
      };
    }

    // add `clientMutationId` to args.input field
    if (!inputTC.hasField('clientMutationId')) {
      inputTC.addField('clientMutationId', {
        type: GraphQLString,
        description: 'The client mutation ID used by clients like Relay to track the mutation. '
                   + 'If given, returned in the response payload of the mutation.',
      });
    }

    return newNextArgs;
  };


  resolve:ResolverMWResolve = (next: ResolverMWResolveFn) => (resolveParams) => {
    let clientMutationId;

    if (resolveParams && resolveParams.args) {
      if (resolveParams.args.input && resolveParams.args.input.clientMutationId) {
        clientMutationId = resolveParams.args.input.clientMutationId;
        delete resolveParams.args.input.clientMutationId;
      }
    }

    return next(resolveParams)
      .then(res => {
        res.nodeId = toGlobalId(
          this.typeComposer.getTypeName(),
          res.recordId
        );
        if (clientMutationId) {
          res.clientMutationId = clientMutationId;
        }
        return res;
      });
  };


  outputType:ResolverMWOutputType = (next: ResolverMWOutputTypeFn) => (outputType) => {
    const nextOutputType = next(outputType);

    if (!(nextOutputType instanceof GraphQLObjectType)) {
      return nextOutputType;
    }

    const outputTC = new TypeComposer(nextOutputType);
    if (!outputTC.hasField('nodeId')) {
      outputTC.addField('nodeId', {
        type: GraphQLID,
        description: 'The globally unique ID among all types',
      });
    }

    if (!outputTC.hasField('clientMutationId')) {
      outputTC.addField('clientMutationId', {
        type: GraphQLString,
        description: 'The client mutation ID used by clients like Relay to track the mutation. '
                   + 'If given, returned in the response payload of the mutation.',
      });
    }

    return outputTC.getType();
  };
}
