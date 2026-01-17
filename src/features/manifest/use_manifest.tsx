import { useProjects } from '../projects/use_projects';
import {
  manifestStore,
  manifestController,
  manifestVersionStore,
} from './install';
import React from 'react';

export const useManifest = () => {
  const { projectsState } = useProjects();

  const manifestState = React.useSyncExternalStore(
    manifestStore.subscribe,
    manifestStore.getSnapshot,
  );

  const manifestVersionState = React.useSyncExternalStore(
    manifestVersionStore.subscribe,
    manifestVersionStore.getSnapshot,
  );

  React.useEffect(() => {
    if (projectsState.activeProject == null) {
      return;
    }
    void manifestController.loadForProject(projectsState.activeProject);
  }, [projectsState.activeProject]);

  return {
    manifestState,
    manifestStore,
    manifestController,
    manifestVersionState,
  };
};
