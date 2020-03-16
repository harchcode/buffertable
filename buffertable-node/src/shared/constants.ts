export enum BType {
  U8 = 0,
  U16,
  U32,
  I8,
  I16,
  I32,
  F32,
  F64,
  BOOL,
  STR,
  TABLE
}

export const BSIZE = [1, 2, 4, 1, 2, 4, 4, 8, 1, 1, 1];

export const SCHEMA_SIZE_TYPE = BType.U8;
export const SCHEMA_TYPE = BType.U8;
export const OFFSET_TYPE = BType.U8;
export const VT_BUFFER_SIZE_TYPE = BType.U32;
export const STR_SIZE_TYPE = BType.U16;
export const DATA_SIZE_TYPE = BType.U32;
export const TABLE_SIZE_TYPE = BType.U32;
