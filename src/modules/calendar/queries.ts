import { queryOptions } from "@tanstack/react-query";
import { $getCalendarStatus } from "./get-calendar-status";

export const calendarQueries = {
  getStatus: () =>
    queryOptions({
      queryKey: ["calendar", "status"],
      queryFn: () => $getCalendarStatus(),
    }),
};
