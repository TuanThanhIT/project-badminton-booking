import React from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
const Footer = () => {
  return (
    <footer className="bg-blue-400 px-4 md:px-16 lg:px-28 py-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-lg font-bold mb-4 text-white">About us</h2>
          <p className="text-white">
            We are a team dedicated to providing the best products and services
            to our customers.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-4 text-white">Quick link</h2>
          <ul>
            <li>
              <a href="" className="hover:underline text-white ">
                Home
              </a>
            </li>
            <li>
              <a href="" className="hover:underline text-white ">
                Products
              </a>
            </li>
            <li>
              <a href="" className="hover:underline text-white ">
                Users
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-4 text-white">Contact us</h2>
          <ul className="flex space-x-4">
            <li>
              <Phone className="text-white  " />
              <a href="" className="hover:underline text-white ">
                Phone
              </a>
            </li>
            <li>
              <Mail className="text-white" />
              <a href="" className="hover:underline text-white ">
                Mail
              </a>
            </li>
            <li>
              <MessageCircle className="text-white" />
              <a href="" className="hover:underline text-white ">
                Chat
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t p-4 border-white mt-4 flex items-center justify-center">
        <p className="text-white">B-Hub. Tất cả quyền được sao lưu</p>
      </div>
    </footer>
  );
};
export default Footer;
