import path from 'path';

import {Snapshot} from '@app/types';

function getPartsByFilename(filename: string, ignoreGroups: string[] = []) {
  const parts = filename.split(path.sep);
  const numberOfParts = parts.length;

  if (numberOfParts <= 1) {
    return {
      name: filename,
    };
  }

  const [baseGroup, ...restParts] = parts;

  if (numberOfParts === 2 || ignoreGroups.includes(baseGroup)) {
    return {
      baseGroup: parts[0],
      group: '',
      name: parts[1],
    };
  }

  const [group, ...rest] = restParts;

  // More than 2 parts
  return {
    baseGroup,
    group,
    name: rest.join(path.sep),
  };
}

/**
 * Breaks down a snapshot file name into Snapshot objects which contain
 * baseGroup, group, snapshot name
 *
 * TODO: Add ignoreGroups
 */
export function getSnapshotGroups(
  set: Set<string>,
  ignoreGroups?: string[]
): Set<Snapshot> {
  const groupedMap = new Map<string, Snapshot>();

  [...set].forEach(item => {
    const {baseGroup, group, name} = getPartsByFilename(item, ignoreGroups);

    if (!baseGroup) {
      groupedMap.set(name, {name, groups: []});
      return;
    }

    const obj = groupedMap.has(name) ? groupedMap.get(name) : null;

    const newGroup = group || '';

    if (obj) {
      groupedMap.set(name, {
        ...obj,
        groups: obj.groups.includes(newGroup)
          ? obj.groups
          : [...obj.groups, newGroup],
      });
    } else {
      groupedMap.set(name, {
        baseGroup,
        name,
        groups: [newGroup],
      });
    }
  });

  return new Set(groupedMap.values());
}
