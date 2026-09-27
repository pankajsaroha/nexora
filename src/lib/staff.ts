export type StaffType = "TEACHING" | "NON_TEACHING";

export type EmploymentType =
  | "PERMANENT"
  | "CONTRACT"
  | "TEMPORARY"
  | "VISITING"
  | "GUEST"
  | "PART_TIME"
  | "AD_HOC";

export type EmploymentStatus =
  | "ACTIVE"
  | "ON_LEAVE"
  | "SUSPENDED"
  | "RESIGNED"
  | "RETIRED"
  | "TERMINATED"
  | "DEACTIVATED";

export interface StaffQualification {
  id: string;
  degree: string; // e.g. "B.Tech", "M.Sc", "PhD", "B.Ed", "CTET", "NET"
  specialization?: string;
  institution: string;
  year: number | string;
  gradeScore?: string;
  isHighest?: boolean;
}

export interface StaffExperience {
  id: string;
  organization: string;
  designation: string;
  startDate: string;
  endDate?: string;
  totalYears?: string;
  description?: string;
}

export interface StaffDocument {
  id: string;
  type: string; // RESUME, APPOINTMENT_LETTER, JOINING_LETTER, QUALIFICATION, EXPERIENCE, ID_PROOF, PAN, CONTRACT, APPRAISAL, OTHER
  title: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  issueDate?: string;
  expiryDate?: string;
  uploadedAt: string;
  uploadedBy?: string;
  status?: "VERIFIED" | "PENDING" | "EXPIRED";
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
}

export interface StaffAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface ExtendedStaffData {
  staffType: StaffType;
  employmentType: EmploymentType;
  middleName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  nationality?: string;
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER";
  panNumber?: string;
  aadhaarNumber?: string;
  personalEmail?: string;
  alternatePhone?: string;
  currentAddress?: StaffAddress;
  permanentAddress?: StaffAddress;
  sameAsCurrentAddress?: boolean;
  emergencyContacts?: EmergencyContact[];
  reportingManager?: string;
  workLocation?: string;
  workShift?: string;
  probationEndDate?: string;
  confirmationDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  exitDate?: string;
  exitReason?: string;
  deactivationReason?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankIfsc?: string;
  bankBranch?: string;
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
  };
  pfNumber?: string;
  esiNumber?: string;
  qualifications?: StaffQualification[];
  experiences?: StaffExperience[];
  documents?: StaffDocument[];
  customFields?: Record<string, any>;
}

/**
 * Safely parses the stored qualification string or JSON metadata into extended staff fields.
 */
export function parseStaffMetadata(rawQualification?: string | null): ExtendedStaffData {
  const defaultData: ExtendedStaffData = {
    staffType: "TEACHING",
    employmentType: "PERMANENT",
    nationality: "Indian",
    gender: "MALE",
    qualifications: [],
    experiences: [],
    documents: [],
    emergencyContacts: [],
    customFields: {},
  };

  if (!rawQualification || typeof rawQualification !== "string") {
    return defaultData;
  }

  // Check if string is JSON
  if (rawQualification.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(rawQualification);
      return {
        ...defaultData,
        ...parsed,
        qualifications: Array.isArray(parsed.qualifications)
          ? parsed.qualifications
          : (parsed.qualification ? [{ id: "q-1", degree: parsed.qualification, institution: "University", year: 2020 }] : []),
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        documents: Array.isArray(parsed.documents) ? parsed.documents : [],
        emergencyContacts: Array.isArray(parsed.emergencyContacts) ? parsed.emergencyContacts : [],
      };
    } catch {
      // Fallback if parsing fails
    }
  }

  // Legacy plain string (e.g. "M.Sc, B.Ed")
  return {
    ...defaultData,
    qualifications: [
      {
        id: "q-legacy",
        degree: rawQualification,
        institution: "Accredited Institution",
        year: 2018,
        isHighest: true,
      },
    ],
  };
}

/**
 * Serializes extended staff information into JSON string for persistence in qualification field.
 */
export function serializeStaffMetadata(data: Partial<ExtendedStaffData>): string {
  return JSON.stringify(data);
}
