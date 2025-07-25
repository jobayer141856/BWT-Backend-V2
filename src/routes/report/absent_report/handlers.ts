import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';

import type { AbsentSummaryReportRoute, DailyAbsentReportRoute } from './routes';

export const dailyAbsentReport: AppRouteHandler<DailyAbsentReportRoute> = async (c: any) => {
  const { employee_uuid, from_date } = c.req.valid('query');

  const query = sql`
    SELECT
        employee.uuid as employee_uuid,
        users.name as employee_name,
        employee.employee_id,
        workplace.name as workplace_name,
        employment_type.name as employment_type_name,
        shift_group.name as shift_group_name,
        shifts.start_time,
        shifts.end_time,
        department.department as department_name,
        designation.designation as designation_name,
        CASE 
            WHEN punch_log.employee_uuid IS NULL THEN 'Absent'
            ELSE 'Present'
        END as attendance_status
    FROM
        hr.employee
    LEFT JOIN
        hr.users ON employee.user_uuid = users.uuid
    LEFT JOIN
        hr.department ON employee.department_uuid = department.uuid
    LEFT JOIN
        hr.designation ON employee.designation_uuid = designation.uuid
    LEFT JOIN 
        hr.employment_type ON employee.employment_type_uuid = employment_type.uuid
    LEFT JOIN
        hr.workplace ON employee.workplace_uuid = workplace.uuid
    LEFT JOIN
        hr.shift_group ON employee.shift_group_uuid = shift_group.uuid
    LEFT JOIN
        hr.shifts ON shift_group.shifts_uuid = shifts.uuid
    LEFT JOIN
        hr.punch_log ON employee.uuid = punch_log.employee_uuid 
        AND ${from_date ? sql`DATE(punch_log.punch_time) = ${from_date}` : sql`DATE(punch_log.punch_time) = CURRENT_DATE`}
    LEFT JOIN
        hr.apply_leave ON employee.uuid = apply_leave.employee_uuid
        AND apply_leave.approval = 'approved'
        AND ${from_date ? sql`${from_date} BETWEEN apply_leave.from_date::date AND apply_leave.to_date::date` : sql`CURRENT_DATE BETWEEN apply_leave.from_date::date AND apply_leave.to_date::date`}
    WHERE 
        employee.status = true
        AND employee.exclude_from_attendance = false
        ${employee_uuid ? sql`AND employee.uuid = ${employee_uuid}` : sql``}
        AND punch_log.employee_uuid IS NULL  -- Only absent employees
        AND apply_leave.employee_uuid IS NULL  -- Exclude employees on approved leave
    ORDER BY
        users.name
  `;

  const data = await db.execute(query);

  return c.json(data.rows, HSCode.OK);
};

