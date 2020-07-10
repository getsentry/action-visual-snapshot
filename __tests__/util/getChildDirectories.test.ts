import {getChildDirectories} from '@app/util/getChildDirectories';

describe('getChildDirectories', function() {
  it('gets the directories to a file', function() {
    expect(
      getChildDirectories([
        [
          '/home/tmp/root',
          [
            '/home/tmp/root/file.png',
            '/home/tmp/root/a/deep/directory/file.png',
            '/home/tmp/root/a/deep/directory/file.png',
            '/home/tmp/root/another/deep/directory/file.png',
          ],
        ],
      ])
    ).toEqual(new Set(['a/deep/directory', 'another/deep/directory']));
  });
});
