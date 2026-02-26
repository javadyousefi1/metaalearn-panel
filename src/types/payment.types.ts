// Payment Enums
export enum PaymentValueType {
  WalletTransaction = 1,
  Course = 2,
  InstallmentTransaction = 3,
}

export enum PaymentMethod {
  Wallet = 1,
  CardToCard = 2,
  OnlinePayment = 3,
}

export enum PaymentType {
  None = 0,
  Free = 1,
  Installment = 2,
  FullyPayment = 3,
}

export enum PaymentStatus {
  Pending = 1,
  Paid = 2,
  Failed = 3,
  Refunded = 4,
  Cancelled = 5,
  Rejected = 6,
}

// Payment User Info
export interface PaymentUserInfo {
  fullNameFa: string;
  imageUrl: string | null;
  phoneNumber: string;
  id: string;
}

// Gateway Info
export interface PaymentGatewayInfo {
  type: number;
  authority: string;
  paymentUrl: string;
  fee: number;
  feeType: string;
  refId: string | null;
  cardPan: string | null;
  cardHash: string | null;
}

// Card to Card Info
export interface PaymentCardToCardInfo {
  imageUrl: string;
  transactionNumber: string;
}

// Payment Item
export interface PaymentListItem {
  user: PaymentUserInfo;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  type: PaymentType;
  valueType: PaymentValueType;
  valueId: string;
  referralCode: string;
  paidTime: string | null;
  message: string | null;
  gateway: PaymentGatewayInfo | null;
  cardToCard: PaymentCardToCardInfo | null;
  createdTime: string;
  updatedTime: string | null;
  id: string;
}

// API Request/Response
export interface GetAllPaymentsParams {
  PageIndex: number;
  PageSize: number;
  Status?: PaymentStatus;
  Method?: PaymentMethod;
  Type?: PaymentType;
  ReferralCode?: string;
}

export interface AllPaymentsResponse {
  items: PaymentListItem[];
  totalCount: number;
}

export interface VerifyPaymentPayload {
  paymentId: string;
}

export interface RejectPaymentPayload {
  paymentId: string;
  reason: string;
}

export interface RefundPaymentPayload {
  paymentId: string;
  refundedMessage: string;
}

// Helper functions for payment method display
export const getPaymentMethodName = (method: PaymentMethod | number): string => {
  const methodValue = typeof method === 'number' ? method : method;

  switch (methodValue) {
    case PaymentMethod.Wallet:
      return 'کیف پول';
    case PaymentMethod.CardToCard:
      return 'کارت به کارت';
    case PaymentMethod.OnlinePayment:
      return 'پرداخت آنلاین';
    default:
      return 'نامشخص';
  }
};

export const getPaymentMethodColor = (method: PaymentMethod | number): string => {
  const methodValue = typeof method === 'number' ? method : method;

  switch (methodValue) {
    case PaymentMethod.Wallet:
      return 'blue';
    case PaymentMethod.CardToCard:
      return 'orange';
    case PaymentMethod.OnlinePayment:
      return 'green';
    default:
      return 'default';
  }
};

// Helper functions for payment status display
export const getPaymentStatusName = (status: PaymentStatus | number): string => {
  const statusValue = typeof status === 'number' ? status : status;

  switch (statusValue) {
    case PaymentStatus.Pending:
      return 'در انتظار';
    case PaymentStatus.Paid:
      return 'پرداخت شده';
    case PaymentStatus.Failed:
      return 'ناموفق';
    case PaymentStatus.Refunded:
      return 'بازگشت داده شده';
    case PaymentStatus.Cancelled:
      return 'لغو شده';
    case PaymentStatus.Rejected:
       return 'رد شده توسط ادمین';
    default:
      return 'نامشخص';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus | number): string => {
  const statusValue = typeof status === 'number' ? status : status;

  switch (statusValue) {
    case PaymentStatus.Pending:
      return 'orange';
    case PaymentStatus.Paid:
      return 'green';
    case PaymentStatus.Rejected:
    case PaymentStatus.Failed:
      return 'red';
    case PaymentStatus.Refunded:
      return 'purple';
    case PaymentStatus.Cancelled:
      return 'default';
    default:
      return 'default';
  }
};

// Helper functions for payment type display
export const getPaymentTypeName = (type: PaymentType | number): string => {
  const typeValue = typeof type === 'number' ? type : type;

  switch (typeValue) {
    case PaymentType.None:
      return 'هیچ';
    case PaymentType.Free:
      return 'رایگان';
    case PaymentType.Installment:
      return 'اقساطی';
    case PaymentType.FullyPayment:
      return 'پرداخت کامل';
    default:
      return 'نامشخص';
  }
};

export const getPaymentTypeColor = (type: PaymentType | number): string => {
  const typeValue = typeof type === 'number' ? type : type;

  switch (typeValue) {
    case PaymentType.None:
      return 'default';
    case PaymentType.Free:
      return 'cyan';
    case PaymentType.Installment:
      return 'purple';
    case PaymentType.FullyPayment:
      return 'blue';
    default:
      return 'default';
  }
};

// Helper functions for payment value type display
export const getPaymentValueTypeName = (valueType: PaymentValueType | number): string => {
  const valueTypeValue = typeof valueType === 'number' ? valueType : valueType;

  switch (valueTypeValue) {
    case PaymentValueType.WalletTransaction:
      return 'تراکنش کیف پول';
    case PaymentValueType.Course:
      return 'دوره';
    case PaymentValueType.InstallmentTransaction:
      return 'تراکنش اقساطی';
    default:
      return 'نامشخص';
  }
};

export const getPaymentValueTypeColor = (valueType: PaymentValueType | number): string => {
  const valueTypeValue = typeof valueType === 'number' ? valueType : valueType;

  switch (valueTypeValue) {
    case PaymentValueType.WalletTransaction:
      return 'blue';
    case PaymentValueType.Course:
      return 'green';
    case PaymentValueType.InstallmentTransaction:
      return 'purple';
    default:
      return 'default';
  }
};

// Format amount to Persian currency
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};
