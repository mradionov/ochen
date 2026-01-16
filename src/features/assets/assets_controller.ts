import { FS } from '../../lib/fs';
import type { ProjectsController } from '../projects/projects_controller';
import type { AssetsStore } from './assets_store';

export type VideoFileAsset = {
  name: string;
  path: string;
};

const videoFilesExtensions = ['.mp4', '.mov', '.jpg', '.jpeg', '.heic'];

export class AssetsController {
  private readonly assetsStore: AssetsStore;
  private readonly projectsController: ProjectsController;

  constructor(store: AssetsStore, projectsController: ProjectsController) {
    this.assetsStore = store;
    this.projectsController = projectsController;
  }

  async deleteVideoFile(fileName: string) {
    const projectVideosDirHandle =
      await this.projectsController.getActiveProjectVideosDirHandle();

    await FS.deleteFile(projectVideosDirHandle, fileName);

    this.assetsStore.deleteVideoFile(fileName);
  }

  async pickAndUploadVideoFiles() {
    const projectVideosDirHandle =
      await this.projectsController.getActiveProjectVideosDirHandle();

    const videoFileHandles = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          accept: {
            'video/*': videoFilesExtensions,
          },
        },
      ],
    });

    await Promise.all(
      videoFileHandles.map(async (fileHandle) => {
        const file = await fileHandle.getFile();

        await FS.copyFile(fileHandle, projectVideosDirHandle, file.name);
      }),
    );

    await this.fetchActiveProjectVideoFiles();
  }

  async fetchActiveProjectVideoFiles() {
    const projectDirHandle =
      await this.projectsController.getActiveProjectDirHandle();
    const projectVideosDirHandle =
      await this.projectsController.getActiveProjectVideosDirHandle();

    const videoFilesItems = await FS.getDirItems(projectVideosDirHandle, {
      kind: 'file',
      sort: true,
    });

    const videoFileAssets = videoFilesItems.map(({ name }) => ({
      path: `/sets/${projectDirHandle.name}/${projectVideosDirHandle.name}/${name}`,
      name,
    }));

    this.assetsStore.hydrateVideoFileAssets(videoFileAssets);
  }
}
