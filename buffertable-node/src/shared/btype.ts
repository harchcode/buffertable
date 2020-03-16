import { BType } from './constants';

export type BValue = number | boolean | string;

export type BWriter = {
  [key in BType]: (
    buffer: Buffer | DataView,
    offset: number,
    value: BValue
  ) => void;
};

export type BReader = {
  [key in BType]: (buffer: Buffer | DataView, offset: number) => BValue;
};

export type BSize = {
  [key in BType]: number;
};
