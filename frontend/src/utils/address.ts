import type { District, FullAddress, Province, Ward } from "../types/address";

type AddressProps = {
  addr: FullAddress;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
};

export const formatAddress = ({
  addr,
  provinces,
  districts,
  wards,
}: AddressProps) => {
  const province = provinces.find((p) => p.ProvinceID == addr.provinceCode)?.ProvinceName;
  const district = districts.find((d) => d.DistrictID == addr.districtCode)?.DistrictName;
  const ward = wards.find((w) => w.WardCode == String(addr.wardCode))?.WardName;

  return `${addr.address}, ${ward}, ${district}, ${province}`;
};
