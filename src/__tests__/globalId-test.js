import { expect } from 'chai';
import {
  base64,
  unbase64,
  toGlobalId,
  fromGlobalId,
} from '../globalId';


describe('globalId', () => {
  it('should have correct method base64()', () => {
    expect(base64('123')).to.equal('MTIz');
    expect(base64('lksdnfkksdknsdc:123')).to.equal('bGtzZG5ma2tzZGtuc2RjOjEyMw==');
  });

  it('should have correct method unbase64()', () => {
    expect(unbase64('MTIz')).to.equal('123');
    expect(unbase64('bGtzZG5ma2tzZGtuc2RjOjEyMw==')).to.equal('lksdnfkksdknsdc:123');
  });

  it('should have correct method toGlobalId()', () => {
    expect(toGlobalId('User', '789')).to.equal('VXNlcjo3ODk=');
    expect(toGlobalId('Article', 22)).to.equal('QXJ0aWNsZToyMg==');
  });

  it('should have correct method fromGlobalId()', () => {
    expect(fromGlobalId('VXNlcjo3ODk=')).to.deep.equal({ type: 'User', id: '789' });
    expect(fromGlobalId('QXJ0aWNsZToyMg=='))
      .to.deep.equal({ type: 'Article', id: '22' });
  });
});
