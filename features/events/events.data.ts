import { MONTH_LABELS } from "@/features/events/events-calendar";
import type { EventItem } from "@/features/events/events.types";

const formatEventDate = (year: number, month: number, day: number) =>
  `${String(day).padStart(2, "0")} ${MONTH_LABELS[month - 1]} ${year}`;

const formatIsoDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const getTodayParts = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
};

const todayParts = getTodayParts();

const localTodayDateText = formatEventDate(
  todayParts.year,
  todayParts.month,
  todayParts.day,
);
const todayIsoDate = formatIsoDate(
  todayParts.year,
  todayParts.month,
  todayParts.day,
);

const getDatePartsFromOffset = (offsetDays: number) => {
  const targetDate = new Date(
    todayParts.year,
    todayParts.month - 1,
    todayParts.day + offsetDays,
    12,
    0,
    0,
    0,
  );
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  return {
    year,
    month,
    day,
    eventDate: formatEventDate(year, month, day),
    isoDate: formatIsoDate(year, month, day),
  };
};

const eventsTomorrow = getDatePartsFromOffset(1);
const eventsThreeDaysLater = getDatePartsFromOffset(3);
const eventsNextWeek = getDatePartsFromOffset(7);
const eventsTwoWeeksLater = getDatePartsFromOffset(14);

const localYesterday = getDatePartsFromOffset(-1);
const localTwoDaysLater = getDatePartsFromOffset(2);
const localFiveDaysLater = getDatePartsFromOffset(5);
const localTwoWeeksLater = getDatePartsFromOffset(14);
const localNextMonth = getDatePartsFromOffset(35);
const localThreeMonthsLater = getDatePartsFromOffset(95);

export const EVENTS_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
  eventPlaceholder: require("../../assets/images/events-icon.png"),
} as const;

