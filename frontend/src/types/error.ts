export type FieldError = {
  field: string;
  fieldMessage: string;
};

export type ApiErrorType = {
  statusCode: number;
  success: boolean;
  message: string;
  errors?: FieldError[];
  data?: {
    remainingTime?: number;
  };
};
