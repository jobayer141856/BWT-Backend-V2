import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { currency, voucher } from '../schema';

const createdByUser = alias(users, 'createdByUser');
const updatedByUser = alias(users, 'updatedByUser');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(voucher).values(value).returning({
    name: sql`CONCAT('VO', TO_CHAR(${voucher.created_at}::timestamp, 'YY'), '-', ${voucher.id})`,
  });

  const name = String((data as any)?.name ?? '');
  return c.json(createToast('create', name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);
  const [data] = await db.update(voucher)
    .set(updates)
    .where(eq(voucher.uuid, uuid))
    .returning({
      name: sql`CONCAT('VO', TO_CHAR(${voucher.created_at}::timestamp, 'YY'), '-', ${voucher.id})`,
    });

  if (!data)
    return DataNotFound(c);

  const name = String((data as any).name ?? '');
  return c.json(createToast('update', name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(voucher)
    .where(eq(voucher.uuid, uuid))
    .returning({
      name: sql`CONCAT('VO', TO_CHAR(${voucher.created_at}::timestamp, 'YY'), '-', ${voucher.id})`,
    });

  if (!data)
    return DataNotFound(c);

  const name = String((data as any).name ?? '');
  return c.json(createToast('delete', name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const voucherPromise = db
    .select({
      uuid: voucher.uuid,
      id: voucher.id,
      voucher_id: sql`CONCAT('VO', TO_CHAR(${voucher.created_at}::timestamp, 'YY'), '-', ${voucher.id})`,
      date: voucher.date,
      conversion_rate: voucher.conversion_rate,
      vat_deduction: voucher.vat_deduction,
      tax_deduction: voucher.tax_deduction,
      category: voucher.category,
      narration: voucher.narration,
      currency_uuid: voucher.currency_uuid,
      currency_name: currency.currency_name,
      currency_symbol: currency.symbol,
      created_by: voucher.created_by,
      created_by_name: createdByUser.name,
      created_at: voucher.created_at,
      updated_by: voucher.updated_by,
      updated_by_name: updatedByUser.name,
      updated_at: voucher.updated_at,
      remarks: voucher.remarks,
    })
    .from(voucher)
    .leftJoin(currency, eq(currency.uuid, voucher.currency_uuid))
    .leftJoin(createdByUser, eq(createdByUser.uuid, voucher.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, voucher.updated_by))
    .orderBy(desc(voucher.created_at));

  const data = await voucherPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const voucherPromise = db
    .select({
      uuid: voucher.uuid,
      id: voucher.id,
      voucher_id: sql`CONCAT('VO', TO_CHAR(${voucher.created_at}::timestamp, 'YY'), '-', ${voucher.id})`,
      date: voucher.date,
      conversion_rate: voucher.conversion_rate,
      vat_deduction: voucher.vat_deduction,
      tax_deduction: voucher.tax_deduction,
      category: voucher.category,
      narration: voucher.narration,
      currency_uuid: voucher.currency_uuid,
      currency_name: currency.currency_name,
      currency_symbol: currency.symbol,
      created_by: voucher.created_by,
      created_by_name: createdByUser.name,
      created_at: voucher.created_at,
      updated_by: voucher.updated_by,
      updated_by_name: updatedByUser.name,
      updated_at: voucher.updated_at,
      remarks: voucher.remarks,
    })
    .from(voucher)
    .leftJoin(currency, eq(currency.uuid, voucher.currency_uuid))
    .leftJoin(createdByUser, eq(createdByUser.uuid, voucher.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, voucher.updated_by))
    .where(eq(voucher.uuid, uuid));

  const [data] = await voucherPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
