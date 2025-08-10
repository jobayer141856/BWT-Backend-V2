import absent_report from './absent_report';
import attendance_report from './attendance_report';
import field_visit_report from './field_visit_report';
import late_report from './late_report';
import leave_report from './leave_report';
import working_hour_report from './working_hour_report';

const report = [
  leave_report,
  attendance_report,
  absent_report,
  late_report,
  working_hour_report,
  field_visit_report,
];

export default report;
