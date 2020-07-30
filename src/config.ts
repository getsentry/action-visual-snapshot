import * as core from '@actions/core';

export const API_ENDPOINT =
  core.getInput('api-endpoint') ||
  'https://sentry-visual-snapshot-dwunkkvj6a-uc.a.run.app/api';
export const SENTRY_DSN =
  'https://6b971d11c2af4b468105f079294e372c@o1.ingest.sentry.io/5324467';
