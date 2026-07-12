import type { FieldError } from "../types/error";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const getString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

const getFieldErrorMessage = (errors: unknown) => {
  if (!Array.isArray(errors)) return undefined;

  const firstError = errors[0] as Partial<FieldError> | undefined;
  return getString(firstError?.fieldMessage);
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Có lỗi xảy ra",
) => {
  const errorRecord = asRecord(error);
  const responseRecord = asRecord(errorRecord?.response);
  const responseData = asRecord(responseRecord?.data);
  const payload = responseData ?? errorRecord;
  const payloadData = asRecord(payload?.data);

  return (
    getFieldErrorMessage(payload?.errors) ||
    getString(payload?.message) ||
    getString(payloadData?.message) ||
    fallback
  );
};
