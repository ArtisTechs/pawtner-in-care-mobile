export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type CalendarDayCell = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
};

export const createCalendarDate = (
  year: number,
  monthIndex: number,
  day: number,
) => new Date(year, monthIndex, day, 12, 0, 0, 0);

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const isSameCalendarDate = (left: Date, right: Date) =>
  toDateKey(left) === toDateKey(right);

export const getMonthTitle = (date: Date) =>
  `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

export const buildMonthGrid = (monthDate: Date): CalendarDayCell[] => {
  const monthStart = createCalendarDate(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1,
  );
  const monthIndex = monthStart.getMonth();
  const startOffset = monthStart.getDay();
  const gridStart = createCalendarDate(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    1 - startOffset,
  );
  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const cellDate = createCalendarDate(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );

    cells.push({
      date: cellDate,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === monthIndex,
    });
  }

  return cells;
};
