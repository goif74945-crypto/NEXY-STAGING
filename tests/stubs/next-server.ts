export type JsonResponseInit = {
  status?: number;
  headers?: Record<string, string>;
};

export type JsonResponseShape<TData> = {
  body: TData;
  status: number;
  headers: Record<string, string>;
};

export function createJsonResponse<TData>(
  body: TData,
  init: JsonResponseInit = {},
): JsonResponseShape<TData> {
  return {
    body,
    status: init.status ?? 200,
    headers: init.headers ?? {},
  };
}

export const NextResponse = {
  json<TData>(
    body: TData,
    init: JsonResponseInit = {},
  ): JsonResponseShape<TData> {
    return createJsonResponse(body, init);
  },

  next(): JsonResponseShape<null> {
    return createJsonResponse(null, {
      status: 200,
    });
  },
} as const;
