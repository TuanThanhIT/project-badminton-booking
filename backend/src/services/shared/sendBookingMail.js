import mailer from "../../helpers/mailer.js";

// Gửi mail đặt sân về cho khách
export const handleSendBookingMail = (booking, type) => {
  const email = booking?.user?.email;
  const details = booking?.details || booking?.bookingDetails || [];
  const firstDetail = details[0];
  const date =
    firstDetail?.playDate || firstDetail?.courtSchedule?.date || "";
  const time = details
    .map(
      (d) =>
        `${(d.startTime || d.courtSchedule?.startTime || "").substring(
          0,
          5,
        )} - ${(d.endTime || d.courtSchedule?.endTime || "").substring(0, 5)}`,
    )
    .join(", ");

  if (!email || !date || !time) return Promise.resolve();

  return mailer.sendBookingMail(email, time, date, type);
};
