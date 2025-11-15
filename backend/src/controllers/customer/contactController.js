import contactService from "../../services/customer/contactService.js";

const submitContact = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, subject, message } = req.body;
    await contactService.submitContactService(
      fullName,
      email,
      phoneNumber,
      subject,
      message
    );
    return res.status(200).json({
      message:
        "Cảm ơn bạn đã gửi phản hồi. Chúng tôi đã nhận được và sẽ xử lý trong thời gian sớm nhất!",
    });
  } catch (error) {
    next(error);
  }
};

const contactController = {
  submitContact,
};
export default contactController;
