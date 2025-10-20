import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { ledger } from '../schema';

//* crud
export const selectSchema = createSelectSchema(ledger);

export const insertSchema = createInsertSchema(
  ledger,
  {
    uuid: schema => schema.uuid.length(15),
    name: schema => schema.name.min(1),
    group_uuid: schema => schema.group_uuid.length(15),
    table_name: schema => schema.table_name.optional(),
    table_uuid: schema => schema.table_uuid.optional(),
    account_no: schema => schema.account_no.optional(),
    group_number: schema => schema.group_number.optional(),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  name: true,
  group_uuid: true,
  created_by: true,
  created_at: true,
}).partial({
  group_number: true,
  updated_by: true,
  updated_at: true,
  remarks: true,
  index: true,
});

export const patchSchema = insertSchema.partial();
