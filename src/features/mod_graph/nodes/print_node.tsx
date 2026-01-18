import { icon } from '../../../ui/icon';
import { createModNode } from '../mod_node_spec';
import z from 'zod';

export const printNodeSpec = createModNode({
  type: 'print_node' as const,
  title: 'Print',
  category: 'output',
  Icon: icon.ReceiptText,
  stateSchema: z.object({}),
  pipe: {
    input: 'number',
    output: 'void',
    transform: () => {},
  },
  View: ({ input }) => {
    return input ?? 'n/a';
  },
});
