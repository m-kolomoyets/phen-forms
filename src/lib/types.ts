export type ObjKeys<TObj> = keyof TObj;

export type ObjValues<TObj> = TObj[ObjKeys<TObj>];

export type ObjectDotNotation<T extends Record<string, unknown>> =
    T extends Record<string, unknown>
        ? {
              [K in keyof T]: T[K] extends Record<string, unknown>
                  ? `${string & K}.${ObjectDotNotation<T[K]>}`
                  : `${string & K}`;
          }[keyof T]
        : never;

export type Filters = Record<string, string | number | boolean>;
