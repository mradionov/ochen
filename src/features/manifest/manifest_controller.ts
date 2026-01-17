import { asyncOnce } from '../../lib/async_once';
import type { Project } from '../projects/projects_store';
import type { ManifestReader } from './manifest_reader';
import type { ManifestWriter } from './manifest_writer';
import type { ManifestStore } from './stores/manifest_store';
import type { ManifestVersionStore } from './stores/manifest_version_store';

export class ManifestController {
  private readonly manifestStore: ManifestStore;
  private readonly manifestVersionStore: ManifestVersionStore;
  private readonly manifestReader: ManifestReader;
  private readonly manifestWriter: ManifestWriter;

  constructor(
    manifestStore: ManifestStore,
    manifestVersionStore: ManifestVersionStore,
    manifestReader: ManifestReader,
    manifestWriter: ManifestWriter,
  ) {
    this.manifestStore = manifestStore;
    this.manifestVersionStore = manifestVersionStore;
    this.manifestReader = manifestReader;
    this.manifestWriter = manifestWriter;
  }

  readonly loadForProject = asyncOnce(
    async (project: Project) => {
      const loadedManifestStore = await this.manifestReader.read(project.name);
      const snap = loadedManifestStore.getSnapshot();
      this.manifestStore.hydrate(snap);
      this.manifestVersionStore.resetVersioning();
    },
    ([project]) => project.name,
  );

  async saveManifest() {
    await this.manifestWriter.writeWithFilePicker(this.manifestStore);
    this.manifestVersionStore.resetVersioning();
  }
}
