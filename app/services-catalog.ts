export type Service = {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  affectedBySize: boolean;
  subOptions?: string[];
  priceBySize?: Record<string, number>;
};

export const CATEGORIES = [
  'Patín y tirantes',
  'Travesaños',
  'Cabezal frontal',
  'Cuello de ganso',
  'Vigas',
  'Estructura interior',
  'Parte frontal',
  'Parte trasera',
  'Carguero y alas',
  'Soportes y bases',
  'Balancines y muelles',
  'Acabados y varios',
] as const;

const FTT = ['Frontal', 'Trasero', 'Transversal'];
const DI  = ['Derecha', 'Izquierda'];
const LADI = ['Lado Derecho', 'Lado Izquierdo'];
const DER_IZQ = ['Derecho', 'Izquierdo'];

export const SERVICES: Service[] = [
  // ── Patín y tirantes ───────────────────────────────────────────────────────
  { id: 'pat-01', category: 'Patín y tirantes', name: 'REEMPLAZO DE PATÍN REFORZADO CON COMPLEMENTOS',        basePrice: 11986, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'pat-02', category: 'Patín y tirantes', name: 'REEMPLAZO DE TIRANTES DE PATÍN REFORZADOS',            basePrice: 11571, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'pat-03', category: 'Patín y tirantes', name: 'COLOCACIÓN DE SOPORTE PARA TIRANTES',                  basePrice:  5180, affectedBySize: false },
  { id: 'pat-04', category: 'Patín y tirantes', name: 'REEMPLAZO DE SOPORTE REFORZADO PARA PATÍN',            basePrice:  3536, affectedBySize: false },

  // ── Travesaños ─────────────────────────────────────────────────────────────
  { id: 'trv-01', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 18"', basePrice:  5690, affectedBySize: false, subOptions: FTT },
  { id: 'trv-02', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 24"', basePrice:  7586, affectedBySize: false, subOptions: FTT },
  { id: 'trv-03', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 27"', basePrice:  8375, affectedBySize: false, subOptions: FTT },
  { id: 'trv-04', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 30"', basePrice:  9163, affectedBySize: false, subOptions: FTT },
  { id: 'trv-05', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 37"', basePrice: 11302, affectedBySize: false, subOptions: FTT },
  { id: 'trv-06', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 42"', basePrice: 12829, affectedBySize: false, subOptions: FTT },
  { id: 'trv-07', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 48"', basePrice: 14832, affectedBySize: false, subOptions: [...FTT, ...DER_IZQ] },
  { id: 'trv-08', category: 'Travesaños', name: 'REFORZAR TRAVESAÑO TRANSVERSAL CON PLACA DE 6X6PLG',         basePrice:  1995, affectedBySize: false },
  { id: 'trv-09', category: 'Travesaños', name: 'AJUSTAR 2 TRAVESAÑOS TRANSVERSALES FRONTALES',               basePrice:  1204, affectedBySize: false },
  { id: 'trv-10', category: 'Travesaños', name: 'SOLDAR/REFORZAR REAR BOLSTER 9"',                            basePrice:  2900, affectedBySize: false },
  { id: 'trv-11', category: 'Travesaños', name: 'SOLDAR/REFORZAR FRONT BOLSTER 9"',                           basePrice:  2900, affectedBySize: false },

  // ── Cabezal frontal ────────────────────────────────────────────────────────
  { id: 'cab-01', category: 'Cabezal frontal', name: 'SOLDAR / REFORZAR CABEZAL FRONTAL 12"',                 basePrice:  3795, affectedBySize: false },
  { id: 'cab-02', category: 'Cabezal frontal', name: 'SOLDAR / REFORZAR CABEZAL FRONTAL 16"',                 basePrice:  5060, affectedBySize: false },
  { id: 'cab-03', category: 'Cabezal frontal', name: 'REEMPLAZO DE CABEZAL FRONTAL DERECHO',                  basePrice:  5786, affectedBySize: false },
  { id: 'cab-04', category: 'Cabezal frontal', name: 'ENDEREZAR CABEZAL FRONTAL 11"',                         basePrice:  2998, affectedBySize: false },
  { id: 'cab-05', category: 'Cabezal frontal', name: 'ENDEREZAR CEJA FRONTAL 5"',                             basePrice:  1136, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'cab-06', category: 'Cabezal frontal', name: 'ENDEREZAR CEJA FRONTAL 8"',                             basePrice:  2125, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'cab-07', category: 'Cabezal frontal', name: 'ENDEREZAR CEJA FRONTAL 12"',                            basePrice:  2936, affectedBySize: false, subOptions: DER_IZQ },

  // ── Cuello de ganso ────────────────────────────────────────────────────────
  { id: 'cg-01',  category: 'Cuello de ganso', name: 'SOLDAR PLACA TRAVESAÑO CUELLO DE GANSO 12"',            basePrice:  4268, affectedBySize: false },
  { id: 'cg-02',  category: 'Cuello de ganso', name: 'ENDEREZAR PLACA DE CUELLO DE GANSO 4"',                 basePrice:  1018, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'cg-03',  category: 'Cuello de ganso', name: 'ENDEREZAR PLACA DE CUELLO DE GANSO 8"',                 basePrice:  2219, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'cg-04',  category: 'Cuello de ganso', name: 'ENDEREZAR PLACA DE CUELLO DE GANSO 12"',                basePrice:  3188, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'cg-05',  category: 'Cuello de ganso', name: 'ENDEREZAR Y SOLDAR PERCHA FRONTAL',                     basePrice:  2877, affectedBySize: false },

  // ── Vigas ──────────────────────────────────────────────────────────────────
  { id: 'vig-01', category: 'Vigas', name: 'SOLDAR / REFORZAR VIGA 6"',                                       basePrice:  1918, affectedBySize: false },
  { id: 'vig-02', category: 'Vigas', name: 'SOLDAR / REFORZAR VIGA 12"',                                      basePrice:  3795, affectedBySize: false },
  { id: 'vig-03', category: 'Vigas', name: 'SOLDAR / REFORZAR VIGA 42" (Lado Derecho / Lado Izquierdo)',      basePrice: 13276, affectedBySize: false, subOptions: LADI },
  { id: 'vig-04', category: 'Vigas', name: 'ENDEREZAR VIGA TRASERA CENTRAL 8"',                               basePrice:  2125, affectedBySize: false },

  // ── Estructura interior ────────────────────────────────────────────────────
  { id: 'est-01', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 6" (Derecho / Izquierdo)', basePrice: 1918, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'est-02', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 12"',                    basePrice:  3795, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'est-03', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 13"',                    basePrice:  4780, affectedBySize: false },
  { id: 'est-04', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 18"',                    basePrice:  5690, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'est-05', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 30"',                    basePrice:  9696, affectedBySize: false },
  { id: 'est-06', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 33"',                    basePrice: 10314, affectedBySize: false },
  { id: 'est-07', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 34"',                    basePrice: 10626, affectedBySize: false },
  { id: 'est-08', category: 'Estructura interior', name: 'SOLDAR SECCIÓN ENTRE TRAVESAÑOS INTERIORES (Lado Derecho / Lado Izquierdo)', basePrice: 13200, affectedBySize: false, subOptions: LADI },

  // ── Parte frontal ──────────────────────────────────────────────────────────
  { id: 'frt-01', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 4"',            basePrice:  1063, affectedBySize: false, subOptions: DI },
  { id: 'frt-02', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 5"',            basePrice:  1205, affectedBySize: false, subOptions: DI },
  { id: 'frt-03', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 8"',            basePrice:  2125, affectedBySize: false, subOptions: DI },
  { id: 'frt-04', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 16"',           basePrice:  3795, affectedBySize: false, subOptions: DI },
  { id: 'frt-05', category: 'Parte frontal', name: 'SOLDAR / REFORZAR PARTE FRONTAL 6"',                      basePrice:  1918, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'frt-06', category: 'Parte frontal', name: 'SOLDAR / REFORZAR PARTE FRONTAL 18"',                     basePrice:  5690, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'frt-07', category: 'Parte frontal', name: 'ENDEREZAR BASE PORTACANDADO FRONTAL 5"',                  basePrice:  1204, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'frt-08', category: 'Parte frontal', name: 'ENDEREZAR BASE PORTACANDADO FRONTAL 7"',                  basePrice:  1973, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'frt-09', category: 'Parte frontal', name: 'ENDEREZAR BASE DE PERNO DE CANDADO FRONTAL',              basePrice:  1072, affectedBySize: false, subOptions: DER_IZQ },

  // ── Parte trasera ──────────────────────────────────────────────────────────
  { id: 'tra-01', category: 'Parte trasera', name: 'ENDEREZAR BASE DE PERNO DE CANDADO TRASERO',              basePrice:  1509, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'tra-02', category: 'Parte trasera', name: 'SOLDAR PARTE TRASERA 12"',                                basePrice:  3795, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'tra-03', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 12"',                     basePrice:  3795, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'tra-04', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 18"',                     basePrice:  5690, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'tra-05', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 24"',                     basePrice:  7586, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'tra-06', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 30"',                     basePrice:  9163, affectedBySize: false },
  { id: 'tra-07', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 36"',                     basePrice: 11635, affectedBySize: false },
  { id: 'tra-08', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA',                         basePrice:  2105, affectedBySize: false },
  { id: 'tra-09', category: 'Parte trasera', name: 'ENDEREZAR Y REFORZAR CARTABÓN DERECHO TRASERO',           basePrice:  2105, affectedBySize: false },

  // ── Carguero y alas ────────────────────────────────────────────────────────
  { id: 'car-01', category: 'Carguero y alas', name: 'RECONSTRUCCIÓN DE SOPORTE PERPENDICULAR DE CARGUERO',  basePrice: 12805, affectedBySize: false },
  { id: 'car-02', category: 'Carguero y alas', name: 'RECONSTRUCCIÓN DE SOPORTE ANGULAR ALA LATERAL',        basePrice:  4433, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'car-03', category: 'Carguero y alas', name: 'CONSTRUCCIÓN DE TOPE PARA ALA DE CARGUERO',            basePrice:  3046, affectedBySize: false },
  { id: 'car-04', category: 'Carguero y alas', name: 'CARTABONES DE REFUERZO PARA ALA DE CARGUERO',          basePrice:  2403, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'car-05', category: 'Carguero y alas', name: 'TAPAS DE ALA DE CARGUERO',                             basePrice:  2359, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'car-06', category: 'Carguero y alas', name: 'SOLDAR CARGUERO 6"',                                   basePrice:  1918, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'car-07', category: 'Carguero y alas', name: 'SOLDAR CARGUERO 12"',                                  basePrice:  3795, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'car-08', category: 'Carguero y alas', name: 'SOLDAR CARGUERO 18"',                                  basePrice:  5690, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'car-09', category: 'Carguero y alas', name: 'PARCHE EN CARGUERO TRASERO',                           basePrice:  1993, affectedBySize: false },
  { id: 'car-10', category: 'Carguero y alas', name: 'COLOCAR PARCHE DE 10X10',                              basePrice:  4000, affectedBySize: false },

  // ── Soportes y bases ───────────────────────────────────────────────────────
  { id: 'sop-01', category: 'Soportes y bases', name: 'REEMPLAZAR PLACA DE 4X7PLG EN BASE PORTA CANDADO',    basePrice:  1995, affectedBySize: false },
  { id: 'sop-02', category: 'Soportes y bases', name: 'ENDEREZAR Y SOLDAR DE BASE PORTA MANITAS',            basePrice:  4268, affectedBySize: false },
  { id: 'sop-03', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR SOPORTE LATERAL 12"',               basePrice:  3795, affectedBySize: false },
  { id: 'sop-04', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR BASE PORTACANDADO 18"',             basePrice:  5690, affectedBySize: false },
  { id: 'sop-05', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA PLAFONES 12"',          basePrice:  3795, affectedBySize: false },
  { id: 'sop-06', category: 'Soportes y bases', name: 'ENDEREZAR SOPORTE 5"',                                basePrice:  1204, affectedBySize: false },
  { id: 'sop-07', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR BASE LATERAL 12"',                  basePrice:  3795, affectedBySize: false },
  { id: 'sop-08', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR BASE LATERAL 18"',                  basePrice:  5690, affectedBySize: false },
  { id: 'sop-09', category: 'Soportes y bases', name: 'ENDEREZAR BASE PORTA PLAFONES 4"',                    basePrice:  1018, affectedBySize: false },
  { id: 'sop-10', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA PLAFONES 3"',           basePrice:  1138, affectedBySize: false },
  { id: 'sop-11', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA CANDADO',               basePrice:  3795, affectedBySize: false },
  { id: 'sop-12', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA PLAFONES 24"',          basePrice:  7586, affectedBySize: false },
  { id: 'sop-13', category: 'Soportes y bases', name: 'ENDEREZAR BASE DE CANDADO (Derecho / Izquierdo)',     basePrice:   980, affectedBySize: false, subOptions: DER_IZQ },

  // ── Balancines y muelles ───────────────────────────────────────────────────
  { id: 'bal-01', category: 'Balancines y muelles', name: 'SOLDAR Y ENDEREZAR DE BALANCÍN',                                     basePrice:  2908, affectedBySize: false, subOptions: DER_IZQ },
  { id: 'bal-02', category: 'Balancines y muelles', name: 'REEMPLAZO DE 2 BALANCINES',                                          basePrice: 22619, affectedBySize: false },
  { id: 'bal-03', category: 'Balancines y muelles', name: 'REEMPLAZO DE ABRAZADERAS C/TORNILLERÍA Y TUERCAS DE SEGURIDAD',      basePrice:  5897, affectedBySize: false },
  { id: 'bal-04', category: 'Balancines y muelles', name: 'REEMPLAZO DE 2 MUELLES',                                             basePrice: 32709, affectedBySize: false },
  { id: 'bal-05', category: 'Balancines y muelles', name: 'REEMPLAZO DE 4 MUELLES',                                             basePrice: 61105, affectedBySize: false },
  { id: 'bal-06', category: 'Balancines y muelles', name: 'REEMPLAZO DE 1 MUELLE (Trasero Derecho / Trasero Izquierdo)',        basePrice: 16174, affectedBySize: false, subOptions: ['Trasero Derecho', 'Trasero Izquierdo'] },
  { id: 'bal-07', category: 'Balancines y muelles', name: 'ALINEACIÓN DE EJES',                                                 basePrice:  4902, affectedBySize: false },

  // ── Acabados y varios ─────────────────────────────────────────────────────
  { id: 'var-01', category: 'Acabados y varios', name: 'REEMPLAZO DE ESTRIBO',       basePrice: 5410, affectedBySize: false },
  { id: 'aca-01', category: 'Acabados y varios', name: 'PINTURA DE LLANTAS',         basePrice: 1000, affectedBySize: false },
  { id: 'aca-02', category: 'Acabados y varios', name: 'ROTULACIÓN DE VINILES',      basePrice: 3000, affectedBySize: false },
  { id: 'aca-03', category: 'Acabados y varios', name: 'PINTURA DE CHASIS',          basePrice: 0,    affectedBySize: false,
    priceBySize: { 'pequeño': 12000, 'grande': 16000 } },
];

// ─── Multipliers & labels (kept for display purposes) ─────────────────────────

export const SIZE_MULTIPLIERS: Record<string, number> = {
  'pequeño': 1.0,
  'mediano': 1.4,
  'grande':  1.8,
  'extra-grande': 2.5,
};

export const CONDITION_MULTIPLIERS: Record<string, number> = {
  'bueno':    1.0,
  'moderado': 1.3,
  'severo':   1.7,
  'critico':  2.2,
};

export const SIZE_LABELS: Record<string, string> = {
  'pequeño':      '20 ft',
  'mediano':      'Mediano',
  'grande':       '40 ft',
  'extra-grande': 'Extra Grande',
};

export const CONDITION_LABELS: Record<string, string> = {
  'bueno':    'Buenas condiciones',
  'moderado': 'Desgaste moderado',
  'severo':   'Deterioro severo',
  'critico':  'Estado crítico',
};
