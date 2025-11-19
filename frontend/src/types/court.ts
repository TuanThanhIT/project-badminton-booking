export type CourtListResponse = {
  courts: CourtListInfo[];
  total: number;
  page: number;
  limit: number;
};

export type CourtListInfo = {
  id: number;
  name: string;
  location: string;
  thumbnailUrl: string;
  date: string;
  availableSlots: number;
};

export type CourtListRequest = {
  date: string | undefined;
  page: number | undefined;
  limit: number | undefined;
};

export type CourtPriceResponse = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  price: number;
  periodType: string;
}[];

export type CourtPrice = {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  price: number;
  periodType: string;
};

export type CourtScheduleResponse = {
  id: number;
  name: string;
  location: string;
  thumbnailUrl: string;
  courtSchedules: CourtScheduleInfo[];
};

export type CourtScheduleInfo = {
  id: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type CourtScheduleRequest = {
  courtId: number;
  date: string;
};
