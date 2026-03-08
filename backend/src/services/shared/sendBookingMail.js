import mailer from "../../helpers/mailer.js";

// Gửi mail đặt sân về cho khách
export const handleSendBookingMail = (booking, type) => {
  const email = booking?.user?.email;
  const date = booking.bookingDetails[0].courtSchedule.date;
  const time = booking.bookingDetails
    .map(
      (d) =>
        `${d.courtSchedule.startTime.substring(
          0,
          5,
        )} - ${d.courtSchedule.endTime.substring(0, 5)}`,
    )
    .join(", ");

  return mailer.sendBookingMail(email, time, date, type);
};
