import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import contactService from "../../services/customer/contactService.js";

const submitContact = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await contactService.submitContactService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Cảm ơn bạn đã gửi phản hồi. Chúng tôi đã nhận được và sẽ xử lý trong thời gian sớm nhất!",
      ),
    );
});

const contactController = {
  submitContact,
};
export default contactController;
