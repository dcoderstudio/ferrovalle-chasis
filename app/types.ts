export type ChassisStatus =
  | 'recibido'
  | 'diagnostico'
  | 'en-reparacion'
  | 'acabados'
  | 'inspeccion'
  | 'entregado';

export type ChassisSize = 'pequeño' | 'mediano' | 'grande' | 'extra-grande';
export type ChassisCondition = 'bueno' | 'moderado' | 'severo' | 'critico';

export type SelectedService = {
  serviceId: string;
  quantity: number;
  selectedSubOptions?: string[];
};

export type Chassis = {
  id: string;
  chassisNumber: string;
  clientName: string;
  status: ChassisStatus;
  purchaseOrder: string;
  size: ChassisSize;
  condition: ChassisCondition;
  photosBefore: string[];
  photosDetail: string[];
  photosAfter: string[];
  commitmentDate: string;
  deliveryDate: string;
  selectedServices: SelectedService[];
  finalPrice: number | null;
  notes: string;
  createdAt: string;
  completedServices: string[];
  approvedServices?: string[];
  priority: boolean;
  requestedBy: string;
  pdfPurchaseOrder: string;
  pdfPurchaseOrderName: string;
  pdfQuotation: string;
  pdfQuotationName: string;
  diagnosedBy?: string;
  diagnosedAt?: string;
  patio?: string;
};
