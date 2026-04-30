import React, { useState, useMemo, useRef, CSSProperties } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, LabelList
} from 'recharts';

type Estatus = 'ok' | 'riesgo' | 'critico';
type Periodicidad = 'Semanal' | 'Quincenal' | 'Mensual';
type EstadoKPI = 'ok' | 'alerta';
type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo';

interface Cliente {
  id: string;
  nombre: string;
  empleados: number;
  periodicidad: Periodicidad;
  fee: number;
  costoOp: number;
  slaCumplido: number;
  timbrado: number;
  variacion: number;
  estatus: Estatus;
}

interface FichaTecnica {
  rfc: string;
  razonSocial: string;
  sector: string;
  giro: string;
  domicilioFiscal: string;
  contactoNombre: string;
  contactoPuesto: string;
  contactoEmail: string;
  contactoTelefono: string;
  fechaAlta: string;
  ejecutivoCuenta: string;
  modalidadPago: string;
  bancoDispersion: string;
  observaciones: string;
  historicoNomina: { mes: string; total: number; recibos: number }[];
  alertas: string[];
}

type SortKey = 'nombre' | 'empleados' | 'periodicidad' | 'slaCumplido' | 'timbrado' | 'variacion' | 'fee' | 'margen' | 'estatus';
type SortDir = 'asc' | 'desc';

interface TooltipPayload {
  value: number | string;
  name: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface KPIProps {
  titulo: string;
  valor: string;
  unidad: string;
  meta: string;
  estado: EstadoKPI;
  semaforo: EstadoSemaforo;
  divider?: boolean;
}

interface PanelProps {
  titulo: string;
  kicker: string;
  flex: number;
  children: React.ReactNode;
}

interface RowProps {
  children: React.ReactNode;
}

interface KPIDetalleProps {
  numero: string;
  titulo: string;
  subtitulo: string;
  valor: string;
  unidad: string;
  meta: string;
  descripcion: string;
  estado: 'ok' | 'alerta';
  divider?: boolean;
}

const C = {
  paper: '#faf7f2',
  paperSoft: '#f4efe6',
  ink: '#1a1814',
  inkSoft: '#3d3830',
  inkMute: '#7a746a',
  rule: '#d8d1c3',
  ruleSoft: '#e8e2d4',
  coral: '#d4553a',
  coralSoft: '#e8a396',
  olive: '#4a5d3a',
  oliveSoft: '#8a9e7a',
  amber: '#c4953a',
  amberSoft: '#ddc58a',
  crimson: '#962d1f'
} as const;

const FONT = 'Arial, sans-serif';

const seedFromString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const CLIENTES: Cliente[] = [
  { id: 'C01', nombre: 'Manufacturas del Norte SA', empleados: 142, periodicidad: 'Semanal', fee: 28500, costoOp: 14200, slaCumplido: 98, timbrado: 100, variacion: 2.1, estatus: 'ok' },
  { id: 'C02', nombre: 'Constructora Hermosillo', empleados: 87, periodicidad: 'Semanal', fee: 18900, costoOp: 10500, slaCumplido: 92, timbrado: 99.2, variacion: 4.8, estatus: 'ok' },
  { id: 'C03', nombre: 'Grupo Restaurantero MX', empleados: 213, periodicidad: 'Quincenal', fee: 34200, costoOp: 21800, slaCumplido: 87, timbrado: 97.1, variacion: 7.3, estatus: 'riesgo' },
  { id: 'C04', nombre: 'Logística Pacífico', empleados: 64, periodicidad: 'Quincenal', fee: 15400, costoOp: 7200, slaCumplido: 100, timbrado: 100, variacion: 1.2, estatus: 'ok' },
  { id: 'C05', nombre: 'Textiles Bajío', empleados: 178, periodicidad: 'Semanal', fee: 31200, costoOp: 24800, slaCumplido: 78, timbrado: 94.5, variacion: 11.2, estatus: 'critico' },
  { id: 'C06', nombre: 'Servicios Médicos del Sur', empleados: 45, periodicidad: 'Mensual', fee: 12800, costoOp: 5100, slaCumplido: 100, timbrado: 100, variacion: 0.8, estatus: 'ok' },
  { id: 'C07', nombre: 'Agroindustrias Sinaloa', empleados: 256, periodicidad: 'Semanal', fee: 42500, costoOp: 28900, slaCumplido: 94, timbrado: 98.8, variacion: 3.4, estatus: 'ok' },
  { id: 'C08', nombre: 'Distribuidora Automotriz CH', empleados: 112, periodicidad: 'Quincenal', fee: 22100, costoOp: 13400, slaCumplido: 96, timbrado: 99.5, variacion: 2.8, estatus: 'ok' },
  { id: 'C09', nombre: 'Hotelera Costa Maya', empleados: 189, periodicidad: 'Quincenal', fee: 29800, costoOp: 22100, slaCumplido: 82, timbrado: 96.3, variacion: 8.9, estatus: 'riesgo' },
  { id: 'C10', nombre: 'Consultora Corporativa MX', empleados: 38, periodicidad: 'Mensual', fee: 14200, costoOp: 4800, slaCumplido: 100, timbrado: 100, variacion: 1.5, estatus: 'ok' },
  { id: 'C11', nombre: 'Metalúrgica del Centro', empleados: 134, periodicidad: 'Semanal', fee: 25600, costoOp: 15800, slaCumplido: 91, timbrado: 98.2, variacion: 5.1, estatus: 'ok' },
  { id: 'C12', nombre: 'Comercializadora Golfo', empleados: 76, periodicidad: 'Quincenal', fee: 17300, costoOp: 9200, slaCumplido: 97, timbrado: 99.8, variacion: 2.4, estatus: 'ok' }
];

const FICHAS: Record<string, FichaTecnica> = {
  C01: {
    rfc: 'MNO940312H45', razonSocial: 'Manufacturas del Norte, S.A. de C.V.',
    sector: 'Manufactura', giro: 'Fabricación de componentes metálicos para la industria automotriz',
    domicilioFiscal: 'Av. Industrial 1240, Parque Industrial Stiva, Apodaca, N.L. C.P. 66600',
    contactoNombre: 'Lic. Mariana Treviño', contactoPuesto: 'Gerente de Capital Humano',
    contactoEmail: 'mtrevino@manorte.com.mx', contactoTelefono: '+52 81 8345 1200',
    fechaAlta: '12 de marzo de 2019', ejecutivoCuenta: 'Sra. Patricia Olvera',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'BBVA',
    observaciones: 'Cliente ancla del despacho. Procesamiento semanal con dispersión los jueves antes de las 14:00 hrs. Tres turnos en planta.',
    historicoNomina: [
      { mes: 'May', total: 5840000, recibos: 568 }, { mes: 'Jun', total: 5912000, recibos: 568 },
      { mes: 'Jul', total: 5980000, recibos: 568 }, { mes: 'Ago', total: 6034000, recibos: 568 },
      { mes: 'Sep', total: 6128000, recibos: 568 }, { mes: 'Oct', total: 6210000, recibos: 568 }
    ],
    alertas: []
  },
  C02: {
    rfc: 'CHE110805K22', razonSocial: 'Constructora Hermosillo, S.A. de C.V.',
    sector: 'Construcción', giro: 'Edificación residencial y obra civil pública',
    domicilioFiscal: 'Blvd. Solidaridad 245, Col. El Llano, Hermosillo, Son. C.P. 83210',
    contactoNombre: 'C.P. Roberto Aguilar', contactoPuesto: 'Director Administrativo',
    contactoEmail: 'raguilar@constructora-hermosillo.com', contactoTelefono: '+52 662 213 0944',
    fechaAlta: '8 de agosto de 2020', ejecutivoCuenta: 'Lic. Daniel Mendoza',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'Banorte',
    observaciones: 'Plantilla con alta rotación por proyecto. Incidencias semanales por destajos y horas extra. SLA bajó por captura tardía de incidencias en obra.',
    historicoNomina: [
      { mes: 'May', total: 3120000, recibos: 348 }, { mes: 'Jun', total: 3245000, recibos: 348 },
      { mes: 'Jul', total: 3318000, recibos: 348 }, { mes: 'Ago', total: 3402000, recibos: 348 },
      { mes: 'Sep', total: 3485000, recibos: 348 }, { mes: 'Oct', total: 3578000, recibos: 348 }
    ],
    alertas: ['Captura de incidencias en obra fuera de tiempo']
  },
  C03: {
    rfc: 'GRM150622TX8', razonSocial: 'Grupo Restaurantero MX, S.A.P.I. de C.V.',
    sector: 'Alimentos y Bebidas', giro: 'Operación de restaurantes de servicio completo (15 sucursales)',
    domicilioFiscal: 'Av. Presidente Masaryk 514, Polanco, CDMX C.P. 11560',
    contactoNombre: 'Lic. Andrea Solís', contactoPuesto: 'Coordinadora de Nóminas Multisucursal',
    contactoEmail: 'asolis@gruporestaurantero.mx', contactoTelefono: '+52 55 5280 7700',
    fechaAlta: '3 de febrero de 2021', ejecutivoCuenta: 'Sra. Patricia Olvera',
    modalidadPago: 'Transferencia interbancaria', bancoDispersion: 'Santander',
    observaciones: 'Quincenal con 213 empleados distribuidos en 15 sucursales. Propinas reportadas por sucursal. Pendiente conciliación CFDI 3 sucursales.',
    historicoNomina: [
      { mes: 'May', total: 7240000, recibos: 426 }, { mes: 'Jun', total: 7398000, recibos: 426 },
      { mes: 'Jul', total: 7512000, recibos: 426 }, { mes: 'Ago', total: 7689000, recibos: 426 },
      { mes: 'Sep', total: 7821000, recibos: 426 }, { mes: 'Oct', total: 7945000, recibos: 426 }
    ],
    alertas: ['Timbrado 97.1% — bajo meta', 'Variación 7.3% sobre presupuesto', 'CFDI pendientes en 3 sucursales']
  },
  C04: {
    rfc: 'LPA180214UV9', razonSocial: 'Logística Pacífico, S. de R.L. de C.V.',
    sector: 'Transporte y Logística', giro: 'Transporte de carga federal y distribución última milla',
    domicilioFiscal: 'Carretera a Nogales km 14.5, Mazatlán, Sin. C.P. 82000',
    contactoNombre: 'Ing. Carlos Beltrán', contactoPuesto: 'Gerente de Operaciones',
    contactoEmail: 'cbeltran@logpacifico.com.mx', contactoTelefono: '+52 669 985 4422',
    fechaAlta: '17 de junio de 2022', ejecutivoCuenta: 'Lic. Daniel Mendoza',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'BBVA',
    observaciones: 'Cliente modelo. Cero incidencias en últimos 4 trimestres. Operadores foráneos con viáticos integrados a recibo.',
    historicoNomina: [
      { mes: 'May', total: 2180000, recibos: 128 }, { mes: 'Jun', total: 2210000, recibos: 128 },
      { mes: 'Jul', total: 2245000, recibos: 128 }, { mes: 'Ago', total: 2278000, recibos: 128 },
      { mes: 'Sep', total: 2312000, recibos: 128 }, { mes: 'Oct', total: 2348000, recibos: 128 }
    ],
    alertas: []
  },
  C05: {
    rfc: 'TBA050910M73', razonSocial: 'Textiles Bajío, S.A. de C.V.',
    sector: 'Textil', giro: 'Manufactura textil y confección de prendas de vestir',
    domicilioFiscal: 'Av. Tecnológico 988, Irapuato, Gto. C.P. 36710',
    contactoNombre: 'C.P. Luis Felipe Cárdenas', contactoPuesto: 'Director de Recursos Humanos',
    contactoEmail: 'lcardenas@textilesbajio.com', contactoTelefono: '+52 462 626 1500',
    fechaAlta: '21 de septiembre de 2018', ejecutivoCuenta: 'Lic. Patricia Olvera',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'Banamex',
    observaciones: 'Cliente CRÍTICO. Cuenta con problemas operativos sostenidos. Reunión de escalamiento programada con dirección. Riesgo de cancelación.',
    historicoNomina: [
      { mes: 'May', total: 5980000, recibos: 356 }, { mes: 'Jun', total: 6210000, recibos: 356 },
      { mes: 'Jul', total: 6498000, recibos: 356 }, { mes: 'Ago', total: 6745000, recibos: 356 },
      { mes: 'Sep', total: 6920000, recibos: 356 }, { mes: 'Oct', total: 7102000, recibos: 356 }
    ],
    alertas: ['SLA 78% — muy por debajo de meta', 'Timbrado 94.5% — riesgo fiscal', 'Variación 11.2% — fuera de control', '3 requerimientos SAT pendientes']
  },
  C06: {
    rfc: 'SMS191130W12', razonSocial: 'Servicios Médicos del Sur, S.C.',
    sector: 'Salud', giro: 'Servicios médicos especializados y hospitalización',
    domicilioFiscal: 'Calz. de Tlalpan 4520, Coyoacán, CDMX C.P. 14080',
    contactoNombre: 'Dra. Patricia Mendoza', contactoPuesto: 'Directora Administrativa',
    contactoEmail: 'pmendoza@smsur.org.mx', contactoTelefono: '+52 55 5424 6700',
    fechaAlta: '5 de noviembre de 2019', ejecutivoCuenta: 'Lic. Daniel Mendoza',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'HSBC',
    observaciones: 'Modalidad mensual. Médicos por honorarios separados de plantilla operativa. Procesamiento estable.',
    historicoNomina: [
      { mes: 'May', total: 1840000, recibos: 90 }, { mes: 'Jun', total: 1855000, recibos: 90 },
      { mes: 'Jul', total: 1872000, recibos: 90 }, { mes: 'Ago', total: 1889000, recibos: 90 },
      { mes: 'Sep', total: 1904000, recibos: 90 }, { mes: 'Oct', total: 1922000, recibos: 90 }
    ],
    alertas: []
  },
  C07: {
    rfc: 'AGS980715P88', razonSocial: 'Agroindustrias Sinaloa, S.A. de C.V.',
    sector: 'Agroindustria', giro: 'Producción y empaque de hortalizas para exportación',
    domicilioFiscal: 'Carretera Internacional km 1885, Culiacán, Sin. C.P. 80020',
    contactoNombre: 'Ing. Alejandro Castro', contactoPuesto: 'Gerente de Capital Humano',
    contactoEmail: 'acastro@agroindustriass.com.mx', contactoTelefono: '+52 667 712 0900',
    fechaAlta: '14 de enero de 2017', ejecutivoCuenta: 'Sra. Patricia Olvera',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'Banorte',
    observaciones: 'La cuenta más grande del despacho por plantilla. Estacionalidad fuerte (cosecha oct-mar). Cumplimiento ejemplar.',
    historicoNomina: [
      { mes: 'May', total: 8420000, recibos: 512 }, { mes: 'Jun', total: 8512000, recibos: 512 },
      { mes: 'Jul', total: 8645000, recibos: 512 }, { mes: 'Ago', total: 8780000, recibos: 512 },
      { mes: 'Sep', total: 9120000, recibos: 540 }, { mes: 'Oct', total: 9485000, recibos: 540 }
    ],
    alertas: []
  },
  C08: {
    rfc: 'DAC120308Q34', razonSocial: 'Distribuidora Automotriz CH, S.A. de C.V.',
    sector: 'Automotriz', giro: 'Distribución de vehículos y refacciones — 4 agencias',
    domicilioFiscal: 'Blvd. Las Torres 5500, Saltillo, Coah. C.P. 25204',
    contactoNombre: 'Lic. Verónica Garza', contactoPuesto: 'Gerente Administrativa',
    contactoEmail: 'vgarza@distautomotrizch.com', contactoTelefono: '+52 844 416 8800',
    fechaAlta: '30 de julio de 2020', ejecutivoCuenta: 'Lic. Daniel Mendoza',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'BBVA',
    observaciones: 'Vendedores con esquema de comisiones variables. Quincenal con cierre estricto. Sin novedades.',
    historicoNomina: [
      { mes: 'May', total: 4180000, recibos: 224 }, { mes: 'Jun', total: 4225000, recibos: 224 },
      { mes: 'Jul', total: 4298000, recibos: 224 }, { mes: 'Ago', total: 4356000, recibos: 224 },
      { mes: 'Sep', total: 4412000, recibos: 224 }, { mes: 'Oct', total: 4485000, recibos: 224 }
    ],
    alertas: []
  },
  C09: {
    rfc: 'HCM160429UJ7', razonSocial: 'Hotelera Costa Maya, S.A. de C.V.',
    sector: 'Hotelería y Turismo', giro: 'Operación hotelera all-inclusive (2 propiedades)',
    domicilioFiscal: 'Carretera Cancún-Tulum km 312, Mahahual, Q. Roo C.P. 77976',
    contactoNombre: 'Lic. Sebastián Reyes', contactoPuesto: 'Director de Recursos Humanos',
    contactoEmail: 'sreyes@hotelescostamaya.com', contactoTelefono: '+52 983 834 0500',
    fechaAlta: '11 de octubre de 2021', ejecutivoCuenta: 'Lic. Patricia Olvera',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'Santander',
    observaciones: 'Personal con propinas y servicios integrados. Temporada baja afecta plantilla. Captura de tarjetas de tiempo con retraso.',
    historicoNomina: [
      { mes: 'May', total: 5680000, recibos: 378 }, { mes: 'Jun', total: 5512000, recibos: 378 },
      { mes: 'Jul', total: 5398000, recibos: 378 }, { mes: 'Ago', total: 5445000, recibos: 378 },
      { mes: 'Sep', total: 5689000, recibos: 378 }, { mes: 'Oct', total: 5912000, recibos: 378 }
    ],
    alertas: ['SLA 82% — bajo meta', 'Captura de tiempos con retraso recurrente']
  },
  C10: {
    rfc: 'CCM230118LB5', razonSocial: 'Consultora Corporativa MX, S.C.',
    sector: 'Servicios Profesionales', giro: 'Consultoría estratégica y financiera',
    domicilioFiscal: 'Paseo de la Reforma 296, Cuauhtémoc, CDMX C.P. 06600',
    contactoNombre: 'Lic. Fernanda Ortega', contactoPuesto: 'Socia Administrativa',
    contactoEmail: 'fortega@cconsultora.mx', contactoTelefono: '+52 55 5511 2080',
    fechaAlta: '18 de enero de 2023', ejecutivoCuenta: 'Lic. Daniel Mendoza',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'Banamex',
    observaciones: 'Cliente más reciente. Plantilla pequeña, alta especialización. Mensual con bono trimestral.',
    historicoNomina: [
      { mes: 'May', total: 1620000, recibos: 76 }, { mes: 'Jun', total: 1645000, recibos: 76 },
      { mes: 'Jul', total: 1672000, recibos: 76 }, { mes: 'Ago', total: 1698000, recibos: 76 },
      { mes: 'Sep', total: 1725000, recibos: 76 }, { mes: 'Oct', total: 1758000, recibos: 76 }
    ],
    alertas: []
  },
  C11: {
    rfc: 'MCN001120V44', razonSocial: 'Metalúrgica del Centro, S.A. de C.V.',
    sector: 'Metalurgia', giro: 'Fundición y forja de piezas industriales',
    domicilioFiscal: 'Av. Constituyentes 1500, Querétaro, Qro. C.P. 76060',
    contactoNombre: 'Ing. Hugo Ramírez', contactoPuesto: 'Gerente de RH',
    contactoEmail: 'hramirez@metalcentro.com.mx', contactoTelefono: '+52 442 224 7300',
    fechaAlta: '20 de noviembre de 2018', ejecutivoCuenta: 'Sra. Patricia Olvera',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'Banorte',
    observaciones: 'Tres turnos. Sindicalizado y de confianza. Tabulador IMSS con prima de antigüedad. Operativo estable.',
    historicoNomina: [
      { mes: 'May', total: 4520000, recibos: 268 }, { mes: 'Jun', total: 4598000, recibos: 268 },
      { mes: 'Jul', total: 4672000, recibos: 268 }, { mes: 'Ago', total: 4740000, recibos: 268 },
      { mes: 'Sep', total: 4812000, recibos: 268 }, { mes: 'Oct', total: 4889000, recibos: 268 }
    ],
    alertas: []
  },
  C12: {
    rfc: 'CGO210504RS6', razonSocial: 'Comercializadora Golfo, S.A. de C.V.',
    sector: 'Comercio', giro: 'Comercialización mayorista de productos del mar',
    domicilioFiscal: 'Calle 18 de Marzo 220, Veracruz, Ver. C.P. 91700',
    contactoNombre: 'C.P. Daniela Rosales', contactoPuesto: 'Contralora',
    contactoEmail: 'drosales@comercgolfo.com.mx', contactoTelefono: '+52 229 932 1450',
    fechaAlta: '4 de mayo de 2021', ejecutivoCuenta: 'Lic. Daniel Mendoza',
    modalidadPago: 'Transferencia SPEI', bancoDispersion: 'BBVA',
    observaciones: 'Operación quincenal sin novedades. Personal de bodega y rutas con prestaciones de ley.',
    historicoNomina: [
      { mes: 'May', total: 2480000, recibos: 152 }, { mes: 'Jun', total: 2512000, recibos: 152 },
      { mes: 'Jul', total: 2548000, recibos: 152 }, { mes: 'Ago', total: 2580000, recibos: 152 },
      { mes: 'Sep', total: 2612000, recibos: 152 }, { mes: 'Oct', total: 2648000, recibos: 152 }
    ],
    alertas: []
  }
};

const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MES_INDEX: Record<string, number> = {
  'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
  'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
};

const parsePeriodo = (periodo: string): { mesIdx: number; year: number } => {
  const [mesStr, yearStr] = periodo.split(' ');
  return { mesIdx: MES_INDEX[mesStr] ?? 3, year: parseInt(yearStr) || 2026 };
};

const ventanaMeses = (periodo: string, count: number): string[] => {
  const { mesIdx, year } = parsePeriodo(periodo);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    let m = mesIdx - i;
    let y = year;
    while (m < 0) { m += 12; y -= 1; }
    out.push(`${MESES_ES[m]} ${String(y).slice(-2)}`);
  }
  return out;
};

