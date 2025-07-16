import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { salary_entry } from '../schema';

//* crud
export const selectSchema = createSelectSchema(salary_entry);

export const insertSchema = createInsertSchema(
  salary_entry,
  {
    uuid: schema => schema.uuid.length(15),
    employee_uuid: schema => schema.employee_uuid.length(15),
    type: schema => schema.type,
    month: schema => schema.month,
    year: schema => schema.year,
    amount: schema => schema.amount,
    loan_amount: schema => schema.loan_amount,
    advance_amount: schema => schema.advance_amount,
    created_by: schema => schema.created_by.length(15),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  employee_uuid: true,
  month: true,
  year: true,
  amount: true,
  type: true,
  created_by: true,
  created_at: true,
}).partial({
  loan_amount: true,
  advance_amount: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
