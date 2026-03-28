import type {
  DonationCauseItem,
  DonationFilter,
  DonationPaymentMethod,
} from "@/features/donations/donations.types";

type DonationFilterOption = {
  key: DonationFilter;
  label: string;
};

export const DONATION_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
  donateIcon: require("../../assets/images/donate-icon.png"),
  frontPageIcon: require("../../assets/images/donate-front-page-icon.png"),
  profileAvatar: require("../../assets/images/cat.png"),
  defaultCauseImage: require("../../assets/images/dog.png"),
} as const;

export const DONATION_FILTER_OPTIONS: DonationFilterOption[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "health", label: "Health" },
  { key: "foods", label: "Foods" },
];

export const DONATION_CAUSES_MOCK_DATA: DonationCauseItem[] = [
  {
    id: "donation-cause-critical-surgery",
    title: "Critical Care Surgery",
    description: "For animals that require immediate surgery treatment to survive.",
    shortLabel: "Operation",
    category: "health",
    image:
      "https://images.pexels.com/photos/6235233/pexels-photo-6235233.jpeg?auto=compress&cs=tinysrgb&w=280&h=280&dpr=2",
    raisedAmount: 10000,
    targetAmount: 40000,
    isUrgent: true,
    featuredOnHome: true,
    homeSection: "urgent-fundraising",
  },
  {
    id: "donation-cause-critical-food",
    title: "Critical Food Supply",
    description: "For time-sensitive feeding programs for rescued cats and dogs.",
    shortLabel: "Food Support",
    category: "foods",
    image:
      "https://images.pexels.com/photos/4587996/pexels-photo-4587996.jpeg?auto=compress&cs=tinysrgb&w=280&h=280&dpr=2",
    raisedAmount: 14000,
    targetAmount: 40000,
    isUrgent: true,
    featuredOnHome: true,
    homeSection: "urgent-fundraising",
  },
  {
    id: "donation-cause-immediate-shelter",
    title: "Immediate Shelter Support",
    description: "To provide warm shelter and safe temporary homes for strays.",
    shortLabel: "Shelter",
    category: "shelter",
    image:
      "https://images.pexels.com/photos/1904105/pexels-photo-1904105.jpeg?auto=compress&cs=tinysrgb&w=280&h=280&dpr=2",
    raisedAmount: 10000,
    targetAmount: 40000,
    isUrgent: true,
    featuredOnHome: true,
    homeSection: "urgent-fundraising",
  },
  {
    id: "donation-cause-food-nutrition",
    title: "Food & Nutrition",
    description: "Sustain balanced meals for rescued and recovering animals.",
    shortLabel: "Food",
    category: "foods",
    image:
      "https://images.pexels.com/photos/5732476/pexels-photo-5732476.jpeg?auto=compress&cs=tinysrgb&w=280&h=280&dpr=2",
    raisedAmount: 12000,
    targetAmount: 40000,
    isUrgent: false,
    featuredOnHome: true,
    homeSection: "fund-strays",
  },
  {
    id: "donation-cause-medical-care",
    title: "Medical Care",
    description: "Support medicine, diagnostics, and treatment for rescued pets.",
    shortLabel: "Medical",
    category: "health",
    image:
      "https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=280&h=280&dpr=2",
    raisedAmount: 10000,
    targetAmount: 40000,
    isUrgent: false,
    featuredOnHome: true,
    homeSection: "fund-strays",
  },
  {
    id: "donation-cause-spay-neuter-programs",
    title: "Spay & Neuter Programs",
    description: "Fund sterilization programs to reduce stray overpopulation.",
    shortLabel: "Program",
    category: "health",
    image:
      "https://images.pexels.com/photos/6235668/pexels-photo-6235668.jpeg?auto=compress&cs=tinysrgb&w=280&h=280&dpr=2",
    raisedAmount: 9000,
    targetAmount: 30000,
    isUrgent: false,
    featuredOnHome: true,
    homeSection: "fund-strays",
  },
];

export const DONATION_PAYMENT_METHODS: DonationPaymentMethod[] = [
  {
    id: "gcash-1",
    name: "Gcash 1",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=GCASH_1_09338240358",
    accountName: "RE***LD *AR*LA",
    accountNumber: "09338240358",
    referenceLabel: "**********",
  },
  {
    id: "gcash-2",
    name: "Gcash 2",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=GCASH_2_09338240359",
    accountName: "RE***LD *AR*LA",
    accountNumber: "09338240359",
    referenceLabel: "**********",
  },
  {
    id: "metrobank",
    name: "Metrobank",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=METROBANK_0123345599",
    accountName: "NOAHS ARK SHELTER",
    accountNumber: "0123345599",
    referenceLabel: "**********",
  },
  {
    id: "gotyme",
    name: "Gotyme",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=GOTYME_09451236789",
    accountName: "NOAHS ARK SHELTER",
    accountNumber: "09451236789",
    referenceLabel: "**********",
  },
  {
    id: "bpi",
    name: "BPI",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=BPI_00126889973",
    accountName: "NOAHS ARK SHELTER",
    accountNumber: "00126889973",
    referenceLabel: "**********",
  },
];

const DONATION_FILTER_SET: Set<DonationFilter> = new Set([
  "all",
  "urgent",
  "health",
  "foods",
]);

export const getDonationCauses = () => DONATION_CAUSES_MOCK_DATA;

export const getDonationCauseById = (donationId: string) =>
  DONATION_CAUSES_MOCK_DATA.find((cause) => cause.id === donationId) ?? null;

export const getDonationPaymentMethods = () => DONATION_PAYMENT_METHODS;

export const isDonationFilter = (value: string): value is DonationFilter =>
  DONATION_FILTER_SET.has(value as DonationFilter);

export const resolveDonationFilter = (
  value: string | string[] | undefined,
): DonationFilter | null => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (!normalizedValue) {
    return null;
  }

  return isDonationFilter(normalizedValue) ? normalizedValue : null;
};

export const filterDonationCauses = (
  donationCauses: DonationCauseItem[],
  filter: DonationFilter,
) => {
  return donationCauses.filter((cause) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "urgent") {
      return cause.isUrgent;
    }

    return cause.category === filter;
  });
};

export const selectUrgentFundraisingCauses = (donationCauses: DonationCauseItem[]) =>
  donationCauses.filter(
    (cause) =>
      cause.featuredOnHome &&
      cause.homeSection === "urgent-fundraising" &&
      cause.isUrgent,
  );

export const selectFundStraysCauses = (donationCauses: DonationCauseItem[]) =>
  donationCauses.filter(
    (cause) => cause.featuredOnHome && cause.homeSection === "fund-strays",
  );
