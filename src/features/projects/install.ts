import { Database } from '../../lib/database';
import { ProjectsController } from './projects_controller';
import { ProjectsRepo } from './projects_repo';
import { ProjectsStore } from './projects_store';

const db = new Database();
const projectsRepo = new ProjectsRepo(db);

export const projectsStore = new ProjectsStore();
export const projectsController = new ProjectsController(
  projectsRepo,
  projectsStore,
);
