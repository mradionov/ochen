import { SyncStore } from '../../lib/store';

export type Project = {
  name: string;
  isActive: boolean;
};

export type ProjectsState = {
  projects: Project[];
  activeProject?: Project;
};

export class ProjectsStore extends SyncStore<ProjectsState> {
  private state: ProjectsState;

  constructor() {
    super();
    this.state = {
      projects: [],
      activeProject: undefined,
    };
  }

  private readonly recomputeState = (
    fromState: Partial<ProjectsState> = this.state,
    shouldEmit = true,
  ): ProjectsState => {
    this.state = {
      ...this.state,
      ...fromState,
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  };

  setProjects(projects: Project[]) {
    this.recomputeState({ projects });
  }

  setActiveProject(activeProject: Project | undefined) {
    this.recomputeState({ activeProject });
  }

  readonly getSnapshot = () => {
    return this.state;
  };
}
