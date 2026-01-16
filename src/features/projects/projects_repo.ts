import type { Database } from '../../lib/database';

const PROJECTS_STORE_NAME = 'projects';
const ROOT_DIR_HANDLE_KEY = 'root_dir_handle';
const ACTIVE_PROJECT_KEY = 'active_project';

export class ProjectsRepo {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;

    db.upgradeNeeded.addListener((createStoreIfMissing) => {
      createStoreIfMissing(PROJECTS_STORE_NAME);
    });
  }

  async saveRootDirHandle(rootHandle: FileSystemDirectoryHandle) {
    return this.db.saveValue(
      PROJECTS_STORE_NAME,
      ROOT_DIR_HANDLE_KEY,
      rootHandle,
    );
  }

  async loadRootDirHandle(): Promise<FileSystemDirectoryHandle> {
    return this.db.loadValue(PROJECTS_STORE_NAME, ROOT_DIR_HANDLE_KEY);
  }

  async saveActiveProject(projectName: string) {
    return this.db.saveValue(
      PROJECTS_STORE_NAME,
      ACTIVE_PROJECT_KEY,
      projectName,
    );
  }

  async loadActiveProject(): Promise<string> {
    return this.db.loadValue(PROJECTS_STORE_NAME, ACTIVE_PROJECT_KEY);
  }
}
