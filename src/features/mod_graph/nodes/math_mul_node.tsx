import { icon } from '../../../ui/icon';
import { createModNode } from '../mod_node_spec';
import { NumberView } from '../views/number_view';
import z from 'zod';

export const mathMulNodeSpec = createModNode({
  type: 'math_mul' as const,
  title: 'Multiply',
  category: 'math',
  Icon: icon.X,
  stateSchema: z.object({
    value: z.number().default(1),
  }),
  pipe: {
    input: 'number',
    output: 'number',
    transform: ({ state, input }) => {
      return input * state.value;
    },
  },
  View: NumberView,
});
