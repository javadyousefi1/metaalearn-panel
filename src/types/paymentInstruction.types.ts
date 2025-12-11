// Payment Instruction Item
export interface PaymentInstruction {
  shaba: string;
  cardNumber: string;
  ownerName: string;
  bankName: string;
  cardExpireTime: string | null;
  isActive?: boolean;
  createdTime: string | null;
  updatedTime: string | null;
  id: string;
}

// API Request/Response
export interface GetAllPaymentInstructionsParams {
  PageIndex: number;
  PageSize: number;
}

export interface AllPaymentInstructionsResponse {
  items: PaymentInstruction[];
  totalCount: number;
}

export interface CreatePaymentInstructionPayload {
  shaba: string;
  cardNumber: string;
  ownerName: string;
  bankName: string;
  cardExpireTime: string;
}

export interface UpdatePaymentInstructionPayload {
  shaba: string;
  cardNumber: string;
  ownerName: string;
  bankName: string;
  cardExpireTime: string;
  isActive: boolean;
  id: string;
}

export interface DeletePaymentInstructionParams {
  id: string;
}

// Helper function to format card number
export const formatCardNumber = (cardNumber: string): string => {
  // Remove all spaces and format as groups of 4
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// Helper function to format SHABA number
export const formatShaba = (shaba: string): string => {
  // Remove all spaces and add IR prefix if not present
  const cleaned = shaba.replace(/\s/g, '');
  const withoutIR = cleaned.replace(/^IR/i, '');
  return `IR ${withoutIR.replace(/(\d{4})(?=\d)/g, '$1 ')}`.trim();
};
