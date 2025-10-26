import type { ProjectsRepo } from '$lib/projects/projects_repo';

const excludeNames = ['.DS_Store'];

export type Project = {
	name: string;
	isActive: boolean;
};

export class ProjectsController {
	constructor(private readonly projectsRepo: ProjectsRepo) {}

	async chooseDir() {
		const handle = await window.showDirectoryPicker();
		await this.projectsRepo.saveDirHandle(handle);
	}

	async activate(project: Project) {
		await this.projectsRepo.saveActiveProject(project.name);
	}

	async fetchActiveProjectName(): Promise<string> {
		return this.projectsRepo.loadActiveProject();
	}

	async fetchProjects(): Promise<Project[] | undefined> {
		const handle = await this.projectsRepo.loadDirHandle();
		if (!handle) {
			return undefined;
		}

		const activeProject = await this.projectsRepo.loadActiveProject();

		const projects: Project[] = [];

		for await (const [key, value] of handle.entries()) {
			if (excludeNames.includes(key)) {
				continue;
			}
			projects.push({
				name: key,
				isActive: key === activeProject
			});
		}

		return projects;
	}
}
