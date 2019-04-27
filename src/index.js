/* @flow */

import { composeWithRelay, TypeMapForRelayNode } from './composeWithRelay';
import { fromGlobalId, toGlobalId } from './globalId';
import { getNodeInterface } from './nodeInterface';

export default composeWithRelay;
export { composeWithRelay, getNodeInterface, TypeMapForRelayNode, fromGlobalId, toGlobalId };