export const absentSummaryReport: AppRouteHandler<AbsentSummaryReportRoute> = async (c: any) => {
  const { employee_uuid } = c.req.valid('query');

  const query = sql`
    WITH absence_summary AS (
        SELECT 
            employee.uuid as employee_uuid,
            users.name as employee_name,
            employee.employee_id,
            department.department as department_name,
            designation.designation as designation_name,
            employment_type.name as employment_type_name,
            workplace.name as workplace_name,
            
            -- Count total working days (excluding weekends/holidays)
            COUNT(DISTINCT calendar_date.date) as total_working_days,
            
            -- Count days with punch records
            COUNT(DISTINCT DATE(punch_log.punch_time)) as days_present,
            
            -- Count approved leave days
            COALESCE(SUM(
                CASE 
                    WHEN apply_leave.type = 'full' THEN (apply_leave.to_date::date - apply_leave.from_date::date + 1)
                    WHEN apply_leave.type = 'half' THEN (apply_leave.to_date::date - apply_leave.from_date::date + 1) * 0.5
                    ELSE 0
                END
            ), 0) as approved_leave_days,
            
            -- Calculate absent days (working days - present days - approved leave days)
            (COUNT(DISTINCT calendar_date.date) - COUNT(DISTINCT DATE(punch_log.punch_time)) - COALESCE(SUM(
                CASE 
                    WHEN apply_leave.type = 'full' THEN (apply_leave.to_date::date - apply_leave.from_date::date + 1)
                    WHEN apply_leave.type = 'half' THEN (apply_leave.to_date::date - apply_leave.from_date::date + 1) * 0.5
                    ELSE 0
                END
            ), 0)) as unauthorized_absent_days,

            -- Absent Dates (only dates without punch records and not on leave)
            json_agg(
                DISTINCT CASE 
                    WHEN punch_log.employee_uuid IS NULL AND apply_leave.employee_uuid IS NULL 
                    THEN calendar_date.date 
                    ELSE NULL 
                END
            ) FILTER (WHERE punch_log.employee_uuid IS NULL AND apply_leave.employee_uuid IS NULL) as absent_days,
            json_agg(
                CASE 
                    WHEN punch_log.employee_uuid IS NULL AND apply_leave.employee_uuid IS NULL 
                    THEN shifts.start_time::time
                    ELSE NULL 
                END
            ) FILTER (WHERE punch_log.employee_uuid IS NULL AND apply_leave.employee_uuid IS NULL) as start_times,
            json_agg(
                CASE 
                    WHEN punch_log.employee_uuid IS NULL AND apply_leave.employee_uuid IS NULL 
                    THEN shifts.end_time::time
                    ELSE NULL 
                END
            ) FILTER (WHERE punch_log.employee_uuid IS NULL AND apply_leave.employee_uuid IS NULL) as end_times
        FROM 
            hr.employee
        LEFT JOIN 
            hr.users ON employee.user_uuid = users.uuid
        LEFT JOIN
            hr.department ON employee.department_uuid = department.uuid
        LEFT JOIN
            hr.designation ON employee.designation_uuid = designation.uuid
        LEFT JOIN 
            hr.employment_type ON employee.employment_type_uuid = employment_type.uuid
        LEFT JOIN
            hr.workplace ON employee.workplace_uuid = workplace.uuid
        LEFT JOIN
            -- Generate a calendar of working days for the current month
            (SELECT generate_series(
                DATE_TRUNC('month', CURRENT_DATE),
                DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
                '1 day'::interval
            )::date as date) as calendar_date ON TRUE
        LEFT JOIN
            hr.punch_log ON employee.uuid = punch_log.employee_uuid 
            AND DATE(punch_log.punch_time) = calendar_date.date
        LEFT JOIN
            hr.apply_leave ON employee.uuid = apply_leave.employee_uuid
            AND apply_leave.approval = 'approved'
            AND calendar_date.date BETWEEN apply_leave.from_date::date AND apply_leave.to_date::date
        LEFT JOIN
            hr.general_holidays ON calendar_date.date = general_holidays.date::date
        LEFT JOIN
            hr.special_holidays ON calendar_date.date BETWEEN special_holidays.from_date::date AND special_holidays.to_date::date
            AND employee.workplace_uuid = special_holidays.workplace_uuid
        LEFT JOIN
            hr.shift_group sg_calendar ON employee.shift_group_uuid = sg_calendar.uuid
        LEFT JOIN
            hr.shifts ON sg_calendar.shifts_uuid = shifts.uuid
        LEFT JOIN 
            hr.roster ON shifts.uuid = roster.shifts_uuid AND sg_calendar.uuid = roster.shift_group_uuid
        WHERE 
            employee.status = true
            AND employee.exclude_from_attendance = false
            ${employee_uuid ? sql`AND employee.uuid = ${employee_uuid}` : sql``}
            -- Exclude off days based on shift group off_days
            AND NOT (CASE WHEN calendar_date.date < roster.effective_date THEN sg_calendar.off_days::jsonb ? LPAD(LOWER(TO_CHAR(calendar_date.date, 'Day')), 3) ELSE roster.off_days::jsonb ? LPAD(LOWER(TO_CHAR(calendar_date.date, 'Day')), 3) END)
            AND general_holidays.uuid IS NULL
            AND special_holidays.uuid IS NULL
        GROUP BY
            employee.uuid, users.name, employee.employee_id, department.department, 
            designation.designation, employment_type.name, workplace.name
    )
    SELECT 
        *,
        ROUND((days_present::numeric / NULLIF(total_working_days, 0)) * 100, 2) as attendance_percentage,
        ROUND((unauthorized_absent_days::numeric / NULLIF(total_working_days, 0)) * 100, 2) as absence_percentage
    FROM absence_summary
    ORDER BY unauthorized_absent_days DESC, employee_name
  `;

  const data = await db.execute(query);

  return c.json(data.rows, HSCode.OK);
};
