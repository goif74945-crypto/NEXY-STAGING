import { NextResponse } from 'next/server';
import { z } from 'zod';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';

const REQUEST_ID = 'outputs_id_export_get';

const ParamsSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
  })
  .strict();

const ExportFormatSchema = z.enum(['json', 'markdown', 'pdf']);
const ExportStatusSchema = z.enum(['ready', 'blocked']);

const OutputExportDescriptorSchema = z
  .object({
    output_id: z.string().trim().min(1).max(256),
    format: ExportFormatSchema,
    content_hash: z.string().trim().min(1).max(256),
    export_status: ExportStatusSchema,
  })
  .strict();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = ParamsSchema.parse(await context.params);
    const descriptor = OutputExportDescriptorSchema.parse({
      output_id: params.id,
      format: 'json',
      content_hash: `content_hash:${params.id}`,
      export_status: 'ready',
    });

    return NextResponse.json(
      makeEnvelope({
        status: 'OK',
        requestId: REQUEST_ID,
        data: descriptor,
      }),
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const routeError = toRouteError(error);

    return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
      status: getHttpStatusFromRouteError(routeError),
    });
  }
}
