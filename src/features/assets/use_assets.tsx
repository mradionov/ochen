import { projectsController } from '../projects/install';
import { AssetsController } from './assets_controller';
import { AssetsStore } from './assets_store';
import React from 'react';

const assetsStore = new AssetsStore();
const assetsController = new AssetsController(assetsStore, projectsController);

export const useAssets = () => {
  const assetsState = React.useSyncExternalStore(
    assetsStore.subscribe,
    assetsStore.getSnapshot,
  );

  const load = async () => {
    await assetsController.fetchActiveProjectVideoFiles();
  };

  React.useEffect(() => {
    void load();
  }, []);

  return {
    assetsController,
    assetsState,
  };
};
