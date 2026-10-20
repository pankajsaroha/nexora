
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.InstitutionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  logo: 'logo',
  type: 'type',
  address: 'address',
  city: 'city',
  state: 'state',
  pincode: 'pincode',
  phone: 'phone',
  email: 'email',
  website: 'website',
  timezone: 'timezone',
  currency: 'currency',
  currencySymbol: 'currencySymbol',
  workingDays: 'workingDays',
  workingHours: 'workingHours',
  brandingColor: 'brandingColor',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampusScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  code: 'code',
  address: 'address',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  headName: 'headName',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AcademicYearScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TermScalarFieldEnum = {
  id: 'id',
  academicYearId: 'academicYearId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  code: 'code',
  hodId: 'hodId',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  email: 'email',
  passwordHash: 'passwordHash',
  phone: 'phone',
  fullName: 'fullName',
  avatarUrl: 'avatarUrl',
  roleCode: 'roleCode',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  isSystem: 'isSystem',
  createdAt: 'createdAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  module: 'module',
  description: 'description'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  campusId: 'campusId',
  userId: 'userId',
  admissionNumber: 'admissionNumber',
  rollNumber: 'rollNumber',
  firstName: 'firstName',
  middleName: 'middleName',
  lastName: 'lastName',
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  bloodGroup: 'bloodGroup',
  nationality: 'nationality',
  category: 'category',
  aadhaarNumber: 'aadhaarNumber',
  photoUrl: 'photoUrl',
  address: 'address',
  addressLine1: 'addressLine1',
  addressLine2: 'addressLine2',
  city: 'city',
  state: 'state',
  pincode: 'pincode',
  country: 'country',
  admissionDate: 'admissionDate',
  admissionType: 'admissionType',
  previousSchool: 'previousSchool',
  previousQualification: 'previousQualification',
  universityRegNumber: 'universityRegNumber',
  batch: 'batch',
  semester: 'semester',
  currentClassId: 'currentClassId',
  currentSectionId: 'currentSectionId',
  academicYearId: 'academicYearId',
  status: 'status',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  notes: 'notes',
  deactivatedAt: 'deactivatedAt',
  deactivatedByUserId: 'deactivatedByUserId',
  deactivationReason: 'deactivationReason',
  restoredAt: 'restoredAt',
  restoredByUserId: 'restoredByUserId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GuardianScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  fullName: 'fullName',
  relation: 'relation',
  phone: 'phone',
  email: 'email',
  occupation: 'occupation',
  annualIncome: 'annualIncome',
  address: 'address',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentGuardianScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  guardianId: 'guardianId',
  isPrimary: 'isPrimary'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  campusId: 'campusId',
  userId: 'userId',
  employeeId: 'employeeId',
  firstName: 'firstName',
  lastName: 'lastName',
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  designation: 'designation',
  departmentId: 'departmentId',
  qualification: 'qualification',
  joiningDate: 'joiningDate',
  employmentStatus: 'employmentStatus',
  basicSalary: 'basicSalary',
  bankAccountNumber: 'bankAccountNumber',
  bankIfsc: 'bankIfsc',
  photoUrl: 'photoUrl',
  casualLeaveBalance: 'casualLeaveBalance',
  sickLeaveBalance: 'sickLeaveBalance',
  earnedLeaveBalance: 'earnedLeaveBalance',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClassScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  departmentId: 'departmentId',
  academicYearId: 'academicYearId',
  name: 'name',
  code: 'code',
  level: 'level',
  durationYears: 'durationYears',
  type: 'type',
  isActive: 'isActive',
  orderIndex: 'orderIndex',
  createdAt: 'createdAt'
};

exports.Prisma.SectionScalarFieldEnum = {
  id: 'id',
  classId: 'classId',
  name: 'name',
  roomNumber: 'roomNumber',
  capacity: 'capacity',
  classTeacherId: 'classTeacherId',
  createdAt: 'createdAt'
};

exports.Prisma.ClassTeacherScalarFieldEnum = {
  id: 'id',
  sectionId: 'sectionId',
  teacherId: 'teacherId',
  academicYearId: 'academicYearId',
  isCurrent: 'isCurrent',
  startDate: 'startDate',
  endDate: 'endDate'
};

exports.Prisma.SubjectScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  departmentId: 'departmentId',
  name: 'name',
  code: 'code',
  credits: 'credits',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.TeacherAssignmentScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  subjectId: 'subjectId',
  sectionId: 'sectionId',
  academicYearId: 'academicYearId'
};

