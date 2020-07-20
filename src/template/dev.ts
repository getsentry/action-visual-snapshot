import path from 'path';

import {build} from './build';

import {generateImageGallery} from '../util/generateImageGallery';

async function main() {
  await build();
  await generateImageGallery(
    path.resolve(__dirname, '../../example_gallery/index.html'),
    {
      changed: [
        'acceptance/project-ownership.png',
        'acceptance/project-settings-all-integrations.png',
        'acceptance/project-settings-debug-symbols.png',
        'acceptance/project-settings-general-settings.png',
        'acceptance/project-settings-release-tracking.png',
        'acceptance/project-settings-service-hooks-create.png',
        'acceptance/project-settings-service-hooks-details.png',
        'acceptance/project-settings-service-hooks-empty-list.png',
        'acceptance/project-settings-service-hooks-list-with-entries.png',
      ],
      missing: ['acceptance/project-settings-tags-after-remove.png'],
      added: ['acceptance/project-settings-tags.png'],
    }
  );
}

main();
