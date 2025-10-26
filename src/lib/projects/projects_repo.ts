import type { Database } from '$lib/database';

const PROJECTS_STORE_NAME = 'projects';
const DIR_HANDLE_KEY = 'dir_handle';
const ACTIVE_PROJECT_KEY = 'active_project';

export class ProjectsRepo {
	constructor(private readonly db: Database) {
		db.upgradeNeeded.addListener((createStoreIfMissing) => {
			createStoreIfMissing(PROJECTS_STORE_NAME);
		});
	}

	async saveDirHandle(handle: FileSystemDirectoryHandle) {
		return this.db.saveValue(PROJECTS_STORE_NAME, DIR_HANDLE_KEY, handle);
	}

	async loadDirHandle(): Promise<FileSystemDirectoryHandle> {
		return this.db.loadValue(PROJECTS_STORE_NAME, DIR_HANDLE_KEY);
	}

	async saveActiveProject(projectName: string) {
		return this.db.saveValue(PROJECTS_STORE_NAME, ACTIVE_PROJECT_KEY, projectName);
	}

	async loadActiveProject(): Promise<string> {
		return this.db.loadValue(PROJECTS_STORE_NAME, ACTIVE_PROJECT_KEY);
	}
}
