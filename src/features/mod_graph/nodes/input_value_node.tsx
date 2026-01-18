import { icon } from '../../../ui/icon';
import { createModNode } from '../mod_node_spec';
import { NumberView } from '../views/number_view';
import z from 'zod';

export const inputValueNodeSpec = createModNode({
  type: 'input_value' as const,
  title: 'Value',
  category: 'input',
  Icon: icon.Binary,
  stateSchema: z.object({
    value: z.number().default(0),
  }),
  pipe: {
    input: 'void',
    output: 'number',
    transform: ({ state }) => {
      return state.value;
    },
  },
  View: NumberView,
});
