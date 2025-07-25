import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { info } from '../schema';
//* crud
export const selectSchema = createSelectSchema(info);

export const insertSchema = createInsertSchema(
  info,
  {
    uuid: schema => schema.uuid.length(15),
    user_uuid: schema => schema.user_uuid.length(15).optional(),
    received_date: schema => schema.received_date.regex(dateTimePattern, {
      message: 'received_date must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    zone_uuid: schema => schema.zone_uuid.length(15).optional(),
    branch_uuid: schema => schema.branch_uuid.length(15).optional(),
    created_by: schema => schema.created_by.length(15),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    remarks: schema => schema.remarks.optional(),
  },
).required({
  uuid: true,
  created_by: true,
  created_at: true,
}).partial({
  user_uuid: true,
  zone_uuid: true,
  branch_uuid: true,
  received_date: true,
  is_product_received: true,
  location: true,
  submitted_by: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
}).extend({
  // Additional fields for user creation
  is_new_customer: z.string().transform(val => val === 'true').or(z.boolean()).optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  department_uuid: z.string().length(15).nullable().optional(),
  designation_uuid: z.string().length(15).nullable().optional(),
  business_type: z.string().optional(),
  where_they_find_us: z.string().optional(),
});

export const patchSchema = insertSchema.partial();