const procesamientoSemanal = (periodo: string) => {
  const rnd = mulberry32(seedFromString('proc:' + periodo));
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return dias.map((dia, i) => {
    const baseCompletadas = [6, 5, 3, 4, 5, 1][i];
    const completadas = Math.max(0, baseCompletadas + Math.round((rnd() - 0.5) * 3));
    const pendientes = i >= 2 ? Math.max(0, Math.round(rnd() * 3)) : 0;
    const atrasadas = i === 4 ? Math.max(0, Math.round(rnd() * 2)) : 0;
    return { dia, completadas, pendientes, atrasadas };
  });
};

const timbradoMensual = (periodo: string) => {
  const meses = ventanaMeses(periodo, 6);
  return meses.map(mes => {
    const rnd = mulberry32(seedFromString('timbrado:' + mes));
    const porcentaje = Math.round((97.5 + rnd() * 2.4) * 10) / 10;
    return { mes, porcentaje };
  });
};

const variacionMensual = (periodo: string) => {
  const meses = ventanaMeses(periodo, 6);
  return meses.map((mes, i) => {
    const rnd = mulberry32(seedFromString('variacion:' + mes));
    const ppto = 8400000 + i * 110000 + Math.round((rnd() - 0.5) * 280000);
    const real = ppto + Math.round((1 + rnd() * 4.5) * ppto / 100);
    return { mes, presupuesto: ppto, real };
  });
};

const cumplimientoFiscal = (periodo: string) => {
  const rnd = mulberry32(seedFromString('cumpl:' + periodo));
  const entidades = ['SAT', 'IMSS', 'INFONAVIT', 'FONACOT', 'ISR', 'Estatales'];
  const bases = [99.1, 100, 100, 98.4, 99.8, 97.2];
  return entidades.map((entidad, i) => ({
    entidad,
    cumplimiento: Math.min(100, Math.max(92, Math.round((bases[i] + (rnd() - 0.5) * 4) * 10) / 10))
  }));
};

const ajustarClientePorPeriodo = (c: Cliente, periodo: string): Cliente => {
  const rnd = mulberry32(seedFromString(c.id + '|' + periodo));
  const offsets: Record<string, number> = { 'Abril 2026': 0, 'Marzo 2026': 1, 'Febrero 2026': 2, 'Enero 2026': 3 };
  const trend = offsets[periodo] ?? 0;

  const slaJitter = (rnd() - 0.5) * 5;
  const timbradoJitter = (rnd() - 0.5) * 1.4;
  const varJitter = (rnd() - 0.5) * 2;
  const empleadosJitter = Math.round((rnd() - 0.5) * 6);
  const feeJitter = Math.round((rnd() - 0.5) * 1500);
  const costoJitter = Math.round((rnd() - 0.5) * 800);

  const slaTrend = -trend * 0.4;
  const variacionTrend = trend * 0.3;

  return {
    ...c,
    slaCumplido: Math.round(Math.max(60, Math.min(100, c.slaCumplido + slaJitter + slaTrend))),
    timbrado: Math.round(Math.min(100, Math.max(90, c.timbrado + timbradoJitter)) * 10) / 10,
    variacion: Math.max(0, Math.round((c.variacion + varJitter + variacionTrend) * 10) / 10),
    empleados: Math.max(20, c.empleados + empleadosJitter - trend * 2),
    fee: Math.max(5000, c.fee + feeJitter),
    costoOp: Math.max(2000, c.costoOp + costoJitter)
  };
};

interface KPIDetallePeriodo {
  exactitud: number;
  cumplimientoPlazos: number;
  costoPorRecibo: number;
  tiempoResolucion: number;
  erroresCumplimiento: number;
}

const kpisDetallePorPeriodo = (periodo: string): KPIDetallePeriodo => {
  const rnd = mulberry32(seedFromString('kpisDet:' + periodo));
  return {
    exactitud: Math.round((98.8 + rnd() * 1.0) * 10) / 10,
    cumplimientoPlazos: Math.round((97.0 + rnd() * 2.5) * 10) / 10,
    costoPorRecibo: 110 + Math.round(rnd() * 18),
    tiempoResolucion: Math.round((3.6 + rnd() * 1.4) * 10) / 10,
    erroresCumplimiento: Math.round(rnd() * 4)
  };
};

interface ReporteMaterialidad {
  numero: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  frecuencia: string;
  retencion: string;
  evidencia: string;
}

const REPORTES_MATERIALIDAD: ReporteMaterialidad[] = [
  {
    numero: '01',
    titulo: 'Contrato de Prestación de Servicios con Razón de Negocio',
    descripcion: 'Contrato firmado con cláusulas de alcance, fee, vigencia, entregables específicos y declaración expresa de razón de negocio conforme al artículo 5-A del CFF. Anexos por sucursal o razón social cuando aplique.',
    tipo: 'Documento legal',
    frecuencia: 'Anual / al alta',
    retencion: '5 años post-vigencia (Art. 30 CFF)',
    evidencia: 'Existencia, razón de negocio y materialidad sustancial (Art. 5-A CFF)'
  },
  {
    numero: '02',
    titulo: 'Constancia de Situación Fiscal (CSF) Vigente',
    descripcion: 'CSF actualizada del cliente y del despacho con régimen fiscal, obligaciones y actividades económicas registradas; validación que el régimen del cliente permite la deducción del servicio.',
    tipo: 'Documento SAT',
    frecuencia: 'Anual o por cambio de domicilio/régimen',
    retencion: '5 años (Art. 30 CFF)',
    evidencia: 'Identificación fiscal y régimen vigente al momento del servicio'
  },
  {
    numero: '03',
    titulo: 'Opinión Positiva de Cumplimiento (Art. 32-D CFF)',
    descripcion: 'Opinión de cumplimiento en sentido positivo del cliente y del despacho, descargada del Portal SAT al momento del cierre del servicio o de la facturación.',
    tipo: 'Acuse SAT',
    frecuencia: 'Mensual o trimestral',
    retencion: '5 años',
    evidencia: 'Estado de cumplimiento fiscal de ambas partes'
  },
  {
    numero: '04',
    titulo: 'Verificación de Listas EFOS / EDOS (Art. 69-B CFF)',
    descripcion: 'Evidencia de consulta periódica al listado del SAT de Empresas que Facturan Operaciones Simuladas (EFOS) y EDOS para confirmar que ninguna parte se ubica en presunción o lista definitiva.',
    tipo: 'Verificación SAT',
    frecuencia: 'Mensual y previo a cada facturación',
    retencion: '5 años',
    evidencia: 'Mitigación del riesgo de operaciones simuladas'
  },
  {
    numero: '05',
    titulo: 'Constancia REPSE Vigente (cuando proceda)',
    descripcion: 'Registro de Prestadoras de Servicios Especializados u Obras Especializadas vigente del despacho, con folio activo y renovación trianual conforme a la reforma laboral 2021 (LFT 12-15).',
    tipo: 'Registro STPS',
    frecuencia: 'Verificación trianual / al inicio de servicio',
    retencion: 'Mientras dure la relación + 5 años',
    evidencia: 'Procedencia de la deducción cuando hay personal especializado'
  },
  {
    numero: '06',
    titulo: 'Orden de Servicio del Periodo',
    descripcion: 'Documento por periodo de nómina que detalla el alcance procesado, número de empleados, entregables comprometidos y vinculación uno-a-uno con el CFDI emitido (Art. 29-A CFF).',
    tipo: 'Documento operativo',
    frecuencia: 'Por periodo de nómina',
    retencion: '5 años',
    evidencia: 'Servicio efectivamente prestado y trazabilidad CFDI'
  },
  {
    numero: '07',
    titulo: 'CFDI 4.0 de Honorarios + Complemento REP',
    descripcion: 'Factura del despacho con descripción detallada del servicio (no genérica), uso del CFDI correcto, método y forma de pago conforme al catálogo SAT, y Complemento de Recibo Electrónico de Pago por cada cobro.',
    tipo: 'CFDI 4.0',
    frecuencia: 'Por cada facturación / cobro',
    retencion: '5 años',
    evidencia: 'Concepto, monto y cobro real del honorario'
  },
  {
    numero: '08',
    titulo: 'CFDI 4.0 de Nómina con Complemento Vigente',
    descripcion: 'Recibos timbrados con Complemento de Nómina conforme a la guía SAT vigente, percepciones y deducciones segregadas por clave del catálogo, y conciliación XML / PDF / acuse archivados.',
    tipo: 'CFDI nómina',
    frecuencia: 'Por periodo de pago',
    retencion: '5 años',
    evidencia: 'Entregable concreto y deducible para el cliente'
  },
  {
    numero: '09',
    titulo: 'Bitácora de Procesamiento con Sello de Tiempo',
    descripcion: 'Log digital con fecha y hora de recepción de incidencias, captura, validación, autorización del cliente, dispersión y timbrado; firma electrónica del responsable por etapa.',
    tipo: 'Reporte interno',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Trazabilidad operativa y control interno del servicio'
  },
  {
    numero: '10',
    titulo: 'Acuses IMSS-IDSE / SUA / EMA / EBA',
    descripcion: 'Acuses de movimientos afiliatorios (altas, bajas, modificaciones de salario), pago de cuotas obrero-patronales, EMA bimestral y EBA mensual del cliente.',
    tipo: 'Acuse IMSS',
    frecuencia: 'Mensual / por evento',
    retencion: '5 años (5 años IMSS Art. 251)',
    evidencia: 'Cumplimiento de obligaciones de seguridad social'
  },
  {
    numero: '11',
    titulo: 'Acuses INFONAVIT (SISUB) y FONACOT',
    descripcion: 'Reporte trimestral SISUB para servicios especializados, acuses de retención y entero de descuentos INFONAVIT y FONACOT, conciliación con base salarial cotizable.',
    tipo: 'Acuse oficial',
    frecuencia: 'Trimestral SISUB / mensual descuentos',
    retencion: '5 años',
    evidencia: 'Cumplimiento de obligaciones derivadas de servicios especializados'
  },
  {
    numero: '12',
    titulo: 'Acuses Declaraciones ISR Retenido (Buzón Tributario)',
    descripcion: 'Acuses de presentación y pago del ISR por sueldos y salarios; notificaciones del Buzón Tributario activo (Art. 17-K CFF) y papeles de trabajo del cálculo entregado.',
    tipo: 'Acuse SAT',
    frecuencia: 'Mensual',
    retencion: '5 años',
    evidencia: 'Resultado fiscal entregado al cliente y obligación cumplida'
  },
  {
    numero: '13',
    titulo: 'Reporte de Incidencias del Cliente con Sello de Tiempo',
    descripcion: 'Insumo del cliente con altas, bajas, faltas, horas extra, vacaciones, comisiones, recibido por portal o correo con sello de tiempo verificable y firma del responsable autorizado.',
    tipo: 'Insumo del cliente',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Trazabilidad del insumo que originó el procesamiento'
  },
  {
    numero: '14',
    titulo: 'Conciliaciones y Layout de Dispersión Bancaria',
    descripcion: 'Layout bancario de dispersión, conciliación tres puntos (cliente / despacho / banco), comprobantes de transferencia y reporte de pagos no aplicados o devueltos.',
    tipo: 'Reporte financiero',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Cierre financiero verificable del servicio'
  },
  {
    numero: '15',
    titulo: 'Declaración Informativa de Beneficiarios Controladores',
    descripcion: 'Identificación de beneficiarios controladores del cliente conforme a los artículos 32-B Quáter y Quinquies del CFF, expediente con datos verificados y reporte ante el SAT cuando aplique.',
    tipo: 'Declaración SAT',
    frecuencia: 'Anual o ante cambios',
    retencion: '5 años',
    evidencia: 'Cumplimiento de transparencia corporativa'
  },
  {
    numero: '16',
    titulo: 'Minutas y Comunicaciones Formales',
    descripcion: 'Minutas de juntas mensuales con cliente, correos formales, tickets de soporte y reportes ejecutivos del periodo; evidencia de relación comercial sostenida y entregables consultivos.',
    tipo: 'Comunicación',
    frecuencia: 'Continua',
    retencion: '5 años',
    evidencia: 'Razón comercial y relación profesional sostenida'
  }
];

