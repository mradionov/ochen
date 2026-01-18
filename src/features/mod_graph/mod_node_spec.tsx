import type z from 'zod';

export type ModNodeCategory = 'input' | 'math' | 'output';

type ModPipeKind = 'number' | 'void';
type ModPipeKindMap = {
  number: number;
  void: void;
};
export type ModPipeType<K extends ModPipeKind> = ModPipeKindMap[K];

export const createModNode = <
  TType,
  TSchema,
  TInput extends ModPipeKind,
  TOutput extends ModPipeKind,
>(spec: {
  type: TType;
  title: string;
  category: ModNodeCategory;
  Icon: React.FC;
  stateSchema: TSchema;
  pipe: {
    input: TInput;
    output: TOutput;
    transform: (args: {
      state: z.infer<TSchema>;
      input: ModPipeType<TInput>;
    }) => ModPipeType<TOutput>;
  };
  View: React.FC<{
    state: z.infer<TSchema>;
    input: ModPipeType<TInput>;
    onStateChange: (state: z.infer<TSchema>) => void;
  }>;
}) => {
  return spec;
};
