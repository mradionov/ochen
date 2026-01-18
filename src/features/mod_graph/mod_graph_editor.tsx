import { icon } from '../../ui/icon';
import { ModAddNodeMenu } from './mod_add_node_menu';
import { calcNodes } from './mod_node_helper';
import {
  modNodeRegistry,
  type ModNodeInstance,
  type ModNodeState,
  type ModNodeType,
} from './mod_node_registry';
import { ModNodeViewWrapper } from './mod_node_view_wrapper';
import { Group } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import React from 'react';

export const ModGraphEditor = () => {
  const [nodes, handlers] = useListState<ModNodeInstance>([]);
  const onAddNode = (type: ModNodeType) => {
    const node: ModNodeInstance = {
      type,
      state: modNodeRegistry[type].stateSchema.parse({}),
    };
    handlers.append(node);
  };

  return (
    <Group>
      <Group gap={4}>
        {nodes.map((node, index) => {
          const spec = modNodeRegistry[node.type];

          const onStateChange = (newState: ModNodeState<typeof node.type>) => {
            handlers.setItem(index, { ...node, state: newState });
          };

          const onRemove = () => {
            handlers.remove(index);
          };

          const input = calcNodes(nodes, index - 1);

          // console.log('node', {
          //   index,
          //   type: node.type,
          //   state: node.state,
          //   input,
          // });

          const view = (
            <spec.View
              state={node.state}
              input={input}
              onStateChange={onStateChange}
            />
          );

          const showArrow = index < nodes.length - 1;
          const isLast = index === nodes.length - 1;

          return (
            <React.Fragment key={index}>
              <ModNodeViewWrapper
                view={view}
                title={spec.title}
                onRemove={isLast ? onRemove : undefined}
              />
              {showArrow && <icon.ArrowRight />}
            </React.Fragment>
          );
        })}
      </Group>
      <ModAddNodeMenu onSelect={onAddNode} nodes={nodes} />
    </Group>
  );
};