const Dashboard: React.FC = () => {
  const [periodo, setPeriodo] = useState<string>('Abril 2026');
  const [filtroEstatus, setFiltroEstatus] = useState<string>('todos');
  const [pestana, setPestana] = useState<'operativo' | 'materialidad' | 'reportes' | 'chat' | 'alertas'>('operativo');
  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir(k === 'nombre' || k === 'periodicidad' || k === 'estatus' ? 'asc' : 'desc'); }
  };

  const estatusRank: Record<Estatus, number> = { ok: 0, riesgo: 1, critico: 2 };

  const formatMXN = (n: number): string =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
  const formatNum = (n: number): string => new Intl.NumberFormat('es-MX').format(n);

  const clientesPeriodo = useMemo<Cliente[]>(() =>
    CLIENTES.map(c => ajustarClientePorPeriodo(c, periodo)), [periodo]);

  const clientesFiltrados = useMemo<Cliente[]>(() => {
    const base = filtroEstatus === 'todos' ? clientesPeriodo : clientesPeriodo.filter(c => c.estatus === filtroEstatus);
    const margenDe = (c: Cliente) => ((c.fee - c.costoOp) / c.fee) * 100;
    const get = (c: Cliente): number | string => {
      switch (sortKey) {
        case 'nombre': return c.nombre.toLowerCase();
        case 'empleados': return c.empleados;
        case 'periodicidad': return c.periodicidad;
        case 'slaCumplido': return c.slaCumplido;
        case 'timbrado': return c.timbrado;
        case 'variacion': return c.variacion;
        case 'fee': return c.fee;
        case 'margen': return margenDe(c);
        case 'estatus': return estatusRank[c.estatus];
      }
    };
    const sorted = [...base].sort((a, b) => {
      const va = get(a), vb = get(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filtroEstatus, sortKey, sortDir, clientesPeriodo]);

  const kpis = useMemo(() => {
    const totalEmpleados = clientesPeriodo.reduce((s, c) => s + c.empleados, 0);
    const feeTotal = clientesPeriodo.reduce((s, c) => s + c.fee, 0);
    const costoTotal = clientesPeriodo.reduce((s, c) => s + c.costoOp, 0);
    const margen = ((feeTotal - costoTotal) / feeTotal) * 100;
    const timbradoProm = clientesPeriodo.reduce((s, c) => s + c.timbrado, 0) / clientesPeriodo.length;
    const slaProm = clientesPeriodo.reduce((s, c) => s + c.slaCumplido, 0) / clientesPeriodo.length;
    const variacionProm = clientesPeriodo.reduce((s, c) => s + c.variacion, 0) / clientesPeriodo.length;
    return { totalEmpleados, feeTotal, costoTotal, margen, timbradoProm, slaProm, variacionProm };
  }, [clientesPeriodo]);

  const rentabilidadPorCliente = useMemo(() =>
    clientesPeriodo.map(c => ({
      nombre: c.nombre,
      margen: Number((((c.fee - c.costoOp) / c.fee) * 100).toFixed(1))
    })).sort((a, b) => b.margen - a.margen), [clientesPeriodo]);

  const distribucionPeriodicidad = useMemo(() => {
    const grupos = clientesPeriodo.reduce<Record<string, number>>((acc, c) => {
      acc[c.periodicidad] = (acc[c.periodicidad] || 0) + c.empleados;
      return acc;
    }, {});
    return Object.entries(grupos).map(([name, value]) => ({ name, value }));
  }, [clientesPeriodo]);

  const procesamientoSemanalData = useMemo(() => procesamientoSemanal(periodo), [periodo]);
  const timbradoMensualData = useMemo(() => timbradoMensual(periodo), [periodo]);
  const variacionMensualData = useMemo(() => variacionMensual(periodo), [periodo]);
  const cumplimientoFiscalData = useMemo(() => cumplimientoFiscal(periodo), [periodo]);
  const kpisDetalle = useMemo(() => kpisDetallePorPeriodo(periodo), [periodo]);

  const estatusColor = (e: Estatus): string => e === 'ok' ? C.olive : e === 'riesgo' ? C.amber : C.coral;
  const estatusTexto = (e: Estatus): string => e === 'ok' ? 'Saludable' : e === 'riesgo' ? 'Atención' : 'Crítico';

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ backgroundColor: C.ink, padding: '10px 14px', borderRadius: 2 }}>
        <p style={{ color: C.paper, fontFamily: FONT, fontSize: 11, fontWeight: 700, margin: 0, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || C.paperSoft, fontFamily: FONT, margin: 0, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
            {p.name}: {typeof p.value === 'number' ? formatNum(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: C.paper,
      minHeight: '100vh',
      padding: '48px 56px',
      fontFamily: FONT,
      color: C.ink
    }}>
      <div style={{ marginBottom: 40, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 18, borderBottom: `2px solid ${C.ink}` }}>
          <div>
            <h1 style={{ fontFamily: FONT, fontSize: 44, fontWeight: 700, margin: 0, lineHeight: 0.95, color: C.ink, letterSpacing: '-1px' }}>
              GUSTAVO ROBLES NÓMINAS
            </h1>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.inkSoft, marginTop: 6 }}>
              Gestión de Nóminas · {periodo}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                color: C.ink,
                border: `1px solid ${C.ink}`,
                padding: '8px 16px',
                borderRadius: 0,
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              <option>Abril 2026</option>
              <option>Marzo 2026</option>
              <option>Febrero 2026</option>
              <option>Enero 2026</option>
            </select>
            <div style={{ fontSize: 10, color: C.inkMute, marginTop: 8, fontFamily: FONT }}>
              {CLIENTES.length} empresas · {formatNum(kpis.totalEmpleados)} colaboradores
            </div>
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: C.ink, marginTop: 2 }} />
      </div>

      {/* PESTAÑAS */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: `1px solid ${C.rule}` }}>
        <button
          onClick={() => setPestana('operativo')}
          style={{
            backgroundColor: 'transparent',
            color: pestana === 'operativo' ? C.coral : C.inkSoft,
            border: 'none',
            borderBottom: pestana === 'operativo' ? `2px solid ${C.coral}` : '2px solid transparent',
            padding: '14px 0',
            marginRight: 32,
            marginBottom: -1,
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Tablero Operativo
        </button>
        <button
          onClick={() => setPestana('materialidad')}
          style={{
            backgroundColor: 'transparent',
            color: pestana === 'materialidad' ? C.coral : C.inkSoft,
            border: 'none',
            borderBottom: pestana === 'materialidad' ? `2px solid ${C.coral}` : '2px solid transparent',
            padding: '14px 0',
            marginRight: 32,
            marginBottom: -1,
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Estrategias de Materialidad
        </button>
        <button
          onClick={() => setPestana('reportes')}
          style={{
            backgroundColor: 'transparent',
            color: pestana === 'reportes' ? C.coral : C.inkSoft,
            border: 'none',
            borderBottom: pestana === 'reportes' ? `2px solid ${C.coral}` : '2px solid transparent',
            padding: '14px 0',
            marginRight: 32,
            marginBottom: -1,
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Reporte a Clientes
        </button>
        <button
          onClick={() => setPestana('chat')}
          style={{
            backgroundColor: 'transparent',
            color: pestana === 'chat' ? C.coral : C.inkSoft,
            border: 'none',
            borderBottom: pestana === 'chat' ? `2px solid ${C.coral}` : '2px solid transparent',
            padding: '14px 0',
            marginRight: 32,
            marginBottom: -1,
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Asistente
        </button>
        <button
          onClick={() => setPestana('alertas')}
          style={{
            backgroundColor: 'transparent',
            color: pestana === 'alertas' ? C.coral : C.inkSoft,
            border: 'none',
            borderBottom: pestana === 'alertas' ? `2px solid ${C.coral}` : '2px solid transparent',
            padding: '14px 0',
            marginRight: 32,
            marginBottom: -1,
            fontSize: 14,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Alertas Tempranas
        </button>
      </div>

      {/* CONTENIDO PESTAÑA OPERATIVO */}
      {pestana === 'operativo' && (
      <div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 48, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <KPI titulo="Cumplimiento SLA" valor={kpis.slaProm.toFixed(1)} unidad="%" meta="meta ≥ 95" estado={kpis.slaProm >= 95 ? 'ok' : 'alerta'} semaforo={kpis.slaProm >= 90 ? 'verde' : kpis.slaProm >= 85 ? 'amarillo' : 'rojo'} divider />
        <KPI titulo="Timbrado CFDI" valor={kpis.timbradoProm.toFixed(1)} unidad="%" meta="meta ≥ 99" estado={kpis.timbradoProm >= 99 ? 'ok' : 'alerta'} semaforo={kpis.timbradoProm >= 99 ? 'verde' : kpis.timbradoProm >= 98 ? 'amarillo' : 'rojo'} divider />
        <KPI titulo="Variación vs Presupuesto" valor={'+' + kpis.variacionProm.toFixed(1)} unidad="%" meta="meta ≤ 3.0" estado={kpis.variacionProm <= 3 ? 'ok' : 'alerta'} semaforo={kpis.variacionProm <= 3 ? 'verde' : kpis.variacionProm <= 4 ? 'amarillo' : 'rojo'} divider />
        <KPI titulo="Margen Operativo" valor={kpis.margen.toFixed(1)} unidad="%" meta={formatMXN(kpis.feeTotal - kpis.costoTotal)} estado={kpis.margen >= 40 ? 'ok' : 'alerta'} semaforo={kpis.margen >= 40 ? 'verde' : kpis.margen >= 35 ? 'amarillo' : 'rojo'} />
      </div>

      <Row>
        <Panel titulo="Procesamiento Semanal" kicker="La Semana en Curso" flex={1.3}>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={procesamientoSemanalData} margin={{ top: 28, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
              <XAxis dataKey="dia" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} />
              <YAxis stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.paperSoft }} />
              <Legend wrapperStyle={{ fontSize: 13, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase', color: C.inkSoft }} />
              <Bar dataKey="completadas" stackId="a" fill={C.olive} name="Completadas" />
              <Bar dataKey="pendientes" stackId="a" fill={C.amber} name="Pendientes" />
              <Bar dataKey="atrasadas" stackId="a" fill={C.coral} name="Atrasadas">
                <LabelList valueAccessor={(entry: { completadas: number; pendientes: number; atrasadas: number }) => entry.completadas + entry.pendientes + entry.atrasadas} position="top" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: C.ink }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titulo="Timbrado CFDI" kicker="Seis Meses en Curva" flex={1}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timbradoMensualData} margin={{ top: 28, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.coral} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.coral} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
              <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} />
              <YAxis domain={[97, 100]} ticks={[97, 98, 99, 100]} stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="porcentaje" stroke={C.coral} strokeWidth={2.5} fill="url(#coralGrad)" name="% Exitoso">
                <LabelList dataKey="porcentaje" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: C.crimson }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </Row>

      <Row>
        <Panel titulo="Nómina Real vs Presupuesto" kicker="La Brecha del Semestre" flex={1.3}>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={variacionMensualData} margin={{ top: 28, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
              <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} />
              <YAxis stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.paperSoft }} />
              <Legend wrapperStyle={{ fontSize: 13, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }} />
              <Bar dataKey="presupuesto" fill={C.inkSoft} name="Presupuesto">
                <LabelList dataKey="presupuesto" position="top" formatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: C.inkSoft }} />
              </Bar>
              <Bar dataKey="real" fill={C.coral} name="Real">
                <LabelList dataKey="real" position="top" formatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: C.crimson }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titulo="Cumplimiento Fiscal" kicker="Seis Entidades en Examen" flex={1}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={cumplimientoFiscalData}>
              <PolarGrid stroke={C.rule} />
              <PolarAngleAxis dataKey="entidad" tick={{ fill: C.inkSoft, fontSize: 13, fontFamily: FONT }} />
              <PolarRadiusAxis domain={[90, 100]} tick={{ fill: C.inkMute, fontSize: 12, fontFamily: FONT }} axisLine={false} />
              <Radar name="Cumplimiento" dataKey="cumplimiento" stroke={C.coral} fill={C.coral} fillOpacity={0.25} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      </Row>

      <Row>
        <Panel titulo="Rentabilidad por Cuenta (% UO)" kicker="El Ranking Silencioso" flex={1.5}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={rentabilidadPorCliente} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} horizontal={false} />
              <XAxis type="number" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} tickFormatter={(v: number) => v + '%'} domain={[0, 80]} />
              <YAxis
                type="category"
                dataKey="nombre"
                stroke={C.inkSoft}
                style={{ fontSize: 12, fontFamily: FONT }}
                axisLine={false}
                tickLine={false}
                width={180}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.paperSoft }} />
              <Bar dataKey="margen" fill={C.olive} name="Margen %">
                <LabelList
                  dataKey="margen"
                  position="right"
                  style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, fill: C.ink }}
                  formatter={(v: number) => v + '%'}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titulo="Periodicidad" kicker="Distribución de Plantilla" flex={1}>
          <div style={{ width: '100%', height: 320, overflow: 'visible' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                <Pie
                  data={distribucionPeriodicidad}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={(props: { name: string; percent: number; x: number; y: number; cx: number }) => {
                    const { name, percent, x, y, cx } = props;
                    return (
                      <text
                        x={x}
                        y={y}
                        fill={C.ink}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: 13, fontFamily: FONT, fontWeight: 700 }}
                      >
                        {`${name} · ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: C.inkSoft, strokeWidth: 0.5 }}
                >
                  <Cell fill="#d4553a" stroke={C.paper} strokeWidth={2} />
                  <Cell fill="#4a5d3a" stroke={C.paper} strokeWidth={2} />
                  <Cell fill="#c4953a" stroke={C.paper} strokeWidth={2} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </Row>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: FONT, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
          Los Indicadores del Servicio
        </div>
        <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px', marginBottom: 24 }}>
          KPIs de Calidad y Cumplimiento
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
          <KPIDetalle numero="01" titulo="Exactitud de Nómina" subtitulo="Payroll Accuracy Rate" valor={kpisDetalle.exactitud.toFixed(1)} unidad="%" meta="meta ≥ 99.5%" descripcion="Recibos sin errores sobre el total emitido." estado={kpisDetalle.exactitud >= 99.5 ? 'ok' : 'alerta'} divider />
          <KPIDetalle numero="02" titulo="Cumplimiento de Plazos" subtitulo="Timeliness" valor={kpisDetalle.cumplimientoPlazos.toFixed(1)} unidad="%" meta="meta ≥ 98%" descripcion="Nóminas entregadas y pagadas a tiempo." estado={kpisDetalle.cumplimientoPlazos >= 98 ? 'ok' : 'alerta'} divider />
          <KPIDetalle numero="03" titulo="Costo por Recibo" subtitulo="Cost per Payslip" valor={`$${kpisDetalle.costoPorRecibo}`} unidad="MXN" meta="meta ≤ $125" descripcion="Costos operativos sobre empleados procesados." estado={kpisDetalle.costoPorRecibo <= 125 ? 'ok' : 'alerta'} divider />
          <KPIDetalle numero="04" titulo="Tiempo Medio de Resolución" subtitulo="Mean Resolution Time" valor={kpisDetalle.tiempoResolucion.toFixed(1)} unidad="hrs" meta="meta ≤ 4 hrs" descripcion="Respuesta a consultas de empleados." estado={kpisDetalle.tiempoResolucion <= 4 ? 'ok' : 'alerta'} divider />
          <KPIDetalle numero="05" titulo="Errores de Cumplimiento" subtitulo="Compliance Error Index" valor={kpisDetalle.erroresCumplimiento.toString()} unidad="casos" meta="meta = 0" descripcion="Multas o requerimientos SAT/IMSS/INFONAVIT." estado={kpisDetalle.erroresCumplimiento === 0 ? 'ok' : 'alerta'} />
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: FONT, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
          El Registro
        </div>
        <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px', marginBottom: 20 }}>
          Cartera de Clientes
        </h2>

        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.rule}` }}>
          {(['todos', 'ok', 'riesgo', 'critico'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroEstatus(f)}
              style={{
                backgroundColor: 'transparent',
                color: filtroEstatus === f ? C.coral : C.inkSoft,
                border: 'none',
                borderBottom: filtroEstatus === f ? `2px solid ${C.coral}` : '2px solid transparent',
                padding: '10px 20px 10px 0',
                marginRight: 24,
                marginBottom: -1,
                fontSize: 13,
                fontFamily: FONT,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              {f === 'todos' ? 'Todos' : f === 'ok' ? 'Saludables' : f === 'riesgo' ? 'Atención' : 'Críticos'}
            </button>
          ))}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <SortableTh label="Cliente" k="nombre" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Empleados" k="empleados" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Periodicidad" k="periodicidad" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="SLA" k="slaCumplido" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Timbrado" k="timbrado" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Variación" k="variacion" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Fee" k="fee" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Margen" k="margen" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortableTh label="Estatus" k="estatus" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c, idx) => {
              const margen = (((c.fee - c.costoOp) / c.fee) * 100).toFixed(1);
              return (
                <tr
                  key={c.id}
                  onClick={() => setClienteSeleccionado(c)}
                  style={{ borderBottom: `1px solid ${C.ruleSoft}`, backgroundColor: idx % 2 === 0 ? 'transparent' : C.paperSoft, cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.ruleSoft)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : C.paperSoft)}
                >
                  <td style={{ ...tdStyle, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: C.ink }}>{c.nombre}</td>
                  <td style={tdStyleNum}>{formatNum(c.empleados)}</td>
                  <td style={{ ...tdStyle, color: C.inkSoft, fontFamily: FONT }}>{c.periodicidad}</td>
                  <td style={{ ...tdStyleNum, color: c.slaCumplido >= 95 ? C.olive : c.slaCumplido >= 85 ? C.amber : C.crimson, fontWeight: 700 }}>
                    {c.slaCumplido}%
                  </td>
                  <td style={{ ...tdStyleNum, color: c.timbrado >= 99 ? C.olive : C.amber, fontWeight: 700 }}>
                    {c.timbrado}%
                  </td>
                  <td style={{ ...tdStyleNum, color: c.variacion <= 3 ? C.olive : c.variacion <= 7 ? C.amber : C.crimson, fontWeight: 700 }}>
                    +{c.variacion}%
                  </td>
                  <td style={tdStyleNum}>{formatMXN(c.fee)}</td>
                  <td style={{ ...tdStyleNum, color: C.coral, fontWeight: 700 }}>{margen}%</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: estatusColor(c.estatus), marginRight: 8, verticalAlign: 'middle' }} />
                    <span style={{ fontSize: 15, fontFamily: FONT, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: C.inkSoft }}>
                      {estatusTexto(c.estatus)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
      )}

      {/* CONTENIDO PESTAÑA MATERIALIDAD */}
      {pestana === 'materialidad' && (
        <PestanaMaterialidad />
      )}

      {/* CONTENIDO PESTAÑA REPORTE A CLIENTES */}
      {pestana === 'reportes' && (
        <PestanaReportes periodo={periodo} formatMXN={formatMXN} formatNum={formatNum} />
      )}

      {/* CONTENIDO PESTAÑA ASISTENTE (CHAT SIMULADO) */}
      {pestana === 'chat' && (
        <PestanaChat />
      )}

      {/* CONTENIDO PESTAÑA ALERTAS TEMPRANAS */}
      {pestana === 'alertas' && (
        <PestanaAlertas />
      )}

      {clienteSeleccionado && (
        <FichaTecnicaModal
          cliente={clienteSeleccionado}
          ficha={FICHAS[clienteSeleccionado.id]}
          onClose={() => setClienteSeleccionado(null)}
          formatMXN={formatMXN}
          formatNum={formatNum}
          estatusColor={estatusColor}
          estatusTexto={estatusTexto}
        />
      )}

    </div>
  );
};

interface FichaTecnicaModalProps {
  cliente: Cliente;
  ficha: FichaTecnica;
  onClose: () => void;
  formatMXN: (n: number) => string;
  formatNum: (n: number) => string;
  estatusColor: (e: Estatus) => string;
  estatusTexto: (e: Estatus) => string;
}

