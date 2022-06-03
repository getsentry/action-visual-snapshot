// https://github.com/TypeStrong/ts-node/issues/676#issuecomment-472913023
require('ts-node').register();
require(require('path').resolve(__dirname, 'SnapshotDiffWorker.ts'));
