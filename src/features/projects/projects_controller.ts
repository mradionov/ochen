import { asyncOnce } from '../../lib/async_once.ts';
import { FS } from '../../lib/fs.ts';
import type { ProjectsRepo } from './projects_repo.ts';
import type { Project, ProjectsStore } from './projects_store.ts';

export class ProjectsController {
  private readonly projectsRepo: ProjectsRepo;
  private readonly projectsStore: ProjectsStore;

  constructor(projectsRepo: ProjectsRepo, projectsStore: ProjectsStore) {
    this.projectsRepo = projectsRepo;
    this.projectsStore = projectsStore;
  }

  readonly loadProjects = asyncOnce(async () => {
    await this.fetchProjects();
  });

  private async getDirRootHandle(): Promise<FileSystemDirectoryHandle> {
    const rootDirHandle = await this.projectsRepo.loadRootDirHandle();
    if (!rootDirHandle) {
      throw new Error('No projects dir handle');
    }
    return rootDirHandle;
  }

  private async getProjectDirHandle(
    name: string,
  ): Promise<FileSystemDirectoryHandle> {
    const rootDirHandle = await this.getDirRootHandle();
    const projectDirHandle = await FS.findDirHandleByName(rootDirHandle, name);
    if (!projectDirHandle) {
      throw new Error(`No project dir found by name: "${name}"`);
    }
    return projectDirHandle;
  }

  async chooseRootDir() {
    const rootHandle = await window.showDirectoryPicker();
    await this.projectsRepo.saveRootDirHandle(rootHandle);
    await this.fetchProjects();
  }

  async activate(project: Project) {
    await this.getProjectDirHandle(project.name);
    await this.projectsRepo.saveActiveProject(project.name);
    await this.fetchProjects();
  }

  async createNewProject(name: string) {
    const rootDirHandle = await this.getDirRootHandle();

    const newProjectDirHandle = await FS.createDir(rootDirHandle, name);

    await FS.createDir(newProjectDirHandle, 'audios');
    await FS.createDir(newProjectDirHandle, 'videos');
    await FS.createFile(newProjectDirHandle, 'manifest.json');

    await this.projectsRepo.saveActiveProject(name);

    await this.fetchProjects();
  }

  async fetchProjects() {
    const rootDirHandle = await this.getDirRootHandle();

    const activeProjectName = await this.projectsRepo.loadActiveProject();

    const projects: Project[] = [];

    const dirItems = await FS.getDirItems(rootDirHandle, { sort: true });
    for (const { name } of dirItems) {
      projects.push({
        name: name,
        isActive: name === activeProjectName,
      });
    }

    this.projectsStore.setActiveProject(projects.find((p) => p.isActive));
    this.projectsStore.setProjects(projects);
  }

  async getActiveProjectDirHandle(): Promise<FileSystemDirectoryHandle> {
    const activeProjectName = await this.projectsRepo.loadActiveProject();
    const projectDirHandle = await this.getProjectDirHandle(activeProjectName);
    return projectDirHandle;
  }

  async getActiveProjectVideosDirHandle(): Promise<FileSystemDirectoryHandle> {
    const projectDirHandle = await this.getActiveProjectDirHandle();
    const videosDirHandle = await FS.findDirHandleByName(
      projectDirHandle,
      'videos',
    );
    if (!videosDirHandle) {
      throw new Error('No active project "videos" dir');
    }
    return videosDirHandle;
  }
}