const FichaTecnicaModal: React.FC<FichaTecnicaModalProps> = ({ cliente, ficha, onClose, formatMXN, formatNum, estatusColor, estatusTexto }) => {
  const margen = (((cliente.fee - cliente.costoOp) / cliente.fee) * 100).toFixed(1);
  const totalRecibos6m = ficha.historicoNomina.reduce((s, m) => s + m.recibos, 0);
  const totalNomina6m = ficha.historicoNomina.reduce((s, m) => s + m.total, 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(26, 24, 20, 0.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1000, padding: '40px 24px', overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: C.paper,
          width: '100%', maxWidth: 920,
          padding: '40px 48px',
          fontFamily: FONT, color: C.ink,
          borderTop: `4px solid ${C.coral}`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 18, borderBottom: `2px solid ${C.ink}` }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 6, fontWeight: 700 }}>
              Ficha Técnica · {cliente.id}
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: '-0.6px' }}>{cliente.nombre}</h2>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 6 }}>{ficha.razonSocial} · {ficha.rfc}</div>
            <div style={{ marginTop: 10 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: estatusColor(cliente.estatus), marginRight: 8, verticalAlign: 'middle' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: C.inkSoft }}>
                {estatusTexto(cliente.estatus)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent', color: C.ink,
              border: `1px solid ${C.ink}`, padding: '8px 16px',
              fontSize: 11, fontFamily: FONT, fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer'
            }}
          >
            Cerrar ✕
          </button>
        </div>

        {ficha.alertas.length > 0 && (
          <div style={{ backgroundColor: C.paperSoft, borderLeft: `3px solid ${C.coral}`, padding: '12px 16px', marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 6 }}>Alertas activas</div>
            {ficha.alertas.map((a, i) => (
              <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 2 }}>· {a}</div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }}>
          <Seccion titulo="Datos Fiscales y Generales">
            <Dato etiqueta="Sector" valor={ficha.sector} />
            <Dato etiqueta="Giro" valor={ficha.giro} />
            <Dato etiqueta="Domicilio Fiscal" valor={ficha.domicilioFiscal} />
            <Dato etiqueta="Fecha de alta" valor={ficha.fechaAlta} />
            <Dato etiqueta="Ejecutivo de cuenta" valor={ficha.ejecutivoCuenta} />
          </Seccion>

          <Seccion titulo="Contacto Operativo">
            <Dato etiqueta="Nombre" valor={ficha.contactoNombre} />
            <Dato etiqueta="Puesto" valor={ficha.contactoPuesto} />
            <Dato etiqueta="Correo" valor={ficha.contactoEmail} />
            <Dato etiqueta="Teléfono" valor={ficha.contactoTelefono} />
            <Dato etiqueta="Dispersión" valor={`${ficha.modalidadPago} · ${ficha.bancoDispersion}`} />
          </Seccion>
        </div>

        <Seccion titulo="Indicadores Operativos">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}`, marginTop: 8 }}>
            <KPICelda etiqueta="Empleados" valor={formatNum(cliente.empleados)} unidad={cliente.periodicidad} />
            <KPICelda etiqueta="SLA Cumplido" valor={`${cliente.slaCumplido}`} unidad="%" color={cliente.slaCumplido >= 95 ? C.olive : cliente.slaCumplido >= 85 ? C.amber : C.crimson} />
            <KPICelda etiqueta="Timbrado" valor={`${cliente.timbrado}`} unidad="%" color={cliente.timbrado >= 99 ? C.olive : C.amber} />
            <KPICelda etiqueta="Variación vs ppto" valor={`+${cliente.variacion}`} unidad="%" color={cliente.variacion <= 3 ? C.olive : cliente.variacion <= 7 ? C.amber : C.crimson} divider={false} />
          </div>
        </Seccion>

        <div style={{ marginTop: 28 }}>
          <Seccion titulo="Indicadores Económicos">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}`, marginTop: 8 }}>
              <KPICelda etiqueta="Fee Mensual" valor={formatMXN(cliente.fee)} unidad="MXN" />
              <KPICelda etiqueta="Costo Operativo" valor={formatMXN(cliente.costoOp)} unidad="MXN" />
              <KPICelda etiqueta="Margen UO" valor={margen} unidad="%" color={C.coral} divider={false} />
            </div>
          </Seccion>
        </div>

        <div style={{ marginTop: 28 }}>
          <Seccion titulo="Histórico Últimos 6 Meses">
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.ink}` }}>
                  <th style={{ ...thStyle, padding: '8px 8px 8px 0' }}>Mes</th>
                  <th style={{ ...thStyle, padding: '8px 8px 8px 0', textAlign: 'right' }}>Nómina total</th>
                  <th style={{ ...thStyle, padding: '8px 8px 8px 0', textAlign: 'right' }}>Recibos</th>
                </tr>
              </thead>
              <tbody>
                {ficha.historicoNomina.map((m, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.ruleSoft}` }}>
                    <td style={{ padding: '10px 8px 10px 0', fontSize: 12, fontWeight: 700 }}>{m.mes}</td>
                    <td style={{ padding: '10px 8px 10px 0', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMXN(m.total)}</td>
                    <td style={{ padding: '10px 8px 10px 0', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatNum(m.recibos)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${C.ink}` }}>
                  <td style={{ padding: '12px 8px 4px 0', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.inkMute }}>Acumulado</td>
                  <td style={{ padding: '12px 8px 4px 0', fontSize: 13, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.coral }}>{formatMXN(totalNomina6m)}</td>
                  <td style={{ padding: '12px 8px 4px 0', fontSize: 13, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: C.coral }}>{formatNum(totalRecibos6m)}</td>
                </tr>
              </tbody>
            </table>
          </Seccion>
        </div>

        <div style={{ marginTop: 28 }}>
          <Seccion titulo="Observaciones">
            <p style={{ fontSize: 12, lineHeight: 1.65, color: C.inkSoft, margin: '8px 0 0 0' }}>{ficha.observaciones}</p>
          </Seccion>
        </div>
      </div>
    </div>
  );
};

const Seccion: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <div>
    <div style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700, marginBottom: 4 }}>
      {titulo}
    </div>
    {children}
  </div>
);

const Dato: React.FC<{ etiqueta: string; valor: string }> = ({ etiqueta, valor }) => (
  <div style={{ marginTop: 12 }}>
    <div style={{ fontSize: 10, color: C.inkMute, marginBottom: 2 }}>{etiqueta}</div>
    <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{valor}</div>
  </div>
);

const KPICelda: React.FC<{ etiqueta: string; valor: string; unidad: string; color?: string; divider?: boolean }> = ({ etiqueta, valor, unidad, color, divider = true }) => (
  <div style={{ padding: '14px 16px', borderRight: divider ? `1px solid ${C.rule}` : 'none' }}>
    <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700, marginBottom: 6 }}>{etiqueta}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.ink, fontVariantNumeric: 'tabular-nums' }}>{valor}</div>
      <div style={{ fontSize: 10, color: C.inkMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{unidad}</div>
    </div>
  </div>
);

interface SortableThProps {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
}

const SortableTh: React.FC<SortableThProps> = ({ label, k, sortKey, sortDir, onClick }) => {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onClick(k)}
      style={{
        ...thStyle,
        cursor: 'pointer',
        color: active ? C.coral : C.inkMute,
        userSelect: 'none'
      }}
    >
      {label}
      <span style={{ marginLeft: 6, fontSize: 14, opacity: active ? 1 : 0.35 }}>
        {active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </th>
  );
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 12px 12px 0',
  color: C.inkMute,
  fontSize: 14,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontFamily: FONT,
  borderBottom: `2px solid ${C.ink}`
};

const tdStyle: CSSProperties = {
  padding: '14px 12px 14px 0',
  color: C.inkSoft,
  fontSize: 14,
  fontFamily: FONT
};

const tdStyleNum: CSSProperties = {
  padding: '14px 12px 14px 0',
  color: C.ink,
  fontSize: 14,
  fontFamily: FONT,
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700
};

// =====================================================
// PESTAÑA: ESTRATEGIA DE MATERIALIDAD
// =====================================================

interface Estrategia {
  titulo: string;
  descripcion: string;
  ejemploCFDI: string;
  riesgoFiscal: 'Bajo' | 'Medio' | 'Alto';
}

interface ActividadEconomicaRow {
  orden: string;
  actividad: string;
  porcentaje: string;
  fechaInicio: string;
  fechaFin: string;
}

interface AnalisisCSF {
  rfc?: string;
  denominacion?: string;
  regimenCapital?: string;
  nombreComercial?: string;
  fechaInicioOperaciones?: string;
  estatusPadron?: string;
  fechaUltimoCambio?: string;
  regimen?: string;
  actividadEconomica?: string;
  porcentaje?: string;
  actividades?: ActividadEconomicaRow[];
}

const motorEstrategias = (actividad: string): Estrategia[] => {
  const a = actividad.toLowerCase();

  if (a.includes('escuela') || a.includes('educa') || a.includes('enseñanza') || a.includes('universidad') || a.includes('colegio')) {
    return [
      { titulo: 'Servicios de Capacitación y Cursos', descripcion: 'Diseño e impartición de cursos de actualización docente, talleres pedagógicos y programas de formación continua para personal académico y administrativo.', ejemploCFDI: 'Curso de actualización en metodologías pedagógicas · Programa de formación docente Q4', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Procesos Educativos', descripcion: 'Asesoría en diseño curricular, evaluación de programas académicos, acreditaciones (CONACYT, COPAES) y mejora institucional.', ejemploCFDI: 'Consultoría para evaluación curricular del programa de licenciatura · Servicios de asesoría académica', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría de Cumplimiento Académico-Laboral', descripcion: 'Revisión integral de contratos docentes, esquemas de honorarios, NOM-035, prima de riesgo IMSS y obligaciones STPS en planteles educativos. Informe ejecutivo con plan de remediación.', ejemploCFDI: 'Servicios de auditoría de cumplimiento laboral educativo · Diagnóstico NOM-035 docente', riesgoFiscal: 'Bajo' },
      { titulo: 'Diseño y Producción de Material Didáctico', descripcion: 'Elaboración de manuales, contenidos digitales, evaluaciones estandarizadas y plataformas LMS personalizadas para programas académicos del cliente.', ejemploCFDI: 'Servicios de diseño de material didáctico · Producción de contenido para LMS institucional', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Vinculación Académica y Empresarial', descripcion: 'Diseño de programas duales, prácticas profesionales, convenios con empresas y modelos de educación basados en competencias.', ejemploCFDI: 'Consultoría en programas de vinculación académica · Diseño de modelo dual', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Investigación Educativa', descripcion: 'Estudios de seguimiento de egresados, evaluación de impacto institucional, diagnóstico de desempeño docente y reporte de indicadores académicos.', ejemploCFDI: 'Servicios de investigación educativa · Estudio de seguimiento de egresados', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('construc') || a.includes('obra') || a.includes('edifica') || a.includes('inmobiliari')) {
    return [
      { titulo: 'Auditoría de Seguridad e Higiene en Obra', descripcion: 'Inspección de cumplimiento NOM-031-STPS, revisión de equipos de protección personal, análisis de accidentabilidad por proyecto y emisión de plan de mitigación de riesgos.', ejemploCFDI: 'Servicios de auditoría en seguridad e higiene de obra · Inspección NOM-031-STPS', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Gestión Laboral de Construcción', descripcion: 'Asesoría en cumplimiento STPS, programas de seguridad e higiene, capacitación obligatoria DC-3 y mitigación de riesgos laborales por proyecto.', ejemploCFDI: 'Consultoría en seguridad e higiene industrial · Programa DC-3 de capacitación', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Outsourcing Especializado (REPSE)', descripcion: 'Servicios complementarios bajo registro REPSE para áreas no esenciales de la operación constructiva: vigilancia, limpieza de obra y logística de materiales.', ejemploCFDI: 'Servicios especializados REPSE · Apoyo logístico y de vigilancia en obra', riesgoFiscal: 'Medio' },
      { titulo: 'Capacitación Técnica DC-3 y Certificaciones', descripcion: 'Programas de capacitación obligatoria DC-3 para operadores de maquinaria, soldadores, electricistas y personal de altura conforme al Reglamento Federal de Seguridad y Salud en el Trabajo.', ejemploCFDI: 'Capacitación DC-3 obligatoria · Certificación de personal de altura y soldadura', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Sistemas de Gestión ISO 9001 y 45001', descripcion: 'Diagnóstico, diseño e implementación de sistemas de gestión de calidad y seguridad ocupacional para empresas constructoras y desarrolladoras.', ejemploCFDI: 'Consultoría en sistema de gestión ISO 45001 · Implementación ISO 9001 en obra', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios Logísticos y Acopio de Materiales', descripcion: 'Gestión logística de acopio, almacenaje y abastecimiento de materiales para proyectos constructivos, con control de inventarios y reportes ejecutivos.', ejemploCFDI: 'Servicios logísticos de acopio de materiales · Control de inventarios de obra', riesgoFiscal: 'Medio' }
    ];
  }

  if (a.includes('restaurant') || a.includes('aliment') || a.includes('bebida') || a.includes('comida') || a.includes('hotel')) {
    return [
      { titulo: 'Capacitación en Servicio y Manejo de Alimentos', descripcion: 'Programas de capacitación NOM-251 (manejo higiénico), atención al cliente, mixología y servicio de mesa para personal operativo.', ejemploCFDI: 'Curso de manejo higiénico de alimentos NOM-251 · Capacitación en servicio al cliente', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento Sanitario y Laboral', descripcion: 'Asesoría en distintivo H, protocolos COFEPRIS, gestión de PTU específica del sector y cumplimiento de propinas.', ejemploCFDI: 'Consultoría en distintivo H y protocolos sanitarios · Asesoría laboral del sector', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría Operativa y de Calidad de Servicio', descripcion: 'Mystery shopper, revisión de cumplimiento de turnos y séptimo día, evaluación de propinas, diagnóstico de calidad de servicio y plan de mejora operativa.', ejemploCFDI: 'Servicios de auditoría operativa restaurantera · Diagnóstico de calidad de servicio', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Diseño de Menú y Costeo', descripcion: 'Diseño de carta y menú con análisis de costos, ingeniería de menú, estudio de margen por platillo y propuesta de precios estratégicos.', ejemploCFDI: 'Servicios de ingeniería de menú · Análisis de costos por platillo y propuesta de pricing', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Control de Inventarios y Mermas', descripcion: 'Implementación de sistemas de control de inventarios, análisis de mermas, conciliación de consumos y diseño de procesos de almacén.', ejemploCFDI: 'Consultoría en control de inventarios restauranteros · Análisis de mermas y conciliaciones', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Marketing Gastronómico y Branding', descripcion: 'Estrategias de posicionamiento, gestión de redes sociales, diseño de campañas, fotografía gastronómica y estudios de imagen de marca.', ejemploCFDI: 'Servicios de marketing gastronómico · Campaña de branding y gestión de redes', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('manufactur') || a.includes('fabrica') || a.includes('industri') || a.includes('producci') || a.includes('textil') || a.includes('metal') || a.includes('automotr')) {
    return [
      { titulo: 'Capacitación Técnica y Certificaciones', descripcion: 'Programas DC-3 obligatorios, capacitación en operación de maquinaria, certificaciones ISO 9001 y formación en seguridad industrial.', ejemploCFDI: 'Capacitación DC-3 en operación de maquinaria · Programa ISO 9001 para personal operativo', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Gestión de Riesgos Laborales', descripcion: 'Asesoría en NOM-035 (factores psicosociales), prima de riesgo IMSS, análisis de accidentabilidad y mitigación de incapacidades.', ejemploCFDI: 'Consultoría en NOM-035 · Análisis y reducción de prima de riesgo IMSS', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría de Riesgo de Trabajo y Prima IMSS', descripcion: 'Análisis de siniestralidad, revisión técnica de la prima de riesgo IMSS, diagnóstico de NOM-030-STPS y plan de reducción de incidentes en planta.', ejemploCFDI: 'Servicios de auditoría de riesgo de trabajo · Análisis de prima IMSS y NOM-030', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Lean Manufacturing y Procesos', descripcion: 'Diagnóstico de procesos productivos, diseño de células de manufactura, eliminación de desperdicios (mudas) y rediseño de flujo de planta.', ejemploCFDI: 'Consultoría en Lean Manufacturing · Diagnóstico de procesos y rediseño de flujo', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Control de Calidad y Metrología', descripcion: 'Calibración de instrumentos, validación de procesos, ensayos no destructivos y emisión de certificados de calidad por lote producido.', ejemploCFDI: 'Servicios de calibración metrológica · Certificación de calidad por lote', riesgoFiscal: 'Bajo' },
      { titulo: 'Asesoría en Compliance Sectorial e IMMEX', descripcion: 'Cumplimiento regulatorio para programas IMMEX/Maquila, certificación OEA, padrones de importadores y obligaciones aduanales del sector manufacturero.', ejemploCFDI: 'Asesoría en programa IMMEX · Consultoría en certificación OEA y padrones aduanales', riesgoFiscal: 'Medio' }
    ];
  }

  if (a.includes('comercio') || a.includes('venta') || a.includes('distribu') || a.includes('mayoreo') || a.includes('menudeo')) {
    return [
      { titulo: 'Capacitación en Ventas y Atención al Cliente', descripcion: 'Programas de formación en técnicas de venta, servicio al cliente, manejo de objeciones y CRM para fuerza de ventas.', ejemploCFDI: 'Curso de técnicas avanzadas de venta · Capacitación en CRM y servicio al cliente', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Estructura de Compensación Variable', descripcion: 'Diseño de tabuladores con esquema fijo + variable, optimización fiscal de comisiones y bonos, cumplimiento de la base de cotización mixta.', ejemploCFDI: 'Consultoría en diseño de esquemas de compensación · Asesoría fiscal de comisiones', riesgoFiscal: 'Medio' },
      { titulo: 'Diagnóstico de Productividad y Retención Comercial', descripcion: 'Análisis de KPIs de fuerza de ventas, evaluación de rotación de personal, diseño de planes de carrera y propuestas de retención de talento clave.', ejemploCFDI: 'Servicios de diagnóstico de productividad comercial · Plan de retención de talento de ventas', riesgoFiscal: 'Bajo' },
      { titulo: 'Estudios de Mercado y Comportamiento del Consumidor', descripcion: 'Investigación cuantitativa y cualitativa de mercado, análisis de competencia, segmentación y reporte estratégico de oportunidades comerciales.', ejemploCFDI: 'Estudio de mercado y análisis de competencia · Reporte de segmentación de consumidor', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Estrategia Digital y E-commerce', descripcion: 'Diseño de estrategia omnicanal, implementación de plataforma e-commerce, integración con marketplaces y análisis de conversión digital.', ejemploCFDI: 'Consultoría en estrategia digital · Implementación de plataforma e-commerce', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría de Cumplimiento Comercial (PROFECO)', descripcion: 'Diagnóstico de cumplimiento de NOM-051, etiquetado, garantías, publicidad y precios; mitigación de riesgos ante revisiones de PROFECO.', ejemploCFDI: 'Auditoría de cumplimiento NOM-051 y PROFECO · Diagnóstico de etiquetado y publicidad', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('agricul') || a.includes('ganader') || a.includes('pesca') || a.includes('agroind')) {
    return [
      { titulo: 'Capacitación en Seguridad Agroindustrial', descripcion: 'Programas de capacitación en manejo seguro de agroquímicos, NOM-003-STPS, primeros auxilios en campo y operación de maquinaria agrícola.', ejemploCFDI: 'Capacitación en NOM-003-STPS manejo de agroquímicos · Programa de primeros auxilios en campo', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento Laboral del Campo', descripcion: 'Asesoría en cumplimiento de la Ley Federal del Trabajo Capítulo VIII (trabajadores del campo), prestaciones obligatorias y régimen IMSS de eventuales.', ejemploCFDI: 'Consultoría en LFT Capítulo VIII · Asesoría en prestaciones del trabajador del campo', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría de Cumplimiento Agrícola y Estacionalidad', descripcion: 'Revisión del régimen de eventuales del campo, análisis de cuotas IMSS reducidas, dictamen de estacionalidad y plan de cumplimiento de jornaleros.', ejemploCFDI: 'Servicios de auditoría agrícola laboral · Dictamen de cumplimiento Capítulo VIII LFT', riesgoFiscal: 'Bajo' },
      { titulo: 'Asesoría en Certificaciones de Inocuidad y SENASICA', descripcion: 'Consultoría e implementación de certificaciones Global G.A.P., México Calidad Suprema, BPA y trámites ante SENASICA para mercados de exportación.', ejemploCFDI: 'Asesoría en certificación Global G.A.P. · Trámite SENASICA para exportación', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Sostenibilidad y Trazabilidad', descripcion: 'Implementación de sistemas de trazabilidad de cosecha, huella hídrica, cumplimiento ESG y reportes ambientales para mercados internacionales.', ejemploCFDI: 'Consultoría en trazabilidad agrícola · Reporte ESG y huella hídrica de cosecha', riesgoFiscal: 'Bajo' },
      { titulo: 'Diagnóstico de Productividad Agrícola', descripcion: 'Análisis de rendimientos por hectárea, diagnóstico de tecnificación, evaluación de eficiencia hídrica y plan de mejora de productividad.', ejemploCFDI: 'Diagnóstico de productividad agrícola · Análisis de rendimientos y eficiencia hídrica', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('salud') || a.includes('médic') || a.includes('hospital') || a.includes('clínic') || a.includes('farmac')) {
    return [
      { titulo: 'Capacitación NOM en Salud y Seguridad', descripcion: 'Programas de capacitación NOM-016, NOM-019, manejo de RPBI, bioseguridad y atención de emergencias para personal clínico y administrativo.', ejemploCFDI: 'Capacitación NOM-016 manejo de RPBI · Programa de bioseguridad hospitalaria', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento Sanitario y Laboral', descripcion: 'Asesoría en COFEPRIS para personal, gestión de cédulas profesionales, certificación CSG y cumplimiento de prima de riesgo de clase IV.', ejemploCFDI: 'Consultoría en cumplimiento COFEPRIS · Asesoría en certificación CSG', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría de Bioseguridad y Manejo de RPBI', descripcion: 'Revisión técnica del manejo de Residuos Peligrosos Biológico-Infecciosos, dictamen de cumplimiento NOM-087-ECOL-SSA1 y plan de remediación de bioseguridad.', ejemploCFDI: 'Servicios de auditoría de bioseguridad · Dictamen NOM-087-ECOL-SSA1 manejo de RPBI', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Acreditación Hospitalaria CSG', descripcion: 'Asesoría e implementación de estándares para certificación del Consejo de Salubridad General, gestión de auditorías de seguimiento y plan de cierre de hallazgos.', ejemploCFDI: 'Servicios de acreditación CSG · Implementación de estándares hospitalarios', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Farmacovigilancia y Manejo de Insumos', descripcion: 'Diseño de programas de farmacovigilancia, control de inventario de medicamentos controlados, cumplimiento NOM-220 y reportes a COFEPRIS.', ejemploCFDI: 'Consultoría en farmacovigilancia NOM-220 · Control de medicamentos controlados', riesgoFiscal: 'Bajo' },
      { titulo: 'Diseño de Protocolos de Atención y Calidad', descripcion: 'Elaboración de guías clínicas, protocolos de atención por especialidad, indicadores de calidad asistencial y reporte ejecutivo de desempeño médico.', ejemploCFDI: 'Diseño de protocolos clínicos · Indicadores de calidad asistencial por especialidad', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('transport') || a.includes('logistic') || a.includes('flete') || a.includes('carga') || a.includes('paqueter')) {
    return [
      { titulo: 'Capacitación en Seguridad Vial y NOM-087', descripcion: 'Programas DC-3 obligatorios, capacitación en NOM-087-SCT-2017 (transporte de materiales peligrosos), manejo defensivo y bitácora electrónica.', ejemploCFDI: 'Capacitación NOM-087-SCT en transporte · Programa de manejo defensivo DC-3', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento SCT y Laboral', descripcion: 'Asesoría en regulación SCT, gestión de licencias federales, programas de fatiga y descanso, y cumplimiento de horas-hombre regulatorias.', ejemploCFDI: 'Consultoría en cumplimiento SCT · Asesoría en programas de fatiga y descanso', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría de Programas de Fatiga y Bitácoras', descripcion: 'Revisión de bitácoras electrónicas de operadores, análisis de cumplimiento de horas-hombre regulatorias, dictamen de fatiga y descanso conforme a SCT.', ejemploCFDI: 'Servicios de auditoría de seguridad vial · Dictamen de fatiga y bitácoras electrónicas', riesgoFiscal: 'Bajo' },
      { titulo: 'Asesoría en Carta Porte y Cumplimiento Fiscal', descripcion: 'Consultoría en emisión correcta del CFDI con Complemento Carta Porte 3.1, validación de claves, conciliación de manifiestos y mitigación de sanciones SAT-SICT.', ejemploCFDI: 'Asesoría en Complemento Carta Porte 3.1 · Conciliación de manifiestos de carga', riesgoFiscal: 'Bajo' },
      { titulo: 'Diagnóstico de Mantenimiento Preventivo de Flota', descripcion: 'Diseño de plan de mantenimiento preventivo, gestión de bitácoras de servicio, análisis de costos de operación por unidad y proyección de renovación de flota.', ejemploCFDI: 'Diagnóstico de mantenimiento preventivo · Plan de renovación y costos de operación', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Geolocalización y Telemetría', descripcion: 'Implementación de sistemas GPS, telemetría de comportamiento del operador, análisis de rutas óptimas y reportes de eficiencia para clientes corporativos.', ejemploCFDI: 'Consultoría en telemetría vehicular · Implementación de GPS y análisis de rutas', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('servicio') || a.includes('consult') || a.includes('profesion') || a.includes('asesor')) {
    return [
      { titulo: 'Capacitación Especializada y Certificaciones', descripcion: 'Programas de actualización profesional, certificaciones internacionales, soft skills y desarrollo de liderazgo para equipos consultivos.', ejemploCFDI: 'Programa de certificación profesional · Capacitación en habilidades de liderazgo', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Diseño Organizacional', descripcion: 'Asesoría en estructura de compensación competitiva, esquemas de retención de talento, plan de carrera y evaluación de desempeño.', ejemploCFDI: 'Consultoría en diseño organizacional · Asesoría en planes de retención de talento', riesgoFiscal: 'Bajo' },
      { titulo: 'Auditoría y Diagnóstico Laboral Integral', descripcion: 'Revisión de cumplimiento STPS, NOM-035, prima de riesgo IMSS, esquemas de subcontratación y emisión de informe ejecutivo con plan de remediación.', ejemploCFDI: 'Servicios de auditoría laboral · Diagnóstico de cumplimiento STPS y NOM-035', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Implementación de Sistemas de Información', descripcion: 'Análisis funcional, implementación de ERP/CRM, automatización de procesos y migración de datos para áreas de operaciones del cliente.', ejemploCFDI: 'Servicios de implementación de sistema ERP · Migración de datos y automatización', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Marketing B2B y Generación de Leads', descripcion: 'Diseño de campañas de marketing especializado, generación calificada de leads, contenidos thought leadership y nurturing comercial.', ejemploCFDI: 'Servicios de marketing B2B · Generación de leads y campañas digitales', riesgoFiscal: 'Bajo' },
      { titulo: 'Asesoría en Compliance Fiscal y Anti-Lavado (PLD)', descripcion: 'Diagnóstico de cumplimiento ante UIF, diseño de manuales PLD/FT, capacitación en prevención de lavado de dinero y reportes regulatorios obligatorios.', ejemploCFDI: 'Asesoría en compliance PLD · Manual y capacitación de prevención de lavado', riesgoFiscal: 'Medio' }
    ];
  }

  return [
    { titulo: 'Capacitación Laboral y Desarrollo de Personal', descripcion: 'Programas DC-3 obligatorios, capacitación en NOM-035, desarrollo de habilidades blandas y formación continua.', ejemploCFDI: 'Programa DC-3 de capacitación obligatoria · Curso NOM-035 factores psicosociales', riesgoFiscal: 'Bajo' },
    { titulo: 'Consultoría en Cumplimiento Laboral y Fiscal', descripcion: 'Asesoría en obligaciones STPS, IMSS, SAT, INFONAVIT, gestión de auditorías y mitigación de riesgos regulatorios.', ejemploCFDI: 'Consultoría en cumplimiento laboral · Asesoría regulatoria integral', riesgoFiscal: 'Bajo' },
    { titulo: 'Diagnóstico de Cumplimiento STPS-IMSS-INFONAVIT', descripcion: 'Análisis integral de cumplimiento ante autoridades laborales y de seguridad social, revisión de obligaciones, identificación de contingencias y plan de remediación.', ejemploCFDI: 'Servicios de diagnóstico de cumplimiento STPS-IMSS-INFONAVIT · Análisis de contingencias laborales', riesgoFiscal: 'Bajo' },
    { titulo: 'Servicios de Reclutamiento y Selección Especializada', descripcion: 'Búsqueda de talento clave, evaluación psicométrica, assessment de competencias y proceso de selección por competencias para posiciones críticas.', ejemploCFDI: 'Servicios de reclutamiento y selección · Búsqueda de talento clave por competencias', riesgoFiscal: 'Bajo' },
    { titulo: 'Servicios de Onboarding y Desarrollo de Talento', descripcion: 'Diseño de programas de inducción, planes de desarrollo individual, mentoría ejecutiva y matrices de sucesión para posiciones de liderazgo.', ejemploCFDI: 'Servicios de onboarding ejecutivo · Diseño de plan de sucesión y desarrollo de talento', riesgoFiscal: 'Bajo' },
    { titulo: 'Diagnóstico de Clima Laboral y Cultura Organizacional', descripcion: 'Aplicación de encuestas de clima, análisis de cultura, focus groups, NOM-035 y plan de mejora con métricas de seguimiento ejecutivo.', ejemploCFDI: 'Diagnóstico de clima laboral y cultura · Encuesta NOM-035 y plan de mejora', riesgoFiscal: 'Bajo' }
  ];
};

const PestanaMaterialidad: React.FC = () => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [textoExtraido, setTextoExtraido] = useState<string>('');
  const [analisis, setAnalisis] = useState<AnalisisCSF | null>(null);
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const cargarPDFJS = async (): Promise<any> => {
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const extraerTextoPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await cargarPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const TOL_Y = 3;
    let textoCompleto = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pagina = await pdf.getPage(i);
      const contenido = await pagina.getTextContent();
      const items = contenido.items as Array<{ str: string; transform: number[] }>;
      const buckets: Array<{ y: number; items: Array<{ x: number; str: string }> }> = [];
      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        const x = item.transform[4];
        const y = item.transform[5];
        let bucket = buckets.find(b => Math.abs(b.y - y) <= TOL_Y);
        if (!bucket) {
          bucket = { y, items: [] };
          buckets.push(bucket);
        }
        bucket.items.push({ x, str: item.str });
      }
      buckets.sort((a, b) => b.y - a.y);
      const lineas = buckets
        .map(b => {
          b.items.sort((p, q) => p.x - q.x);
          return b.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
        })
        .filter(l => l.length > 0);
      textoCompleto += `\n--- PÁGINA ${i} ---\n${lineas.join('\n')}`;
    }
    return textoCompleto;
  };

  const analizarCSF = (texto: string): AnalisisCSF => {
    const resultado: AnalisisCSF = {};
    const limpio = texto.replace(/\s+/g, ' ').trim();

    // Etiquetas en el orden en que aparecen dentro de "Datos de Identificación del Contribuyente"
    const etiquetas: Array<{ clave: keyof AnalisisCSF; patron: RegExp }> = [
      { clave: 'rfc', patron: /RFC\s*:?/i },
      { clave: 'denominacion', patron: /Denominaci[oó]n\s*\/?\s*Raz[oó]n\s+Social\s*:?/i },
      { clave: 'regimenCapital', patron: /R[eé]gimen\s+Capital\s*:?/i },
      { clave: 'nombreComercial', patron: /Nombre\s+Comercial\s*:?/i },
      { clave: 'fechaInicioOperaciones', patron: /Fecha\s+(?:de\s+)?inicio\s+de\s+operaciones\s*:?/i },
      { clave: 'estatusPadron', patron: /Estatus\s+en\s+el\s+padr[oó]n\s*:?/i },
      { clave: 'fechaUltimoCambio', patron: /Fecha\s+de\s+[uú]ltimo\s+cambio\s+de\s+estado\s*:?/i }
    ];

    // Encuentra los rangos de cada etiqueta y extrae el contenido entre la etiqueta actual y la siguiente
    const ocurrencias: Array<{ clave: keyof AnalisisCSF; inicio: number; fin: number }> = [];
    for (const e of etiquetas) {
      const m = limpio.match(e.patron);
      if (m && m.index !== undefined) {
        ocurrencias.push({ clave: e.clave, inicio: m.index, fin: m.index + m[0].length });
      }
    }
    ocurrencias.sort((a, b) => a.inicio - b.inicio);

    for (let i = 0; i < ocurrencias.length; i++) {
      const actual = ocurrencias[i];
      const siguiente = ocurrencias[i + 1];
      const valor = limpio.slice(actual.fin, siguiente ? siguiente.inicio : actual.fin + 200).trim();
      const limpioValor = valor.replace(/^[:\s\-]+/, '').trim();
      if (limpioValor.length > 0 && limpioValor.length < 250) {
        (resultado as any)[actual.clave] = limpioValor;
      }
    }

    // Si el RFC quedó capturado por bloque, valida que el patrón sea de RFC, si no, búscalo aparte
    if (resultado.rfc && !/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/.test(resultado.rfc.replace(/\s/g, ''))) {
      const rfcMatch = limpio.match(/\b([A-ZÑ&]{3,4}\d{6}[A-Z\d]{3})\b/);
      if (rfcMatch) resultado.rfc = rfcMatch[1];
    }
    if (!resultado.rfc) {
      const rfcMatch = limpio.match(/\b([A-ZÑ&]{3,4}\d{6}[A-Z\d]{3})\b/);
      if (rfcMatch) resultado.rfc = rfcMatch[1];
    }

    // Régimen fiscal (sección distinta a "Régimen Capital")
    const regimenMatch = limpio.match(/R[eé]gimen(?!\s+Capital)[:\s]+([^.]{5,200}?)(?=Fecha|Actividad|Obligaciones|$)/i);
    if (regimenMatch) resultado.regimen = regimenMatch[1].trim();

    // Tabla de Actividades Económicas — procesamos línea por línea.
    // Cada renglón visual del PDF llega como una línea independiente gracias a la extracción posicional.
    // Patrón típico: "<orden> <actividad larga en español> <porcentaje> <dd/mm/yyyy> [<dd/mm/yyyy>]"
    const lineas = texto.split(/\n+/).map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const headerIdx = lineas.findIndex(l => /Actividad(?:es)?\s+Econ[oó]mica/i.test(l));
    const finIdx = (() => {
      if (headerIdx < 0) return -1;
      for (let i = headerIdx + 1; i < lineas.length; i++) {
        if (/(Reg[ií]menes|Mis\s+Obligaciones|^\s*Obligaciones\b|Domicilio\s+Fiscal)/i.test(lineas[i])) return i;
      }
      return lineas.length;
    })();

    const actividades: ActividadEconomicaRow[] = [];
    const filaRegex = /^(\d{1,2})\s+(.+?)\s+(\d{1,3})\s*%?\s+(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}\/\d{2}\/\d{4}))?\s*$/;

    if (headerIdx >= 0 && finIdx > headerIdx) {
      for (let i = headerIdx + 1; i < finIdx; i++) {
        const linea = lineas[i];
        if (/^Orden\b/i.test(linea)) continue; // header de columnas
        const m = linea.match(filaRegex);
        if (m) {
          const actividad = m[2].replace(/\s+/g, ' ').trim();
          if (actividad.length < 6) continue;
          actividades.push({
            orden: m[1],
            actividad,
            porcentaje: m[3] + '%',
            fechaInicio: m[4],
            fechaFin: m[5] || ''
          });
          if (actividades.length >= 8) break;
        }
      }
    }

    // Fallback: si la extracción posicional no separó bien las filas, intenta sobre el texto plano.
    if (actividades.length === 0 && headerIdx >= 0) {
      const bloque = lineas.slice(headerIdx, finIdx).join(' ');
      const reGlobal = /(\d{1,2})\s+([A-Za-zÁÉÍÓÚÑáéíóúñ][^0-9%]{10,200}?)\s+(\d{1,3})\s*%?\s+(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}\/\d{2}\/\d{4}))?/g;
      let m: RegExpExecArray | null;
      while ((m = reGlobal.exec(bloque)) !== null) {
        const actividad = m[2].replace(/\s+/g, ' ').trim();
        if (actividad.length < 10) continue;
        actividades.push({
          orden: m[1],
          actividad,
          porcentaje: m[3] + '%',
          fechaInicio: m[4],
          fechaFin: m[5] || ''
        });
        if (actividades.length >= 8) break;
      }
    }

    if (actividades.length > 0) {
      resultado.actividades = actividades;
      resultado.actividadEconomica = actividades[0].actividad;
      resultado.porcentaje = actividades[0].porcentaje;
    } else {
      // Fallback al parser anterior si no logramos detectar la tabla
      const actividadPatterns = [
        /ACTIVIDAD(?:ES)?\s+ECON[OÓ]MICA(?:S)?[\s\S]{0,500}?(?:Orden|Actividad Econ[oó]mica)[:\s]+([^\n]{20,400})/i,
        /Actividad Econ[oó]mica[:\s]+([^\n]{20,400})/i
      ];
      for (const pattern of actividadPatterns) {
        const match = limpio.match(pattern);
        if (match && match[1]) {
          resultado.actividadEconomica = match[1].trim().replace(/\s+/g, ' ');
          break;
        }
      }
      const porcentajeMatch = limpio.match(/(\d{1,3})\s*%/);
      if (porcentajeMatch) resultado.porcentaje = porcentajeMatch[1] + '%';
    }

    return resultado;
  };

  const procesarArchivo = async (file: File) => {
    setError('');
    setProcesando(true);
    setArchivo(file);
    setAnalisis(null);
    setEstrategias([]);
    setTextoExtraido('');

    try {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('El archivo debe ser un PDF.');
      }
      const texto = await extraerTextoPDF(file);
      setTextoExtraido(texto);
      const datos = analizarCSF(texto);
      setAnalisis(datos);
      if (datos.actividadEconomica) {
        setEstrategias(motorEstrategias(datos.actividadEconomica));
      } else {
        setError('No se pudo localizar la actividad económica en el documento. Captúrala manualmente.');
      }
    } catch (e: any) {
      setError(e.message || 'Error al procesar el PDF.');
    } finally {
      setProcesando(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files[0];
    if (file) procesarArchivo(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  };

  const [actividadManual, setActividadManual] = useState<string>('');
  const generarConActividadManual = () => {
    if (actividadManual.trim().length < 10) {
      setError('Escribe la actividad económica con al menos 10 caracteres.');
      return;
    }
    setError('');
    setAnalisis({ ...analisis, actividadEconomica: actividadManual });
    setEstrategias(motorEstrategias(actividadManual));
  };

  const riesgoColor = (r: 'Bajo' | 'Medio' | 'Alto'): string =>
    r === 'Bajo' ? C.olive : r === 'Medio' ? C.amber : C.coral;

  return (
    <div>
      {/* HEADER DE PESTAÑA */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
          Análisis de Constancia Fiscal
        </div>
        <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px', marginBottom: 6 }}>
          Estrategias de Materialidad
        </h2>
        <div style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, marginBottom: 0, fontWeight: 400 }}>
          Sube la Constancia de Situación Fiscal del cliente.
        </div>
      </div>

      {/* ZONA DE ARRASTRE */}
      {!archivo && (
        <div
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${arrastrando ? C.coral : C.rule}`,
            backgroundColor: arrastrando ? '#fbeae5' : C.paperSoft,
            padding: '64px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 8, letterSpacing: '-0.4px' }}>
            Arrastra CSF del Cliente
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, marginBottom: 16 }}>
            Constancia de Situación Fiscal en formato PDF
          </div>
          <div style={{ display: 'inline-block', backgroundColor: C.ink, color: C.paper, padding: '10px 24px', fontSize: 11, fontFamily: FONT, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            o haz clic para seleccionar
          </div>
        </div>
      )}

      {/* ESTADO PROCESANDO */}
      {procesando && (
        <div style={{ padding: '32px', backgroundColor: C.paperSoft, borderLeft: `3px solid ${C.coral}`, marginBottom: 24 }}>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 8 }}>
            Procesando
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.ink }}>
            Leyendo {archivo?.name}…
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={{ padding: '20px 24px', backgroundColor: '#fbeae5', borderLeft: `3px solid ${C.coral}`, marginBottom: 24 }}>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 6 }}>
            Aviso
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: C.ink, marginBottom: 16 }}>
            {error}
          </div>
          {error.includes('actividad económica') && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: C.inkSoft, marginBottom: 8, fontWeight: 700 }}>
                Captura manualmente la actividad económica:
              </div>
              <textarea
                value={actividadManual}
                onChange={(e) => setActividadManual(e.target.value)}
                placeholder="Ej: Escuelas de educación superior pertenecientes al sector privado…"
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 12,
                  fontFamily: FONT,
                  fontSize: 13,
                  border: `1px solid ${C.rule}`,
                  backgroundColor: C.paper,
                  color: C.ink,
                  resize: 'vertical',
                  marginBottom: 12
                }}
              />
              <button
                onClick={generarConActividadManual}
                style={{
                  backgroundColor: C.coral,
                  color: C.paper,
                  border: 'none',
                  padding: '10px 24px',
                  fontSize: 11,
                  fontFamily: FONT,
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Generar Estrategias
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESUMEN DE ANÁLISIS */}
      {analisis && analisis.actividadEconomica && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
            Datos Extraídos
          </div>
          <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, margin: 0, color: C.ink, marginBottom: 16, letterSpacing: '-0.4px' }}>
            Análisis de la CSF
          </h3>

          <div style={{ border: `1px solid ${C.ink}`, marginBottom: 16, backgroundColor: C.paper }}>
            <div style={{ padding: '10px 14px', backgroundColor: C.paperSoft, borderBottom: `1px solid ${C.ink}`, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.ink }}>
              Datos de Identificación del Contribuyente:
            </div>
            <CSFRow etiqueta="RFC:" valor={analisis.rfc} />
            <CSFRow etiqueta="Denominación/Razón Social:" valor={analisis.denominacion} />
            <CSFRow etiqueta="Régimen Capital:" valor={analisis.regimenCapital} />
            <CSFRow etiqueta="Nombre Comercial:" valor={analisis.nombreComercial} />
            <CSFRow etiqueta="Fecha inicio de operaciones:" valor={analisis.fechaInicioOperaciones} />
            <CSFRow etiqueta="Estatus en el padrón:" valor={analisis.estatusPadron} />
            <CSFRow etiqueta="Fecha de último cambio de estado:" valor={analisis.fechaUltimoCambio} ultima />
          </div>

          {analisis.actividades && analisis.actividades.length > 0 ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 8 }}>
                Actividades Económicas Registradas ante el SAT ({analisis.actividades.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.ink}`, fontFamily: FONT }}>
                <thead>
                  <tr style={{ backgroundColor: C.paperSoft, borderBottom: `1px solid ${C.ink}` }}>
                    <th style={tdCSF(true, '8%')}>Orden</th>
                    <th style={tdCSF(true)}>Actividad Económica</th>
                    <th style={tdCSF(true, '12%')}>Porcentaje</th>
                    <th style={tdCSF(true, '14%')}>Fecha Inicio</th>
                    <th style={tdCSF(true, '14%')}>Fecha Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {analisis.actividades.map((act, i) => (
                    <tr key={i} style={{ borderBottom: i === analisis.actividades!.length - 1 ? 'none' : `1px solid ${C.rule}` }}>
                      <td style={tdCSF(false, '8%')}>{act.orden}</td>
                      <td style={{ ...tdCSF(false), fontWeight: 700 }}>{act.actividad}</td>
                      <td style={tdCSF(false, '12%')}>{act.porcentaje}</td>
                      <td style={{ ...tdCSF(false, '14%'), fontVariantNumeric: 'tabular-nums' }}>{act.fechaInicio}</td>
                      <td style={{ ...tdCSF(false, '14%'), fontVariantNumeric: 'tabular-nums' }}>{act.fechaFin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontFamily: FONT, fontSize: 10, color: C.inkMute, marginTop: 8, fontStyle: 'italic' }}>
                Las estrategias se generan en función de la actividad principal (mayor porcentaje). Los reportes de materialidad cubren el universo completo de actividades.
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px 24px', backgroundColor: C.paperSoft, borderLeft: `3px solid ${C.coral}` }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 6 }}>
                Actividad Económica Registrada ante el SAT
              </div>
              <div style={{ fontFamily: FONT, fontSize: 14, color: C.ink, lineHeight: 1.5, fontWeight: 400 }}>
                {analisis.actividadEconomica}
              </div>
              {analisis.porcentaje && (
                <div style={{ fontFamily: FONT, fontSize: 11, color: C.inkSoft, marginTop: 8 }}>
                  Participación: {analisis.porcentaje}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ESTRATEGIAS GENERADAS */}
      {estrategias.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
            Tres Caminos para Facturar con Materialidad
          </div>
          <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, margin: 0, color: C.ink, marginBottom: 6, letterSpacing: '-0.5px' }}>
            Estrategias Propuestas
          </h3>
          <div style={{ fontFamily: FONT, fontSize: 12, color: C.inkSoft, marginBottom: 20 }}>
            Cada estrategia está alineada con la actividad económica registrada y soporta materialidad ante el SAT.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {estrategias.map((est, i) => (
              <div key={i} style={{
                backgroundColor: C.paper,
                border: `1px solid ${C.rule}`,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.coral, letterSpacing: '-1px', lineHeight: 1 }}>
                    0{i + 1}
                  </div>
                  <span style={{
                    fontFamily: FONT,
                    fontSize: 9,
                    fontWeight: 700,
                    color: C.paper,
                    backgroundColor: riesgoColor(est.riesgoFiscal),
                    padding: '3px 10px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase'
                  }}>
                    Riesgo {est.riesgoFiscal}
                  </span>
                </div>

                <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700, marginTop: 4 }}>
                  Estrategia {i + 1}
                </div>

                <h4 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: 0, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                  {est.titulo}
                </h4>

                <div style={{ fontFamily: FONT, fontSize: 12, color: C.inkSoft, lineHeight: 1.5, fontWeight: 400 }}>
                  {est.descripcion}
                </div>

                <div style={{ paddingTop: 12, borderTop: `1px solid ${C.ruleSoft}`, marginTop: 'auto' }}>
                  <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700, marginBottom: 6 }}>
                    Ejemplo de concepto CFDI
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 11, color: C.ink, lineHeight: 1.4, fontStyle: 'italic' }}>
                    "{est.ejemploCFDI}"
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* REPORTES DE MATERIALIDAD - COMPLEMENTO A LAS ESTRATEGIAS */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
              La Defensa Documental
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, margin: 0, color: C.ink, marginBottom: 6, letterSpacing: '-0.5px' }}>
              Reportes que Soportan la Estrategia
            </h3>
            <div style={{ fontFamily: FONT, fontSize: 12, color: C.inkSoft, marginBottom: 20 }}>
              El expediente que cada estrategia anterior debe acompañar para sostenerse ante una revisión, auditoría o requerimiento del SAT.
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Reporte / Documento</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Frecuencia</th>
                  <th style={thStyle}>Retención</th>
                  <th style={thStyle}>Qué evidencia ante SAT</th>
                </tr>
              </thead>
              <tbody>
                {REPORTES_MATERIALIDAD.map((r, idx) => (
                  <tr key={r.numero} style={{ borderBottom: `1px solid ${C.ruleSoft}`, backgroundColor: idx % 2 === 0 ? 'transparent' : C.paperSoft }}>
                    <td style={{ ...tdStyleNum, color: C.coral, width: 40 }}>{r.numero}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, fontSize: 12, color: C.ink, width: '24%' }}>
                      {r.titulo}
                      <div style={{ fontSize: 10, fontWeight: 400, color: C.inkMute, marginTop: 4, lineHeight: 1.45 }}>{r.descripcion}</div>
                    </td>
                    <td style={{ ...tdStyle, color: C.inkSoft, fontSize: 11 }}>{r.tipo}</td>
                    <td style={{ ...tdStyle, color: C.inkSoft, fontSize: 11 }}>{r.frecuencia}</td>
                    <td style={{ ...tdStyle, color: C.inkSoft, fontSize: 11 }}>{r.retencion}</td>
                    <td style={{ ...tdStyle, color: C.olive, fontSize: 11, fontWeight: 700, lineHeight: 1.45 }}>{r.evidencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 18, padding: '14px 18px', backgroundColor: C.paperSoft, borderLeft: `3px solid ${C.coral}` }}>
              <div style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 6 }}>
                Criterio de armado del expediente
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>
                Cada CFDI emitido bajo cualquiera de las estrategias anteriores debe poder vincularse a: <strong style={{ color: C.ink }}>(i)</strong> contrato vigente, <strong style={{ color: C.ink }}>(ii)</strong> orden de servicio del periodo, <strong style={{ color: C.ink }}>(iii)</strong> entregables del cliente (recibos timbrados, acuses IMSS/IDSE, declaraciones presentadas) y <strong style={{ color: C.ink }}>(iv)</strong> evidencia de comunicación operativa. Este encadenamiento es lo que el SAT denomina <em>materialidad</em>: la prueba de que el servicio existió, fue real y razonable en monto.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCIONES */}
      {archivo && (
        <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.rule}` }}>
          <button
            onClick={() => {
              setArchivo(null);
              setAnalisis(null);
              setEstrategias([]);
              setError('');
              setTextoExtraido('');
              setActividadManual('');
            }}
            style={{
              backgroundColor: 'transparent',
              color: C.ink,
              border: `1px solid ${C.ink}`,
              padding: '10px 20px',
              fontSize: 11,
              fontFamily: FONT,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Subir Otra CSF
          </button>
        </div>
      )}
    </div>
  );
};

