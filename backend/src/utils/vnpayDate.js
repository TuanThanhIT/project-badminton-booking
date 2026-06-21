export const VNPAY_TIME_ZONE = "Asia/Ho_Chi_Minh";

const vnPayDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VNPAY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export const formatVNPayDate = (date = new Date()) => {
  const parts = Object.fromEntries(
    vnPayDateFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return Number(
    `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`,
  );
};

export const createVNPayDateRange = ({
  now = new Date(),
  expiresInMs = 15 * 60 * 1000,
} = {}) => {
  const expiresAt = new Date(now.getTime() + expiresInMs);

  return {
    now,
    expiresAt,
    createDate: formatVNPayDate(now),
    expireDate: formatVNPayDate(expiresAt),
  };
};

export const logVNPayDiagnostics = ({
  context,
  createDate,
  expireDate,
  paymentUrl,
}) => {
  if (process.env.VNP_DEBUG !== "true") return;

  console.info("[VNPAY_DIAGNOSTICS]", {
    context,
    nodeNowIso: new Date().toISOString(),
    processTZ: process.env.TZ || null,
    resolvedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    vnpTimeZone: VNPAY_TIME_ZONE,
    vnpCreateDate: createDate,
    vnpExpireDate: expireDate,
    vnpUrl: process.env.VNP_URL || null,
    vnpReturnUrl: process.env.VNP_RETURN_URL || null,
    vnpIpnUrl: process.env.VNP_IPN_URL || null,
    paymentUrl,
  });
};
