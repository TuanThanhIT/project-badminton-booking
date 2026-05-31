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

  const meta = {
    bookingCode: booking.bookingCode,
    fullName: booking.user?.profile?.fullName,
    username: booking.user?.username,
    phoneNumber: booking.user?.profile?.phoneNumber,
    branchName: booking.branch?.branchName,
    courtName: details
      .map((detail) => detail.court?.courtName)
      .filter(Boolean)
      .join(", "),
    totalAmount: Number(booking.totalAmount || 0),
    depositAmount: Number(booking.depositAmount || 0),
    paymentMethod: booking.payment?.paymentMethod,
    penaltyAmount: Number(booking.penaltyAmount || 0),
  };

  return mailer.sendBookingMail(email, time, date, type, meta);
};