const KPI: React.FC<KPIProps> = ({ titulo, valor, unidad, meta, estado, semaforo, divider }) => (
  <div style={{ padding: '28px 24px', borderRight: divider ? `1px solid ${C.rule}` : 'none' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
      <div style={{ fontFamily: FONT, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700 }}>
        {titulo}
      </div>
      <Semaforo estado={semaforo} />
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <div style={{ fontFamily: FONT, fontSize: 48, fontWeight: 700, color: estado === 'ok' ? C.ink : C.coral, lineHeight: 1, letterSpacing: '-1.5px', fontVariantNumeric: 'tabular-nums' }}>
        {valor}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 20, color: C.inkSoft, fontWeight: 400 }}>
        {unidad}
      </div>
    </div>
    <div style={{ fontFamily: FONT, fontSize: 14, color: C.inkMute, marginTop: 8 }}>
      {meta}
    </div>
  </div>
);

const Semaforo: React.FC<{ estado: EstadoSemaforo }> = ({ estado }) => {
  const verde = '#5fa850';
  const amarillo = '#e6a83a';
  const rojo = '#e0492c';
  return (
    <div style={{
      display: 'inline-flex',
      gap: 7,
      padding: '6px 9px',
      backgroundColor: 'rgba(26, 24, 20, 0.7)',
      borderRadius: 16,
      alignItems: 'center',
      flexShrink: 0
    }}>
      <Luz color={verde} activa={estado === 'verde'} />
      <Luz color={amarillo} activa={estado === 'amarillo'} />
      <Luz color={rojo} activa={estado === 'rojo'} />
    </div>
  );
};

const Luz: React.FC<{ color: string; activa: boolean }> = ({ color, activa }) => (
  <div style={{
    width: 11,
    height: 11,
    borderRadius: '50%',
    backgroundColor: activa ? color : 'rgba(255, 255, 255, 0.12)',
    boxShadow: activa
      ? `0 0 4px ${color}, 0 0 8px ${color}, 0 0 14px ${color}`
      : 'inset 0 0 2px rgba(0,0,0,0.4)'
  }} />
);

const KPIDetalle: React.FC<KPIDetalleProps> = ({ numero, titulo, subtitulo, valor, unidad, meta, descripcion, estado, divider }) => {
  const color = estado === 'ok' ? C.olive : C.coral;
  return (
    <div style={{ padding: '24px 20px', borderRight: divider ? `1px solid ${C.rule}` : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.coral, letterSpacing: '1px' }}>
        {numero}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
          {titulo}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: C.inkMute, marginTop: 2, fontWeight: 400 }}>
          {subtitulo}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: color, lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
          {valor}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 14, color: C.inkSoft, fontWeight: 400 }}>
          {unidad}
        </div>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 13, color: C.inkMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {meta}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 14, color: C.inkSoft, lineHeight: 1.4, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.ruleSoft}` }}>
        {descripcion}
      </div>
    </div>
  );
};

const Panel: React.FC<PanelProps> = ({ titulo, kicker, flex, children }) => (
  <div style={{ flex: flex, padding: '0 20px 0 0' }}>
    <div style={{ fontFamily: FONT, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
      {kicker}
    </div>
    <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.4px', marginBottom: 16 }}>
      {titulo}
    </h3>
    {children}
  </div>
);

const Row: React.FC<RowProps> = ({ children }) => (
  <div style={{ display: 'flex', gap: 32, marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${C.rule}` }}>
    {children}
  </div>
);

interface CSFRowProps {
  etiqueta: string;
  valor?: string;
  ultima?: boolean;
}

const CSFRow: React.FC<CSFRowProps> = ({ etiqueta, valor, ultima = false }) => (
  <div style={{ display: 'flex', borderBottom: ultima ? 'none' : `1px solid ${C.rule}` }}>
    <div style={{
      width: '38%',
      padding: '12px 14px',
      backgroundColor: C.paperSoft,
      borderRight: `1px solid ${C.rule}`,
      fontFamily: FONT,
      fontSize: 12,
      fontWeight: 700,
      color: C.ink
    }}>
      {etiqueta}
    </div>
    <div style={{
      flex: 1,
      padding: '12px 14px',
      fontFamily: FONT,
      fontSize: 12,
      color: C.ink,
      minHeight: 18
    }}>
      {valor || ''}
    </div>
  </div>
);

