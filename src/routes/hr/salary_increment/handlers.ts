import type { AppRouteHandler } from '@/lib/types';

import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { employee, salary_increment, users } from '../schema';

const createdByUser = alias(users, 'createdByUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(salary_increment).values(value).returning({
    name: salary_increment.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(salary_increment)
    .set(updates)
    .where(eq(salary_increment.uuid, uuid))
    .returning({
      name: salary_increment.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(salary_increment)
    .where(eq(salary_increment.uuid, uuid))
    .returning({
      name: salary_increment.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.department.findMany();

  const salaryIncrementPromise = db
    .select({
      uuid: salary_increment.uuid,
      employee_uuid: salary_increment.employee_uuid,
      employee_name: users.name,
      amount: PG_DECIMAL_TO_FLOAT(salary_increment.amount),
      effective_date: salary_increment.effective_date,
      created_by: salary_increment.created_by,
      created_by_name: users.name,
      created_at: salary_increment.created_at,
      updated_at: salary_increment.updated_at,
      remarks: salary_increment.remarks,
    })
    .from(salary_increment)
    .leftJoin(employee, eq(salary_increment.employee_uuid, employee.uuid))
    .leftJoin(users, eq(employee.user_uuid, users.uuid))
    .leftJoin(
      createdByUser,
      eq(salary_increment.created_by, createdByUser.uuid),
    )
    .orderBy(desc(salary_increment.created_at));

  const data = await salaryIncrementPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const salaryIncrementPromise = db
    .select({
      uuid: salary_increment.uuid,
      employee_uuid: salary_increment.employee_uuid,
      employee_name: users.name,
      amount: PG_DECIMAL_TO_FLOAT(salary_increment.amount),
      effective_date: salary_increment.effective_date,
      created_by: salary_increment.created_by,
      created_by_name: createdByUser.name,
      created_at: salary_increment.created_at,
      updated_at: salary_increment.updated_at,
      remarks: salary_increment.remarks,
    })
    .from(salary_increment)
    .leftJoin(employee, eq(salary_increment.employee_uuid, employee.uuid))
    .leftJoin(users, eq(employee.user_uuid, users.uuid))
    .leftJoin(
      createdByUser,
      eq(salary_increment.created_by, createdByUser.uuid),
    )
    .where(eq(salary_increment.uuid, uuid));

  const [data] = await salaryIncrementPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