exports.Prisma.TimetableSlotScalarFieldEnum = {
  id: 'id',
  sectionId: 'sectionId',
  subjectId: 'subjectId',
  teacherId: 'teacherId',
  dayOfWeek: 'dayOfWeek',
  periodNumber: 'periodNumber',
  startTime: 'startTime',
  endTime: 'endTime',
  roomNumber: 'roomNumber'
};

exports.Prisma.StudentAttendanceScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  sectionId: 'sectionId',
  date: 'date',
  status: 'status',
  remarks: 'remarks',
  markedByUserId: 'markedByUserId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffAttendanceScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  date: 'date',
  status: 'status',
  checkInTime: 'checkInTime',
  checkOutTime: 'checkOutTime',
  remarks: 'remarks'
};

exports.Prisma.LeaveYearScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveTypeScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  code: 'code',
  isPaid: 'isPaid',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeavePolicyScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  staffType: 'staffType',
  employmentType: 'employmentType',
  leaveYearId: 'leaveYearId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeavePolicyRuleScalarFieldEnum = {
  id: 'id',
  policyId: 'policyId',
  leaveTypeId: 'leaveTypeId',
  annualEntitlement: 'annualEntitlement',
  accrualFrequency: 'accrualFrequency',
  proRataEnabled: 'proRataEnabled',
  proRataBasis: 'proRataBasis',
  roundingRule: 'roundingRule',
  eligibilityRule: 'eligibilityRule',
  eligibilityDays: 'eligibilityDays',
  allowCarryForward: 'allowCarryForward',
  maxCarryForwardDays: 'maxCarryForwardDays',
  maxBalance: 'maxBalance',
  requiresProof: 'requiresProof',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeLeaveAccountScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  teacherId: 'teacherId',
  leaveTypeId: 'leaveTypeId',
  leaveYearId: 'leaveYearId',
  entitledDays: 'entitledDays',
  carriedOverDays: 'carriedOverDays',
  accruedDays: 'accruedDays',
  usedDays: 'usedDays',
  pendingDays: 'pendingDays',
  availableDays: 'availableDays',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveTransactionScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  type: 'type',
  days: 'days',
  balanceAfter: 'balanceAfter',
  leaveRequestId: 'leaveRequestId',
  remarks: 'remarks',
  createdByUserId: 'createdByUserId',
  createdAt: 'createdAt'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  teacherId: 'teacherId',
  leaveTypeId: 'leaveTypeId',
  leaveYearId: 'leaveYearId',
  employeeLeaveAccountId: 'employeeLeaveAccountId',
  leaveType: 'leaveType',
  startDate: 'startDate',
  endDate: 'endDate',
  totalDays: 'totalDays',
  reason: 'reason',
  status: 'status',
  approvedByUserId: 'approvedByUserId',
  rejectionReason: 'rejectionReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssignmentScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  sectionId: 'sectionId',
  subjectId: 'subjectId',
  teacherId: 'teacherId',
  title: 'title',
  description: 'description',
  attachmentUrl: 'attachmentUrl',
  dueDate: 'dueDate',
  priority: 'priority',
  status: 'status',
  maxMarks: 'maxMarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssignmentSubmissionScalarFieldEnum = {
  id: 'id',
  assignmentId: 'assignmentId',
  studentId: 'studentId',
  submissionDate: 'submissionDate',
  content: 'content',
  attachmentUrl: 'attachmentUrl',
  marksObtained: 'marksObtained',
  status: 'status',
  feedback: 'feedback',
  gradedAt: 'gradedAt'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  createdById: 'createdById',
  academicYearId: 'academicYearId',
  termId: 'termId',
  name: 'name',
  examType: 'examType',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ExamSubjectScalarFieldEnum = {
  id: 'id',
  examId: 'examId',
  subjectId: 'subjectId',
  classId: 'classId',
  examDate: 'examDate',
  startTime: 'startTime',
  endTime: 'endTime',
  maxMarks: 'maxMarks',
  passMarks: 'passMarks'
};

exports.Prisma.StudentMarkScalarFieldEnum = {
  id: 'id',
  examSubjectId: 'examSubjectId',
  studentId: 'studentId',
  marksObtained: 'marksObtained',
  grade: 'grade',
  isAbsent: 'isAbsent',
  remarks: 'remarks'
};

exports.Prisma.FeeCategoryScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  description: 'description'
};

