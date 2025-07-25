import type { AppRouteHandler } from '@/lib/types';

import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { category, model, product, size, warehouse } from '../schema';

const warehouse1 = alias(warehouse, 'warehouse_1');
const warehouse2 = alias(warehouse, 'warehouse_2');
const warehouse3 = alias(warehouse, 'warehouse_3');
const warehouse4 = alias(warehouse, 'warehouse_4');
const warehouse5 = alias(warehouse, 'warehouse_5');
const warehouse6 = alias(warehouse, 'warehouse_6');
const warehouse7 = alias(warehouse, 'warehouse_7');
const warehouse8 = alias(warehouse, 'warehouse_8');
const warehouse9 = alias(warehouse, 'warehouse_9');
const warehouse10 = alias(warehouse, 'warehouse_10');
const warehouse11 = alias(warehouse, 'warehouse_11');
const warehouse12 = alias(warehouse, 'warehouse_12');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(product).values(value).returning({
    name: product.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(product)
    .set(updates)
    .where(eq(product.uuid, uuid))
    .returning({
      name: product.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(product)
    .where(eq(product.uuid, uuid))
    .returning({
      name: product.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const productPromise = db
    .select({
      uuid: product.uuid,
      name: product.name,
      category_uuid: product.category_uuid,
      category_name: category.name,
      model_uuid: product.model_uuid,
      model_name: model.name,
      size_uuid: product.size_uuid,
      size_name: size.name,
      warranty_days: product.warranty_days,
      service_warranty_days: product.service_warranty_days,
      type: product.type,
      is_maintaining_stock: product.is_maintaining_stock,
      created_by: product.created_by,
      created_by_name: users.name,
      created_at: product.created_at,
      updated_at: product.updated_at,
      remarks: product.remarks,
      warehouse_1: PG_DECIMAL_TO_FLOAT(product.warehouse_1),
      warehouse_2: PG_DECIMAL_TO_FLOAT(product.warehouse_2),
      warehouse_3: PG_DECIMAL_TO_FLOAT(product.warehouse_3),
      warehouse_4: PG_DECIMAL_TO_FLOAT(product.warehouse_4),
      warehouse_5: PG_DECIMAL_TO_FLOAT(product.warehouse_5),
      warehouse_6: PG_DECIMAL_TO_FLOAT(product.warehouse_6),
      warehouse_7: PG_DECIMAL_TO_FLOAT(product.warehouse_7),
      warehouse_8: PG_DECIMAL_TO_FLOAT(product.warehouse_8),
      warehouse_9: PG_DECIMAL_TO_FLOAT(product.warehouse_9),
      warehouse_10: PG_DECIMAL_TO_FLOAT(product.warehouse_10),
      warehouse_11: PG_DECIMAL_TO_FLOAT(product.warehouse_11),
      warehouse_12: PG_DECIMAL_TO_FLOAT(product.warehouse_12),
      warehouse_1_uuid: warehouse1.uuid,
      warehouse_1_name: warehouse1.name,
      warehouse_2_uuid: warehouse2.uuid,
      warehouse_2_name: warehouse2.name,
      warehouse_3_uuid: warehouse3.uuid,
      warehouse_3_name: warehouse3.name,
      warehouse_4_uuid: warehouse4.uuid,
      warehouse_4_name: warehouse4.name,
      warehouse_5_uuid: warehouse5.uuid,
      warehouse_5_name: warehouse5.name,
      warehouse_6_uuid: warehouse6.uuid,
      warehouse_6_name: warehouse6.name,
      warehouse_7_uuid: warehouse7.uuid,
      warehouse_7_name: warehouse7.name,
      warehouse_8_uuid: warehouse8.uuid,
      warehouse_8_name: warehouse8.name,
      warehouse_9_uuid: warehouse9.uuid,
      warehouse_9_name: warehouse9.name,
      warehouse_10_uuid: warehouse10.uuid,
      warehouse_10_name: warehouse10.name,
      warehouse_11_uuid: warehouse11.uuid,
      warehouse_11_name: warehouse11.name,
      warehouse_12_uuid: warehouse12.uuid,
      warehouse_12_name: warehouse12.name,
    })
    .from(product)
    .leftJoin(category, eq(product.category_uuid, category.uuid))
    .leftJoin(model, eq(product.model_uuid, model.uuid))
    .leftJoin(size, eq(product.size_uuid, size.uuid))
    .leftJoin(users, eq(product.created_by, users.uuid))
    .leftJoin(warehouse1, eq(warehouse1.assigned, 'warehouse_1'))
    .leftJoin(warehouse2, eq(warehouse2.assigned, 'warehouse_2'))
    .leftJoin(warehouse3, eq(warehouse3.assigned, 'warehouse_3'))
    .leftJoin(warehouse4, eq(warehouse4.assigned, 'warehouse_4'))
    .leftJoin(warehouse5, eq(warehouse5.assigned, 'warehouse_5'))
    .leftJoin(warehouse6, eq(warehouse6.assigned, 'warehouse_6'))
    .leftJoin(warehouse7, eq(warehouse7.assigned, 'warehouse_7'))
    .leftJoin(warehouse8, eq(warehouse8.assigned, 'warehouse_8'))
    .leftJoin(warehouse9, eq(warehouse9.assigned, 'warehouse_9'))
    .leftJoin(warehouse10, eq(warehouse10.assigned, 'warehouse_10'))
    .leftJoin(warehouse11, eq(warehouse11.assigned, 'warehouse_11'))
    .leftJoin(warehouse12, eq(warehouse12.assigned, 'warehouse_12'))
    .orderBy(desc(product.created_at));

  const data = await productPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: product.uuid,
    name: product.name,
    category_uuid: product.category_uuid,
    category_name: category.name,
    model_uuid: product.model_uuid,
    model_name: model.name,
    size_uuid: product.size_uuid,
    size_name: size.name,
    warranty_days: product.warranty_days,
    service_warranty_days: product.service_warranty_days,
    type: product.type,
    is_maintaining_stock: product.is_maintaining_stock,
    created_by: product.created_by,
    created_by_name: users.name,
    created_at: product.created_at,
    updated_at: product.updated_at,
    remarks: product.remarks,
    warehouse_1: PG_DECIMAL_TO_FLOAT(product.warehouse_1),
    warehouse_2: PG_DECIMAL_TO_FLOAT(product.warehouse_2),
    warehouse_3: PG_DECIMAL_TO_FLOAT(product.warehouse_3),
    warehouse_4: PG_DECIMAL_TO_FLOAT(product.warehouse_4),
    warehouse_5: PG_DECIMAL_TO_FLOAT(product.warehouse_5),
    warehouse_6: PG_DECIMAL_TO_FLOAT(product.warehouse_6),
    warehouse_7: PG_DECIMAL_TO_FLOAT(product.warehouse_7),
    warehouse_8: PG_DECIMAL_TO_FLOAT(product.warehouse_8),
    warehouse_9: PG_DECIMAL_TO_FLOAT(product.warehouse_9),
    warehouse_10: PG_DECIMAL_TO_FLOAT(product.warehouse_10),
    warehouse_11: PG_DECIMAL_TO_FLOAT(product.warehouse_11),
    warehouse_12: PG_DECIMAL_TO_FLOAT(product.warehouse_12),
  })
    .from(product)
    .leftJoin(category, eq(product.category_uuid, category.uuid))
    .leftJoin(model, eq(product.model_uuid, model.uuid))
    .leftJoin(size, eq(product.size_uuid, size.uuid))
    .leftJoin(users, eq(product.created_by, users.uuid))
    .leftJoin(warehouse1, eq(warehouse1.assigned, 'warehouse_1'))
    .leftJoin(warehouse2, eq(warehouse2.assigned, 'warehouse_2'))
    .leftJoin(warehouse3, eq(warehouse3.assigned, 'warehouse_3'))
    .leftJoin(warehouse4, eq(warehouse4.assigned, 'warehouse_4'))
    .leftJoin(warehouse5, eq(warehouse5.assigned, 'warehouse_5'))
    .leftJoin(warehouse6, eq(warehouse6.assigned, 'warehouse_6'))
    .leftJoin(warehouse7, eq(warehouse7.assigned, 'warehouse_7'))
    .leftJoin(warehouse8, eq(warehouse8.assigned, 'warehouse_8'))
    .leftJoin(warehouse9, eq(warehouse9.assigned, 'warehouse_9'))
    .leftJoin(warehouse10, eq(warehouse10.assigned, 'warehouse_10'))
    .leftJoin(warehouse11, eq(warehouse11.assigned, 'warehouse_11'))
    .leftJoin(warehouse12, eq(warehouse12.assigned, 'warehouse_12'))
    .where(eq(product.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