export const EVENTS_MOCK_DATA: EventItem[] = [
  {
    id: `event-today-${todayIsoDate}-1`,
    title: "Paw Care Community Day",
    type: "events",
    image:
      "https://images.pexels.com/photos/6568486/pexels-photo-6568486.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Meet pet owners, adopters, and volunteer groups for free guidance and quick wellness tips.",
    eventDate: localTodayDateText,
    startDate: todayIsoDate,
    endDate: todayIsoDate,
    timeLabel: "Time",
    timeValue: "10 AM to 12 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: true,
    month: todayParts.month,
    year: todayParts.year,
    day: todayParts.day,
  },
  {
    id: `event-today-${todayIsoDate}-2`,
    title: "Adoption Meet & Greet",
    type: "events",
    image:
      "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Connect with rescue teams and meet adoptable pets in a friendly, family-ready environment.",
    eventDate: localTodayDateText,
    startDate: todayIsoDate,
    endDate: todayIsoDate,
    timeLabel: "Time",
    timeValue: "2 PM to 5 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: todayParts.month,
    year: todayParts.year,
    day: todayParts.day,
  },
  {
    id: `event-${eventsTomorrow.isoDate}-1`,
    title: "Pet First Aid Basics",
    type: "events",
    image:
      "https://images.pexels.com/photos/6568500/pexels-photo-6568500.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "A short workshop covering emergency checks, safe transport, and basic pet first aid routines.",
    eventDate: eventsTomorrow.eventDate,
    startDate: eventsTomorrow.isoDate,
    endDate: eventsTomorrow.isoDate,
    timeLabel: "Time",
    timeValue: "1 PM to 3 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: eventsTomorrow.month,
    year: eventsTomorrow.year,
    day: eventsTomorrow.day,
  },
  {
    id: `event-${eventsThreeDaysLater.isoDate}-1`,
    title: "Paw Run Community Warmup",
    type: "events",
    image:
      "https://images.pexels.com/photos/7210263/pexels-photo-7210263.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Join a light community walk and wellness stop with hydration booths and adoption support volunteers.",
    eventDate: eventsThreeDaysLater.eventDate,
    startDate: eventsThreeDaysLater.isoDate,
    endDate: eventsThreeDaysLater.isoDate,
    timeLabel: "Time",
    timeValue: "6 AM to 9 AM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: eventsThreeDaysLater.month,
    year: eventsThreeDaysLater.year,
    day: eventsThreeDaysLater.day,
  },
  {
    id: `event-${eventsNextWeek.isoDate}-1`,
    title: "Shelter Supply Drive",
    type: "events",
    image:
      "https://images.pexels.com/photos/6235233/pexels-photo-6235233.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Donate pet food, medicine, and care kits. Partner groups will match selected donations on-site.",
    eventDate: eventsNextWeek.eventDate,
    startDate: eventsNextWeek.isoDate,
    endDate: eventsNextWeek.isoDate,
    timeLabel: "Time",
    timeValue: "9 AM to 1 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: true,
    month: eventsNextWeek.month,
    year: eventsNextWeek.year,
    day: eventsNextWeek.day,
  },
  {
    id: `event-${eventsTwoWeeksLater.isoDate}-1`,
    title: "Pet Nutrition 101",
    type: "events",
    image:
      "https://images.pexels.com/photos/5732476/pexels-photo-5732476.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Learn practical feeding plans for rescue pets, senior pets, and special dietary cases.",
    eventDate: eventsTwoWeeksLater.eventDate,
    startDate: eventsTwoWeeksLater.isoDate,
    endDate: eventsTwoWeeksLater.isoDate,
    timeLabel: "Time",
    timeValue: "3 PM to 5 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: eventsTwoWeeksLater.month,
    year: eventsTwoWeeksLater.year,
    day: eventsTwoWeeksLater.day,
  },
  {
    id: "event-2019-09-05",
    title: "CR Summer East - 2019",
    type: "events",
    image:
      "https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Join us for a pet-friendly art and activity fair with mini workshops and adoption booths.",
    eventDate: formatEventDate(2019, 9, 5),
    startDate: "2019-09-05",
    endDate: "2019-09-05",
    timeLabel: "Time",
    timeValue: "2 PM to 4 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: true,
    month: 9,
    year: 2019,
    day: 5,
  },
  {
    id: "event-2019-09-16",
    title: "CR Summer East - 2019",
    type: "events",
    image:
      "https://images.pexels.com/photos/7469213/pexels-photo-7469213.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Enjoy a community day with pet wellness talks, games, and support booths for local shelters.",
    eventDate: formatEventDate(2019, 9, 16),
    startDate: "2019-09-16",
    endDate: "2019-09-16",
    timeLabel: "Time",
    timeValue: "2 PM to 4 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: 9,
    year: 2019,
    day: 16,
  },
  {
    id: "event-2019-09-23",
    title: "Pawtner Weekend Meetup - 2019",
    type: "events",
    image:
      "https://images.pexels.com/photos/5731865/pexels-photo-5731865.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Meet local adopters, rescue volunteers, and veterinary partners in one friendly weekend session.",
    eventDate: formatEventDate(2019, 9, 23),
    startDate: "2019-09-23",
    endDate: "2019-09-23",
    timeLabel: "Time",
    timeValue: "9 AM to 11 AM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: 9,
    year: 2019,
    day: 23,
  },
  {
    id: "local-event-today",
    title: "Local Volunteer Booth",
    type: "local",
    image:
      "https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Visit our local volunteer booth and learn how to foster rescued animals in your community.",
    eventDate: localTodayDateText,
    startDate: todayIsoDate,
    endDate: todayIsoDate,
    timeLabel: "Time",
    timeValue: "1 PM to 3 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: true,
    month: todayParts.month,
    year: todayParts.year,
    day: todayParts.day,
  },
  {
    id: `local-event-today-${todayIsoDate}-2`,
    title: "Local Grooming Support Day",
    type: "local",
    image:
      "https://images.pexels.com/photos/4587982/pexels-photo-4587982.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Free quick grooming consults and hygiene tips for first-time adopters and foster families.",
    eventDate: localTodayDateText,
    startDate: todayIsoDate,
    endDate: todayIsoDate,
    timeLabel: "Time",
    timeValue: "4 PM to 6 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: todayParts.month,
    year: todayParts.year,
    day: todayParts.day,
  },
  {
    id: `local-event-${localYesterday.isoDate}-1`,
    title: "Neighborhood Vet Q&A",
    type: "local",
    image:
      "https://images.pexels.com/photos/6234615/pexels-photo-6234615.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "A neighborhood veterinary open forum focused on preventive care and vaccination scheduling.",
    eventDate: localYesterday.eventDate,
    startDate: localYesterday.isoDate,
    endDate: localYesterday.isoDate,
    timeLabel: "Time",
    timeValue: "5 PM to 7 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: localYesterday.month,
    year: localYesterday.year,
    day: localYesterday.day,
  },
  {
    id: `local-event-${localTwoDaysLater.isoDate}-1`,
    title: "Barangay Adoption Caravan",
    type: "local",
    image:
      "https://images.pexels.com/photos/4587978/pexels-photo-4587978.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Meet adoptable pets and process pre-screening forms with local shelter representatives.",
    eventDate: localTwoDaysLater.eventDate,
    startDate: localTwoDaysLater.isoDate,
    endDate: localTwoDaysLater.isoDate,
    timeLabel: "Time",
    timeValue: "8 AM to 11 AM",
    facebookUrl: "https://facebook.com",
    isFeatured: true,
    month: localTwoDaysLater.month,
    year: localTwoDaysLater.year,
    day: localTwoDaysLater.day,
  },
  {
    id: `local-event-${localFiveDaysLater.isoDate}-1`,
    title: "Pet Care Starter Class",
    type: "local",
    image:
      "https://images.pexels.com/photos/4587990/pexels-photo-4587990.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Starter class for new adopters about feeding routines, crate safety, and social adaptation.",
    eventDate: localFiveDaysLater.eventDate,
    startDate: localFiveDaysLater.isoDate,
    endDate: localFiveDaysLater.isoDate,
    timeLabel: "Time",
    timeValue: "10 AM to 12 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: localFiveDaysLater.month,
    year: localFiveDaysLater.year,
    day: localFiveDaysLater.day,
  },
  {
    id: `local-event-${localTwoWeeksLater.isoDate}-1`,
    title: "Weekend Rescue Meet",
    type: "local",
    image:
      "https://images.pexels.com/photos/1904104/pexels-photo-1904104.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Support local rescues and meet volunteer coordinators for foster and transport opportunities.",
    eventDate: localTwoWeeksLater.eventDate,
    startDate: localTwoWeeksLater.isoDate,
    endDate: localTwoWeeksLater.isoDate,
    timeLabel: "Time",
    timeValue: "2 PM to 5 PM",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: localTwoWeeksLater.month,
    year: localTwoWeeksLater.year,
    day: localTwoWeeksLater.day,
  },
  {
    id: `local-event-${localNextMonth.isoDate}-1`,
    title: "Monthly Local Pet Fair",
    type: "local",
    image:
      "https://images.pexels.com/photos/7210348/pexels-photo-7210348.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "A monthly fair featuring adoption booths, low-cost vaccines, and local pet supply sellers.",
    eventDate: localNextMonth.eventDate,
    startDate: localNextMonth.isoDate,
    endDate: localNextMonth.isoDate,
    timeLabel: "Date",
    timeValue: localNextMonth.eventDate,
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: localNextMonth.month,
    year: localNextMonth.year,
    day: localNextMonth.day,
  },
  {
    id: `local-event-${localThreeMonthsLater.isoDate}-1`,
    title: "Annual Community Pet Summit",
    type: "local",
    image:
      "https://images.pexels.com/photos/6568487/pexels-photo-6568487.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "A yearly summit with local clinics, rescue organizations, and community adoption leaders.",
    eventDate: localThreeMonthsLater.eventDate,
    startDate: localThreeMonthsLater.isoDate,
    endDate: localThreeMonthsLater.isoDate,
    timeLabel: "Date",
    timeValue: localThreeMonthsLater.eventDate,
    facebookUrl: "https://facebook.com",
    isFeatured: true,
    month: localThreeMonthsLater.month,
    year: localThreeMonthsLater.year,
    day: localThreeMonthsLater.day,
  },
  {
    id: "local-event-2026-03-03",
    title: "Close To Visitor - 2026",
    type: "local",
    image:
      "https://images.pexels.com/photos/1904105/pexels-photo-1904105.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "Thank you for your understanding. See you in April for our next outreach sessions.",
    eventDate: formatEventDate(2026, 3, 3),
    startDate: "2026-03-25",
    endDate: "2026-04-02",
    timeLabel: "Date",
    timeValue: "March 25, 2026 to April 2, 2026",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: 3,
    year: 2026,
    day: 3,
  },
  {
    id: "local-event-2026-03-06",
    title: "FUR-EVER Pink - 2026",
    type: "local",
    image:
      "https://images.pexels.com/photos/5732493/pexels-photo-5732493.jpeg?auto=compress&cs=tinysrgb&w=260&h=260&dpr=2",
    description:
      "A pet-friendly fair with drinks and support for rescued animals at Noah's Ark Dog and Cat Shelter.",
    eventDate: formatEventDate(2026, 3, 6),
    startDate: "2026-03-06",
    endDate: "2026-03-06",
    timeLabel: "Time",
    timeValue: "No Time or Date set",
    facebookUrl: "https://facebook.com",
    isFeatured: false,
    month: 3,
    year: 2026,
    day: 6,
  },
];
