import { inputValueNodeSpec } from './nodes/input_value_node';
import { mathAddNodeSpec } from './nodes/math_add_node';
import { mathMulNodeSpec } from './nodes/math_mul_node';
import { printNodeSpec } from './nodes/print_node';
import type z from 'zod';

export const modNodeRegistry = {
  // input

  [inputValueNodeSpec.type]: inputValueNodeSpec,

  // math

  [mathAddNodeSpec.type]: mathAddNodeSpec,
  [mathMulNodeSpec.type]: mathMulNodeSpec,

  // output
  [printNodeSpec.type]: printNodeSpec,
} as const;

export type ModNodeType = keyof typeof modNodeRegistry;

export type ModNodeState<T extends ModNodeType = ModNodeType> = z.infer<
  (typeof modNodeRegistry)[T]['stateSchema']
>;

export type ModNodeSpec<T extends ModNodeType = ModNodeType> =
  (typeof modNodeRegistry)[T];

export type ModNodeInstance<T extends ModNodeType = ModNodeType> = {
  type: T;
  state: ModNodeState<T>;
};
