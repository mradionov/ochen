import { useProjects } from '../projects/use_projects';
import { ManifestReader } from './manifest_reader';
import { ManifestWriter } from './manifest_writer';
import { ManifestStore, type ManifestState } from './stores/manifest_store';
import React from 'react';

const manifestReader = new ManifestReader();
const manifestWriter = new ManifestWriter();
const manifestStore = ManifestStore.createEmpty();

export const useManifest = () => {
  const { activeProjectName } = useProjects();

  const [savePointManifestState, setSavePointManifestState] =
    React.useState<ManifestState | null>(null);

  const manifestState = React.useSyncExternalStore(
    manifestStore.subscribe,
    manifestStore.getSnapshot,
  );

  const load = async (projectName: string) => {
    const loadedManifestStore = await manifestReader.read(projectName);
    const snap = loadedManifestStore.getSnapshot();
    manifestStore.hydrate(snap);
    setSavePointManifestState(snap);
  };

  const saveManifest = async () => {
    await manifestWriter.writeWithFilePicker(manifestStore);
    setSavePointManifestState(manifestStore.getSnapshot());
  };

  React.useEffect(() => {
    if (activeProjectName == null) {
      return;
    }
    void load(activeProjectName);
  }, [activeProjectName]);

  const hasManifestChanged = React.useMemo(() => {
    return (
      savePointManifestState != null &&
      JSON.stringify(savePointManifestState) !== JSON.stringify(manifestState)
    );
  }, [savePointManifestState, manifestState]);

  return { manifestState, manifestStore, saveManifest, hasManifestChanged };
};
