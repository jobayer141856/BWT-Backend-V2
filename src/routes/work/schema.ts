import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgSchema,
  serial,
  text,
} from 'drizzle-orm/pg-core';

import {
  DateTime,
  defaultUUID,
  PG_DECIMAL,
  uuid_primary,
} from '@/lib/variables';

import * as hrSchema from '../hr/schema';
import * as storeSchema from '../store/schema';

const work = pgSchema('work');

export const categoryEnum = pgEnum('category', ['customer', 'employee']);

export const problem = work.table('problem', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  category: categoryEnum('category').default('customer'),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const zone = work.table('zone', {
  id: serial('id').notNull().unique(),
  uuid: uuid_primary,
  name: text('name').notNull(),
  division: text('division').notNull(),
  latitude: text('latitude').default(sql`null`),
  longitude: text('longitude').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const submittedByEnum = pgEnum('submitted_by', ['customer', 'employee']);

export const info = work.table('info', {
  id: serial('id').notNull().unique(),
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid').references(() => hrSchema.users.uuid),
  received_date: DateTime('received_date').default(sql`null`),
  is_product_received: boolean('is_product_received').default(false),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
  zone_uuid: defaultUUID('zone_uuid').references(() => zone.uuid),
  location: text('location').default(sql`null`),
  submitted_by: submittedByEnum('submitted_by').default('employee'),
  branch_uuid: defaultUUID('branch_uuid').references(
    () => storeSchema.branch.uuid,
  ).default(sql`'wW4ofP5YSFmlLAH'`),
});

export const order = work.table('order', {
  id: serial('id').notNull().unique(),
  uuid: uuid_primary,
  info_uuid: defaultUUID('info_uuid').references(() => info.uuid),
  model_uuid: defaultUUID('model_uuid').references(
    () => storeSchema.model.uuid,
  ),
  serial_no: text('serial_no'),
  quantity: integer('quantity').default(0),
  problems_uuid: text('problems_uuid').array(),
  problem_statement: text('problem_statement').notNull(),
  accessories: text('accessories').array().default(sql`null`),
  is_diagnosis_need: boolean('is_diagnosis_need').default(false),
  warehouse_uuid: defaultUUID('warehouse_uuid').references(
    () => storeSchema.warehouse.uuid,
  ),
  rack_uuid: defaultUUID('rack_uuid').references(() => storeSchema.rack.uuid),
  floor_uuid: defaultUUID('floor_uuid').references(
    () => storeSchema.floor.uuid,
  ),
  box_uuid: defaultUUID('box_uuid').references(() => storeSchema.box.uuid),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
  is_transferred_for_qc: boolean('is_transferred_for_qc').default(false),
  is_ready_for_delivery: boolean('is_ready_for_delivery').default(false),
  brand_uuid: defaultUUID('brand_uuid').references(
    () => storeSchema.brand.uuid,
  ),
  is_proceed_to_repair: boolean('is_proceed_to_repair').default(false),
  repairing_problems_uuid: text('repairing_problems_uuid')
    .array()
    .default([]),
  qc_problems_uuid: text('qc_problems_uuid').array().default([]),
  delivery_problems_uuid: text('delivery_problems_uuid').array().default([]),
  repairing_problem_statement: text('repairing_problem_statement').default(
    sql`null`,
  ),
  qc_problem_statement: text('qc_problem_statement').default(sql`null`),
  delivery_problem_statement: text('delivery_problem_statement').default(
    sql`null`,
  ),
  ready_for_delivery_date: DateTime('ready_for_delivery_date').default(sql`null`),
  bill_amount: PG_DECIMAL('bill_amount').default(sql`0`),
  is_home_repair: boolean('is_home_repair').default(false),
  proposed_cost: PG_DECIMAL('proposed_cost').default(sql`0`),
  is_challan_needed: boolean('is_challan_needed').default(false),
  image_1: text('image_1').default(sql`null`),
  image_2: text('image_2').default(sql`null`),
  image_3: text('image_3').default(sql`null`),
});
export const statusEnum = pgEnum('status', [
  'pending',
  'rejected',
  'accepted',
  'not_repairable',
  'customer_reject',
]);

export const diagnosis = work.table('diagnosis', {
  id: serial('id').notNull().unique(),
  uuid: uuid_primary,
  order_uuid: defaultUUID('order_uuid').references(() => order.uuid),
  engineer_uuid: defaultUUID('engineer_uuid').references(
    () => hrSchema.users.uuid,
  ),
  problems_uuid: text('problems_uuid').array().default([]),
  problem_statement: text('problem_statement'),
  status: statusEnum('status').default('pending'),
  status_update_date: DateTime('status_update_date').default(sql`null`),
  proposed_cost: PG_DECIMAL('proposed_cost').default(sql`0`),
  is_proceed_to_repair: boolean('is_proceed_to_repair').default(false),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
  customer_problem_statement: text('customer_problem_statement'),
  customer_remarks: text('customer_remarks').default(sql`null`),
});

export const section = work.table('section', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const process = work.table('process', {
  id: serial('id').notNull().unique(),
  uuid: uuid_primary,
  index: integer('index').default(0),
  section_uuid: defaultUUID('section_uuid')
    .references(() => section.uuid)
    .notNull(),
  order_uuid: defaultUUID('order_uuid').references(() => order.uuid),
  diagnosis_uuid: defaultUUID('diagnosis_uuid').references(
    () => diagnosis.uuid,
  ),
  engineer_uuid: defaultUUID('engineer_uuid').references(
    () => hrSchema.users.uuid,
  ),
  problems_uuid: text('problems_uuid').array().default([]),
  problem_statement: text('problem_statement').default(sql`null`),
  status: boolean('status').default(false),
  status_update_date: DateTime('status_update_date').default(sql`null`),
  is_transferred_for_qc: boolean('is_transferred_for_qc').default(false),
  is_ready_for_delivery: boolean('is_ready_for_delivery').default(false),
  warehouse_uuid: defaultUUID('warehouse_uuid').references(
    () => storeSchema.warehouse.uuid,
  ),
  rack_uuid: defaultUUID('rack_uuid').references(() => storeSchema.rack.uuid),
  floor_uuid: defaultUUID('floor_uuid').references(
    () => storeSchema.floor.uuid,
  ),
  box_uuid: defaultUUID('box_uuid').references(() => storeSchema.box.uuid),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const accessory = work.table('accessory', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(() => hrSchema.users.uuid),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export default work;
