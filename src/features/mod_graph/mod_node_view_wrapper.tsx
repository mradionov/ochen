import { icon } from '../../ui/icon';
import { ActionIcon, Divider, Group, Paper, Text } from '@mantine/core';

export const ModNodeViewWrapper = ({
  view,
  title,
  onRemove,
}: {
  view: React.ReactNode;
  title: string;
  onRemove: (() => void) | undefined;
}) => {
  return (
    <Paper withBorder>
      <Group justify="space-between">
        <Text fw={500} px={8}>
          {title}
        </Text>
        <ActionIcon
          color="red"
          variant="subtle"
          size="sm"
          onClick={onRemove}
          disabled={onRemove === undefined}
        >
          <icon.X />
        </ActionIcon>
      </Group>
      <Divider />
      <Group p={8}>{view}</Group>
    </Paper>
  );
};
