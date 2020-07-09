import {getDirectoriesToFile} from '@app/util/getDirectoriesToFile';

describe('getDirectoriesToFile', function() {
  it('gets the directories to a file', function() {
    expect(
      getDirectoriesToFile(
        '/home/tmp/root',
        '/home/tmp/root/a/deep/directory/file.png'
      )
    ).toBe('a/deep/directory');
  });
});
