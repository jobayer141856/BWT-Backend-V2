import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['store.review'];

export const list = createRoute({
  path: '/store/review',
  method: 'get',
  tags,
  request: {
    query: z.object({
      product_uuid: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of review',
    ),
  },
});

export const create = createRoute({
  path: '/store/review',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The review to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created review',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/store/review/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested review',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'review not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/store/review/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The review updates',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated review',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'review not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/store/review/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'review deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'review not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

// export const getReviewEntryDetailsByReviewUuid = createRoute({
//   path: '/store/review/review-entry-details/by/{review_uuid}',
//   method: 'get',
//   request: {
//     params: z.object({
//       review_uuid: z.string(),
//     }),
//   },
//   tags,
//   responses: {
//     [HSCode.OK]: jsonContent(
//       z.array(selectSchema),
//       'The review entry details',
//     ),
//     [HSCode.NOT_FOUND]: jsonContent(
//       notFoundSchema,
//       'review entry details not found',
//     ),
//     [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(param.uuid),
//       'Invalid id error',
//     ),
//   },
// });

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
// export type GetReviewEntryDetailsByReviewUuidRoute = typeof getReviewEntryDetailsByReviewUuid;
