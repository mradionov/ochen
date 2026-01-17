import { icon } from '../icon';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Group, Paper, Stack, ThemeIcon } from '@mantine/core';
import React from 'react';

type RenderArgs<T> = {
  item: T;
  index: number;
  isDragging: boolean;
};

export const SortableList = <T,>({
  items,
  renderItem,
  getId,
  onChange,
}: {
  items: T[];
  renderItem: (args: RenderArgs<T>) => React.ReactNode;
  getId: (item: T) => UniqueIdentifier;
  onChange: (nextItems: T[]) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove([...items], oldIndex, newIndex));
  };

  const ids = React.useMemo(() => items.map(getId), [items, getId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Stack gap={4}>
          {items.map((item, index) => (
            <SortableItem
              key={String(getId(item))}
              id={getId(item)}
              index={index}
              item={item}
              renderItem={renderItem}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
};

const SortableItem = <T,>({
  id,
  index,
  item,
  renderItem,
}: {
  id: UniqueIdentifier;
  index: number;
  item: T;
  renderItem: (args: RenderArgs<T>) => React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const styleTransform = transform
    ? CSS.Transform.toString(transform)
    : undefined;

  return (
    <Paper
      withBorder
      ref={setNodeRef}
      style={{
        transform: styleTransform,
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      {...attributes}
    >
      <Group gap={4}>
        <ThemeIcon variant="subtle" {...listeners} style={{ cursor: 'grab' }}>
          <icon.GripVertical />
        </ThemeIcon>
        {renderItem({
          item,
          index,
          isDragging,
        })}
      </Group>
    </Paper>
  );
};
