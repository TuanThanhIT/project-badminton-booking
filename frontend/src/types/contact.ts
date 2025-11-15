export type ContactRequest = {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
};

export type ContactResponse = {
  message: string;
};
