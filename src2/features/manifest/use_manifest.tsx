import React from 'react';
import { ManifestReader } from './manifest_reader';
import { ManifestStore } from './stores/manifest_store';
import { useProjects } from '../projects/use_projects';

const manifestReader = new ManifestReader();

export const useManifest = () => {
  const { activeProjectName } = useProjects();

  const manifestStore = React.useMemo(() => ManifestStore.createEmpty(), []);

  const manifestState = React.useSyncExternalStore(
    manifestStore.subscribe,
    manifestStore.getSnapshot,
  );

  const load = async (projectName: string) => {
    const loadedManifestStore = await manifestReader.read(projectName);
    manifestStore.hydrate(loadedManifestStore.getSnapshot());
  };

  React.useEffect(() => {
    if (activeProjectName == null) {
      return;
    }
    void load(activeProjectName);
  }, [activeProjectName]);

  return { manifestState, manifestStore };
};
