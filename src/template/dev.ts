import path from 'path';

import {build} from './build';

import {generateImageGallery} from '../util/generateImageGallery';

async function main() {
  await build();
  await generateImageGallery(
    path.resolve(__dirname, '../../example_gallery/index.html'),
    {
      changed: {
        'project-ownership': 'acceptance/project-ownership.png',
        'project-settings-all-integrations':
          'acceptance/project-settings-all-integrations.png',
        'project-settings-debug-symbols':
          'acceptance/project-settings-debug-symbols.png',
        'project-settings-general-settings':
          'acceptance/project-settings-general-settings.png',
        'project-settings-release-tracking':
          'acceptance/project-settings-release-tracking.png',
        'project-settings-service-hooks-create':
          'acceptance/project-settings-service-hooks-create.png',
        'project-settings-service-hooks-details':
          'acceptance/project-settings-service-hooks-details.png',
        'project-settings-service-hooks-empty-list':
          'acceptance/project-settings-service-hooks-empty-list.png',
      },
      missing: {
        'project-settings-tags-after-remove':
          'acceptance/project-settings-tags-after-remove.png',
      },
      added: {
        'project-settings-tags': 'acceptance/project-settings-tags.png',
      },
      differentSize: {
        'project-settings-service-hooks-list-with-entries':
          'acceptance/project-settings-service-hooks-list-with-entries.png',
      },
    }
  );
}

main();