exports.Prisma.FeeStructureScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  feeCategoryId: 'feeCategoryId',
  classId: 'classId',
  academicYearId: 'academicYearId',
  amount: 'amount',
  dueDate: 'dueDate',
  frequency: 'frequency'
};

exports.Prisma.StudentFeeScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  feeStructureId: 'feeStructureId',
  academicYearId: 'academicYearId',
  totalAmount: 'totalAmount',
  discountAmount: 'discountAmount',
  paidAmount: 'paidAmount',
  pendingAmount: 'pendingAmount',
  dueDate: 'dueDate',
  status: 'status',
  remarks: 'remarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeePaymentScalarFieldEnum = {
  id: 'id',
  studentFeeId: 'studentFeeId',
  studentId: 'studentId',
  receiptNumber: 'receiptNumber',
  amount: 'amount',
  paymentDate: 'paymentDate',
  paymentMethod: 'paymentMethod',
  transactionRef: 'transactionRef',
  notes: 'notes',
  collectedByUserId: 'collectedByUserId',
  createdAt: 'createdAt'
};

exports.Prisma.PayrollScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  teacherId: 'teacherId',
  month: 'month',
  year: 'year',
  basicSalary: 'basicSalary',
  allowances: 'allowances',
  deductions: 'deductions',
  bonus: 'bonus',
  leaveDeduction: 'leaveDeduction',
  netSalary: 'netSalary',
  status: 'status',
  paymentDate: 'paymentDate',
  paymentMethod: 'paymentMethod',
  transactionRef: 'transactionRef',
  approvedByUserId: 'approvedByUserId',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  description: 'description',
  assigneeUserId: 'assigneeUserId',
  createdByUserId: 'createdByUserId',
  departmentId: 'departmentId',
  priority: 'priority',
  dueDate: 'dueDate',
  status: 'status',
  taskType: 'taskType',
  relatedEntity: 'relatedEntity',
  relatedEntityId: 'relatedEntityId',
  completedAt: 'completedAt',
  reopenedAt: 'reopenedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskCommentScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  userId: 'userId',
  comment: 'comment',
  createdAt: 'createdAt'
};

exports.Prisma.AnnouncementScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  content: 'content',
  targetAudience: 'targetAudience',
  targetEntityId: 'targetEntityId',
  priority: 'priority',
  authorUserId: 'authorUserId',
  publishedAt: 'publishedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  institutionId: 'institutionId',
  title: 'title',
  message: 'message',
  type: 'type',
  isRead: 'isRead',
  linkUrl: 'linkUrl',
  relatedEntity: 'relatedEntity',
  relatedEntityId: 'relatedEntityId',
  createdAt: 'createdAt'
};

exports.Prisma.WhatsAppMessageLogScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  recipientPhone: 'recipientPhone',
  recipientName: 'recipientName',
  templateName: 'templateName',
  messageContent: 'messageContent',
  status: 'status',
  provider: 'provider',
  externalMessageId: 'externalMessageId',
  failureReason: 'failureReason',
  relatedEntity: 'relatedEntity',
  relatedEntityId: 'relatedEntityId',
  createdAt: 'createdAt',
  sentAt: 'sentAt'
};

exports.Prisma.BookScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  author: 'author',
  isbn: 'isbn',
  category: 'category',
  publisher: 'publisher',
  totalCopies: 'totalCopies',
  availableCopies: 'availableCopies',
  rackLocation: 'rackLocation',
  createdAt: 'createdAt'
};

exports.Prisma.BookIssueScalarFieldEnum = {
  id: 'id',
  bookId: 'bookId',
  studentId: 'studentId',
  teacherId: 'teacherId',
  issueDate: 'issueDate',
  dueDate: 'dueDate',
  returnDate: 'returnDate',
  status: 'status',
  fineAmount: 'fineAmount',
  isFinePaid: 'isFinePaid'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  vehicleNumber: 'vehicleNumber',
  vehicleType: 'vehicleType',
  capacity: 'capacity',
  driverName: 'driverName',
  driverPhone: 'driverPhone',
  helperName: 'helperName',
  helperPhone: 'helperPhone',
  status: 'status'
};

exports.Prisma.RouteScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  vehicleId: 'vehicleId',
  routeName: 'routeName',
  startPoint: 'startPoint',
  endPoint: 'endPoint'
};

exports.Prisma.RouteStopScalarFieldEnum = {
  id: 'id',
  routeId: 'routeId',
  stopName: 'stopName',
  stopOrder: 'stopOrder',
  pickupTime: 'pickupTime',
  dropTime: 'dropTime',
  feeAmount: 'feeAmount'
};