const tdCSF = (header: boolean, width?: string): CSSProperties => ({
  padding: '10px 12px',
  fontFamily: FONT,
  fontSize: 12,
  color: C.ink,
  fontWeight: header ? 700 : 400,
  textAlign: 'left',
  borderRight: `1px solid ${C.rule}`,
  verticalAlign: 'top',
  width
});

// =====================================================
// PESTAÑA: REPORTE A CLIENTES
// =====================================================

const MESES_12 = ['May 25', 'Jun 25', 'Jul 25', 'Ago 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dic 25', 'Ene 26', 'Feb 26', 'Mar 26', 'Abr 26'];

interface DesgloseMes {
  mes: string;
  nomina: number;
  comisiones: number;
  bonos: number;
  destajos: number;
  otros: number;
}

interface ReporteData {
  // Sección 1
  nominaTotalMes: number;
  desgloseMes: DesgloseMes;
  variacionAcumulada: { mes: string; variacion: number }[];
  // Sección 2
  bajasMes: number;
  costoBajasMes: number;
  pctRotacionAcum: number;
  bajasAcum: { mes: string; bajas: number }[];
  costoAcum: { mes: string; costo: number }[];
  rotacionAcum: { mes: string; pct: number }[];
  // Sección 3
  desgloseCostosActual: { name: string; value: number; color: string }[];
  desgloseCostosAcum: { mes: string; nomina: number; imss: number; infonavit: number; isr: number; isn: number; otros: number }[];
}

const generarDataReporte = (c: Cliente): ReporteData => {
  const rnd = mulberry32(seedFromString(c.id));
  // Nómina mensual aproximada: empleados * salario promedio mensual (México ~16-22k bruto)
  const salarioProm = 14000 + Math.floor(rnd() * 9000);
  const nominaTotalMes = c.empleados * salarioProm;

  // Sección 1: Variaciones del mes
  const pctComisiones = 0.025 + rnd() * 0.06;
  const pctBonos = 0.01 + rnd() * 0.04;
  const pctDestajos = c.periodicidad === 'Semanal' ? 0.01 + rnd() * 0.05 : rnd() * 0.02;
  const pctOtros = 0.005 + rnd() * 0.015;

  const desgloseMes: DesgloseMes = {
    mes: MESES_12[11],
    nomina: Math.round(nominaTotalMes * (1 - pctComisiones - pctBonos - pctDestajos - pctOtros)),
    comisiones: Math.round(nominaTotalMes * pctComisiones),
    bonos: Math.round(nominaTotalMes * pctBonos),
    destajos: Math.round(nominaTotalMes * pctDestajos),
    otros: Math.round(nominaTotalMes * pctOtros)
  };

  const variacionBase = c.variacion;
  const variacionAcumulada = MESES_12.map((mes, i) => {
    const ruido = (rnd() - 0.5) * 3;
    const tendencia = (i / 11) * (variacionBase - 2);
    return { mes, variacion: Number(Math.max(0, 1.5 + tendencia + ruido).toFixed(1)) };
  });

  // Sección 2: Rotación
  const tasaMensual = c.estatus === 'critico' ? 0.045 : c.estatus === 'riesgo' ? 0.028 : 0.015;
  const bajasMes = Math.max(1, Math.round(c.empleados * tasaMensual * (0.7 + rnd() * 0.6)));
  const finiquitoProm = 18000 + Math.floor(rnd() * 12000);
  const costoBajasMes = bajasMes * finiquitoProm;

  const bajasAcum = MESES_12.map(mes => {
    const b = Math.max(1, Math.round(c.empleados * tasaMensual * (0.6 + rnd() * 0.8)));
    return { mes, bajas: b };
  });
  const totalBajasYTD = bajasAcum.reduce((s, m) => s + m.bajas, 0);
  const pctRotacionAcum = Number(((totalBajasYTD / c.empleados) * 100).toFixed(1));

  const costoAcum = bajasAcum.map(m => ({ mes: m.mes, costo: m.bajas * (finiquitoProm + Math.floor((rnd() - 0.5) * 4000)) }));

  let acumBajas = 0;
  const rotacionAcum = bajasAcum.map(m => {
    acumBajas += m.bajas;
    return { mes: m.mes, pct: Number(((acumBajas / c.empleados) * 100).toFixed(2)) };
  });

  // Sección 3: Desglose de costos (proporciones típicas México)
  const total = nominaTotalMes;
  const pNomina = 0.62 + (rnd() - 0.5) * 0.04;
  const pIMSS = 0.135 + (rnd() - 0.5) * 0.02;
  const pInfonavit = 0.05 + (rnd() - 0.5) * 0.01;
  const pISR = 0.10 + (rnd() - 0.5) * 0.02;
  const pISN = 0.025 + (rnd() - 0.5) * 0.005;
  const pOtros = Math.max(0.02, 1 - (pNomina + pIMSS + pInfonavit + pISR + pISN));

  const desgloseCostosActual = [
    { name: 'Nómina Neta', value: Math.round(total * pNomina), color: C.coral },
    { name: 'IMSS Patronal', value: Math.round(total * pIMSS), color: C.olive },
    { name: 'INFONAVIT', value: Math.round(total * pInfonavit), color: C.amber },
    { name: 'ISR Retenido', value: Math.round(total * pISR), color: C.inkSoft },
    { name: 'ISN Estatal', value: Math.round(total * pISN), color: C.oliveSoft },
    { name: 'Otros (SAR, Prima)', value: Math.round(total * pOtros), color: C.amberSoft }
  ];

  const desgloseCostosAcum = MESES_12.map((mes, i) => {
    const factor = 0.92 + (i / 11) * 0.16 + (rnd() - 0.5) * 0.04;
    const t = total * factor;
    return {
      mes,
      nomina: Math.round(t * pNomina),
      imss: Math.round(t * pIMSS),
      infonavit: Math.round(t * pInfonavit),
      isr: Math.round(t * pISR),
      isn: Math.round(t * pISN),
      otros: Math.round(t * pOtros)
    };
  });

  return {
    nominaTotalMes,
    desgloseMes,
    variacionAcumulada,
    bajasMes,
    costoBajasMes,
    pctRotacionAcum,
    bajasAcum,
    costoAcum,
    rotacionAcum,
    desgloseCostosActual,
    desgloseCostosAcum
  };
};

const interpretacionVariaciones = (c: Cliente, d: ReporteData): { titulo: string; cuerpo: string; riesgos: string[]; oportunidades: string[] } => {
  const totalIngresosVariables = d.desgloseMes.comisiones + d.desgloseMes.bonos + d.desgloseMes.destajos + d.desgloseMes.otros;
  const pctVariable = (totalIngresosVariables / (d.desgloseMes.nomina + totalIngresosVariables)) * 100;
  const ultimaVar = d.variacionAcumulada[d.variacionAcumulada.length - 1].variacion;
  const primeraVar = d.variacionAcumulada[0].variacion;
  const tendencia = ultimaVar - primeraVar;

  const tono = c.estatus === 'critico' ? 'crítica' : c.estatus === 'riesgo' ? 'requiere atención' : 'controlada';

  return {
    titulo: `Variabilidad ${tono} en la composición de la nómina`,
    cuerpo: `Durante el mes, ${pctVariable.toFixed(1)}% del costo total correspondió a percepciones variables (comisiones, bonos, destajos y otros), con un peso significativo del rubro ${d.desgloseMes.comisiones > d.desgloseMes.bonos ? 'comisiones' : 'bonos'}. La variación acumulada en doce meses cerró en ${ultimaVar.toFixed(1)}% sobre presupuesto, con una ${tendencia > 0 ? 'tendencia al alza' : 'tendencia descendente'} de ${Math.abs(tendencia).toFixed(1)} puntos respecto al inicio del periodo.`,
    riesgos: [
      `Composición variable elevada (${pctVariable.toFixed(1)}%) puede comprometer la previsibilidad del flujo de nómina si no se proyecta con base mensual.`,
      tendencia > 2 ? 'La variación acumulada muestra una pendiente preocupante que sugiere desviaciones recurrentes sobre el presupuesto autorizado.' : 'La variación se mantiene dentro de rangos manejables, sin desviaciones materiales recurrentes.',
      'Posible exposición a observaciones del SAT por integración variable a la base de cotización IMSS si no se documentan los conceptos como ingresos exentos o gravables conforme a la LISR.'
    ],
    oportunidades: [
      'Diseñar un esquema de compensación variable con tope mensual y reglas de capping para mitigar la dispersión.',
      `Renegociar el presupuesto de nómina con un techo de variación de ${Math.max(3, Math.round(ultimaVar - 1))}% para alinear expectativas con dirección.`,
      'Implementar un tablero de validación previo al cierre que detecte movimientos atípicos en bonos y destajos antes del timbrado.'
    ]
  };
};

const interpretacionRotacion = (c: Cliente, d: ReporteData): { titulo: string; cuerpo: string; riesgos: string[]; oportunidades: string[] } => {
  const promBajasMes = d.bajasAcum.reduce((s, m) => s + m.bajas, 0) / d.bajasAcum.length;
  const totalCostoYTD = d.costoAcum.reduce((s, m) => s + m.costo, 0);
  const nivel = d.pctRotacionAcum > 25 ? 'elevada' : d.pctRotacionAcum > 15 ? 'moderada' : 'controlada';

  return {
    titulo: `Rotación ${nivel} con impacto financiero acumulado`,
    cuerpo: `La rotación acumulada en doce meses alcanzó ${d.pctRotacionAcum.toFixed(1)}% sobre la plantilla promedio de ${c.empleados} colaboradores, con un promedio de ${promBajasMes.toFixed(1)} bajas mensuales. El costo financiero asociado a finiquitos, indemnizaciones y reposiciones ascendió a un acumulado de ${(totalCostoYTD / 1000000).toFixed(2)} millones de pesos en el periodo.`,
    riesgos: [
      `Una rotación de ${d.pctRotacionAcum.toFixed(1)}% ${d.pctRotacionAcum > 20 ? 'supera el referente sectorial y' : ''} compromete la curva de aprendizaje y la productividad esperada.`,
      'Costos ocultos no contabilizados: capacitación, baja productividad inicial y pérdida de conocimiento operativo.',
      d.pctRotacionAcum > 20 ? 'Riesgo reputacional ante el IMSS por alta rotación que puede activar revisiones de prima de riesgo de trabajo.' : 'Estabilidad razonable de plantilla; mantener monitoreo trimestral para evitar deterioro.'
    ],
    oportunidades: [
      'Implementar entrevistas de salida estructuradas para identificar causas raíz y diseñar plan de retención focalizado.',
      `Estimar ahorro potencial de ${formatearMillones(totalCostoYTD * 0.35)} mediante reducción de 35% en finiquitos no programados con un programa de permanencia.`,
      'Diseñar bono de antigüedad escalonado con costo marginal inferior al costo de reposición observado.'
    ]
  };
};

const interpretacionCostos = (c: Cliente, d: ReporteData): { titulo: string; cuerpo: string; riesgos: string[]; oportunidades: string[] } => {
  const total = d.desgloseCostosActual.reduce((s, p) => s + p.value, 0);
  const cargasSociales = d.desgloseCostosActual.filter(p => ['IMSS Patronal', 'INFONAVIT', 'ISR Retenido', 'ISN Estatal', 'Otros (SAR, Prima)'].includes(p.name)).reduce((s, p) => s + p.value, 0);
  const pctCargas = (cargasSociales / total) * 100;

  return {
    titulo: `Estructura de costos con ${pctCargas.toFixed(0)}% de cargas sociales y fiscales`,
    cuerpo: `La nómina neta percibida por los colaboradores representa ${((d.desgloseCostosActual[0].value / total) * 100).toFixed(1)}% del costo total. Las contribuciones obligatorias (IMSS, INFONAVIT, ISN, ISR retenido y otros conceptos patronales) suman ${pctCargas.toFixed(1)}%, equivalente a ${formatearMillones(cargasSociales)} mensuales. Esta proporción es consistente con la naturaleza de la actividad económica del cliente.`,
    riesgos: [
      `El componente IMSS-INFONAVIT representa una exposición patrimonial significativa: cualquier observación en la prima de riesgo o en la base de cotización puede traducirse en créditos fiscales relevantes.`,
      'El ISR retenido debe enterarse en plazos perentorios; retrasos generan actualización, recargos y multas no recuperables.',
      'La carga del ISN estatal varía por entidad; crecimientos de plantilla en estados con tasas mayores incrementan el costo efectivo.'
    ],
    oportunidades: [
      'Auditar la prima de riesgo de trabajo con metodología actuarial para detectar oportunidades de reducción ante el IMSS.',
      'Optimizar la estructura de percepciones con herramientas legales: previsión social, fondo de ahorro y vales de despensa exentos hasta los topes UMA.',
      `Estimar ahorro potencial anual de ${formatearMillones(cargasSociales * 12 * 0.04)} mediante un proyecto de optimización fiscal-laboral con cumplimiento estricto.`
    ]
  };
};

const formatearMillones = (n: number): string => {
  const m = n / 1000000;
  if (m >= 1) return `$${m.toFixed(2)}M MXN`;
  return `$${(n / 1000).toFixed(0)}K MXN`;
};

const formatPctDeTotal = (v: number, d: DesgloseMes): string => {
  const total = d.nomina + d.comisiones + d.bonos + d.destajos + d.otros;
  const pct = (v / total) * 100;
  return pct < 4 ? '' : `${pct.toFixed(1)}%`;
};

const formatKMXN = (v: number): string => `$${(v / 1000).toFixed(0)}K`;
const formatMMXN = (v: number): string => `$${(v / 1000000).toFixed(1)}M`;

interface PestanaReportesProps {
  periodo: string;
  formatMXN: (n: number) => string;
  formatNum: (n: number) => string;
}

const PestanaReportes: React.FC<PestanaReportesProps> = ({ periodo, formatMXN, formatNum }) => {
  const [clienteId, setClienteId] = useState<string>('');
  const cliente = useMemo(() => CLIENTES.find(c => c.id === clienteId) || null, [clienteId]);
  const data = useMemo(() => cliente ? generarDataReporte(cliente) : null, [cliente]);

  const interpVar = useMemo(() => cliente && data ? interpretacionVariaciones(cliente, data) : null, [cliente, data]);
  const interpRot = useMemo(() => cliente && data ? interpretacionRotacion(cliente, data) : null, [cliente, data]);
  const interpCos = useMemo(() => cliente && data ? interpretacionCostos(cliente, data) : null, [cliente, data]);

  const ReporteTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ backgroundColor: C.ink, padding: '10px 14px', borderRadius: 2 }}>
        <p style={{ color: C.paper, fontFamily: FONT, fontSize: 11, fontWeight: 700, margin: 0, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || C.paperSoft, fontFamily: FONT, margin: 0, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
            {p.name}: {typeof p.value === 'number' ? formatMXN(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  const PctTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ backgroundColor: C.ink, padding: '10px 14px', borderRadius: 2 }}>
        <p style={{ color: C.paper, fontFamily: FONT, fontSize: 11, fontWeight: 700, margin: 0, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || C.paperSoft, fontFamily: FONT, margin: 0, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) + '%' : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* SELECTOR + DESCARGA — no se imprime */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${C.rule}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontSize: 15, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 6, fontWeight: 700 }}>
            Reporte Ejecutivo
          </div>
          <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px', marginBottom: 12 }}>
            Selecciona un cliente
          </h2>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={{
              backgroundColor: C.paper,
              color: C.ink,
              border: `1px solid ${C.ink}`,
              padding: '12px 16px',
              borderRadius: 0,
              fontSize: 17,
              fontFamily: FONT,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 380
            }}
          >
            <option value="">— Selecciona un cliente —</option>
            {CLIENTES.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        {cliente && (
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: C.ink,
              color: C.paper,
              border: 'none',
              padding: '14px 28px',
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Descargar PDF ↓
          </button>
        )}
      </div>

      {!cliente && (
        <div style={{ padding: '80px 0', textAlign: 'center', color: C.inkMute, fontFamily: FONT, fontSize: 17 }}>
          Elige un cliente del listado para generar su reporte ejecutivo personalizado.
        </div>
      )}

      {cliente && data && interpVar && interpRot && interpCos && (
        <div className="reporte-printable" style={{ fontFamily: FONT, color: C.ink }}>
          {/* PORTADA / ENCABEZADO */}
          <div style={{ borderTop: `4px solid ${C.coral}`, borderBottom: `2px solid ${C.ink}`, padding: '32px 0', marginBottom: 32 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 12 }}>
              Reporte Ejecutivo Mensual · {periodo}
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 8 }}>
              {cliente.nombre}
            </h1>
            <div style={{ fontFamily: FONT, fontSize: 17, color: C.inkSoft }}>
              {FICHAS[cliente.id]?.razonSocial} · RFC {FICHAS[cliente.id]?.rfc} · {formatNum(cliente.empleados)} colaboradores · Dispersión {cliente.periodicidad}
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
              <ReporteKPI etiqueta="Nómina del Mes" valor={formatMXN(data.nominaTotalMes)} />
              <ReporteKPI etiqueta="Bajas del Mes" valor={`${data.bajasMes} colaboradores`} />
              <ReporteKPI etiqueta="Rotación YTD" valor={`${data.pctRotacionAcum.toFixed(1)}%`} acento={data.pctRotacionAcum > 20} />
              <ReporteKPI etiqueta="Variación vs Ppto" valor={`+${data.variacionAcumulada[11].variacion.toFixed(1)}%`} acento={data.variacionAcumulada[11].variacion > 5} />
            </div>
          </div>

          {/* SECCIÓN 1: VARIACIONES A LA NÓMINA */}
          <ReporteSeccion numero="01" kicker="Composición y Desviaciones" titulo="Variaciones a la Nómina">
            <p style={{ fontFamily: FONT, fontSize: 16, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Análisis de la composición de las percepciones del mes y de la desviación acumulada de la nómina respecto al presupuesto autorizado, con desglose de los conceptos variables (comisiones, bonos, destajos y otros).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 24 }}>
              {/* Gráfica del mes con desglose */}
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Mes en Curso
                </div>
                <h4 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.ink, letterSpacing: '-0.3px' }}>
                  Desglose de percepciones · {data.desgloseMes.mes}
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[data.desgloseMes]} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }} stackOffset="expand">
                    <CartesianGrid strokeDasharray="1 3" stroke={C.rule} horizontal={false} />
                    <XAxis type="number" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} stroke={C.inkMute} style={{ fontSize: 15, fontFamily: FONT }} />
                    <YAxis type="category" dataKey="mes" stroke={C.inkSoft} style={{ fontSize: 15, fontFamily: FONT }} />
                    <Tooltip content={<ReporteTooltip />} cursor={{ fill: C.paperSoft }} />
                    <Legend wrapperStyle={{ fontSize: 14, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }} />
                    <Bar dataKey="nomina" stackId="a" fill={C.olive} name="Nómina base">
                      <LabelList dataKey="nomina" position="center" formatter={(v: number) => formatPctDeTotal(v, data.desgloseMes)} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: C.paper }} />
                    </Bar>
                    <Bar dataKey="comisiones" stackId="a" fill={C.coral} name="Comisiones">
                      <LabelList dataKey="comisiones" position="center" formatter={(v: number) => formatPctDeTotal(v, data.desgloseMes)} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: C.paper }} />
                    </Bar>
                    <Bar dataKey="bonos" stackId="a" fill={C.amber} name="Bonos">
                      <LabelList dataKey="bonos" position="center" formatter={(v: number) => formatPctDeTotal(v, data.desgloseMes)} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: C.ink }} />
                    </Bar>
                    <Bar dataKey="destajos" stackId="a" fill={C.oliveSoft} name="Destajos" />
                    <Bar dataKey="otros" stackId="a" fill={C.amberSoft} name="Otros" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  <DesgloseRow color={C.olive} label="Nómina base" valor={formatMXN(data.desgloseMes.nomina)} />
                  <DesgloseRow color={C.coral} label="Comisiones" valor={formatMXN(data.desgloseMes.comisiones)} />
                  <DesgloseRow color={C.amber} label="Bonos" valor={formatMXN(data.desgloseMes.bonos)} />
                  <DesgloseRow color={C.oliveSoft} label="Destajos" valor={formatMXN(data.desgloseMes.destajos)} />
                  <DesgloseRow color={C.amberSoft} label="Otros" valor={formatMXN(data.desgloseMes.otros)} />
                </div>
              </div>

              {/* Gráfica acumulada — % variación */}
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Tendencia Doce Meses
                </div>
                <h4 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.ink, letterSpacing: '-0.3px' }}>
                  Variación acumulada vs presupuesto
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.variacionAcumulada} margin={{ top: 24, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
                    <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 14, fontFamily: FONT }} />
                    <YAxis stroke={C.inkMute} style={{ fontSize: 15, fontFamily: FONT }} tickFormatter={(v: number) => v + '%'} />
                    <Tooltip content={<PctTooltip />} cursor={{ fill: C.paperSoft }} />
                    <Bar dataKey="variacion" fill={C.coral} name="% Variación" maxBarSize={42}>
                      <LabelList dataKey="variacion" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: C.ink }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: C.paperSoft, borderLeft: `3px solid ${C.coral}` }}>
                  <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>Cierre del periodo</div>
                  <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
                    +{data.variacionAcumulada[11].variacion.toFixed(1)}%
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 15, color: C.inkSoft, marginTop: 2 }}>variación acumulada doce meses</div>
                </div>
              </div>
            </div>

            <BloqueIA interpretacion={interpVar} />
          </ReporteSeccion>

          {/* SECCIÓN 2: COSTO DE ROTACIÓN */}
          <ReporteSeccion numero="02" kicker="Movimiento de Plantilla" titulo="Costo de Rotación">
            <p style={{ fontFamily: FONT, fontSize: 16, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Análisis del movimiento de plantilla durante el periodo: bajas registradas en el mes, costo financiero asociado y porcentaje acumulado de rotación en el ejercicio en curso.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 28, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
              <ReporteKPIBig etiqueta="Bajas del Mes" valor={data.bajasMes.toString()} unidad="colaboradores" divider />
              <ReporteKPIBig etiqueta="Costo del Mes" valor={formatMXN(data.costoBajasMes)} unidad="finiquitos + reposiciones" divider />
              <ReporteKPIBig etiqueta="Rotación Acumulada" valor={`${data.pctRotacionAcum.toFixed(1)}%`} unidad="ejercicio en curso" acento={data.pctRotacionAcum > 20} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Bajas mensuales
                </div>
                <h5 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 10px 0', color: C.ink }}>
                  Número de bajas por mes
                </h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.bajasAcum} margin={{ top: 24, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
                    <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} />
                    <YAxis stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} />
                    <Tooltip content={<ReporteTooltip />} cursor={{ fill: C.paperSoft }} />
                    <Bar dataKey="bajas" fill={C.coral} name="Bajas">
                      <LabelList dataKey="bajas" position="top" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: C.ink }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Costo mensual
                </div>
                <h5 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 10px 0', color: C.ink }}>
                  Costo financiero (MXN)
                </h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.costoAcum} margin={{ top: 24, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
                    <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} />
                    <YAxis stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} tickFormatter={(v: number) => (v / 1000).toFixed(0) + 'K'} />
                    <Tooltip content={<ReporteTooltip />} cursor={{ fill: C.paperSoft }} />
                    <Bar dataKey="costo" fill={C.amber} name="Costo" maxBarSize={32}>
                      <LabelList dataKey="costo" position="top" formatter={(v: number) => formatKMXN(v)} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: C.ink }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Rotación acumulada
                </div>
                <h5 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 10px 0', color: C.ink }}>
                  Porcentaje sobre plantilla
                </h5>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.rotacionAcum} margin={{ top: 24, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rotPctGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.olive} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={C.olive} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
                    <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} />
                    <YAxis stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} tickFormatter={(v: number) => v + '%'} />
                    <Tooltip content={<PctTooltip />} />
                    <Area type="monotone" dataKey="pct" stroke={C.olive} strokeWidth={2} fill="url(#rotPctGrad)" name="% Rotación">
                      <LabelList dataKey="pct" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: C.ink }} />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <BloqueIA interpretacion={interpRot} />
          </ReporteSeccion>

          {/* SECCIÓN 3: DESGLOSE DE COSTOS */}
          <ReporteSeccion numero="03" kicker="Estructura del Costo" titulo="Desglose de Costos de Nómina">
            <p style={{ fontFamily: FONT, fontSize: 16, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Composición del costo total de nómina por concepto: nómina neta percibida por colaboradores, contribuciones obligatorias al IMSS, INFONAVIT, ISR retenido, ISN estatal y otras cargas patronales.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 28, marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Composición del Mes
                </div>
                <h4 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.ink, letterSpacing: '-0.3px' }}>
                  Distribución por concepto
                </h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.desgloseCostosActual}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={105}
                      paddingAngle={2}
                      dataKey="value"
                      label={(props: { name: string; percent: number; x: number; y: number; cx: number }) => {
                        const { percent, x, y, cx } = props;
                        return (
                          <text x={x} y={y} fill={C.ink} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: 14, fontFamily: FONT, fontWeight: 700 }}>
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={{ stroke: C.inkSoft, strokeWidth: 0.5 }}
                    >
                      {data.desgloseCostosActual.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke={C.paper} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<ReporteTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 8 }}>
                  {data.desgloseCostosActual.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < data.desgloseCostosActual.length - 1 ? `1px solid ${C.ruleSoft}` : 'none', fontFamily: FONT, fontSize: 15 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, backgroundColor: p.color, display: 'inline-block' }} />
                        <span style={{ color: C.ink, fontWeight: 700 }}>{p.name}</span>
                      </span>
                      <span style={{ color: C.ink, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{formatMXN(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
                  Acumulado Doce Meses
                </div>
                <h4 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.ink, letterSpacing: '-0.3px' }}>
                  Evolución por concepto
                </h4>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.desgloseCostosAcum} margin={{ top: 28, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
                    <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} />
                    <YAxis stroke={C.inkMute} style={{ fontSize: 13, fontFamily: FONT }} tickFormatter={(v: number) => (v / 1000000).toFixed(1) + 'M'} />
                    <Tooltip content={<ReporteTooltip />} cursor={{ fill: C.paperSoft }} />
                    <Legend wrapperStyle={{ fontSize: 13, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }} />
                    <Bar dataKey="nomina" stackId="b" fill={C.coral} name="Nómina" />
                    <Bar dataKey="imss" stackId="b" fill={C.olive} name="IMSS" />
                    <Bar dataKey="infonavit" stackId="b" fill={C.amber} name="INFONAVIT" />
                    <Bar dataKey="isr" stackId="b" fill={C.inkSoft} name="ISR" />
                    <Bar dataKey="isn" stackId="b" fill={C.oliveSoft} name="ISN" />
                    <Bar dataKey="otros" stackId="b" fill={C.amberSoft} name="Otros">
                      <LabelList valueAccessor={(entry: { nomina: number; imss: number; infonavit: number; isr: number; isn: number; otros: number }) => formatMMXN(entry.nomina + entry.imss + entry.infonavit + entry.isr + entry.isn + entry.otros)} position="top" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: C.ink }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <BloqueIA interpretacion={interpCos} />
          </ReporteSeccion>

          {/* PIE DE PÁGINA DEL REPORTE */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `2px solid ${C.ink}`, fontFamily: FONT, fontSize: 14, color: C.inkMute, lineHeight: 1.6 }}>
            <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 6 }}>
              Aviso del Despacho
            </div>
            Reporte generado por Gustavo Robles Nóminas para uso exclusivo de {cliente.nombre}. Las interpretaciones cualitativas fueron elaboradas con asistencia de inteligencia artificial sobre la base de los datos operativos del cliente; toda decisión derivada del presente documento debe validarse con el ejecutivo de cuenta asignado.
          </div>
        </div>
      )}
    </div>
  );
};

