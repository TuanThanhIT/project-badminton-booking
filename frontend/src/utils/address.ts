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
  const province = provinces.find((p) => p.code == addr.provinceCode)?.name;
  const district = districts.find((d) => d.code == addr.districtCode)?.name;
  const ward = wards.find((w) => w.code == addr.wardCode)?.name;

  return `${addr.address}, ${ward}, ${district}, ${province}`;
};
