import { projectsController, projectsStore } from './install';
import React from 'react';

export const useProjects = () => {
  const projectsState = React.useSyncExternalStore(
    projectsStore.subscribe,
    projectsStore.getSnapshot,
  );

  React.useEffect(() => {
    void projectsController.loadProjects();
  }, []);

  return {
    projectsState,
    projectsController,
  };
};
