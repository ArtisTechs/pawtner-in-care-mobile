export type PaymentModeApiItem = {
  accountNumber?: string | null;
  createdDate?: string | null;
  id: string;
  name: string;
  photoQr?: string | null;
};

export type PaymentModeMutationPayload = {
  accountNumber?: string | null;
  name: string;
  photoQr?: string | null;
};
