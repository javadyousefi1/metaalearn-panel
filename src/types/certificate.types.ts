export enum CertificateStatusType {
  None = 0,
  Requested = 1,
  Verified = 2,
  Rejected = 3,
  Revoked = 4,
}

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
  imageUrl: string;
  phoneNumber: string;
  id: string;
}

export interface CertificateCourseInfo {
  name: string;
  imageUrl: string;
  id: string;
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
}