const ReporteKPI: React.FC<{ etiqueta: string; valor: string; acento?: boolean }> = ({ etiqueta, valor, acento = false }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700, marginBottom: 6 }}>
      {etiqueta}
    </div>
    <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: acento ? C.coral : C.ink, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
      {valor}
    </div>
  </div>
);

const ReporteKPIBig: React.FC<{ etiqueta: string; valor: string; unidad: string; divider?: boolean; acento?: boolean }> = ({ etiqueta, valor, unidad, divider = false, acento = false }) => (
  <div style={{ padding: '24px 28px', borderRight: divider ? `1px solid ${C.rule}` : 'none' }}>
    <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontWeight: 700, marginBottom: 10 }}>
      {etiqueta}
    </div>
    <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: acento ? C.coral : C.ink, letterSpacing: '-0.8px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
      {valor}
    </div>
    <div style={{ fontFamily: FONT, fontSize: 14, color: C.inkMute, fontWeight: 400 }}>
      {unidad}
    </div>
  </div>
);

const ReporteSeccion: React.FC<{ numero: string; kicker: string; titulo: string; children: React.ReactNode }> = ({ numero, kicker, titulo, children }) => (
  <section className="reporte-seccion" style={{ marginBottom: 56, paddingBottom: 32, borderBottom: `1px solid ${C.rule}` }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 20 }}>
      <div style={{ fontFamily: FONT, fontSize: 56, fontWeight: 700, color: C.coral, letterSpacing: '-2px', lineHeight: 0.9 }}>
        {numero}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 4 }}>
          {kicker}
        </div>
        <h3 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px' }}>
          {titulo}
        </h3>
      </div>
    </div>
    {children}
  </section>
);

