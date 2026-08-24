import 'package:dart_frog/dart_frog.dart';
import 'package:timesheet/application/use_cases/create_timesheet.dart';
import 'package:timesheet/domain/entities/attendance.dart';
import 'package:timesheet/domain/entities/employee.dart';
import 'package:timesheet/domain/entities/holiday_info.dart';
import 'package:timesheet/domain/entities/timesheet.dart';
import 'package:timesheet/domain/specs/timesheet.dart';
import 'package:timesheet/domain/specs/timesheet_footer.dart';
import 'package:timesheet/domain/specs/timesheet_header.dart';
import 'package:timesheet/domain/specs/timesheet_table_body.dart';
import 'package:timesheet/domain/specs/timesheet_table_header.dart';
import 'package:timesheet/infrastructure/dto/models.dart';
import 'package:timesheet/presentation/i18n/timesheet.i18n.dart' as i18n;
import 'package:universal_io/io.dart';

const _corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Expose-Headers': 'Content-Disposition',
};

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method == HttpMethod.options) {
    return Response(statusCode: HttpStatus.noContent, headers: _corsHeaders);
  }

  if (context.request.method != HttpMethod.post) {
    return Response(
      statusCode: HttpStatus.methodNotAllowed,
      headers: _corsHeaders,
    );
  }

  final TimesheetDto timesheetDto;
  try {
    final body = await context.request.json();
    timesheetDto = TimesheetDto.fromJson(body as Map);
  } catch (e) {
    return Response(statusCode: HttpStatus.badRequest, headers: _corsHeaders);
  }
  final timesheet = Timesheet(
    year: timesheetDto.year,
    month: timesheetDto.month,
    attendances: timesheetDto.attendances.map((attendance) {
      return Attendance(
        employee: Employee(
          name: attendance.employee.name,
          role: attendance.employee.role,
          code: attendance.employee.code,
        ),
        absences: attendance.absences,
      );
    }).toList(),
    holidays: timesheetDto.holidays.map((day, info) {
      return MapEntry(day, HolidayInfo(type: info.type, shifts: info.shifts));
    }),
  );

  final i18n.Timesheet t;
  final locale = context.request.params['locale'] ?? 'pt_BR';
  switch (locale) {
    case 'pt_BR':
      t = const i18n.Timesheet();
    default:
      return Response(
        statusCode: HttpStatus.badRequest,
        headers: _corsHeaders,
        body: 'unsupported locale: $locale',
      );
  }

  final spec = TimesheetSpec(
    title: timesheetDto.title,
    headerSpec: TimesheetHeaderSpec(
      nameLabel: t.header.name,
      roleLabel: t.header.role,
      codeLabel: t.header.code,
    ),
    tableHeaderSpec: TimesheetTableHeaderSpec(
      dayLabel: t.table.header.day,
      enterTimeLabel: t.table.header.enterTime,
      exitTimeLabel: t.table.header.exitTime,
      signatureLabel: t.table.header.signature,
      additionalInfoLabel: t.table.header.additionalInfo,
    ),
    tableBodySpec: TimesheetTableBodySpec(
      saturdayLabel: t.table.body.saturday,
      sundayLabel: t.table.body.sunday,
      requiredHolidayLabel: t.table.body.requiredHoliday,
      optionalHolidayLabel: t.table.body.optionalHoliday,
      annualLeaveLabel: t.table.body.annualLeave,
      sickLeaveLabel: t.table.body.sickLeave,
      medicalLeaveLabel: t.table.body.medicalLeave,
      longServiceLeaveLabel: t.table.body.longServiceLeave,
    ),
    footerSpec: TimesheetFooterSpec(
      additionalInfoLabel: t.footer.additionalInfo,
      employeeSignatureLabel: t.footer.employeeSignature,
      managerSignatureLabel: t.footer.managerSignature,
    ),
    subtitle: t.subtitle,
    locale: locale,
  );
  final bytes = await createTimesheet(timesheet: timesheet, spec: spec);
  return Response.bytes(
    body: bytes,
    headers: {
      ..._corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=Frequencia.pdf',
    },
  );
}
