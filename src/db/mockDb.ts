import type { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.ts';

type AnyRow = Record<string, unknown>;

const DRIZZLE_NAME = Symbol.for('drizzle:Name');
const DRIZZLE_COLUMNS = Symbol.for('drizzle:Columns');

function getTableName(table: unknown): string {
  if (!table || typeof table !== 'object') return '';
  const syms = Object.getOwnPropertySymbols(table);
  for (const s of syms) {
    if (s.toString() === 'Symbol(drizzle:Name)' || s === DRIZZLE_NAME) {
      return String((table as Record<symbol, unknown>)[s]);
    }
  }
  return '';
}

function getColumnMap(table: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  if (!table || typeof table !== 'object') return map;
  const syms = Object.getOwnPropertySymbols(table);
  for (const s of syms) {
    if (s.toString() === 'Symbol(drizzle:Columns)' || s === DRIZZLE_COLUMNS) {
      const cols = (table as Record<symbol, Record<string, { name?: string }>>)[s];
      if (cols) {
        for (const [jsKey, col] of Object.entries(cols)) {
          if (col?.name) {
            map[col.name] = jsKey;
          }
        }
      }
    }
  }
  return map;
}

const tableColumnMaps = new Map<string, Record<string, string>>();
for (const value of Object.values(schema)) {
  const name = getTableName(value);
  if (name) {
    tableColumnMaps.set(name, getColumnMap(value));
  }
}

function isColumn(obj: unknown): obj is { name: string; table: unknown } {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      'name' in obj &&
      'table' in obj &&
      typeof (obj as { name: unknown }).name === 'string'
  );
}

function unwrapParam(val: unknown): unknown {
  if (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) {
    const constructorName = (val as { constructor?: { name?: string } }).constructor?.name;
    if (constructorName === 'Param') {
      return (val as { value: unknown }).value;
    }
  }
  return val;
}

function getRowValue(
  rowByTable: Record<string, AnyRow | null>,
  col: { name: string; table: unknown }
): unknown {
  const tName = getTableName(col.table);
  const row = rowByTable[tName];
  if (!row) return undefined;
  const colMap = tableColumnMaps.get(tName) || {};
  const jsKey = colMap[col.name] || col.name;
  return row[jsKey];
}

function evalCondition(
  cond: unknown,
  rowByTable: Record<string, AnyRow | null>
): boolean {
  if (!cond || typeof cond !== 'object') return true;
  const chunks = (cond as { queryChunks?: unknown[] }).queryChunks;
  if (!Array.isArray(chunks)) return true;

  // Handle `and(...)` or parenthesized SQL: ['(', SQL, ')'] or [SQL, ' and ', SQL, ...]
  if (
    chunks.length === 3 &&
    Array.isArray((chunks[0] as { value?: unknown })?.value) &&
    (chunks[0] as { value: string[] }).value[0] === '('
  ) {
    return evalCondition(chunks[1], rowByTable);
  }

  // Check if chunks contain nested SQL joined by ' and '
  const hasAnd = chunks.some(
    (c) =>
      Array.isArray((c as { value?: unknown })?.value) &&
      (c as { value: string[] }).value.some((v) => v.toLowerCase().includes(' and '))
  );
  if (hasAnd) {
    return chunks
      .filter((c) => Boolean((c as { queryChunks?: unknown[] })?.queryChunks))
      .every((c) => evalCondition(c, rowByTable));
  }

  // Binary comparison: [StringChunk(''), Col, StringChunk(' = ' | ' not in '), Val, StringChunk('')]
  if (chunks.length >= 4 && isColumn(chunks[1])) {
    const col = chunks[1];
    const opChunk = (chunks[2] as { value?: string[] })?.value?.[0] || '';
    const leftVal = getRowValue(rowByTable, col);

    if (opChunk.includes('not in')) {
      const arr = Array.isArray(chunks[3]) ? chunks[3].map(unwrapParam) : [];
      return !arr.includes(leftVal);
    }

    if (opChunk.includes('=')) {
      if (isColumn(chunks[3])) {
        const rightVal = getRowValue(rowByTable, chunks[3]);
        return leftVal !== undefined && leftVal === rightVal;
      }
      const targetVal = unwrapParam(chunks[3]);
      return leftVal === targetVal;
    }
  }

  return true;
}

function isCountProjection(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  const chunks = (val as { queryChunks?: unknown[] }).queryChunks;
  if (!Array.isArray(chunks)) return false;
  return chunks.some((c) => {
    const v = (c as { value?: string[] })?.value;
    if (Array.isArray(v) && v.some((s) => s.toLowerCase().includes('count('))) return true;
    return isCountProjection(c);
  });
}

