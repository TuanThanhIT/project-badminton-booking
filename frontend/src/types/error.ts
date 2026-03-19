export interface FieldError {
  field: string;
  fieldMessage: string;
}

export interface ApiErrorType {
  statusCode: number;
  success: boolean;
  message: string;
  errors?: FieldError[];
}
