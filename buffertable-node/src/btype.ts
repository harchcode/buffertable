export type BValue = number | boolean | string;

export type BType = {
  write: (buffer: Buffer, offset: number, value?: BValue) => void;
  read: (buffer: Buffer, offset: number) => BValue;
  size: number;
  create?: (value: BValue) => Buffer;
};
