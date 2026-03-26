import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getBranches } from "../../redux/slices/user/branchSlice";
import type { BranchesRequest } from "../../types/branch";
import { useNavigate } from "react-router-dom";

const BranchPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { branches } = useAppSelector((state) => state.branch);

  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const normalizeCity = (name: string) => {
    if (name.includes("Hồ Chí Minh")) return "TP.HCM";
    return name;
  };

  // Load provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=2")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch(() => setCities([]));
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (!city) {
      setDistricts([]);
      return;
    }

    const selectedCity = cities.find((c) => c.name === city);
    setDistricts(selectedCity?.districts || []);
  }, [city, cities]);

  // Call API branches
  useEffect(() => {
    const data: BranchesRequest = {
      page: 1,
      limit: 10,
    };

    if (city) data.city = normalizeCity(city);
    if (district) data.district = district;

    dispatch(getBranches({ data }));
  }, [city, district, dispatch]);

  // Reset selected branch when filter changes
  useEffect(() => {
    setSelectedBranch(null);
  }, [city, district]);

  const mapQuery = selectedBranch
    ? `${selectedBranch.address}, ${selectedBranch.district}, ${selectedBranch.city}`
    : city || "Vietnam";

  return (
    <div className="w-11/12 mx-auto py-10">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT PANEL */}
        <div className="col-span-4 bg-white border rounded-lg shadow-sm p-4">
          {/* FILTER */}
          <div className="flex flex-col gap-3 mb-4">
            {/* CITY */}
            <select
              className="border p-2 rounded-md"
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

            {/* DISTRICT */}
            <select
              className="border p-2 rounded-md"
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

            {/* RESET */}
            <button
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md text-sm"
              onClick={() => {
                setCity("");
                setDistrict("");
                setSelectedBranch(null);
              }}
            >
              Reset bộ lọc
            </button>
          </div>

          {/* LIST BRANCH */}
          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
            {branches.length === 0 ? (
              <p className="text-center text-gray-500">
                Không có chi nhánh phù hợp
              </p>
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`border-b pb-3 p-2 rounded transition ${
                    selectedBranch?.id === branch.id
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* CLICK NAME -> DETAIL */}
                  <h3
                    onClick={() => navigate(`/branches/${branch.id}`)}
                    className="font-semibold text-md text-blue-700 cursor-pointer hover:underline"
                  >
                    {branch.branchName}
                  </h3>

                  {/* CLICK ADDRESS -> MAP */}
                  <p
                    onClick={() => setSelectedBranch(branch)}
                    className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                  >
                    📍 {branch.address}, {branch.district}, {branch.city}
                  </p>

                  <p className="text-sm text-gray-600">
                    📞 {branch.phoneNumber}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="col-span-8 rounded-lg overflow-hidden shadow-sm border">
          <iframe
            title="map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              mapQuery,
            )}&output=embed`}
            className="w-full h-[600px] border-0"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default BranchPage;
