import { icon } from '../../../ui/icon';
import { createModNode } from '../mod_node_spec';
import { NumberView } from '../views/number_view';
import z from 'zod';

export const mathAddNodeSpec = createModNode({
  type: 'math_add' as const,
  title: 'Add',
  category: 'math',
  Icon: icon.Plus,
  stateSchema: z.object({
    value: z.number().default(0),
  }),
  pipe: {
    input: 'number',
    output: 'number',
    transform: ({ state, input }) => {
      return input + state.value;
    },
  },
  View: NumberView,
});
