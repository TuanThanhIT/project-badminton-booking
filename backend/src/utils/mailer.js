// utils/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // nếu dùng Gmail
  auth: {
    user: process.env.EMAIL_USER, // email gửi
    pass: process.env.EMAIL_PASS, // app password (không phải mật khẩu Gmail thường)
  },
});

const sendOtpMail = async (to, otpCode) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Mã OTP xác thực tài khoản",
    text: `Mã OTP của bạn là: ${otpCode}`,
    html: `<p>Mã OTP của bạn là: <b>${otpCode}</b></p><p>Có hiệu lực trong 5 phút.</p>`,
  });
};

export default sendOtpMail;
