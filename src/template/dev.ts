import path from 'path';

import {build} from './build';

import {generateImageGallery} from '../util/generateImageGallery';

async function main() {
  await build();
  await generateImageGallery(
    path.resolve(__dirname, '../../example_gallery/index.html'),
    {
      baseFilesLength: 10,
      changed: [
        {
          name: 'project-ownership.png',
          baseGroup: 'acceptance',
          groups: ['', 'mobile'],
        },
        {
          name: 'project-settings-all-integrations.png',
          baseGroup: 'acceptance',
          groups: ['', 'mobile'],
        },
        'acceptance/project-settings-all-integrations.png',
        'acceptance/project-settings-debug-symbols.png',
        'acceptance/project-settings-general-settings.png',
        'acceptance/project-settings-release-tracking.png',
        'acceptance/project-settings-service-hooks-create.png',
        'acceptance/project-settings-service-hooks-details.png',
        'acceptance/project-settings-service-hooks-empty-list.png',
      ],
      added: [],
      missing: [
        {
          name: 'project-settings-service-hooks-list-with-entries.png',
          baseGroup: 'acceptance',
          groups: ['', 'mobile'],
        },
        'acceptance/project-settings-tags-after-remove.png',
      ],
    }
  );
}

main();
