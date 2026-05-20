export type Service = {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  affectedBySize: boolean; // true = precio se multiplica por factor de tamaño (20ft vs 40ft)
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
  'Varios',
] as const;

export const SERVICES: Service[] = [
  // ── Patín y tirantes ───────────────────────────────────────────────────────
  { id: 'pat-01', category: 'Patín y tirantes', name: 'REEMPLAZO DE PATÍN REFORZADO CON COMPLEMENTOS',         basePrice: 8500,  affectedBySize: false },
  { id: 'pat-02', category: 'Patín y tirantes', name: 'REEMPLAZO DE TIRANTES DE PATÍN REFORZADOS',             basePrice: 3500,  affectedBySize: false },
  { id: 'pat-03', category: 'Patín y tirantes', name: 'COLOCACIÓN DE SOPORTE PARA TIRANTES',                   basePrice: 2200,  affectedBySize: false },
  { id: 'pat-04', category: 'Patín y tirantes', name: 'REEMPLAZO DE SOPORTE REFORZADO PARA PATÍN',             basePrice: 3800,  affectedBySize: false },

  // ── Travesaños ─────────────────────────────────────────────────────────────
  { id: 'trv-01', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 18"',   basePrice: 2800,  affectedBySize: true  },
  { id: 'trv-02', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 24"',   basePrice: 3200,  affectedBySize: true  },
  { id: 'trv-03', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 27"',   basePrice: 3600,  affectedBySize: true  },
  { id: 'trv-04', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 30"',   basePrice: 4000,  affectedBySize: true  },
  { id: 'trv-05', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 37"',   basePrice: 4800,  affectedBySize: true  },
  { id: 'trv-06', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 42"',   basePrice: 5500,  affectedBySize: true  },
  { id: 'trv-07', category: 'Travesaños', name: 'SOLDAR/REFORZAR TRAVESAÑO FRONTAL/TRASERO/TRANSVERSAL 48"',   basePrice: 6200,  affectedBySize: true  },
  { id: 'trv-08', category: 'Travesaños', name: 'REFORZAR TRAVESAÑO TRANSVERSAL CON PLACA DE 6X6PLG',          basePrice: 2500,  affectedBySize: false },
  { id: 'trv-09', category: 'Travesaños', name: 'AJUSTAR 2 TRAVESAÑOS TRANSVERSALES FRONTALES',                basePrice: 3500,  affectedBySize: false },
  { id: 'trv-10', category: 'Travesaños', name: 'SOLDAR/REFORZAR REAR BOLSTER 9"',                             basePrice: 3200,  affectedBySize: false },
  { id: 'trv-11', category: 'Travesaños', name: 'SOLDAR/REFORZAR FRONT BOLSTER 9"',                            basePrice: 3200,  affectedBySize: false },

  // ── Cabezal frontal ────────────────────────────────────────────────────────
  { id: 'cab-01', category: 'Cabezal frontal', name: 'REEMPLAZO DE CABEZAL FRONTAL DERECHO',                   basePrice: 12000, affectedBySize: true  },
  { id: 'cab-02', category: 'Cabezal frontal', name: 'ENDEREZAR CABEZAL FRONTAL 11"',                          basePrice: 2500,  affectedBySize: false },
  { id: 'cab-03', category: 'Cabezal frontal', name: 'SOLDAR / REFORZAR CABEZAL FRONTAL 12"',                  basePrice: 3200,  affectedBySize: true  },
  { id: 'cab-04', category: 'Cabezal frontal', name: 'SOLDAR / REFORZAR CABEZAL FRONTAL 16"',                  basePrice: 4200,  affectedBySize: true  },
  { id: 'cab-05', category: 'Cabezal frontal', name: 'ENDEREZAR CEJA FRONTAL 5"',                              basePrice: 1500,  affectedBySize: false },
  { id: 'cab-06', category: 'Cabezal frontal', name: 'ENDEREZAR CEJA FRONTAL 8"',                              basePrice: 1800,  affectedBySize: false },
  { id: 'cab-07', category: 'Cabezal frontal', name: 'ENDEREZAR CEJA FRONTAL 12"',                             basePrice: 2400,  affectedBySize: false },

  // ── Cuello de ganso ────────────────────────────────────────────────────────
  { id: 'cg-01',  category: 'Cuello de ganso', name: 'SOLDAR PLACA TRAVESAÑO CUELLO DE GANSO 12"',             basePrice: 2800,  affectedBySize: false },
  { id: 'cg-02',  category: 'Cuello de ganso', name: 'ENDEREZAR PLACA DE CUELLO DE GANSO 4"',                  basePrice: 1200,  affectedBySize: false },
  { id: 'cg-03',  category: 'Cuello de ganso', name: 'ENDEREZAR PLACA DE CUELLO DE GANSO 8"',                  basePrice: 1800,  affectedBySize: false },
  { id: 'cg-04',  category: 'Cuello de ganso', name: 'ENDEREZAR PLACA DE CUELLO DE GANSO 12"',                 basePrice: 2400,  affectedBySize: false },
  { id: 'cg-05',  category: 'Cuello de ganso', name: 'ENDEREZAR Y SOLDAR PERCHA FRONTAL',                      basePrice: 3200,  affectedBySize: false },

  // ── Vigas ──────────────────────────────────────────────────────────────────
  { id: 'vig-01', category: 'Vigas', name: 'SOLDAR / REFORZAR VIGA 6"',                                        basePrice: 2200,  affectedBySize: true  },
  { id: 'vig-02', category: 'Vigas', name: 'SOLDAR / REFORZAR VIGA 12"',                                       basePrice: 3200,  affectedBySize: true  },
  { id: 'vig-03', category: 'Vigas', name: 'SOLDAR / REFORZAR VIGA 42"',                                       basePrice: 6500,  affectedBySize: true  },
  { id: 'vig-04', category: 'Vigas', name: 'ENDEREZAR VIGA TRASERA CENTRAL 8"',                                basePrice: 2500,  affectedBySize: false },

  // ── Estructura interior ────────────────────────────────────────────────────
  { id: 'est-01', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 6"',                      basePrice: 1800,  affectedBySize: true  },
  { id: 'est-02', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 12"',                     basePrice: 2600,  affectedBySize: true  },
  { id: 'est-03', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 13"',                     basePrice: 2800,  affectedBySize: true  },
  { id: 'est-04', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 18"',                     basePrice: 3400,  affectedBySize: true  },
  { id: 'est-05', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 30"',                     basePrice: 4800,  affectedBySize: true  },
  { id: 'est-06', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 33"',                     basePrice: 5200,  affectedBySize: true  },
  { id: 'est-07', category: 'Estructura interior', name: 'SOLDAR ESTRUCTURA INTERIOR 34"',                     basePrice: 5400,  affectedBySize: true  },

  // ── Parte frontal ──────────────────────────────────────────────────────────
  { id: 'frt-01', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 4"',             basePrice: 1500,  affectedBySize: false },
  { id: 'frt-02', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 5"',             basePrice: 1800,  affectedBySize: false },
  { id: 'frt-03', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 8"',             basePrice: 2400,  affectedBySize: false },
  { id: 'frt-04', category: 'Parte frontal', name: 'ENDEREZAR PARTE FRONTAL DERECHA/IZQUIERDA 16"',            basePrice: 3800,  affectedBySize: false },
  { id: 'frt-05', category: 'Parte frontal', name: 'SOLDAR / REFORZAR PARTE FRONTAL 6"',                       basePrice: 2200,  affectedBySize: true  },
  { id: 'frt-06', category: 'Parte frontal', name: 'SOLDAR / REFORZAR PARTE FRONTAL 18"',                      basePrice: 4200,  affectedBySize: true  },
  { id: 'frt-07', category: 'Parte frontal', name: 'ENDEREZAR BASE PORTACANDADO FRONTAL 5"',                   basePrice: 1600,  affectedBySize: false },
  { id: 'frt-08', category: 'Parte frontal', name: 'ENDEREZAR BASE PORTACANDADO FRONTAL 7"',                   basePrice: 1900,  affectedBySize: false },
  { id: 'frt-09', category: 'Parte frontal', name: 'ENDEREZAR BASE DE PERNO DE CANDADO FRONTAL',               basePrice: 1800,  affectedBySize: false },

  // ── Parte trasera ──────────────────────────────────────────────────────────
  { id: 'tra-01', category: 'Parte trasera', name: 'SOLDAR PARTE TRASERA 12"',                                 basePrice: 3000,  affectedBySize: true  },
  { id: 'tra-02', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 12"',                      basePrice: 3200,  affectedBySize: true  },
  { id: 'tra-03', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 18"',                      basePrice: 4200,  affectedBySize: true  },
  { id: 'tra-04', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 24"',                      basePrice: 5000,  affectedBySize: true  },
  { id: 'tra-05', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 30"',                      basePrice: 5800,  affectedBySize: true  },
  { id: 'tra-06', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA 36"',                      basePrice: 6600,  affectedBySize: true  },
  { id: 'tra-07', category: 'Parte trasera', name: 'SOLDAR / REFORZAR PARTE TRASERA',                          basePrice: 3500,  affectedBySize: true  },
  { id: 'tra-08', category: 'Parte trasera', name: 'ENDEREZAR BASE DE PERNO DE CANDADO TRASERO',               basePrice: 1800,  affectedBySize: false },
  { id: 'tra-09', category: 'Parte trasera', name: 'ENDEREZAR Y REFORZAR CARTABÓN DERECHO TRASERO',            basePrice: 3200,  affectedBySize: false },

  // ── Carguero y alas ────────────────────────────────────────────────────────
  { id: 'car-01', category: 'Carguero y alas', name: 'RECONSTRUCCIÓN DE SOPORTE PERPENDICULAR DE CARGUERO',   basePrice: 7500,  affectedBySize: true  },
  { id: 'car-02', category: 'Carguero y alas', name: 'RECONSTRUCCIÓN DE SOPORTE ANGULAR ALA LATERAL',          basePrice: 6500,  affectedBySize: false },
  { id: 'car-03', category: 'Carguero y alas', name: 'CONSTRUCCIÓN DE TOPE PARA ALA DE CARGUERO',              basePrice: 4200,  affectedBySize: false },
  { id: 'car-04', category: 'Carguero y alas', name: 'CARTABONES DE REFUERZO PARA ALA DE CARGUERO',            basePrice: 3500,  affectedBySize: false },
  { id: 'car-05', category: 'Carguero y alas', name: 'TAPAS DE ALA DE CARGUERO',                               basePrice: 2800,  affectedBySize: false },
  { id: 'car-06', category: 'Carguero y alas', name: 'SOLDAR CARGUERO 6"',                                     basePrice: 1800,  affectedBySize: true  },
  { id: 'car-07', category: 'Carguero y alas', name: 'SOLDAR CARGUERO 12"',                                    basePrice: 2600,  affectedBySize: true  },
  { id: 'car-08', category: 'Carguero y alas', name: 'SOLDAR CARGUERO 18"',                                    basePrice: 3800,  affectedBySize: true  },
  { id: 'car-09', category: 'Carguero y alas', name: 'PARCHE EN CARGUERO TRASERO',                             basePrice: 3200,  affectedBySize: false },
  { id: 'car-10', category: 'Carguero y alas', name: 'COLOCAR PARCHE DE 10X10',                                basePrice: 2500,  affectedBySize: false },

  // ── Soportes y bases ───────────────────────────────────────────────────────
  { id: 'sop-01', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR SOPORTE LATERAL 12"',                 basePrice: 3200,  affectedBySize: true  },
  { id: 'sop-02', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR BASE PORTACANDADO 18"',               basePrice: 4000,  affectedBySize: false },
  { id: 'sop-03', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR BASE LATERAL 12"',                    basePrice: 3200,  affectedBySize: true  },
  { id: 'sop-04', category: 'Soportes y bases', name: 'SOLDAR / REFORZAR BASE LATERAL 18"',                    basePrice: 4500,  affectedBySize: true  },
  { id: 'sop-05', category: 'Soportes y bases', name: 'REEMPLAZAR PLACA DE 4X7PLG EN BASE PORTA CANDADO',      basePrice: 2200,  affectedBySize: false },
  { id: 'sop-06', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA CANDADO',                 basePrice: 2500,  affectedBySize: false },
  { id: 'sop-07', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA PLAFONES 3"',             basePrice: 1200,  affectedBySize: false },
  { id: 'sop-08', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA PLAFONES 12"',            basePrice: 2600,  affectedBySize: false },
  { id: 'sop-09', category: 'Soportes y bases', name: 'ENDEREZAR / SOLDAR BASE PORTA PLAFONES 24"',            basePrice: 4200,  affectedBySize: false },
  { id: 'sop-10', category: 'Soportes y bases', name: 'ENDEREZAR BASE PORTA PLAFONES 4"',                      basePrice: 1400,  affectedBySize: false },
  { id: 'sop-11', category: 'Soportes y bases', name: 'ENDEREZAR Y SOLDAR DE BASE PORTA MANITAS',              basePrice: 2200,  affectedBySize: false },
  { id: 'sop-12', category: 'Soportes y bases', name: 'ENDEREZAR SOPORTE 5"',                                  basePrice: 1600,  affectedBySize: false },

  // ── Balancines y muelles ───────────────────────────────────────────────────
  { id: 'bal-01', category: 'Balancines y muelles', name: 'SOLDAR Y ENDEREZAR DE BALANCÍN',                    basePrice: 2800,  affectedBySize: false },
  { id: 'bal-02', category: 'Balancines y muelles', name: 'REEMPLAZO DE 2 BALANCINES',                         basePrice: 5500,  affectedBySize: false },
  { id: 'bal-03', category: 'Balancines y muelles', name: 'REEMPLAZO DE 1 MUELLE',                             basePrice: 3500,  affectedBySize: false },
  { id: 'bal-04', category: 'Balancines y muelles', name: 'REEMPLAZO DE 2 MUELLES',                            basePrice: 6500,  affectedBySize: false },
  { id: 'bal-05', category: 'Balancines y muelles', name: 'REEMPLAZO DE 4 MUELLES',                            basePrice: 12000, affectedBySize: false },
  { id: 'bal-06', category: 'Balancines y muelles', name: 'REEMPLAZO DE ABRAZADERAS C/TORNILLERÍA Y TUERCAS',  basePrice: 2800,  affectedBySize: false },

  // ── Varios ─────────────────────────────────────────────────────────────────
  { id: 'var-01', category: 'Varios', name: 'REEMPLAZO DE ESTRIBO',                                             basePrice: 4500,  affectedBySize: false },
  { id: 'var-02', category: 'Varios', name: 'ALINEACIÓN DE EJES',                                              basePrice: 3500,  affectedBySize: false },
];

// ─── Multipliers ──────────────────────────────────────────────────────────────

export const SIZE_MULTIPLIERS: Record<string, number> = {
  'pequeño': 1.0,  // 20 ft
  'mediano': 1.4,
  'grande': 1.8,   // 40 ft
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
