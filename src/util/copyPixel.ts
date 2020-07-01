/* eslint-env node */
import {PNG} from 'pngjs';

export function copyPixel(idx: number, from: PNG, to: PNG): void {
  to.data[idx] = from.data[idx];
  to.data[idx + 1] = from.data[idx + 1];
  to.data[idx + 2] = from.data[idx + 2];
  to.data[idx + 3] = from.data[idx + 3];
}
