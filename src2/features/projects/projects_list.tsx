import React from 'react';
import { type Project, ProjectsController } from './projects_controller';
import { ProjectsRepo } from './projects_repo';
import { Database } from '../../lib/database';
import { Button, Stack, Table, Text } from '@mantine/core';

const db = new Database();
const projectsRepo = new ProjectsRepo(db);
const projectsController = new ProjectsController(projectsRepo);

export const ProjectsList = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    projectsController.fetchProjects().then((projects) => {
      if (!projects) return;
      setProjects(projects);
    });
  }, []);

  const onActivateProject = async (project: Project) => {
    await projectsController.activate(project);
    const updatedProjects = await projectsController.fetchProjects();
    if (updatedProjects) {
      setProjects(updatedProjects);
    }
  };

  const onChooseDirectory = () => {
    projectsController.chooseDir();
  };

  return (
    <Stack align="start">
      <Button onClick={onChooseDirectory}>Choose projects directory</Button>
      <Table withTableBorder withColumnBorders>
        <Table.Tbody>
          {projects.map((project) => (
            <Table.Tr key={project.name}>
              <Table.Td>
                <Text fw={project.isActive ? 'bold' : 'normal'}>
                  {project.name}
                </Text>
              </Table.Td>
              <Table.Td>
                <Button onClick={() => onActivateProject(project)}>
                  Activate
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};
