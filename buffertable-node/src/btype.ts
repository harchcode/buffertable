import { BType } from './constants';

export type BValue = number | boolean | string;
export type BTValue = BValue | BufferTableInterface;

export interface BBufferStaticInterface {
  fromStr: (value: string) => BBufferInterface;
  create: (size: number) => void;
  from: (buffer: Uint8Array) => BBufferInterface;
  concat: (buffers: Uint8Array[]) => Uint8Array;
}

export interface BBufferInterface {
  write: (type: BType, offset: number, value: BValue) => void;
  read: (type: BType, offset: number) => BValue;
  toUint8Array: () => Uint8Array;
  slice: (start?: number, end?: number) => BBufferInterface;
  set: (bBuffer: BBufferInterface, offset?: number) => void;
  fill: (buffer: Uint8Array, offset?: number) => void;
}

export interface BufferTableStaticInterface {
  create: (types: BType[]) => BufferTableInterface;
  from: (buffer: Uint8Array) => BufferTableInterface;
}

export interface BufferTableInterface {
  addRow: (rowData: BTValue[]) => BufferTableInterface;
  addRows: (rowsData: BTValue[][]) => BufferTableInterface;
  getRow: (row: number) => BTValue[];
  getData: (row: number, col: number) => BTValue;
  setData: (row: number, col: number, value: BTValue) => BufferTableInterface;
  setRow: (row: number, values: BTValue[]) => BufferTableInterface;
  deleteRow: (row: number) => BufferTableInterface;
  getRowCount: () => number;
  unpack: () => BTValue[][];
  forEach: (fn: (row?: BTValue[], index?: number) => void) => void;
  toUint8Array: () => Uint8Array;
}
