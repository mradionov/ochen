import { ManifestController } from './manifest_controller';
import { ManifestReader } from './manifest_reader';
import { ManifestWriter } from './manifest_writer';
import { ManifestStore } from './stores/manifest_store';
import { ManifestVersionStore } from './stores/manifest_version_store';

export const manifestReader = new ManifestReader();
export const manifestWriter = new ManifestWriter();
export const manifestStore = ManifestStore.createEmpty();
export const manifestVersionStore = new ManifestVersionStore(manifestStore);
export const manifestController = new ManifestController(
  manifestStore,
  manifestVersionStore,
  manifestReader,
  manifestWriter,
);
