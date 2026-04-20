export type D1QueryResult<T = unknown> = {
  success: boolean;
  results?: T[];
  meta: Record<string, unknown>;
};

export type D1ExecResult = {
  count: number;
  duration: number;
};

export type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = Record<string, unknown>>(columnName?: string) => Promise<T | null>;
  run: <T = Record<string, unknown>>() => Promise<D1QueryResult<T>>;
  all: <T = Record<string, unknown>>() => Promise<D1QueryResult<T>>;
};

export type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
  exec: (query: string) => Promise<D1ExecResult>;
};