function applyDefaults(tableName: string, row: AnyRow): AnyRow {
  const now = new Date();
  const base: AnyRow = { ...row };
  if (base.createdAt === undefined && tableName !== 'farmer_profiles' && tableName !== 'recently_viewed_schemes') {
    base.createdAt = now;
  }
  if (tableName === 'users' && base.role === undefined) {
    base.role = 'farmer';
  }
  if (tableName === 'farmer_profiles' && base.updatedAt === undefined) {
    base.updatedAt = now;
  }
  if (tableName === 'schemes') {
    if (base.stateName === undefined) base.stateName = 'All India';
    if (base.isPopular === undefined) base.isPopular = false;
  }
  if (tableName === 'chat_conversations' && base.title === undefined) {
    base.title = 'Farmer Assistant Chat';
  }
  if (tableName === 'recently_viewed_schemes' && base.viewedAt === undefined) {
    base.viewedAt = now;
  }
  return base;
}

export function createMockDb(): ReturnType<typeof drizzle<typeof schema>> {
  const tables: Record<string, AnyRow[]> = {
    users: [],
    farmer_profiles: [],
    schemes: [],
    agriculture_items: [],
    chat_conversations: [],
    chat_messages: [],
    contact_messages: [],
    recently_viewed_schemes: [],
  };

  const seqs: Record<string, number> = {
    users: 1,
    farmer_profiles: 1,
    schemes: 1,
    agriculture_items: 1,
    chat_conversations: 1,
    chat_messages: 1,
    contact_messages: 1,
    recently_viewed_schemes: 1,
  };

  const mock = {
    select(projection?: Record<string, unknown>) {
      let baseTableName = '';
      const joins: Array<{
        type: 'inner' | 'left';
        tableName: string;
        on: unknown;
      }> = [];
      let whereCond: unknown = null;
      let orderSpecs: unknown[] = [];
      let limitVal: number | null = null;

      const execute = async (): Promise<unknown[]> => {
        const baseRows = tables[baseTableName] || [];
        let combined: Array<Record<string, AnyRow | null>> = baseRows.map((r) => ({
          [baseTableName]: r,
        }));

        for (const join of joins) {
          const rightRows = tables[join.tableName] || [];
          const next: Array<Record<string, AnyRow | null>> = [];
          for (const ctx of combined) {
            let matchedAny = false;
            for (const rr of rightRows) {
              const candidate = { ...ctx, [join.tableName]: rr };
              if (evalCondition(join.on, candidate)) {
                matchedAny = true;
                next.push(candidate);
              }
            }
            if (!matchedAny && join.type === 'left') {
              next.push({ ...ctx, [join.tableName]: null });
            }
          }
          combined = next;
        }

        if (whereCond) {
          combined = combined.filter((ctx) => evalCondition(whereCond, ctx));
        }

        if (orderSpecs.length > 0) {
          combined.sort((a, b) => {
            for (const spec of orderSpecs) {
              let col: { name: string; table: unknown } | null = null;
              let direction: 'asc' | 'desc' = 'asc';

              if (isColumn(spec)) {
                col = spec;
              } else if (spec && typeof spec === 'object' && 'queryChunks' in spec) {
                const chunks = (spec as { queryChunks?: unknown[] }).queryChunks || [];
                for (const c of chunks) {
                  if (isColumn(c)) col = c;
                  const txt = (c as { value?: string[] })?.value?.[0] || '';
                  if (txt.toLowerCase().includes('desc')) direction = 'desc';
                }
              }

              if (!col) continue;
              const av = getRowValue(a, col);
              const bv = getRowValue(b, col);
              if (av === bv) continue;
              if (av === undefined || av === null) return direction === 'asc' ? -1 : 1;
              if (bv === undefined || bv === null) return direction === 'asc' ? 1 : -1;

              const cmp =
                av instanceof Date && bv instanceof Date
                  ? av.getTime() - bv.getTime()
                  : typeof av === 'number' && typeof bv === 'number'
                  ? av - bv
                  : String(av).localeCompare(String(bv));
              if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
            }
            return 0;
          });
        }

        if (limitVal !== null) {
          combined = combined.slice(0, limitVal);
        }

        if (!projection) {
          return combined.map((ctx) => ({ ...(ctx[baseTableName] || {}) }));
        }

        // Check for count() aggregation
        const projEntries = Object.entries(projection);
        if (projEntries.length === 1 && isCountProjection(projEntries[0][1])) {
          return [{ [projEntries[0][0]]: combined.length }];
        }

        return combined.map((ctx) => {
          const out: AnyRow = {};
          for (const [key, expr] of projEntries) {
            if (isColumn(expr)) {
              const val = getRowValue(ctx, expr);
              out[key] = val === undefined ? null : val;
            } else if (getTableName(expr)) {
              const tName = getTableName(expr);
              out[key] = ctx[tName] ? { ...ctx[tName] } : null;
            } else {
              out[key] = null;
            }
          }
          return out;
        });
      };

      const builder = {
        from(table: unknown) {
          baseTableName = getTableName(table);
          return builder;
        },
        innerJoin(table: unknown, on: unknown) {
          joins.push({ type: 'inner', tableName: getTableName(table), on });
          return builder;
        },
        leftJoin(table: unknown, on: unknown) {
          joins.push({ type: 'left', tableName: getTableName(table), on });
          return builder;
        },
        where(cond: unknown) {
          whereCond = cond;
          return builder;
        },
        orderBy(...specs: unknown[]) {
          orderSpecs = specs;
          return builder;
        },
        limit(n: number) {
          limitVal = n;
          return builder;
        },
        then<TResult1 = unknown[], TResult2 = never>(
          onfulfilled?: ((value: unknown[]) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
        ) {
          return execute().then(onfulfilled, onrejected);
        },
      };

      return builder;
    },

    insert(table: unknown) {
      const tableName = getTableName(table);
      let rowsToInsert: AnyRow[] = [];
      let conflictMode: 'none' | 'nothing' | 'update' = 'none';
      let conflictTargetCol: { name: string; table: unknown } | null = null;
      let conflictSet: AnyRow | null = null;

      const execute = async (): Promise<AnyRow[]> => {
        const store = tables[tableName] || (tables[tableName] = []);
        const colMap = tableColumnMaps.get(tableName) || {};
        const affected: AnyRow[] = [];

        for (const rawRow of rowsToInsert) {
          if (conflictTargetCol) {
            const targetKey = colMap[conflictTargetCol.name] || conflictTargetCol.name;
            const existingIdx = store.findIndex((r) => r[targetKey] === rawRow[targetKey]);
            if (existingIdx !== -1) {
              if (conflictMode === 'nothing') {
                continue;
              }
              if (conflictMode === 'update' && conflictSet) {
                store[existingIdx] = { ...store[existingIdx], ...conflictSet };
                affected.push({ ...store[existingIdx] });
                continue;
              }
            }
          }

          const id = seqs[tableName]++;
          const inserted = applyDefaults(tableName, { id, ...rawRow });
          store.push(inserted);
          affected.push({ ...inserted });
        }

        return affected;
      };

      const builder = {
        values(vals: AnyRow | AnyRow[]) {
          rowsToInsert = Array.isArray(vals) ? vals : [vals];
          return builder;
        },
        onConflictDoNothing(opts?: { target?: unknown }) {
          conflictMode = 'nothing';
          if (opts?.target && isColumn(opts.target)) {
            conflictTargetCol = opts.target;
          }
          return builder;
        },
        onConflictDoUpdate(opts: { target: unknown; set: AnyRow }) {
          conflictMode = 'update';
          if (isColumn(opts.target)) {
            conflictTargetCol = opts.target;
          }
          conflictSet = opts.set;
          return builder;
        },
        returning() {
          return builder;
        },
        then<TResult1 = AnyRow[], TResult2 = never>(
          onfulfilled?: ((value: AnyRow[]) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
        ) {
          return execute().then(onfulfilled, onrejected);
        },
      };

      return builder;
    },

    update(table: unknown) {
      const tableName = getTableName(table);
      let patch: AnyRow = {};
      let whereCond: unknown = null;

      const execute = async (): Promise<AnyRow[]> => {
        const store = tables[tableName] || [];
        const updated: AnyRow[] = [];
        for (let i = 0; i < store.length; i++) {
          if (!whereCond || evalCondition(whereCond, { [tableName]: store[i] })) {
            store[i] = { ...store[i], ...patch };
            updated.push({ ...store[i] });
          }
        }
        return updated;
      };

      const builder = {
        set(vals: AnyRow) {
          patch = vals;
          return builder;
        },
        where(cond: unknown) {
          whereCond = cond;
          return builder;
        },
        returning() {
          return builder;
        },
        then<TResult1 = AnyRow[], TResult2 = never>(
          onfulfilled?: ((value: AnyRow[]) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
        ) {
          return execute().then(onfulfilled, onrejected);
        },
      };

      return builder;
    },

    delete(table: unknown) {
      const tableName = getTableName(table);
      let whereCond: unknown = null;

      const execute = async (): Promise<AnyRow[]> => {
        const store = tables[tableName] || [];
        const kept: AnyRow[] = [];
        const removed: AnyRow[] = [];
        for (const row of store) {
          if (!whereCond || evalCondition(whereCond, { [tableName]: row })) {
            removed.push(row);
          } else {
            kept.push(row);
          }
        }
        tables[tableName] = kept;
        return removed;
      };

      const builder = {
        where(cond: unknown) {
          whereCond = cond;
          return builder;
        },
        returning() {
          return builder;
        },
        then<TResult1 = AnyRow[], TResult2 = never>(
          onfulfilled?: ((value: AnyRow[]) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
        ) {
          return execute().then(onfulfilled, onrejected);
        },
      };

      return builder;
    },
  };

  return mock as unknown as ReturnType<typeof drizzle<typeof schema>>;
}
