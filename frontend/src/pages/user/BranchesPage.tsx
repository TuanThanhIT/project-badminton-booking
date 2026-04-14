import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { BranchesRequest } from "../../types/branch";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Search,
  ChevronRight,
  Map as MapIcon,
  Filter,
  RotateCcw,
  Navigation2,
} from "lucide-react";
import { getPagedBranches } from "../../redux/slices/user/branchSlice";

const BranchPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const pagedBranch = useAppSelector((state) => state.branch.pagedBranch);

  const branches = pagedBranch?.branches || [];

  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const normalizeCity = (name: string) => {
    if (name.includes("Hồ Chí Minh")) return "TP.HCM";
    return name;
  };

  // ================= LOAD PROVINCES =================

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=2")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch(() => setCities([]));
  }, []);

  // ================= LOAD DISTRICTS =================

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      return;
    }

    const selectedCity = cities.find((c) => c.name === city);
    setDistricts(selectedCity?.districts || []);
  }, [city, cities]);

  // ================= CALL API =================

  useEffect(() => {
    const data: BranchesRequest = {
      page: 1,
      limit: 10,
    };

    if (city) data.provinceName = normalizeCity(city);
    if (district) data.districtName = district;

    dispatch(getPagedBranches({ data }));
  }, [city, district, dispatch]);

  useEffect(() => {
    setSelectedBranch(null);
  }, [city, district]);

  // ================= MAP QUERY =================

  const mapQuery = selectedBranch
    ? `${selectedBranch.latitude},${selectedBranch.longitude}`
    : city
      ? `${city}, Vietnam`
      : "Vietnam";

  return (
    <div className="min-h-screen pb-20">
      {/* HEADER SECTION */}
      <div className="bg-sky-900 text-white py-12 mb-10">
        <div className="w-11/12 mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MapIcon className="text-sky-400" /> Hệ thống chi nhánh B-Hub
          </h1>
          <p className="text-sky-200 mt-2">
            Tìm kiếm sân cầu lông gần bạn nhất và bắt đầu trải nghiệm
          </p>
        </div>
      </div>

      <div className="w-11/12 mx-auto">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT PANEL */}

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* FILTER CARD */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                <Filter size={18} className="text-sky-600" />
                <span>Bộ lọc tìm kiếm</span>
              </div>

              <div className="flex flex-col gap-4">
                {/* CITY */}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">
                    Thành phố
                  </label>

                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none appearance-none transition-all cursor-pointer text-sm"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setDistrict("");
                      }}
                    >
                      <option value="">Tất cả thành phố</option>

                      {cities.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                {/* DISTRICT */}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">
                    Quận / Huyện
                  </label>

                  <div className="relative">
                    <select
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none appearance-none transition-all cursor-pointer text-sm ${
                        !city
                          ? "bg-gray-100 text-gray-400"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!city}
                    >
                      <option value="">Chọn quận/huyện</option>

                      {districts.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                {/* RESET FILTER */}

                <button
                  className="flex items-center justify-center gap-2 mt-2 text-sm text-sky-600 font-medium hover:text-sky-700 transition"
                  onClick={() => {
                    setCity("");
                    setDistrict("");
                    setSelectedBranch(null);
                  }}
                >
                  <RotateCcw size={16} /> Làm mới bộ lọc
                </button>
              </div>
            </div>

            {/* LIST BRANCH CARD */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-sm">
                  Kết quả ({branches.length})
                </span>
              </div>

              <div className="flex flex-col max-h-[550px] overflow-y-auto custom-scrollbar">
                {branches.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-400" size={24} />
                    </div>

                    <p className="text-gray-500 text-sm">
                      Không tìm thấy chi nhánh nào
                    </p>
                  </div>
                ) : (
                  branches.map((branch) => (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch)}
                      className={`p-5 border-b border-gray-50 cursor-pointer transition-all relative group ${
                        selectedBranch?.id === branch.id
                          ? "bg-sky-50 border-l-4 border-l-sky-500"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sky-900 group-hover:text-sky-600 transition-colors">
                          {branch.branchName}
                        </h3>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/branches/${branch.id}`);
                          }}
                          className="p-1 hover:bg-sky-100 rounded-full text-sky-600 transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin
                            size={16}
                            className="text-sky-500 mt-0.5 shrink-0"
                          />

                          <p>
                            {branch.address}, {branch.districtName},{" "}
                            {branch.provinceName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone
                            size={16}
                            className="text-green-500 shrink-0"
                          />
                          <p>{branch.phoneNumber}</p>
                        </div>
                      </div>

                      {selectedBranch?.id === branch.id && (
                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-sky-600 uppercase tracking-wider">
                          <Navigation2 size={12} fill="currentColor" /> Đang
                          hiển thị trên bản đồ
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: MAP */}

          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 h-[750px] sticky top-10">
              {selectedBranch && (
                <div className="absolute top-6 left-6 right-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-sky-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-sky-600 uppercase mb-1">
                      Đang xem vị trí:
                    </p>

                    <h4 className="font-bold text-gray-900">
                      {selectedBranch.branchName}
                    </h4>
                  </div>

                  <button
                    onClick={() => navigate(`/branches/${selectedBranch.id}`)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-sky-700 transition"
                  >
                    Đặt sân tại đây
                  </button>
                </div>
              )}

              <iframe
                title="map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  mapQuery,
                )}&z=16&output=embed`}
                className="w-full h-full rounded-[1.6rem] border-0"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchPage;
