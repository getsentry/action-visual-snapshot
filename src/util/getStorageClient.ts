import {Storage} from '@google-cloud/storage';
import * as core from '@actions/core';

const GOOGLE_CREDENTIALS = core.getInput('gcp-service-account-key');
const credentials =
  GOOGLE_CREDENTIALS &&
  JSON.parse(Buffer.from(GOOGLE_CREDENTIALS, 'base64').toString('utf8'));

export function getStorageClient() {
  if (!credentials) {
    return null;
  }

  return new Storage({credentials});
}
