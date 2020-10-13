import * as io from '@actions/io';
import * as glob from '@actions/glob';

import {diffSnapshots} from '@app/util/diffSnapshots';
import {multiCompare} from '@app/util/multiCompare';

const BASE_PATH = '/basePath';
const MERGE_BASE_PATH = '/mergeBasePath';
const CURRENT_PATH = '/currentPath';
const OUTPUT_PATH = '/outputPath';

// jest.mock('path');

jest.mock('@actions/io', () => ({
  mkdirP: jest.fn(async () => {}),
  cp: jest.fn(async () => {}),
}));

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
  warning: jest.fn(),
}));

jest.mock('@actions/glob', () => ({
  create: jest.fn(async () => {}),
}));

jest.mock('@app/util/multiCompare', () => ({
  multiCompare: jest.fn(async () => {}),
}));

describe('diffSnapshots', function () {
  jest.setTimeout(5000);
  beforeAll(function () {});

  beforeEach(function () {
    // @ts-ignore
    multiCompare.mockClear();
  });

  it('creates output directories', async function () {
    // @ts-ignore
    multiCompare.mockImplementation(() => false);
    jest.spyOn(glob, 'create');
    (glob.create as jest.Mock).mockImplementation(async dir => ({
      glob: jest.fn(async () => {
        function withPath(p: string) {
          return (f: string) => `${p}/${f}`;
        }

        const COMMON_FILES = ['foo/bar/a', 'foo/bar/b', 'foo/bar/baz/c'];

        // current master
        if (dir.startsWith(BASE_PATH)) {
          return [
            ...COMMON_FILES.map(withPath(BASE_PATH)),
            `${BASE_PATH}/meow`,
          ];
        }

        // master where branched
        if (dir.startsWith(MERGE_BASE_PATH)) {
          return [
            ...COMMON_FILES.map(withPath(MERGE_BASE_PATH)),
            `${MERGE_BASE_PATH}/woof`,
          ];
        }

        // branch head
        if (dir.startsWith(CURRENT_PATH)) {
          return [
            ...COMMON_FILES.map(withPath(CURRENT_PATH)),
            `${CURRENT_PATH}/moo`,
          ];
        }

        return [];
      }),
    }));

    await diffSnapshots({
      basePath: BASE_PATH,
      mergeBasePath: MERGE_BASE_PATH,
      currentPath: CURRENT_PATH,
      outputPath: OUTPUT_PATH,
    });

    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/diffs/foo/bar`);
    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/diffs/foo/bar/baz`);

    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/original/foo/bar`);
    expect(io.mkdirP).toHaveBeenCalledWith(
      `${OUTPUT_PATH}/original/foo/bar/baz`
    );

    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/changed/foo/bar`);
    expect(io.mkdirP).toHaveBeenCalledWith(
      `${OUTPUT_PATH}/changed/foo/bar/baz`
    );

    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/merged/foo/bar`);
    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/merged/foo/bar/baz`);

    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/missing/foo/bar`);
    expect(io.mkdirP).toHaveBeenCalledWith(
      `${OUTPUT_PATH}/missing/foo/bar/baz`
    );

    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/new/foo/bar`);
    expect(io.mkdirP).toHaveBeenCalledWith(`${OUTPUT_PATH}/new/foo/bar/baz`);
  });

  it('can diff with groups', async function () {
    // @ts-ignore
    multiCompare.mockImplementation(({snapshotName}) => {
      if (snapshotName.endsWith('/changed')) {
        return true;
      }

      return false;
    });

    jest.spyOn(glob, 'create');
    (glob.create as jest.Mock).mockImplementation(async dir => ({
      glob: jest.fn(async () => {
        function withPath(p: string) {
          return (f: string) => `${p}/${f}`;
        }

        const COMMON_FILES = [
          'snapshots/1680px/foo/unchanged',
          'snapshots/375px/foo/unchanged',
          'snapshots/1680px/foo/changed',
          'snapshots/375px/foo/changed',
        ];

        // current master
        if (dir.startsWith(BASE_PATH)) {
          return [
            ...COMMON_FILES.map(withPath(BASE_PATH)),
            `${BASE_PATH}/snapshots/1680px/foo/missing`,
            `${BASE_PATH}/snapshots/375px/foo/missing`,
            `${BASE_PATH}/snapshots/1680px/foo/missing-group`,
            `${BASE_PATH}/snapshots/375px/foo/missing-group`,
            `${BASE_PATH}/snapshots/1680px/foo/added-in-master`,
            `${BASE_PATH}/snapshots/375px/foo/added-in-master`,
          ];
        }

        // master where branched
        if (dir.startsWith(MERGE_BASE_PATH)) {
          return [
            ...COMMON_FILES.map(withPath(MERGE_BASE_PATH)),
            `${MERGE_BASE_PATH}/snapshots/1680px/foo/missing`,
            `${MERGE_BASE_PATH}/snapshots/375px/foo/missing`,
            `${MERGE_BASE_PATH}/snapshots/1680px/foo/missing-group`,
            `${MERGE_BASE_PATH}/snapshots/375px/foo/missing-group`,
          ];
        }

        // branch head
        if (dir.startsWith(CURRENT_PATH)) {
          return [
            ...COMMON_FILES.map(withPath(CURRENT_PATH)),
            // `added-in-master` should be ignored because it was added in master
            // removed 'missing' in branch
            // add `new` in branch
            `${CURRENT_PATH}/snapshots/1680px/foo/new`,
            `${CURRENT_PATH}/snapshots/375px/foo/new`,
            `${CURRENT_PATH}/snapshots/1680px/foo/missing-group`,
          ];
        }

        return [];
      }),
    }));

    const results = await diffSnapshots({
      basePath: BASE_PATH,
      mergeBasePath: MERGE_BASE_PATH,
      currentPath: CURRENT_PATH,
      outputPath: OUTPUT_PATH,
    });
    expect(results.newSnapshots).toEqual(
      new Set([
        {
          baseGroup: 'snapshots',
          name: 'foo/new',
          groups: ['1680px', '375px'],
        },
      ])
    );

    expect(results.changedSnapshots).toEqual(
      new Set([
        {
          baseGroup: 'snapshots',
          name: 'foo/changed',
          groups: ['1680px', '375px'],
        },
      ])
    );

    expect(results.missingSnapshots).toEqual(
      new Set([
        {
          baseGroup: 'snapshots',
          name: 'foo/missing',
          groups: ['1680px', '375px'],
        },
        {
          baseGroup: 'snapshots',
          name: 'foo/missing-group',
          groups: ['375px'],
        },
      ])
    );
  });
});
