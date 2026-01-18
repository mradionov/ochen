import { icon } from '../../ui/icon';
import classes from './mod_add_node_menu.module.css';
import { canAddNode } from './mod_node_helper';
import {
  modNodeRegistry,
  type ModNodeInstance,
  type ModNodeSpec,
  type ModNodeType,
} from './mod_node_registry';
import type { ModNodeCategory } from './mod_node_spec';
import {
  Button,
  Group,
  Popover,
  Stack,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export const ModAddNodeMenu = ({
  onSelect,
  nodes,
}: {
  onSelect: (type: ModNodeType) => void;
  nodes: ModNodeInstance[];
}) => {
  const [opened, { open, toggle, close }] = useDisclosure(false);
  const categories: ModNodeCategory[] = ['input', 'math', 'output'];

  return (
    <Popover
      width={500}
      position="bottom"
      opened={opened}
      onClose={close}
      onOpen={open}
    >
      <Popover.Target>
        <Button leftSection={<icon.Plus />} size="compact-sm" onClick={toggle}>
          Mod
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        {categories.map((category) => (
          <Category
            key={category}
            category={category}
            nodes={nodes}
            onSelect={(spec) => {
              onSelect(spec.type);
              close();
            }}
          />
        ))}
      </Popover.Dropdown>
    </Popover>
  );
};

const Category = ({
  category,
  nodes,
  onSelect,
}: {
  category: ModNodeCategory;
  nodes: ModNodeInstance[];
  onSelect: (spec: ModNodeSpec) => void;
}) => {
  const nodeCategorySpecs = Object.entries(modNodeRegistry).filter(
    ([, spec]) => spec.category === category,
  );

  return (
    <Stack key={category} mb="md" gap="xs">
      <Title order={6}>{category}</Title>
      <Group>
        {nodeCategorySpecs.map(([type, spec]) => (
          <Item key={type} nodes={nodes} spec={spec} onClick={onSelect} />
        ))}
      </Group>
    </Stack>
  );
};

const Item = ({
  spec,
  nodes,
  onClick,
}: {
  spec: ModNodeSpec;
  nodes: ModNodeInstance[];
  onClick: (spec: ModNodeSpec) => void;
}) => {
  const isDisabled = !canAddNode(nodes, spec);

  return (
    <UnstyledButton
      size="compact-sm"
      className={classes.button}
      onClick={() => onClick(spec)}
      disabled={isDisabled}
    >
      <spec.Icon />
      {spec.title}
    </UnstyledButton>
  );
};
