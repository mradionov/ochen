import type { ProjectsRepo } from './projects_repo.ts';

const excludeNames = ['.DS_Store'];

export type Project = {
  name: string;
  isActive: boolean;
};

export type SourceVideoFile = {
  name: string;
  path: string;
};

export class ProjectsController {
  private readonly projectsRepo: ProjectsRepo;

  constructor(projectsRepo: ProjectsRepo) {
    this.projectsRepo = projectsRepo;
  }

  async chooseDir() {
    const handle = await window.showDirectoryPicker();
    await this.projectsRepo.saveDirHandle(handle);
  }

  async activate(project: Project) {
    await this.projectsRepo.saveActiveProject(project.name);
  }

  async createNewProject(name: string) {
    const projectsHandle = await this.projectsRepo.loadDirHandle();
    if (!projectsHandle) {
      throw new Error('No projects dir handle');
    }

    const newProjectHandle = await projectsHandle.getDirectoryHandle(name, {
      create: true,
    });

    await newProjectHandle.getDirectoryHandle('audios', { create: true });
    await newProjectHandle.getDirectoryHandle('videos', { create: true });
    await newProjectHandle.getFileHandle('manifest.json', { create: true });

    await this.projectsRepo.saveActiveProject(name);
  }

  async fetchActiveProjectName(): Promise<string> {
    return this.projectsRepo.loadActiveProject();
  }

  async fetchProjects(): Promise<Project[]> {
    const handle = await this.projectsRepo.loadDirHandle();
    if (!handle) {
      throw new Error('No projects dir handle');
    }

    const activeProjectName = await this.projectsRepo.loadActiveProject();

    const projects: Project[] = [];

    const dirItems = await this.getDirItems(handle);
    for (const { name } of dirItems) {
      if (excludeNames.includes(name)) {
        continue;
      }
      projects.push({
        name: name,
        isActive: name === activeProjectName,
      });
    }

    projects.sort((a, b) => a.name.localeCompare(b.name));

    return projects;
  }

  private async getDirItems(dirHandle: FileSystemDirectoryHandle) {
    const items = [];
    for await (const [name, handle] of dirHandle.entries()) {
      items.push({
        name,
        handle,
      });
    }
    return items;
  }

  async fetchActiveProjectVideoFiles(): Promise<SourceVideoFile[]> {
    const projectsHandle = await this.projectsRepo.loadDirHandle();
    if (!projectsHandle) {
      throw new Error('No projects dir handle');
    }

    const activeProjectName = await this.projectsRepo.loadActiveProject();

    const projectDirItems = await this.getDirItems(projectsHandle);

    const activeProjectDirItem = projectDirItems.find(
      ({ name }) => name === activeProjectName,
    );
    if (!activeProjectDirItem) {
      throw new Error('No active project dir');
    }

    const activeProjectDirItems = await this.getDirItems(
      activeProjectDirItem.handle,
    );
    const videosDirItem = activeProjectDirItems.find(
      ({ name }) => name === 'videos',
    );
    if (!videosDirItem) {
      throw new Error('No active project "videos" dir');
    }

    const videoFilesItems = await this.getDirItems(videosDirItem.handle);

    return videoFilesItems
      .filter((item) => {
        return item.handle.kind === 'file' && !excludeNames.includes(item.name);
      })
      .map(({ name }) => ({
        path: `/sets/${activeProjectName}/videos/${name}`,
        name,
      }));
  }
}
