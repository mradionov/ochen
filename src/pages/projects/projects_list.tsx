import { useProjects } from '../../features/projects/use_projects';
import { icon } from '../../ui/icon';
import { Button, Table } from '@mantine/core';

export const ProjectsList = () => {
  const { projectsState, projectsController } = useProjects();

  return (
    <Table withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Active</Table.Th>
          <Table.Th>Project Name</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {projectsState.projects.map((project) => (
          <Table.Tr key={project.name}>
            <Table.Td w={20}>{project.isActive && <icon.Check />}</Table.Td>
            <Table.Td w={200}>{project.name}</Table.Td>
            <Table.Td>
              <Button onClick={() => projectsController.activate(project)}>
                Activate
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
