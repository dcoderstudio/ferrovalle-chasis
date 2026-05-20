export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
};

export const SERVICES: Service[] = [
  { id: 'inspeccion-tecnica', name: 'Inspección técnica', description: 'Evaluación y diagnóstico del chasis', basePrice: 1500, unit: 'servicio' },
  { id: 'limpieza-quimica', name: 'Limpieza química', description: 'Desengrasado y preparación de superficie', basePrice: 2000, unit: 'servicio' },
  { id: 'arenado-parcial', name: 'Arenado parcial', description: 'Limpieza abrasiva en zonas específicas', basePrice: 4500, unit: 'servicio' },
  { id: 'arenado-completo', name: 'Arenado completo', description: 'Limpieza total por abrasión', basePrice: 8000, unit: 'servicio' },
  { id: 'granallado', name: 'Granallado', description: 'Limpieza por proyección de granalla metálica', basePrice: 9000, unit: 'servicio' },
  { id: 'fondo-anticorrosivo', name: 'Fondo anticorrosivo', description: 'Aplicación de primer anticorrosivo', basePrice: 3500, unit: 'capa' },
  { id: 'pintura-acabado', name: 'Pintura de acabado', description: 'Acabado final de pintura industrial', basePrice: 4000, unit: 'capa' },
  { id: 'soldadura-reparacion', name: 'Soldadura de reparación', description: 'Reparación de grietas y fracturas', basePrice: 2500, unit: 'punto' },
  { id: 'soldadura-estructural', name: 'Soldadura estructural', description: 'Soldadura de refuerzo estructural', basePrice: 1800, unit: 'hora' },
  { id: 'enderezado-vigas', name: 'Enderezado de vigas', description: 'Corrección de deformaciones en vigas', basePrice: 6000, unit: 'viga' },
  { id: 'refuerzo-estructural', name: 'Refuerzo estructural', description: 'Adición de refuerzos y gussets', basePrice: 8500, unit: 'servicio' },
  { id: 'cambio-travesanos', name: 'Cambio de travesaños', description: 'Reemplazo de piezas transversales', basePrice: 12000, unit: 'pieza' },
  { id: 'reparacion-soportes', name: 'Reparación de soportes', description: 'Corrección de soportes y brackets', basePrice: 4000, unit: 'soporte' },
  { id: 'cambio-tornilleria', name: 'Cambio de tornillería', description: 'Reemplazo de tornillos y fijaciones', basePrice: 800, unit: 'juego' },
];

export const SIZE_MULTIPLIERS: Record<string, number> = {
  'pequeño': 1.0,
  'mediano': 1.4,
  'grande': 1.8,
  'extra-grande': 2.5,
};

export const CONDITION_MULTIPLIERS: Record<string, number> = {
  'bueno': 1.0,
  'moderado': 1.3,
  'severo': 1.7,
  'critico': 2.2,
};

export const SIZE_LABELS: Record<string, string> = {
  'pequeño': '20 ft',
  'mediano': 'Mediano',
  'grande': '40 ft',
  'extra-grande': 'Extra Grande',
};

export const CONDITION_LABELS: Record<string, string> = {
  'bueno': 'Buenas condiciones',
  'moderado': 'Desgaste moderado',
  'severo': 'Deterioro severo',
  'critico': 'Estado crítico',
};
