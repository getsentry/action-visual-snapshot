import {getSnapshotGroups} from '../../src/util/getSnapshotGroups';

describe('getSnapshotGroups', function() {
  it('partially supports old snapshot naming of "base-group/snapshot.png"', function() {
    expect(
      getSnapshotGroups(
        new Set(['acceptance/foo.png', 'acceptance-mobile/foo.png'])
      )
    ).toEqual(
      new Set([{baseGroup: 'acceptance', groups: [''], name: 'foo.png'}])
    );
  });

  it('supports new snapshot groups with sub directories, e.g.  "base/group/snapshot.png"', function() {
    expect(
      getSnapshotGroups(
        new Set([
          'acceptance/foo.png',
          'acceptance/mobile/foo.png',
          'acceptance/other/deeply/nested/foo.png',
        ])
      )
    ).toEqual(
      new Set([
        {baseGroup: 'acceptance', groups: ['', 'mobile'], name: 'foo.png'},
        {
          baseGroup: 'acceptance',
          groups: ['other'],
          name: 'deeply/nested/foo.png',
        },
      ])
    );
  });

  it('supports non-empty base group', function() {
    expect(
      getSnapshotGroups(
        new Set(['acceptance/desktop/foo.png', 'acceptance/mobile/foo.png'])
      )
    ).toEqual(
      new Set([
        {
          baseGroup: 'acceptance',
          groups: ['desktop', 'mobile'],
          name: 'foo.png',
        },
      ])
    );
  });
});
