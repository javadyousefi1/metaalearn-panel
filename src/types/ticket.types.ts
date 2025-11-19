// Ticket Enums
export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3,
}

export enum TicketStatus {
  Open = 0,
  InProgress = 1,
  Answered = 2,
  Resolved = 3,
  Closed = 4,
}

export enum TicketType {
  General = 0,
  Financial = 1,
  Technical = 2,
  Purchase = 3,
}

export enum TicketAttachmentType {
  Image = 0,
  Zip = 1,
}

// User Info
export interface TicketUserInfo {
  fullNameFa: string;
  imageUrl: string;
  id: string;
}

// Ticket Item
export interface TicketListItem {
  title: string;
  type: string;
  status: string;
  userInfo: TicketUserInfo;
  score: number | null;
  createdTime: string;
  updatedTime: string | null;
  id: string;
}

// API Request/Response
export interface GetAllTicketsParams {
  PageIndex: number;
  PageSize: number;
}

export interface AllTicketsResponse {
  items: TicketListItem[];
  totalCount: number;
}

// Helper functions for ticket type display
export const getTicketTypeName = (type: TicketType | string): string => {
  if (typeof type === 'string') {
    switch (type) {
      case 'General':
        return 'عمومی';
      case 'Financial':
        return 'مالی';
      case 'Technical':
        return 'فنی';
      case 'Purchase':
        return 'خرید';
      default:
        return 'نامشخص';
    }
  }

  switch (type) {
    case TicketType.General:
      return 'عمومی';
    case TicketType.Financial:
      return 'مالی';
    case TicketType.Technical:
      return 'فنی';
    case TicketType.Purchase:
      return 'خرید';
    default:
      return 'نامشخص';
  }
};

export const getTicketTypeColor = (type: TicketType | string): string => {
  if (typeof type === 'string') {
    switch (type) {
      case 'General':
        return 'blue';
      case 'Financial':
        return 'green';
      case 'Technical':
        return 'orange';
      case 'Purchase':
        return 'purple';
      default:
        return 'default';
    }
  }

  switch (type) {
    case TicketType.General:
      return 'blue';
    case TicketType.Financial:
      return 'green';
    case TicketType.Technical:
      return 'orange';
    case TicketType.Purchase:
      return 'purple';
    default:
      return 'default';
  }
};

// Helper functions for ticket status display
export const getTicketStatusName = (status: TicketStatus | string): string => {
  if (typeof status === 'string') {
    switch (status) {
      case 'Open':
        return 'باز';
      case 'InProgress':
        return 'در حال بررسی';
      case 'Answered':
        return 'پاسخ داده شده';
      case 'Resolved':
        return 'حل شده';
      case 'Closed':
        return 'بسته شده';
      default:
        return 'نامشخص';
    }
  }

  switch (status) {
    case TicketStatus.Open:
      return 'باز';
    case TicketStatus.InProgress:
      return 'در حال بررسی';
    case TicketStatus.Answered:
      return 'پاسخ داده شده';
    case TicketStatus.Resolved:
      return 'حل شده';
    case TicketStatus.Closed:
      return 'بسته شده';
    default:
      return 'نامشخص';
  }
};

export const getTicketStatusColor = (status: TicketStatus | string): string => {
  if (typeof status === 'string') {
    switch (status) {
      case 'Open':
        return 'blue';
      case 'InProgress':
        return 'orange';
      case 'Answered':
        return 'cyan';
      case 'Resolved':
        return 'green';
      case 'Closed':
        return 'default';
      default:
        return 'default';
    }
  }

  switch (status) {
    case TicketStatus.Open:
      return 'blue';
    case TicketStatus.InProgress:
      return 'orange';
    case TicketStatus.Answered:
      return 'cyan';
    case TicketStatus.Resolved:
      return 'green';
    case TicketStatus.Closed:
      return 'default';
    default:
      return 'default';
  }
};

// Helper functions for ticket priority display
export const getTicketPriorityName = (priority: TicketPriority): string => {
  switch (priority) {
    case TicketPriority.Low:
      return 'کم';
    case TicketPriority.Medium:
      return 'متوسط';
    case TicketPriority.High:
      return 'زیاد';
    case TicketPriority.Urgent:
      return 'فوری';
    default:
      return 'نامشخص';
  }
};

export const getTicketPriorityColor = (priority: TicketPriority): string => {
  switch (priority) {
    case TicketPriority.Low:
      return 'default';
    case TicketPriority.Medium:
      return 'blue';
    case TicketPriority.High:
      return 'orange';
    case TicketPriority.Urgent:
      return 'red';
    default:
      return 'default';
  }
};
