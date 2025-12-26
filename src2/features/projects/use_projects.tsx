import React from 'react';
import { Database } from '../../lib/database';
import { ProjectsController, type Project } from './projects_controller';
import { ProjectsRepo } from './projects_repo';

const db = new Database();
const projectsRepo = new ProjectsRepo(db);
const projectsController = new ProjectsController(projectsRepo);

export const useProjects = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);

  const loadProjects = async () => {
    setProjects(await projectsController.fetchProjects());
  };

  const activateProject = async (project: Project) => {
    await projectsController.activate(project);
    await loadProjects();
  };

  const chooseProjectsDirectory = () => {
    projectsController.chooseDir();
  };

  React.useEffect(() => {
    void loadProjects();
  }, []);

  return { projects, activateProject, chooseProjectsDirectory };
};
// const projectsController = React.useContext(ProjectsControllerContext);
//
