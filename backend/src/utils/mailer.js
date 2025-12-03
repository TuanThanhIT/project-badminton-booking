// utils/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // nếu dùng Gmail
  auth: {
    user: process.env.EMAIL_USER, // email gửi
    pass: process.env.EMAIL_PASS, // app password (không phải mật khẩu Gmail thường)
  },
});

const sendOtpMail = async (email, otpCode) => {
  await transporter.sendMail({
    from: `"Hỗ trợ B-Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã OTP xác thực tài khoản",
    text: `Mã OTP của bạn là: ${otpCode}`,
    html: `<p>Mã OTP của bạn là: <b>${otpCode}</b></p><p>Có hiệu lực trong 5 phút.</p>`,
  });
};

export const sendContactMail = async ({
  fullName,
  email,
  phoneNumber,
  subject,
  message,
}) => {
  await transporter.sendMail({
    from: `"Khách hành: ${fullName}"<${process.env.EMAIL_USER}>`, // email hợp lệ của cửa hàng
    replyTo: email, // email người dùng nhập
    to: process.env.EMAIL_USER, // email nhận thông báo
    subject: subject || "Form liên hệ từ website",
    text: `Họ tên: ${fullName}\nEmail: ${email}\nSĐT: ${
      phoneNumber || "không có"
    }\n\nNội dung:\n${message}`,
    html: `<p><b>Họ tên:</b> ${fullName}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>SĐT:</b> ${phoneNumber || "không có"}</p>
             <p><b>Nội dung:</b><br/>${message}</p>`,
  });
};

const mailer = {
  sendContactMail,
  sendOtpMail,
};

export default mailer;
