import React from 'react';
import { Database } from '../../lib/database';
import {
  ProjectsController,
  type Project,
  type SourceVideoFile,
} from './projects_controller';
import { ProjectsRepo } from './projects_repo';

const db = new Database();
const projectsRepo = new ProjectsRepo(db);
const projectsController = new ProjectsController(projectsRepo);

export const useProjects = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [activeProjectName, setActiveProjectName] = React.useState<
    string | undefined
  >();
  const [sourceVideoFiles, setSourceVideoFiles] = React.useState<
    SourceVideoFile[]
  >([]);

  const load = async () => {
    setProjects(await projectsController.fetchProjects());
    setActiveProjectName(await projectsController.fetchActiveProjectName());
    setSourceVideoFiles(
      await projectsController.fetchActiveProjectVideoFiles(),
    );
  };

  const activateProject = async (project: Project) => {
    await projectsController.activate(project);
    await load();
  };

  const chooseProjectsDirectory = async () => {
    await projectsController.chooseDir();
    await load();
  };

  const createNewProject = async (name: string) => {
    await projectsController.createNewProject(name);
    await load();
  };

  React.useEffect(() => {
    void load();
  }, []);

  return {
    projects,
    activateProject,
    activeProjectName,
    chooseProjectsDirectory,
    createNewProject,
    sourceVideoFiles,
  };
};
