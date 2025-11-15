import type { ContactRequest } from "../types/contact";
import instance from "../utils/axiosCustomize";

const submitContact = async (data: ContactRequest) =>
  instance.post("/user/contact/submit", data);

const contactService = {
  submitContact,
};
export default contactService;
