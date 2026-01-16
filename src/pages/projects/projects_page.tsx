import { CreateProjectButton } from '../../features/projects/create_project_button';
import { useProjects } from '../../features/projects/use_projects';
import { Page } from '../../ui/page/page';
import { ProjectsList } from './projects_list';
import { Button, Group, Stack } from '@mantine/core';

export const ProjectsPage = () => {
  const { projectsController } = useProjects();

  return (
    <Page>
      <Stack gap="lg">
        <Group justify="space-between">
          <Button onClick={() => projectsController.chooseRootDir()}>
            Choose projects directory
          </Button>
          <CreateProjectButton />
        </Group>
        <ProjectsList />
      </Stack>
    </Page>
  );
};
