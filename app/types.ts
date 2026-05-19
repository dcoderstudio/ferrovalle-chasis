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
};
