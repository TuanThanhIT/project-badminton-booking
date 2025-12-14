import { useNavigate } from "react-router-dom";
import { Contact2 } from "lucide-react";

const ContactSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white rounded-xl p-8 flex flex-col md:flex-row items-center gap-6 border border-gray-200">
      {/* Icon lớn */}
      <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-sky-100 text-sky-700 rounded-full">
        <Contact2 className="w-8 h-8" />
      </div>

      {/* Nội dung */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-sky-800">Liên hệ B-Hub</h3>
        <p className="text-gray-700">
          Mọi chi tiết, quý khách vui lòng liên hệ qua hotline, email hoặc
          Facebook của chúng tôi.
        </p>
        <button
          onClick={() => navigate("/contact")}
          className="mt-2 w-max px-6 py-2 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition"
        >
          Xem chi tiết
        </button>
      </div>
    </section>
  );
};

export default ContactSection;
