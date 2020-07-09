import {getDirectoriesToFile} from './getDirectoriesToFile';

/**
 * Given a base path and a full path to file, we want to find
 * the subdirectories "between" `base` and `target`
 */
export function getChildDirectories(targets: [string, string[]][]) {
  return new Set(
    targets
      .reduce(
        (acc: string[], [base, files]) =>
          acc.concat(files.map(file => getDirectoriesToFile(base, file))),
        []
      )
      .filter(Boolean)
  );
}