exports.Prisma.StudentTransportScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  routeStopId: 'routeStopId',
  academicYearId: 'academicYearId',
  status: 'status'
};

exports.Prisma.HostelScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  type: 'type',
  wardenName: 'wardenName',
  wardenPhone: 'wardenPhone',
  address: 'address'
};

exports.Prisma.HostelRoomScalarFieldEnum = {
  id: 'id',
  hostelId: 'hostelId',
  roomNumber: 'roomNumber',
  floor: 'floor',
  totalBeds: 'totalBeds',
  occupiedBeds: 'occupiedBeds',
  feePerTerm: 'feePerTerm'
};

exports.Prisma.HostelAllocationScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  hostelRoomId: 'hostelRoomId',
  bedNumber: 'bedNumber',
  checkInDate: 'checkInDate',
  checkOutDate: 'checkOutDate',
  status: 'status'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  title: 'title',
  description: 'description',
  eventType: 'eventType',
  startDate: 'startDate',
  endDate: 'endDate',
  isAllDay: 'isAllDay',
  targetAudience: 'targetAudience',
  location: 'location',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  userId: 'userId',
  userEmail: 'userEmail',
  userName: 'userName',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  details: 'details',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.TaskActivityScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  userId: 'userId',
  actionType: 'actionType',
  details: 'details',
  fromValue: 'fromValue',
  toValue: 'toValue',
  createdAt: 'createdAt'
};

exports.Prisma.StudentCustomFieldScalarFieldEnum = {
  id: 'id',
  institutionId: 'institutionId',
  name: 'name',
  key: 'key',
  fieldType: 'fieldType',
  options: 'options',
  placeholder: 'placeholder',
  helpText: 'helpText',
  isRequired: 'isRequired',
  isVisibleToAdmin: 'isVisibleToAdmin',
  isVisibleToTeacher: 'isVisibleToTeacher',
  isVisibleToParent: 'isVisibleToParent',
  isVisibleToStudent: 'isVisibleToStudent',
  orderIndex: 'orderIndex',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentCustomFieldValueScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  customFieldId: 'customFieldId',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Institution: 'Institution',
  Campus: 'Campus',
  AcademicYear: 'AcademicYear',
  Term: 'Term',
  Department: 'Department',
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  Student: 'Student',
  Guardian: 'Guardian',
  StudentGuardian: 'StudentGuardian',
  Teacher: 'Teacher',
  Class: 'Class',
  Section: 'Section',
  ClassTeacher: 'ClassTeacher',
  Subject: 'Subject',
  TeacherAssignment: 'TeacherAssignment',
  TimetableSlot: 'TimetableSlot',
  StudentAttendance: 'StudentAttendance',
  StaffAttendance: 'StaffAttendance',
  LeaveYear: 'LeaveYear',
  LeaveType: 'LeaveType',
  LeavePolicy: 'LeavePolicy',
  LeavePolicyRule: 'LeavePolicyRule',
  EmployeeLeaveAccount: 'EmployeeLeaveAccount',
  LeaveTransaction: 'LeaveTransaction',
  LeaveRequest: 'LeaveRequest',
  Assignment: 'Assignment',
  AssignmentSubmission: 'AssignmentSubmission',
  Exam: 'Exam',
  ExamSubject: 'ExamSubject',
  StudentMark: 'StudentMark',
  FeeCategory: 'FeeCategory',
  FeeStructure: 'FeeStructure',
  StudentFee: 'StudentFee',
  FeePayment: 'FeePayment',
  Payroll: 'Payroll',
  Task: 'Task',
  TaskComment: 'TaskComment',
  Announcement: 'Announcement',
  Notification: 'Notification',
  WhatsAppMessageLog: 'WhatsAppMessageLog',
  Book: 'Book',
  BookIssue: 'BookIssue',
  Vehicle: 'Vehicle',
  Route: 'Route',
  RouteStop: 'RouteStop',
  StudentTransport: 'StudentTransport',
  Hostel: 'Hostel',
  HostelRoom: 'HostelRoom',
  HostelAllocation: 'HostelAllocation',
  CalendarEvent: 'CalendarEvent',
  AuditLog: 'AuditLog',
  TaskActivity: 'TaskActivity',
  StudentCustomField: 'StudentCustomField',
  StudentCustomFieldValue: 'StudentCustomFieldValue'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
