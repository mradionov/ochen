import { CreateProjectButton } from '../../features/projects/create_project_button';
import { ProjectsList } from '../../features/projects/projects_list';
import { Page } from '../../ui/page/page';
import { Button, Group, Stack } from '@mantine/core';
import { useProjects } from '../../features/projects/use_projects';

export const ProjectsPage = () => {
  const { chooseProjectsDirectory } = useProjects();

  return (
    <Page>
      <Stack gap="lg">
        <Group justify="space-between">
          <Button onClick={chooseProjectsDirectory}>
            Choose projects directory
          </Button>
          <CreateProjectButton />
        </Group>
        <ProjectsList />
      </Stack>
    </Page>
  );
};
