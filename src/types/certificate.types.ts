export enum CertificateStatusType {
  None = 0,
  Requested = 1,
  Verified = 2,
  Rejected = 3,
  Revoked = 4,
}

export enum CertificateTemplateType {
  None = 0,
  Package = 1,
  Normal = 2,
}

export const getCertificateTemplateName = (type: CertificateTemplateType | number): string => {
  switch (type) {
    case CertificateTemplateType.Package:
      return 'پکیج';
    case CertificateTemplateType.Normal:
      return 'عادی';
    default:
      return 'نامشخص';
  }
};

export const getCertificateStatusName = (status: CertificateStatusType | number): string => {
  switch (status) {
    case CertificateStatusType.None:
      return 'بدون وضعیت';
    case CertificateStatusType.Requested:
      return 'درخواست شده';
    case CertificateStatusType.Verified:
      return 'تایید شده';
    case CertificateStatusType.Rejected:
      return 'رد شده';
    case CertificateStatusType.Revoked:
      return 'باطل شده';
    default:
      return 'نامشخص';
  }
};

export const getCertificateStatusColor = (status: CertificateStatusType | number): string => {
  switch (status) {
    case CertificateStatusType.None:
      return 'default';
    case CertificateStatusType.Requested:
      return 'blue';
    case CertificateStatusType.Verified:
      return 'green';
    case CertificateStatusType.Rejected:
      return 'red';
    case CertificateStatusType.Revoked:
      return 'volcano';
    default:
      return 'default';
  }
};

export interface CertificateUserInfo {
  fullNameFa: string;
  fullNameEn?: string | null;
  imageUrl: string;
  phoneNumber: string;
  id: string;
}

export interface CertificateCourseInfo {
  name: string;
  nameEn?: string | null;
  imageUrl: string;
  id: string;
}

export interface CertificateTopic {
  name: string;
  nameEn?: string | null;
}

export interface CertificateScheduleRating {
  name: string;
  description: string;
  typeId: number;
  rate: number;
  ratedByInfo: unknown | null;
  ratedTime: string;
  id: string;
}

export interface CertificateListItem {
  user: CertificateUserInfo;
  course: CertificateCourseInfo;
  statusType: CertificateStatusType;
  templateType?: CertificateTemplateType;
  topics?: CertificateTopic[];
  referenceCode: string;
  scheduleRatings: CertificateScheduleRating[];
  requestedTime: string;
  verifiedTime: string | null;
  message: string | null;
  createdTime: string;
  updatedTime: string | null;
  id: string;
}

export interface GetAllCertificatesParams {
  PageIndex: number;
  PageSize: number;
  CourseId?: string;
  StatusType?: number;
  TemplateType?: number;
  FullName?: string;
  PhoneNumber?: string;
}

export interface AllCertificatesResponse {
  items: CertificateListItem[];
  totalCount: number;
}

export enum UpdateUserCertificateRqType {
  Verify = 2,
  Reject = 3,
  Revoke = 4,
}

export interface CertificateScheduleRatingPayload {
  courseScheduleId: string;
  rate: number;
}

export interface UpdateCertificatePayload {
  rqType: UpdateUserCertificateRqType;
  certificateId: string;
  scheduleRatings?: CertificateScheduleRatingPayload[];
  message?: string;
  templateType?: CertificateTemplateType;
}
