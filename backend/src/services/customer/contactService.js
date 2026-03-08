import mailer from "../../helpers/mailer.js";

const submitContactService = async (data) => {
  const { fullName, email, phoneNumber, subject, message } = data;
  await mailer.sendContactMail({
    fullName,
    email,
    phoneNumber,
    subject,
    message,
  });
};

const contactService = {
  submitContactService,
};
export default contactService;
