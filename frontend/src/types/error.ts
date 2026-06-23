export type FieldError = {
  field: string;
  fieldMessage: string;
};

export type ApiErrorType = {
  statusCode: number;
  success: boolean;
  message: string;
  forceLogout?: boolean;
  accountStatus?: string;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
  errors?: FieldError[];
  data?: {
    remainingTime?: number;
    forceLogout?: boolean;
    accountStatus?: string;
    suspendedUntil?: string | null;
    suspensionReason?: string | null;
    violationCount?: number;
  };
};
