import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useProjects } from './use_projects';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

export const CreateProjectButton = () => {
  const { createNewProject } = useProjects();

  const [isOpen, { open, close }] = useDisclosure(false);

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      name: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
    },
  });

  const onSubmit = async (values: { name: string }) => {
    await createNewProject(values.name);
    close();
  };

  return (
    <>
      <Button onClick={open}>+ Create new project</Button>
      <Modal
        trapFocus
        opened={isOpen}
        onClose={close}
        title="Create New Project"
      >
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Project name"
            key={form.key('name')}
            data-autofocus
            {...form.getInputProps('name')}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};
