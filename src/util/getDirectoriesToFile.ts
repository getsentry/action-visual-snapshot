import path from 'path';

export function getDirectoriesToFile(from: string, to: string) {
  return path.relative(from, path.dirname(to));
}
