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

const sendBookingMail = async (email, time, date, type = "confirm") => {
  const subjects = {
    confirm: "Xác nhận đặt sân – B-Hub",
    cancel: "Thông báo hủy đặt sân – B-Hub",
    complete: "Hoàn tất đặt sân – B-Hub",
  };

  const messages = {
    confirm: `
      B-Hub xin xác nhận lịch đặt sân của bạn:

      • Thời gian: ${time}
      • Ngày: ${date}

      Khi đến sân, vui lòng cho nhân viên xem email này để nhận sân. Khuyến khích đến trước 10 phút để được hỗ trợ tốt nhất.
    `,
    cancel: `
      B-Hub xin thông báo lịch đặt sân của bạn đã được hủy:

      • Thời gian: ${time}
      • Ngày: ${date}

      Nếu đây không phải yêu cầu của bạn, vui lòng liên hệ B-Hub để được hỗ trợ.
    `,
    complete: `
      B-Hub xin thông báo đặt sân của bạn đã được hoàn tất:

      • Thời gian: ${time}
      • Ngày: ${date}

      Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của B-Hub. Rất mong được phục vụ bạn trong những lần tiếp theo.
    `,
  };

  const htmlMessages = {
    confirm: `
      <p>Chào bạn,</p>
      <p>B-Hub xin xác nhận lịch đặt sân của bạn như sau:</p>

      <ul>
        <li><strong>Thời gian:</strong> ${time}</li>
        <li><strong>Ngày:</strong> ${date}</li>
      </ul>

      <p>Khi đến sân, vui lòng cho nhân viên xem email này để nhận sân. Bạn nên có mặt trước <strong>10 phút</strong> để được hỗ trợ nhanh chóng.</p>

      <p>Trân trọng,<br>B-Hub Support</p>
    `,
    cancel: `
      <p>Chào bạn,</p>
      <p>B-Hub xin thông báo lịch đặt sân của bạn đã được <strong>hủy</strong> với thông tin:</p>

      <ul>
        <li><strong>Thời gian:</strong> ${time}</li>
        <li><strong>Ngày:</strong> ${date}</li>
      </ul>

      <p>Nếu bạn không yêu cầu hủy hoặc cần hỗ trợ thêm, vui lòng liên hệ B-Hub.</p>

      <p>Trân trọng,<br>B-Hub Support</p>
    `,
    complete: `
      <p>Chào bạn,</p>
      <p>B-Hub xin thông báo đặt sân của bạn đã được <strong>hoàn tất</strong> với thông tin sau:</p>

      <ul>
        <li><strong>Thời gian:</strong> ${time}</li>
        <li><strong>Ngày:</strong> ${date}</li>
      </ul>

      <p>Cảm ơn bạn đã tin tưởng lựa chọn B-Hub. Chúc bạn có trải nghiệm vui vẻ và rất mong được phục vụ trong những lần tiếp theo.</p>

      <p>Trân trọng,<br>B-Hub Support</p>
    `,
  };

  await transporter.sendMail({
    from: `"Hỗ trợ B-Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[type],
    text: messages[type],
    html: htmlMessages[type],
  });
};

const formatProductInfo = (products) => {
  return `
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr>
          <th style="padding:8px; border-bottom:1px solid #ccc; text-align:left;">Sản phẩm</th>
          <th style="padding:8px; border-bottom:1px solid #ccc; text-align:center;">Chi tiết</th>
          <th style="padding:8px; border-bottom:1px solid #ccc; text-align:center;">SL</th>
          <th style="padding:8px; border-bottom:1px solid #ccc; text-align:right;">Tạm tính</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (p) => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #eee;">${
              p.productName
            }</td>
            <td style="padding:8px; text-align:center; border-bottom:1px solid #eee;">
              ${p.color || ""} ${p.size || ""} ${p.material || ""}
            </td>
            <td style="padding:8px; text-align:center; border-bottom:1px solid #eee;">${
              p.quantity
            }</td>
            <td style="padding:8px; text-align:right; border-bottom:1px solid #eee;">${p.subTotal.toLocaleString()}đ</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const sendOrderMail = async (
  email,
  orderProducts,
  totalAmount,
  type = "confirm"
) => {
  const formattedProducts = formatProductInfo(orderProducts);

  const subjects = {
    confirm: "Xác nhận đơn hàng – B-Hub",
    cancel: "Thông báo hủy đơn hàng – B-Hub",
    complete: "Hoàn tất đơn hàng – B-Hub",
  };

  const messages = {
    confirm: `
      B-Hub xin xác nhận đơn hàng của bạn:

${formattedProducts}

      Tổng giá trị đơn hàng: ${totalAmount.toLocaleString()}đ

      Đơn hàng đang được chuẩn bị và sẽ sớm giao đến bạn.
    `,
    cancel: `
      B-Hub xin thông báo đơn hàng của bạn đã được hủy:

${formattedProducts}

      Nếu bạn không yêu cầu hủy hoặc cần hỗ trợ thêm, vui lòng liên hệ B-Hub.
    `,
    complete: `
      B-Hub xin thông báo đơn hàng của bạn đã được hoàn tất:

${formattedProducts}

      Tổng giá trị đơn hàng: ${totalAmount.toLocaleString()}đ

      Cảm ơn bạn đã tin tưởng B-Hub. Chúc bạn có trải nghiệm tuyệt vời và hẹn gặp lại!
    `,
  };

  const htmlMessages = {
    confirm: `
      <p>Chào bạn,</p>
      <p>B-Hub xin xác nhận đơn hàng của bạn:</p>

      ${formattedProducts}

      <p style="margin-top:12px;">
        <strong>Tổng giá trị đơn hàng: ${totalAmount.toLocaleString()}đ</strong>
      </p>

      <p>Đơn hàng đang được chuẩn bị và sẽ được gửi đến bạn trong thời gian sớm nhất.</p>
      <p>Trân trọng,<br>B-Hub Support</p>
    `,
    cancel: `
      <p>Chào bạn,</p>
      <p>B-Hub xin thông báo đơn hàng của bạn đã được <strong>hủy</strong>:</p>

      ${formattedProducts}

      <p>Nếu bạn không yêu cầu hủy hoặc cần hỗ trợ thêm, vui lòng liên hệ B-Hub.</p>
      <p>Trân trọng,<br>B-Hub Support</p>
    `,
    complete: `
      <p>Chào bạn,</p>
      <p>B-Hub xin thông báo đơn hàng của bạn đã được <strong>hoàn tất</strong>:</p>

      ${formattedProducts}

      <p style="margin-top:12px;">
        <strong>Tổng giá trị đơn hàng: ${totalAmount.toLocaleString()}đ</strong>
      </p>

      <p>Cảm ơn bạn đã tin tưởng B-Hub. Hẹn gặp lại bạn trong những lần mua sắm tiếp theo.</p>
      <p>Trân trọng,<br>B-Hub Support</p>
    `,
  };

  await transporter.sendMail({
    from: `"Hỗ trợ B-Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[type],
    text: messages[type],
    html: htmlMessages[type],
  });
};

const mailer = {
  sendContactMail,
  sendOtpMail,
  sendBookingMail,
  sendOrderMail,
};

export default mailer;