const DesgloseRow: React.FC<{ color: string; label: string; valor: string }> = ({ color, label, valor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 14 }}>
    <span style={{ width: 10, height: 10, backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
    <span style={{ color: C.inkSoft, flex: 1 }}>{label}</span>
    <span style={{ color: C.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{valor}</span>
  </div>
);

const BloqueIA: React.FC<{ interpretacion: { titulo: string; cuerpo: string; riesgos: string[]; oportunidades: string[] } }> = ({ interpretacion }) => (
  <div style={{ marginTop: 16, backgroundColor: C.paperSoft, padding: '24px 28px', borderLeft: `3px solid ${C.coral}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, padding: '4px 8px', border: `1px solid ${C.coral}` }}>
        Análisis
      </span>
      <h5 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.3px' }}>
        {interpretacion.titulo}
      </h5>
    </div>
    <p style={{ fontFamily: FONT, fontSize: 16, lineHeight: 1.65, color: C.ink, margin: '0 0 18px 0' }}>
      {interpretacion.cuerpo}
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontWeight: 700, marginBottom: 8 }}>
          Riesgos Identificados
        </div>
        <ul style={{ fontFamily: FONT, fontSize: 15, color: C.inkSoft, margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
          {interpretacion.riesgos.map((r, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{r}</li>
          ))}
        </ul>
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: C.olive, fontWeight: 700, marginBottom: 8 }}>
          Oportunidades
        </div>
        <ul style={{ fontFamily: FONT, fontSize: 15, color: C.inkSoft, margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
          {interpretacion.oportunidades.map((o, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{o}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

interface ChatMensaje {
  id: number;
  rol: 'usuario' | 'asistente';
  texto: string;
}

interface ChatConversacion {
  id: number;
  titulo: string;
  mensajes: ChatMensaje[];
}

const RESPUESTAS_SIMULADAS: string[] = [
  'En este momento estoy operando en modo simulación, así que no consulto datos reales del tablero. Lo que sí puedo hacer es ayudarte a estructurar la pregunta para que cuando se conecte el motor de datos obtengamos una respuesta precisa: ¿estás buscando un indicador puntual (SLA, timbrado, variación), una comparación entre clientes, o una explicación conceptual de algún proceso de nómina?',
  'Buena pregunta. Aunque por ahora respondo con texto genérico, te puedo dar una guía rápida: cuando hablamos de margen por cuenta lo que conviene revisar primero es el fee mensual contra el costo operativo asignado, y luego ajustar por incidentes de SLA y retimbres. Si quieres, te armo una plantilla con los campos exactos que deberíamos pedirle al motor.',
  'Lo que comentas suele caer en uno de tres frentes: cumplimiento (timbrado, IMSS, SAT), operación (SLA, incidencias, retimbres) o rentabilidad (fee vs. costo). Decirme cuál de los tres te interesa más me ayuda a darte una respuesta más útil incluso en este modo de simulación.',
  'Entiendo la idea. En la versión conectada, el asistente cruzaría el dato con el periodo seleccionado y los filtros activos del tablero. Por ahora puedo redactarte la conclusión, el correo al cliente o los puntos a llevar a la junta interna a partir del enunciado que me des.',
  'Te respondo de forma general: en nómina la métrica que mejor anticipa problemas no es el costo sino la variación quincena contra quincena. Cuando la variación se sale de ±2% sin un evento que lo justifique (alta masiva, finiquito, bono), conviene auditar el run antes del timbrado. ¿Quieres que lo enfoque en un cliente en particular?',
  'Perfecto. Dame un poco más de contexto: ¿lo necesitas para una reunión interna, para presentárselo al cliente o para un reporte formal? El tono y la profundidad cambian bastante según el destinatario, y prefiero acertarle al primer intento.'
];

const SUGERENCIAS_INICIALES: string[] = [
  '¿Qué clientes tienen mayor riesgo este mes?',
  'Resume la operación de la quincena en 3 puntos.',
  'Explícame la diferencia entre fee y margen operativo.',
  'Redacta un correo al cliente sobre un retimbre.'
];

const PestanaChat: React.FC = () => {
  const [conversaciones, setConversaciones] = useState<ChatConversacion[]>([
    { id: 1, titulo: 'Nueva conversación', mensajes: [] }
  ]);
  const [activaId, setActivaId] = useState<number>(1);
  const [input, setInput] = useState<string>('');
  const [pensando, setPensando] = useState<boolean>(false);
  const respuestaIdx = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const conversacion = conversaciones.find((c) => c.id === activaId) || conversaciones[0];

  const actualizarConversacion = (id: number, fn: (c: ChatConversacion) => ChatConversacion): void => {
    setConversaciones((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  };

  const enviar = (texto: string): void => {
    const limpio = texto.trim();
    if (!limpio || pensando) return;
    const idUsuario = Date.now();
    const idAsistente = idUsuario + 1;

    actualizarConversacion(activaId, (c) => {
      const nuevoTitulo = c.mensajes.length === 0 ? limpio.slice(0, 48) : c.titulo;
      return {
        ...c,
        titulo: nuevoTitulo,
        mensajes: [...c.mensajes, { id: idUsuario, rol: 'usuario', texto: limpio }]
      };
    });
    setInput('');
    setPensando(true);

    window.setTimeout(() => {
      const respuesta = RESPUESTAS_SIMULADAS[respuestaIdx.current % RESPUESTAS_SIMULADAS.length];
      respuestaIdx.current += 1;
      actualizarConversacion(activaId, (c) => ({
        ...c,
        mensajes: [...c.mensajes, { id: idAsistente, rol: 'asistente', texto: respuesta }]
      }));
      setPensando(false);
    }, 900 + Math.random() * 600);
  };

  const nuevaConversacion = (): void => {
    const nuevoId = Math.max(...conversaciones.map((c) => c.id)) + 1;
    setConversaciones((prev) => [{ id: nuevoId, titulo: 'Nueva conversación', mensajes: [] }, ...prev]);
    setActivaId(nuevoId);
    setInput('');
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversacion.mensajes.length, pensando]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(input);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, border: `1px solid ${C.rule}`, height: 'calc(100vh - 280px)', minHeight: 520, backgroundColor: C.paper }}>
      {/* Sidebar de conversaciones */}
      <div style={{ borderRight: `1px solid ${C.rule}`, display: 'flex', flexDirection: 'column', backgroundColor: C.paperSoft }}>
        <div style={{ padding: '16px 16px 12px 16px', borderBottom: `1px solid ${C.rule}` }}>
          <button
            onClick={nuevaConversacion}
            style={{
              width: '100%',
              backgroundColor: C.ink,
              color: C.paper,
              border: 'none',
              padding: '10px 14px',
              fontSize: 11,
              fontFamily: FONT,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            + Nueva conversación
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversaciones.map((c) => (
            <button
              key={c.id}
              onClick={() => setActivaId(c.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: c.id === activaId ? C.paper : 'transparent',
                color: C.ink,
                border: 'none',
                borderLeft: c.id === activaId ? `3px solid ${C.coral}` : '3px solid transparent',
                padding: '12px 16px',
                fontSize: 13,
                fontFamily: FONT,
                fontWeight: c.id === activaId ? 700 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderBottom: `1px solid ${C.ruleSoft}`
              }}
              title={c.titulo}
            >
              {c.titulo}
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.rule}`, fontSize: 10, color: C.inkMute, fontFamily: FONT, letterSpacing: '0.5px' }}>
          Modo simulación · Sin conexión a fuentes externas
        </div>
      </div>

      {/* Área principal del chat */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, fontFamily: FONT }}>
              Asistente Operativo
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, fontFamily: FONT, letterSpacing: '-0.3px', marginTop: 2 }}>
              {conversacion.titulo}
            </div>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px 24px', backgroundColor: C.paper }}>
          {conversacion.mensajes.length === 0 && (
            <div style={{ maxWidth: 640, margin: '40px auto 0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: C.coral, fontFamily: FONT, marginBottom: 10 }}>
                Cómo puedo ayudarte
              </div>
              <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.ink, margin: '0 0 28px 0', letterSpacing: '-0.5px' }}>
                Pregunta lo que necesites del tablero.
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {SUGERENCIAS_INICIALES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => enviar(s)}
                    style={{
                      textAlign: 'left',
                      backgroundColor: C.paperSoft,
                      border: `1px solid ${C.rule}`,
                      color: C.ink,
                      padding: '14px 16px',
                      fontSize: 13,
                      fontFamily: FONT,
                      cursor: 'pointer',
                      lineHeight: 1.4
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {conversacion.mensajes.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: m.rol === 'usuario' ? 'flex-end' : 'flex-start',
                marginBottom: 16
              }}
            >
              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: m.rol === 'usuario' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: m.rol === 'usuario' ? C.inkMute : C.coral, fontFamily: FONT, marginBottom: 4 }}>
                  {m.rol === 'usuario' ? 'Tú' : 'Asistente'}
                </div>
                <div
                  style={{
                    backgroundColor: m.rol === 'usuario' ? C.ink : C.paperSoft,
                    color: m.rol === 'usuario' ? C.paper : C.ink,
                    border: m.rol === 'usuario' ? 'none' : `1px solid ${C.rule}`,
                    padding: '12px 16px',
                    fontSize: 14,
                    fontFamily: FONT,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.texto}
                </div>
              </div>
            </div>
          ))}

          {pensando && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
              <div style={{ maxWidth: '78%' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontFamily: FONT, marginBottom: 4 }}>
                  Asistente
                </div>
                <div style={{ backgroundColor: C.paperSoft, border: `1px solid ${C.rule}`, padding: '12px 16px', fontSize: 14, color: C.inkMute, fontFamily: FONT, fontStyle: 'italic' }}>
                  Escribiendo…
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 24px 18px 24px', borderTop: `1px solid ${C.rule}`, backgroundColor: C.paper }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, border: `1px solid ${C.ink}`, backgroundColor: C.paper, padding: '10px 12px' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu mensaje y presiona Enter…"
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: C.ink,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: 1.5,
                maxHeight: 160
              }}
            />
            <button
              onClick={() => enviar(input)}
              disabled={!input.trim() || pensando}
              style={{
                backgroundColor: !input.trim() || pensando ? C.rule : C.coral,
                color: C.paper,
                border: 'none',
                padding: '8px 18px',
                fontSize: 11,
                fontFamily: FONT,
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: !input.trim() || pensando ? 'not-allowed' : 'pointer'
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type AlertaSeveridad = 'alta' | 'media';

interface AlertaOperativa {
  id: string;
  responsable: string;
  puesto: string;
  tarea: string;
  cliente: string;
  diasRetraso: number;
  fechaCompromiso: string;
  severidad: AlertaSeveridad;
  detalle: string;
}

interface AlertaMercado {
  id: string;
  titulo: string;
  fuente: string;
  fecha: string;
  resumen: string;
  clientesAfectados: { nombre: string; impacto: string }[];
  severidad: AlertaSeveridad;
  recomendacion: string;
}

const ALERTAS_OPERATIVAS: AlertaOperativa[] = [
  {
    id: 'OP-001',
    responsable: 'Mariana Quintero',
    puesto: 'Coordinadora de Timbrado',
    tarea: 'Retimbre masivo CFDI 4.0 — Textiles Bajío',
    cliente: 'Textiles Bajío',
    diasRetraso: 7,
    fechaCompromiso: '22-Abr-2026',
    severidad: 'alta',
    detalle: '34 recibos rechazados por SAT (CFDI 4.0, RFC receptor inválido). El cliente ya escaló por correo al ejecutivo de cuenta.'
  },
  {
    id: 'OP-002',
    responsable: 'Javier Mendoza',
    puesto: 'Analista de Nómina Sr.',
    tarea: 'Conciliación IMSS bimestral — Grupo Restaurantero MX',
    cliente: 'Grupo Restaurantero MX',
    diasRetraso: 5,
    fechaCompromiso: '24-Abr-2026',
    severidad: 'alta',
    detalle: 'Diferencia de $48,200 sin aclarar entre SUA y nómina interna. Riesgo de multa por entero extemporáneo.'
  },
  {
    id: 'OP-003',
    responsable: 'Sofía Rangel',
    puesto: 'Ejecutiva de Cuenta',
    tarea: 'Revisión y firma de adendum contractual — Hotelera Costa Maya',
    cliente: 'Hotelera Costa Maya',
    diasRetraso: 6,
    fechaCompromiso: '23-Abr-2026',
    severidad: 'alta',
    detalle: 'Adendum por incremento de fee 2026 sin firmar. Bloquea facturación del periodo en curso.'
  },
  {
    id: 'OP-004',
    responsable: 'Luis Cabrera',
    puesto: 'Coordinador Operativo',
    tarea: 'Cierre de incidencias quincenales — Constructora Hermosillo',
    cliente: 'Constructora Hermosillo',
    diasRetraso: 3,
    fechaCompromiso: '26-Abr-2026',
    severidad: 'media',
    detalle: 'Faltan capturar 11 incidencias de obra (faltas, horas extra). Sin resolver impacta el run del jueves.'
  },
  {
    id: 'OP-005',
    responsable: 'Andrea Salinas',
    puesto: 'Analista de Nómina',
    tarea: 'Cálculo de finiquitos pendientes — Agroindustrias Sinaloa',
    cliente: 'Agroindustrias Sinaloa',
    diasRetraso: 2,
    fechaCompromiso: '27-Abr-2026',
    severidad: 'media',
    detalle: '6 finiquitos por temporada agrícola. Cliente solicita entrega antes del viernes.'
  },
  {
    id: 'OP-006',
    responsable: 'Roberto Esquivel',
    puesto: 'Soporte Técnico Nómina',
    tarea: 'Alta de 18 colaboradores en sistema — Metalúrgica del Centro',
    cliente: 'Metalúrgica del Centro',
    diasRetraso: 2,
    fechaCompromiso: '27-Abr-2026',
    severidad: 'media',
    detalle: 'Documentación recibida incompleta (faltan 4 CURP). Pendiente confirmación con RH del cliente.'
  },
  {
    id: 'OP-007',
    responsable: 'Patricia Ortega',
    puesto: 'Auditoría Interna',
    tarea: 'Cierre de papeles de trabajo — Servicios Médicos del Sur',
    cliente: 'Servicios Médicos del Sur',
    diasRetraso: 4,
    fechaCompromiso: '25-Abr-2026',
    severidad: 'alta',
    detalle: 'Honorarios por asimilados sin soporte de contrato firmado. Hallazgo abierto desde la auditoría de marzo.'
  },
  {
    id: 'OP-008',
    responsable: 'Diego Navarro',
    puesto: 'Analista de Nómina Jr.',
    tarea: 'Provisión PTU 2026 — Manufacturas del Norte SA',
    cliente: 'Manufacturas del Norte SA',
    diasRetraso: 1,
    fechaCompromiso: '28-Abr-2026',
    severidad: 'media',
    detalle: 'Cálculo preliminar listo, falta validación final con contraloría del cliente.'
  }
];

const ALERTAS_MERCADO: AlertaMercado[] = [
  {
    id: 'MK-001',
    titulo: 'EE.UU. eleva aranceles al acero y aluminio mexicano del 25% al 35%',
    fuente: 'Reuters · El Financiero',
    fecha: '28-Abr-2026',
    severidad: 'alta',
    resumen: 'La administración estadounidense anunció ajuste arancelario que entra en vigor en 30 días. Sectores metalúrgicos y automotrices con exposición exportadora son los más expuestos.',
    clientesAfectados: [
      { nombre: 'Manufacturas del Norte SA', impacto: 'Componentes automotrices con 60% de venta a OEM en Texas. Riesgo alto de recorte de turnos en planta.' },
      { nombre: 'Metalúrgica del Centro', impacto: 'Fundición y forja con clientes en frontera. Posible reducción de plantilla operativa en 4-6 semanas.' }
    ],
    recomendacion: 'Contactar a RH de ambos clientes para anticipar escenario de reducción de plantilla y proyectar finiquitos. Reservar capacidad operativa.'
  },
  {
    id: 'MK-002',
    titulo: 'Sequía severa en Sinaloa: pronóstico CONAGUA reduce ciclo agrícola 2026 en 22%',
    fuente: 'CONAGUA · Milenio',
    fecha: '27-Abr-2026',
    severidad: 'alta',
    resumen: 'El reporte semanal de presas confirma niveles por debajo del 30% en distritos de riego clave. Productores de hortalizas para exportación están reduciendo superficie sembrada.',
    clientesAfectados: [
      { nombre: 'Agroindustrias Sinaloa', impacto: 'Plantilla mayoritariamente jornalera (256 colaboradores). Reducción de ciclo implica baja masiva entre junio y agosto.' }
    ],
    recomendacion: 'Preparar protocolo de finiquitos masivos por terminación de temporada. Alertar al ejecutivo de cuenta para revisar fee variable.'
  },
  {
    id: 'MK-003',
    titulo: 'Salario mínimo profesional en hotelería sube 12% en zonas turísticas',
    fuente: 'CONASAMI · DOF',
    fecha: '25-Abr-2026',
    severidad: 'media',
    resumen: 'Acuerdo tripartita publicado en el DOF impacta mínimos profesionales del sector turístico-hotelero a partir del 1 de junio.',
    clientesAfectados: [
      { nombre: 'Hotelera Costa Maya', impacto: 'Operación all-inclusive con 189 empleados, mayoría sobre tabulador profesional hotelero. Incremento directo en base de cotización IMSS.' }
    ],
    recomendacion: 'Recalcular costo laboral proyectado y notificar al cliente antes del cierre de mayo. Revisar tabulador interno.'
  },
  {
    id: 'MK-004',
    titulo: 'Banxico mantiene tasa en 9.25%; encarece créditos PyME al sector restaurantero',
    fuente: 'Banxico · El Economista',
    fecha: '24-Abr-2026',
    severidad: 'media',
    resumen: 'Decisión de política monetaria mantiene presión sobre líneas de crédito revolventes. Restaurantes con apalancamiento alto enfrentan estrés de capital de trabajo.',
    clientesAfectados: [
      { nombre: 'Grupo Restaurantero MX', impacto: '15 sucursales con financiamiento bancario activo. Posible retraso en pago de fee si liquidez se contrae en Q2.' }
    ],
    recomendacion: 'Reforzar gestión de cobranza preventiva. Revisar antigüedad de cuentas por cobrar del cliente semanalmente.'
  },
  {
    id: 'MK-005',
    titulo: 'Importaciones textiles asiáticas crecen 18% YoY; presión sobre manufactura nacional',
    fuente: 'INEGI · Canaintex',
    fecha: '23-Abr-2026',
    severidad: 'alta',
    resumen: 'Reporte trimestral de Canaintex confirma aceleración de importaciones de prenda terminada. Productores nacionales reportan caída de pedidos para temporada otoño-invierno.',
    clientesAfectados: [
      { nombre: 'Textiles Bajío', impacto: 'Cliente ya en estatus crítico (variación 11.2%, SLA 78%). Confirmación de recortes haría inviable mantener fee actual.' }
    ],
    recomendacion: 'Reunión urgente con ejecutivo de cuenta. Evaluar renegociación de fee o salida ordenada de la cartera.'
  },
  {
    id: 'MK-006',
    titulo: 'Diésel marino sube 9% en abril; presión sobre fletes de carga federal',
    fuente: 'Pemex · CANACAR',
    fecha: '22-Abr-2026',
    severidad: 'media',
    resumen: 'Ajuste de precios al transportista impacta costos operativos del autotransporte. CANACAR estima traslado parcial de costos a clientes finales.',
    clientesAfectados: [
      { nombre: 'Logística Pacífico', impacto: 'Operación de carga federal y última milla. Margen operativo se comprime si no traslada el costo a sus clientes.' }
    ],
    recomendacion: 'No requiere acción inmediata sobre nómina, pero monitorear estabilidad del cliente para cobro oportuno.'
  },
  {
    id: 'MK-007',
    titulo: 'Reforma a régimen de subcontratación: SAT publica criterios más estrictos para servicios especializados',
    fuente: 'SAT · DOF',
    fecha: '21-Abr-2026',
    severidad: 'alta',
    resumen: 'Nuevos criterios de validación REPSE entran en vigor el 15 de mayo. Afecta esquemas de servicios especializados con riesgo de no deducibilidad para el cliente.',
    clientesAfectados: [
      { nombre: 'Consultora Corporativa MX', impacto: 'Esquema de honorarios por consultoría especializada. Requiere revisión de materialidad y CFDI antes del 15 de mayo.' },
      { nombre: 'Servicios Médicos del Sur', impacto: 'Honorarios médicos por asimilados con riesgo de reclasificación si no se actualiza REPSE.' }
    ],
    recomendacion: 'Activar pestaña de Estrategias de Materialidad para ambos clientes. Validar contratos y CFDI vigentes.'
  }
];

const colorSeveridad = (s: AlertaSeveridad): string => (s === 'alta' ? C.crimson : C.amber);
const fondoSeveridad = (s: AlertaSeveridad): string => (s === 'alta' ? '#fbe9e6' : '#fbf3df');
const etiquetaSeveridad = (s: AlertaSeveridad): string => (s === 'alta' ? 'CRÍTICO' : 'ATENCIÓN');

type CanalEnvio = 'whatsapp' | 'correo';

interface ComposerState {
  canal: CanalEnvio;
  alerta: AlertaOperativa;
  destinatario: string;
  asunto: string;
  mensaje: string;
}

const plantillaWhatsApp = (a: AlertaOperativa): string =>
  `Hola ${a.responsable.split(' ')[0]}, te recuerdo que la tarea "${a.tarea}" tiene ${a.diasRetraso} ${a.diasRetraso === 1 ? 'día' : 'días'} de retraso (compromiso ${a.fechaCompromiso}).\n\nNecesitamos avance hoy mismo. ¿Puedes darme un estatus en la próxima hora?\n\nGracias.`;

const plantillaCorreo = (a: AlertaOperativa): string =>
  `Estimado(a) ${a.responsable},\n\nLe comparto el estatus de la siguiente tarea pendiente asignada a su área:\n\n· Tarea: ${a.tarea}\n· Cliente: ${a.cliente}\n· Fecha de compromiso: ${a.fechaCompromiso}\n· Días de retraso: ${a.diasRetraso}\n\nDetalle: ${a.detalle}\n\nLe agradeceré priorizar la atención y enviar un avance al cierre del día.\n\nSaludos cordiales.`;

const PestanaAlertas: React.FC = () => {
  const [seccion, setSeccion] = useState<'operativas' | 'mercado'>('operativas');
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const [confirmacion, setConfirmacion] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  const abrirComposer = (canal: CanalEnvio, a: AlertaOperativa): void => {
    if (canal === 'whatsapp') {
      setComposer({
        canal,
        alerta: a,
        destinatario: '+52 55 0000 0000',
        asunto: '',
        mensaje: plantillaWhatsApp(a)
      });
    } else {
      setComposer({
        canal,
        alerta: a,
        destinatario: `${a.responsable.toLowerCase().replace(/\s+/g, '.')}@gustavorobles.mx`,
        asunto: `Tarea con retraso (${a.diasRetraso} ${a.diasRetraso === 1 ? 'día' : 'días'}) — ${a.cliente}`,
        mensaje: plantillaCorreo(a)
      });
    }
  };

  const enviar = (): void => {
    if (!composer) return;
    setEnviando(true);
    window.setTimeout(() => {
      const etiqueta = composer.canal === 'whatsapp' ? 'WhatsApp' : 'correo';
      setConfirmacion(`Mensaje enviado por ${etiqueta} a ${composer.alerta.responsable}.`);
      setComposer(null);
      setEnviando(false);
      window.setTimeout(() => setConfirmacion(''), 3500);
    }, 900);
  };

  const altasOp = ALERTAS_OPERATIVAS.filter((a) => a.severidad === 'alta').length;
  const mediasOp = ALERTAS_OPERATIVAS.filter((a) => a.severidad === 'media').length;
  const altasMk = ALERTAS_MERCADO.filter((a) => a.severidad === 'alta').length;
  const mediasMk = ALERTAS_MERCADO.filter((a) => a.severidad === 'media').length;

  return (
    <div>
      {/* Resumen ejecutivo de alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: `1px solid ${C.ink}`, marginBottom: 28 }}>
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.rule}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.crimson, fontFamily: FONT }}>Operativas críticas</div>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.crimson, lineHeight: 1, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{altasOp}</div>
          <div style={{ fontSize: 11, color: C.inkMute, fontFamily: FONT, marginTop: 6 }}>≥ 4 días de retraso</div>
        </div>
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.rule}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.amber, fontFamily: FONT }}>Operativas atención</div>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.amber, lineHeight: 1, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{mediasOp}</div>
          <div style={{ fontSize: 11, color: C.inkMute, fontFamily: FONT, marginTop: 6 }}>1 a 3 días de retraso</div>
        </div>
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.rule}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.crimson, fontFamily: FONT }}>Mercado críticas</div>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.crimson, lineHeight: 1, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{altasMk}</div>
          <div style={{ fontSize: 11, color: C.inkMute, fontFamily: FONT, marginTop: 6 }}>Impacto directo en cartera</div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.amber, fontFamily: FONT }}>Mercado atención</div>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.amber, lineHeight: 1, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{mediasMk}</div>
          <div style={{ fontSize: 11, color: C.inkMute, fontFamily: FONT, marginTop: 6 }}>Monitoreo recomendado</div>
        </div>
      </div>

      {/* Sub-pestañas */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${C.rule}` }}>
        <button
          onClick={() => setSeccion('operativas')}
          style={{
            backgroundColor: 'transparent',
            color: seccion === 'operativas' ? C.ink : C.inkMute,
            border: 'none',
            borderBottom: seccion === 'operativas' ? `2px solid ${C.ink}` : '2px solid transparent',
            padding: '12px 0',
            marginRight: 28,
            marginBottom: -1,
            fontSize: 12,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1.8px'
          }}
        >
          Alertas Operativas ({ALERTAS_OPERATIVAS.length})
        </button>
        <button
          onClick={() => setSeccion('mercado')}
          style={{
            backgroundColor: 'transparent',
            color: seccion === 'mercado' ? C.ink : C.inkMute,
            border: 'none',
            borderBottom: seccion === 'mercado' ? `2px solid ${C.ink}` : '2px solid transparent',
            padding: '12px 0',
            marginRight: 28,
            marginBottom: -1,
            fontSize: 12,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1.8px'
          }}
        >
          Alertas de Mercado ({ALERTAS_MERCADO.length})
        </button>
      </div>

      {seccion === 'operativas' && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, fontFamily: FONT }}>
              Tareas con retraso
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.ink, margin: '4px 0 6px 0', letterSpacing: '-0.5px' }}>
              Personal con compromisos vencidos
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
              Las alertas en rojo superan los 4 días de retraso y requieren intervención inmediata. Las alertas en ámbar son seguimiento preventivo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ALERTAS_OPERATIVAS
              .slice()
              .sort((a, b) => b.diasRetraso - a.diasRetraso)
              .map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '6px 1fr',
                    border: `1px solid ${C.rule}`,
                    backgroundColor: C.paper
                  }}
                >
                  <div style={{ backgroundColor: colorSeveridad(a.severidad) }} />
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            color: C.paper,
                            backgroundColor: colorSeveridad(a.severidad),
                            padding: '3px 8px',
                            fontFamily: FONT
                          }}
                        >
                          {etiquetaSeveridad(a.severidad)}
                        </span>
                        <span style={{ fontSize: 10, color: C.inkMute, fontFamily: FONT, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {a.id}
                        </span>
                        <span style={{ fontSize: 10, color: C.inkMute, fontFamily: FONT }}>·</span>
                        <span style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT }}>
                          Compromiso {a.fechaCompromiso}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: C.inkMute, fontFamily: FONT, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Retraso</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: colorSeveridad(a.severidad), fontFamily: FONT, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                          {a.diasRetraso} <span style={{ fontSize: 11, fontWeight: 400, color: C.inkSoft }}>{a.diasRetraso === 1 ? 'día' : 'días'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
                          <button
                            onClick={() => abrirComposer('whatsapp', a)}
                            style={{
                              backgroundColor: '#1d8a4a',
                              color: C.paper,
                              border: 'none',
                              padding: '6px 10px',
                              fontSize: 9,
                              fontFamily: FONT,
                              fontWeight: 700,
                              letterSpacing: '1.5px',
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            Mandar WhatsApp
                          </button>
                          <button
                            onClick={() => abrirComposer('correo', a)}
                            style={{
                              backgroundColor: C.ink,
                              color: C.paper,
                              border: 'none',
                              padding: '6px 10px',
                              fontSize: 9,
                              fontFamily: FONT,
                              fontWeight: 700,
                              letterSpacing: '1.5px',
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            Mandar Correo
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.35, letterSpacing: '-0.2px', marginBottom: 6 }}>
                      {a.tarea}
                    </div>

                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 10, fontFamily: FONT, fontSize: 12 }}>
                      <div>
                        <span style={{ color: C.inkMute, letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10, marginRight: 6 }}>Responsable:</span>
                        <span style={{ color: C.ink, fontWeight: 700 }}>{a.responsable}</span>
                        <span style={{ color: C.inkSoft }}> · {a.puesto}</span>
                      </div>
                      <div>
                        <span style={{ color: C.inkMute, letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10, marginRight: 6 }}>Cliente:</span>
                        <span style={{ color: C.ink, fontWeight: 700 }}>{a.cliente}</span>
                      </div>
                    </div>

                    <p style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.55, paddingTop: 10, borderTop: `1px solid ${C.ruleSoft}` }}>
                      {a.detalle}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {confirmacion && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: C.olive,
            color: C.paper,
            padding: '14px 20px',
            border: 'none',
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.3px',
            zIndex: 1100,
            boxShadow: '0 8px 24px rgba(26, 24, 20, 0.25)'
          }}
        >
          {confirmacion}
        </div>
      )}

      {composer && (
        <div
          onClick={() => !enviando && setComposer(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(26, 24, 20, 0.55)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '60px 24px',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: C.paper,
              width: '100%',
              maxWidth: 640,
              border: `1px solid ${C.ink}`,
              fontFamily: FONT
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.ink}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: composer.canal === 'whatsapp' ? '#1d8a4a' : C.ink, color: C.paper }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', opacity: 0.8 }}>
                  {composer.canal === 'whatsapp' ? 'Mensaje de WhatsApp' : 'Correo electrónico'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, letterSpacing: '-0.2px' }}>
                  Para: {composer.alerta.responsable}
                </div>
              </div>
              <button
                onClick={() => !enviando && setComposer(null)}
                disabled={enviando}
                style={{
                  backgroundColor: 'transparent',
                  color: C.paper,
                  border: `1px solid ${C.paper}`,
                  padding: '6px 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                  opacity: enviando ? 0.5 : 1
                }}
              >
                Cerrar
              </button>
            </div>

            <div style={{ padding: '20px 22px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontFamily: FONT, display: 'block', marginBottom: 6 }}>
                  {composer.canal === 'whatsapp' ? 'Número' : 'Correo destinatario'}
                </label>
                <input
                  type="text"
                  value={composer.destinatario}
                  onChange={(e) => setComposer({ ...composer, destinatario: e.target.value })}
                  disabled={enviando}
                  style={{
                    width: '100%',
                    border: `1px solid ${C.rule}`,
                    backgroundColor: C.paper,
                    padding: '10px 12px',
                    fontSize: 13,
                    fontFamily: FONT,
                    color: C.ink,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {composer.canal === 'correo' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontFamily: FONT, display: 'block', marginBottom: 6 }}>
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={composer.asunto}
                    onChange={(e) => setComposer({ ...composer, asunto: e.target.value })}
                    disabled={enviando}
                    style={{
                      width: '100%',
                      border: `1px solid ${C.rule}`,
                      backgroundColor: C.paper,
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: FONT,
                      color: C.ink,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMute, fontFamily: FONT, display: 'block', marginBottom: 6 }}>
                  Mensaje
                </label>
                <textarea
                  value={composer.mensaje}
                  onChange={(e) => setComposer({ ...composer, mensaje: e.target.value })}
                  disabled={enviando}
                  rows={composer.canal === 'whatsapp' ? 6 : 11}
                  style={{
                    width: '100%',
                    border: `1px solid ${C.rule}`,
                    backgroundColor: C.paper,
                    padding: '12px 14px',
                    fontSize: 13,
                    fontFamily: FONT,
                    color: C.ink,
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: 1.55,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, color: C.inkMute, fontFamily: FONT }}>
                  Tarea: <span style={{ color: C.ink, fontWeight: 700 }}>{composer.alerta.tarea}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => !enviando && setComposer(null)}
                    disabled={enviando}
                    style={{
                      backgroundColor: 'transparent',
                      color: C.inkSoft,
                      border: `1px solid ${C.rule}`,
                      padding: '8px 16px',
                      fontSize: 11,
                      fontFamily: FONT,
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      cursor: enviando ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={enviar}
                    disabled={enviando || !composer.mensaje.trim() || !composer.destinatario.trim()}
                    style={{
                      backgroundColor: enviando || !composer.mensaje.trim() ? C.rule : (composer.canal === 'whatsapp' ? '#1d8a4a' : C.coral),
                      color: C.paper,
                      border: 'none',
                      padding: '8px 20px',
                      fontSize: 11,
                      fontFamily: FONT,
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      cursor: enviando ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {enviando ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {seccion === 'mercado' && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, fontFamily: FONT }}>
              Inteligencia de mercado
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.ink, margin: '4px 0 6px 0', letterSpacing: '-0.5px' }}>
              Eventos macro y sectoriales con impacto en la cartera
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
              Cambios regulatorios, fiscales o de mercado relevantes para clientes activos. Cada alerta lista los clientes específicamente expuestos y la acción recomendada.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ALERTAS_MERCADO
              .slice()
              .sort((a, b) => (a.severidad === b.severidad ? 0 : a.severidad === 'alta' ? -1 : 1))
              .map((a) => (
                <div
                  key={a.id}
                  style={{
                    border: `1px solid ${C.rule}`,
                    backgroundColor: C.paper,
                    borderLeft: `4px solid ${colorSeveridad(a.severidad)}`
                  }}
                >
                  <div style={{ padding: '18px 22px 14px 22px', borderBottom: `1px solid ${C.ruleSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          color: C.paper,
                          backgroundColor: colorSeveridad(a.severidad),
                          padding: '3px 8px',
                          fontFamily: FONT
                        }}
                      >
                        {etiquetaSeveridad(a.severidad)}
                      </span>
                      <span style={{ fontSize: 10, color: C.inkMute, fontFamily: FONT, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {a.id}
                      </span>
                      <span style={{ fontSize: 10, color: C.inkMute, fontFamily: FONT }}>·</span>
                      <span style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT }}>{a.fuente}</span>
                      <span style={{ fontSize: 10, color: C.inkMute, fontFamily: FONT }}>·</span>
                      <span style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT }}>{a.fecha}</span>
                    </div>

                    <h4 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.ink, margin: '0 0 8px 0', letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                      {a.titulo}
                    </h4>
                    <p style={{ fontFamily: FONT, fontSize: 14, color: C.inkSoft, margin: 0, lineHeight: 1.6 }}>
                      {a.resumen}
                    </p>
                  </div>

                  <div style={{ padding: '14px 22px', backgroundColor: fondoSeveridad(a.severidad) }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colorSeveridad(a.severidad), fontFamily: FONT, marginBottom: 10 }}>
                      Clientes expuestos ({a.clientesAfectados.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {a.clientesAfectados.map((c, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
                          <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.ink }}>
                            {c.nombre}
                          </div>
                          <div style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                            {c.impacto}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.ruleSoft}`, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.coral, fontFamily: FONT, minWidth: 110, paddingTop: 2 }}>
                      Recomendación
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: 13, color: C.ink, lineHeight: 1.55, flex: 1 }}>
                      {a.recomendacion}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
