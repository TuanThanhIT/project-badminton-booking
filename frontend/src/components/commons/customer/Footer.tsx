const Footer = () => {
  return (
    <div>
      <div className="grid grid-cols-4 gap-6 shadow-inner p-8 text-gray-700 bg-gray-100">
        {/* Địa chỉ */}
        <div>
          <h3 className="font-bold text-green-700 mb-2 text-lg">Address</h3>
          <p>Badminton Court Booking & Shop</p>
          <p>456 Nguyen Van Bao, Go Vap District, Ho Chi Minh City</p>
          <p>Phone: +84 987 654 321</p>
          <p>Email: support@badmintonvn.com</p>
          <p>Open hours: Mon - Sun, 6AM - 11PM</p>
        </div>

        {/* Thông tin dịch vụ */}
        <div>
          <h3 className="font-bold text-green-700 mb-2 text-lg">
            Service Information
          </h3>
          <p className="hover:text-orange-500 cursor-pointer">Court booking</p>
          <p className="hover:text-orange-500 cursor-pointer">
            Badminton equipment
          </p>
          <p className="hover:text-orange-500 cursor-pointer">Payment policy</p>
          <p className="hover:text-orange-500 cursor-pointer">
            Shipping & Delivery
          </p>
          <p className="hover:text-orange-500 cursor-pointer">
            Return & Refund
          </p>
        </div>

        {/* Chăm sóc khách hàng */}
        <div>
          <h3 className="font-bold text-green-700 mb-2 text-lg">
            Customer Care
          </h3>
          <p className="hover:text-orange-500 cursor-pointer">
            How to book a court
          </p>
          <p className="hover:text-orange-500 cursor-pointer">Online support</p>
          <p className="hover:text-orange-500 cursor-pointer">
            Terms & Conditions
          </p>
          <p className="hover:text-orange-500 cursor-pointer">Privacy Policy</p>
          <p className="hover:text-orange-500 cursor-pointer">FAQs</p>
        </div>

        {/* Về chúng tôi */}
        <div>
          <h3 className="font-bold text-green-700 mb-2 text-lg">About Us</h3>
          <p className="hover:text-orange-500 cursor-pointer">
            Company introduction
          </p>
          <p className="hover:text-orange-500 cursor-pointer">
            Badminton blog & news
          </p>
          <p className="hover:text-orange-500 cursor-pointer">
            Coach recruitment
          </p>
          <p className="hover:text-orange-500 cursor-pointer">Partnerships</p>
          <p className="hover:text-orange-500 cursor-pointer">Contact us</p>
        </div>

        {/* Bản quyền + mạng xã hội */}
        <div className="col-span-4 mt-8 border-t pt-4 text-center text-sm text-gray-500">
          <p>© 2025 Badminton Booking & Shop. All rights reserved.</p>
          <p>
            Follow us on:
            <span className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer">
              Facebook
            </span>
            ,
            <span className="ml-1 text-sky-500 hover:text-sky-700 cursor-pointer">
              Twitter
            </span>
            ,
            <span className="ml-1 text-pink-500 hover:text-pink-700 cursor-pointer">
              Instagram
            </span>
            ,
            <span className="ml-1 text-red-500 hover:text-red-700 cursor-pointer">
              YouTube
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
