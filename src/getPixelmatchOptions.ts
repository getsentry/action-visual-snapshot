import * as core from '@actions/core';
import {PixelmatchOptions} from '@app/types';

const OPTIONS = ['threshold', 'includeAA', 'alpha', 'diffMask'] as const;

export function getPixelmatchOptions(): PixelmatchOptions {
  const inputs = Object.fromEntries(
    OPTIONS.map(option => [option, core.getInput(option)])
  );

  return {
    ...inputs,
    ...(!inputs.includeAA || inputs.includeAA === 'false'
      ? {includeAA: false}
      : {includeAA: true}),
  };
}
