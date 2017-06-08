/* @flow */

import { base64, unbase64, toGlobalId, fromGlobalId } from '../globalId';

describe('globalId', () => {
  it('should have correct method base64()', () => {
    expect(base64('123')).toBe('MTIz');
    expect(base64('lksdnfkksdknsdc:123')).toBe('bGtzZG5ma2tzZGtuc2RjOjEyMw==');
  });

  it('should have correct method unbase64()', () => {
    expect(unbase64('MTIz')).toBe('123');
    expect(unbase64('bGtzZG5ma2tzZGtuc2RjOjEyMw==')).toBe('lksdnfkksdknsdc:123');
  });

  it('should have correct method toGlobalId()', () => {
    expect(toGlobalId('User', '789')).toBe('VXNlcjo3ODk=');
    expect(toGlobalId('Article', 22)).toBe('QXJ0aWNsZToyMg==');
  });

  it('should have correct method fromGlobalId()', () => {
    expect(fromGlobalId('VXNlcjo3ODk=')).toEqual({
      type: 'User',
      id: '789',
    });
    expect(fromGlobalId('QXJ0aWNsZToyMg==')).toEqual({
      type: 'Article',
      id: '22',
    });
  });
});
