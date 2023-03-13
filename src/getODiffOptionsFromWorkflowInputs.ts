import * as core from '@actions/core';
import {ODiffOptions} from 'odiff-bin';

export function getODiffOptionsFromWorkflowInputs(): ODiffOptions {
  let threshold: string | number = process.env.ACTION_THRESHOLD || core.getInput('threshold');
  const antialiasing: string | boolean = core.getInput('antialiasing');

  if (typeof threshold === 'string') {
    threshold = parseFloat(threshold);

    if (isNaN(threshold)) {
      throw new Error(
        'Failed to parse threshold: ' + core.getInput('threshold')
      );
    }
  }

  return {
    threshold,
    antialiasing: antialiasing === 'true' ? true : false,
  };
}
