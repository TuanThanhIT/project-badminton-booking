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

export type CourtScheduleEplRequest = {
  date: string;
};

export type CourtScheduleEplResponse = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  court: {
    name: string;
  };
  price: number;
}[];
///Admin
export type CourtItem = {
  id: number;
  name: string;
  location: string;
  thumbnailUrl: string;
};

export type CreateCourtRequest = {
  name: string;
  location: string;
  file?: File; // file upload thumbnail
};

export type CourtPriceItem = {
  id: number;
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  startTime: string; // TIME
  endTime: string; // TIME
  price: number;
  periodType: "Daytime" | "Evening" | "Weekend";
};

export type CreateCourtPriceRequest = {
  dayOfWeek: CourtPriceItem["dayOfWeek"];
  startTime: string;
  endTime: string;
  price: number;
  periodType: CourtPriceItem["periodType"];
};

export type CourtScheduleItem = {
  id: number;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  courtId: number;
};

export type CreateWeeklySlotsRequest = {
  startDate: string; // YYYY-MM-DD
};
