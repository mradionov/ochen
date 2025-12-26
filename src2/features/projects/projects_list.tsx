import { Button, Stack, Table, Text, ThemeIcon } from '@mantine/core';
import { useProjects } from './use_projects';
import * as Lucide from 'lucide-react';

export const ProjectsList = () => {
  const { projects, activateProject, chooseProjectsDirectory } = useProjects();

  return (
    <Stack align="start">
      <Button onClick={chooseProjectsDirectory}>
        Choose projects directory
      </Button>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th>Project Name</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {projects.map((project) => (
            <Table.Tr key={project.name}>
              <Table.Td w={20}>{project.isActive && <Lucide.Check />}</Table.Td>
              <Table.Td w={200}>{project.name}</Table.Td>
              <Table.Td>
                <Button onClick={() => activateProject(project)}>
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
