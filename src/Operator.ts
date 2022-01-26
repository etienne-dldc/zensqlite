import { mapObject } from './Utils';

export type UnaryOperator = keyof typeof UnaryOperator;
export type UnaryOperatorRaw = typeof UnaryOperator[UnaryOperator];

export const UnaryOperator = {
  BitwiseNegation: '~',
  Plus: '+',
  Minus: '-',
} as const;

export type BinaryOperator = keyof typeof BinaryOperatorsInternal;
export type BinaryOperatorRaw = typeof BinaryOperatorsInternal[BinaryOperator][number];

const BinaryOperatorsInternal = {
  Concatenate: ['||'],
  Multiply: ['*'],
  Divide: ['/'],
  Modulo: ['%'],
  Add: ['+'],
  Subtract: ['-'],
  BitwiseAnd: ['&'],
  BitwiseOr: ['|'],
  BitwiseShiftLeft: ['<<'],
  BitwiseShiftRight: ['>>'],
  GreaterThan: ['>'],
  LowerThan: ['<'],
  GreaterOrEqualThan: ['>='],
  LowerOrEqualThan: ['<='],
  Equal: ['==', '='],
  Different: ['!=', '<>'],
} as const;

export const BinaryOperator: { [K in BinaryOperator]: typeof BinaryOperatorsInternal[K][0] } = mapObject(BinaryOperatorsInternal, (_key, [val]) => val);