export interface FieldError {
  field: string;
  fieldMessage: string;
}

export interface ApiErrorType {
  success: boolean;
  message: string;
  errors?: FieldError[];
}
