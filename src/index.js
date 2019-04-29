/* @flow */

import { composeWithRelay, TypeMapForRelayNode } from './composeWithRelay';
import { fromGlobalId, toGlobalId } from './globalId';
import { getNodeInterface, NodeInterface } from './nodeInterface';

export default composeWithRelay;
export {
  composeWithRelay,
  getNodeInterface,
  TypeMapForRelayNode,
  NodeInterface,
  fromGlobalId,
  toGlobalId,
};
