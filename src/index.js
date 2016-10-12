/* @flow */

import { composeWithRelay, typeComposerMap, nodeFieldConfig } from './composeWithRelay';
import { fromGlobalId, toGlobalId } from './globalId';
import NodeInterface from './nodeInterface';

export default composeWithRelay;
export {
  composeWithRelay,
  NodeInterface,
  typeComposerMap,
  nodeFieldConfig,
  fromGlobalId,
  toGlobalId,
};
