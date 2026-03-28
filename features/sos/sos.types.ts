export type SosImageSourceType = "camera" | "gallery";

export type SosReportTypeId =
  | "injured-or-diseased-stray"
  | "accidents"
  | "random-stray";

export type SosCoordinate = {
  latitude: number;
  longitude: number;
};

export type SosFlowData = {
  description: string;
  imageUri: string;
  latitude: number;
  location: string;
  longitude: number;
  reportType: SosReportTypeId;
  responderMessageAvailable: boolean;
  responderName: string;
  responderPhone: string;
  routePoints: SosCoordinate[];
  submittedAt: string;
};

export const normalizeSosParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const hasFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isCoordinate = (value: unknown): value is SosCoordinate => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const coordinate = value as Partial<SosCoordinate>;
  return (
    hasFiniteNumber(coordinate.latitude) && hasFiniteNumber(coordinate.longitude)
  );
};

const isReportTypeId = (value: unknown): value is SosReportTypeId =>
  value === "injured-or-diseased-stray" ||
  value === "accidents" ||
  value === "random-stray";

export const serializeSosFlowData = (flowData: SosFlowData) =>
  JSON.stringify(flowData);

export const parseSosFlowDataParam = (
  rawValue?: string | string[],
): SosFlowData | null => {
  const normalizedValue = normalizeSosParam(rawValue);

  if (!normalizedValue?.trim()) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(normalizedValue) as Partial<SosFlowData>;

    if (
      typeof parsedValue.imageUri !== "string" ||
      !parsedValue.imageUri.trim() ||
      !isReportTypeId(parsedValue.reportType) ||
      typeof parsedValue.location !== "string" ||
      !parsedValue.location.trim() ||
      !hasFiniteNumber(parsedValue.latitude) ||
      !hasFiniteNumber(parsedValue.longitude) ||
      typeof parsedValue.description !== "string" ||
      !parsedValue.description.trim() ||
      typeof parsedValue.submittedAt !== "string" ||
      !parsedValue.submittedAt.trim() ||
      typeof parsedValue.responderName !== "string" ||
      !parsedValue.responderName.trim() ||
      typeof parsedValue.responderPhone !== "string" ||
      !parsedValue.responderPhone.trim() ||
      typeof parsedValue.responderMessageAvailable !== "boolean" ||
      !Array.isArray(parsedValue.routePoints) ||
      !parsedValue.routePoints.every((point) => isCoordinate(point))
    ) {
      return null;
    }

    return {
      description: parsedValue.description,
      imageUri: parsedValue.imageUri,
      latitude: parsedValue.latitude,
      location: parsedValue.location,
      longitude: parsedValue.longitude,
      reportType: parsedValue.reportType,
      responderMessageAvailable: parsedValue.responderMessageAvailable,
      responderName: parsedValue.responderName,
      responderPhone: parsedValue.responderPhone,
      routePoints: parsedValue.routePoints,
      submittedAt: parsedValue.submittedAt,
    };
  } catch {
    return null;
  }
};
