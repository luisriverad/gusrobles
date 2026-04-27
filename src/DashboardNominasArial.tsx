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

const PROCESAMIENTO_SEMANAL = [
  { dia: 'Lun', completadas: 6, pendientes: 0, atrasadas: 0 },
  { dia: 'Mar', completadas: 4, pendientes: 0, atrasadas: 0 },
  { dia: 'Mié', completadas: 2, pendientes: 1, atrasadas: 0 },
  { dia: 'Jue', completadas: 3, pendientes: 2, atrasadas: 0 },
  { dia: 'Vie', completadas: 4, pendientes: 3, atrasadas: 1 },
  { dia: 'Sáb', completadas: 0, pendientes: 2, atrasadas: 0 }
];

const TIMBRADO_MENSUAL = [
  { mes: 'May', porcentaje: 99.2 }, { mes: 'Jun', porcentaje: 99.5 },
  { mes: 'Jul', porcentaje: 99.1 }, { mes: 'Ago', porcentaje: 98.7 },
  { mes: 'Sep', porcentaje: 99.4 }, { mes: 'Oct', porcentaje: 98.8 }
];

const VARIACION_MENSUAL = [
  { mes: 'May', presupuesto: 8450000, real: 8612000 },
  { mes: 'Jun', presupuesto: 8520000, real: 8723000 },
  { mes: 'Jul', presupuesto: 8600000, real: 8891000 },
  { mes: 'Ago', presupuesto: 8750000, real: 9124000 },
  { mes: 'Sep', presupuesto: 8900000, real: 9187000 },
  { mes: 'Oct', presupuesto: 9050000, real: 9412000 }
];

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
    titulo: 'Contrato de Prestación de Servicios',
    descripcion: 'Contrato firmado con cláusulas de alcance, fee, vigencia y entregables específicos. Anexos por sucursal o razón social cuando aplique.',
    tipo: 'Documento legal',
    frecuencia: 'Anual / al alta',
    retencion: '5 años post-vigencia',
    evidencia: 'Existencia y razón de negocio del servicio'
  },
  {
    numero: '02',
    titulo: 'Orden de Servicio del Periodo',
    descripcion: 'Documento mensual o quincenal que detalla el periodo procesado, número de empleados y entregables comprometidos.',
    tipo: 'Documento operativo',
    frecuencia: 'Por periodo de nómina',
    retencion: '5 años',
    evidencia: 'Servicio efectivamente prestado en cada CFDI'
  },
  {
    numero: '03',
    titulo: 'CFDI 4.0 de Honorarios + Complemento de Pago',
    descripcion: 'Factura emitida por el despacho con descripción puntual del servicio (no genérica) y complemento REP por cada cobro.',
    tipo: 'CFDI',
    frecuencia: 'Por cada facturación',
    retencion: '5 años',
    evidencia: 'Concepto, monto y cobro real del honorario'
  },
  {
    numero: '04',
    titulo: 'Bitácora de Procesamiento de Nómina',
    descripcion: 'Log con fecha de recepción de incidencias, captura, validación, cierre, dispersión y timbrado. Firma de responsable por etapa.',
    tipo: 'Reporte interno',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Trazabilidad operativa del servicio'
  },
  {
    numero: '05',
    titulo: 'Recibos CFDI Timbrados (nómina del cliente)',
    descripcion: 'Acuse de timbrado de cada recibo de nómina emitido a nombre del cliente, con XML y PDF respaldados.',
    tipo: 'CFDI nómina',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Entregable concreto del servicio facturado'
  },
  {
    numero: '06',
    titulo: 'Acuses IMSS-IDSE / SUA / INFONAVIT',
    descripcion: 'Acuses de movimientos afiliatorios (altas, bajas, modificaciones de salario) y pago de cuotas obrero-patronales.',
    tipo: 'Acuse oficial',
    frecuencia: 'Mensual / por evento',
    retencion: '5 años',
    evidencia: 'Cumplimiento de obligaciones derivadas del servicio'
  },
  {
    numero: '07',
    titulo: 'Acuses de Declaraciones ISR Retenido',
    descripcion: 'Acuses de presentación y pago del ISR por sueldos y salarios calculado y retenido como parte del servicio.',
    tipo: 'Acuse SAT',
    frecuencia: 'Mensual',
    retencion: '5 años',
    evidencia: 'Resultado fiscal entregado al cliente'
  },
  {
    numero: '08',
    titulo: 'Reporte de Incidencias y Evidencia de Captura',
    descripcion: 'Documento del cliente con altas, bajas, faltas, horas extra, vacaciones, comisiones — recibido por correo o portal con sello de tiempo.',
    tipo: 'Insumo del cliente',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Insumo que originó el procesamiento'
  },
  {
    numero: '09',
    titulo: 'Conciliaciones y Comprobantes de Dispersión',
    descripcion: 'Layout bancario de dispersión de nómina, conciliación contra total calculado y comprobantes de transferencia.',
    tipo: 'Reporte financiero',
    frecuencia: 'Por periodo',
    retencion: '5 años',
    evidencia: 'Cierre financiero del servicio'
  },
  {
    numero: '10',
    titulo: 'Minutas y Comunicaciones Formales',
    descripcion: 'Minutas de juntas mensuales, correos formales, tickets de soporte y reportes ejecutivos enviados al cliente.',
    tipo: 'Comunicación',
    frecuencia: 'Continua',
    retencion: '5 años',
    evidencia: 'Razón comercial y relación profesional sostenida'
  }
];

const CUMPLIMIENTO_FISCAL = [
  { entidad: 'SAT', cumplimiento: 99.1 },
  { entidad: 'IMSS', cumplimiento: 100 },
  { entidad: 'INFONAVIT', cumplimiento: 100 },
  { entidad: 'FONACOT', cumplimiento: 98.4 },
  { entidad: 'ISR', cumplimiento: 99.8 },
  { entidad: 'Estatales', cumplimiento: 97.2 }
];

const Dashboard: React.FC = () => {
  const [periodo, setPeriodo] = useState<string>('Abril 2026');
  const [filtroEstatus, setFiltroEstatus] = useState<string>('todos');
  const [pestana, setPestana] = useState<'operativo' | 'materialidad'>('operativo');
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

  const clientesFiltrados = useMemo<Cliente[]>(() => {
    const base = filtroEstatus === 'todos' ? CLIENTES : CLIENTES.filter(c => c.estatus === filtroEstatus);
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
  }, [filtroEstatus, sortKey, sortDir]);

  const kpis = useMemo(() => {
    const totalEmpleados = CLIENTES.reduce((s, c) => s + c.empleados, 0);
    const feeTotal = CLIENTES.reduce((s, c) => s + c.fee, 0);
    const costoTotal = CLIENTES.reduce((s, c) => s + c.costoOp, 0);
    const margen = ((feeTotal - costoTotal) / feeTotal) * 100;
    const timbradoProm = CLIENTES.reduce((s, c) => s + c.timbrado, 0) / CLIENTES.length;
    const slaProm = CLIENTES.reduce((s, c) => s + c.slaCumplido, 0) / CLIENTES.length;
    const variacionProm = CLIENTES.reduce((s, c) => s + c.variacion, 0) / CLIENTES.length;
    return { totalEmpleados, feeTotal, costoTotal, margen, timbradoProm, slaProm, variacionProm };
  }, []);

  const rentabilidadPorCliente = useMemo(() =>
    CLIENTES.map(c => ({
      nombre: c.nombre,
      margen: Number((((c.fee - c.costoOp) / c.fee) * 100).toFixed(1))
    })).sort((a, b) => b.margen - a.margen), []);

  const distribucionPeriodicidad = useMemo(() => {
    const grupos = CLIENTES.reduce<Record<string, number>>((acc, c) => {
      acc[c.periodicidad] = (acc[c.periodicidad] || 0) + c.empleados;
      return acc;
    }, {});
    return Object.entries(grupos).map(([name, value]) => ({ name, value }));
  }, []);

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
            fontSize: 11,
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
            fontSize: 11,
            fontFamily: FONT,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Estrategias de Materialidad
        </button>
      </div>

      {/* CONTENIDO PESTAÑA OPERATIVO */}
      {pestana === 'operativo' && (
      <div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 48, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
        <KPI titulo="Cumplimiento SLA" valor={kpis.slaProm.toFixed(1)} unidad="%" meta="meta ≥ 95" estado={kpis.slaProm >= 95 ? 'ok' : 'alerta'} divider />
        <KPI titulo="Timbrado CFDI" valor={kpis.timbradoProm.toFixed(1)} unidad="%" meta="meta ≥ 99" estado={kpis.timbradoProm >= 99 ? 'ok' : 'alerta'} divider />
        <KPI titulo="Variación vs Presupuesto" valor={'+' + kpis.variacionProm.toFixed(1)} unidad="%" meta="meta ≤ 3.0" estado={kpis.variacionProm <= 3 ? 'ok' : 'alerta'} divider />
        <KPI titulo="Margen Operativo" valor={kpis.margen.toFixed(1)} unidad="%" meta={formatMXN(kpis.feeTotal - kpis.costoTotal)} estado={kpis.margen >= 40 ? 'ok' : 'alerta'} />
      </div>

      <Row>
        <Panel titulo="Procesamiento Semanal" kicker="La Semana en Curso" flex={1.3}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PROCESAMIENTO_SEMANAL} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
              <XAxis dataKey="dia" stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} />
              <YAxis stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.paperSoft }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase', color: C.inkSoft }} />
              <Bar dataKey="completadas" stackId="a" fill={C.olive} name="Completadas" />
              <Bar dataKey="pendientes" stackId="a" fill={C.amber} name="Pendientes" />
              <Bar dataKey="atrasadas" stackId="a" fill={C.coral} name="Atrasadas" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titulo="Timbrado CFDI" kicker="Seis Meses en Curva" flex={1}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={TIMBRADO_MENSUAL} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.coral} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.coral} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
              <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} />
              <YAxis domain={[97, 100]} stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="porcentaje" stroke={C.coral} strokeWidth={2.5} fill="url(#coralGrad)" name="% Exitoso" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </Row>

      <Row>
        <Panel titulo="Nómina Real vs Presupuesto" kicker="La Brecha del Semestre" flex={1.3}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={VARIACION_MENSUAL} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 3" stroke={C.rule} vertical={false} />
              <XAxis dataKey="mes" stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} />
              <YAxis stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: C.paperSoft }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }} />
              <Bar dataKey="presupuesto" fill={C.inkSoft} name="Presupuesto" />
              <Bar dataKey="real" fill={C.coral} name="Real" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel titulo="Cumplimiento Fiscal" kicker="Seis Entidades en Examen" flex={1}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={CUMPLIMIENTO_FISCAL}>
              <PolarGrid stroke={C.rule} />
              <PolarAngleAxis dataKey="entidad" tick={{ fill: C.inkSoft, fontSize: 10, fontFamily: FONT }} />
              <PolarRadiusAxis domain={[90, 100]} tick={{ fill: C.inkMute, fontSize: 9, fontFamily: FONT }} axisLine={false} />
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
              <XAxis type="number" stroke={C.inkMute} style={{ fontSize: 10, fontFamily: FONT }} axisLine={{ stroke: C.ink }} tickLine={false} tickFormatter={(v: number) => v + '%'} domain={[0, 80]} />
              <YAxis
                type="category"
                dataKey="nombre"
                stroke={C.inkSoft}
                style={{ fontSize: 9, fontFamily: FONT }}
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
                  style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: C.ink }}
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
                        style={{ fontSize: 10, fontFamily: FONT, fontWeight: 700 }}
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
        <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
          Los Indicadores del Servicio
        </div>
        <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px', marginBottom: 6 }}>
          KPIs de Calidad y Cumplimiento
        </h2>
        <div style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, marginBottom: 24, fontWeight: 400 }}>
          Service Quality & Compliance KPIs · Los cinco indicadores que definen la reputación del despacho.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
          <KPIDetalle numero="01" titulo="Exactitud de Nómina" subtitulo="Payroll Accuracy Rate" valor="99.4" unidad="%" meta="meta ≥ 99.5%" descripcion="Recibos sin errores sobre el total emitido." estado="alerta" divider />
          <KPIDetalle numero="02" titulo="Cumplimiento de Plazos" subtitulo="Timeliness" valor="97.8" unidad="%" meta="meta ≥ 98%" descripcion="Nóminas entregadas y pagadas a tiempo." estado="alerta" divider />
          <KPIDetalle numero="03" titulo="Costo por Recibo" subtitulo="Cost per Payslip" valor="$118" unidad="MXN" meta="meta ≤ $125" descripcion="Costos operativos sobre empleados procesados." estado="ok" divider />
          <KPIDetalle numero="04" titulo="Tiempo Medio de Resolución" subtitulo="Mean Resolution Time" valor="4.2" unidad="hrs" meta="meta ≤ 4 hrs" descripcion="Respuesta a consultas de empleados." estado="alerta" divider />
          <KPIDetalle numero="05" titulo="Errores de Cumplimiento" subtitulo="Compliance Error Index" valor="2" unidad="casos" meta="meta = 0" descripcion="Multas o requerimientos SAT/IMSS/INFONAVIT." estado="alerta" />
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
          El Registro
        </div>
        <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: '-0.6px', marginBottom: 6 }}>
          Cartera de Clientes
        </h2>
        <div style={{ fontFamily: FONT, fontSize: 13, color: C.inkSoft, marginBottom: 20, fontWeight: 400 }}>
          Un retrato operativo completo de {CLIENTES.length} cuentas en gestión.
        </div>

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
                fontSize: 10,
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
                  <td style={{ ...tdStyle, fontFamily: FONT, fontWeight: 700, fontSize: 12, color: C.ink }}>{c.nombre}</td>
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
                    <span style={{ fontSize: 10, fontFamily: FONT, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: C.inkSoft }}>
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
      <span style={{ marginLeft: 6, fontSize: 9, opacity: active ? 1 : 0.35 }}>
        {active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </th>
  );
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 12px 12px 0',
  color: C.inkMute,
  fontSize: 9,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontFamily: FONT,
  borderBottom: `2px solid ${C.ink}`
};

const tdStyle: CSSProperties = {
  padding: '14px 12px 14px 0',
  color: C.inkSoft,
  fontSize: 12,
  fontFamily: FONT
};

const tdStyleNum: CSSProperties = {
  padding: '14px 12px 14px 0',
  color: C.ink,
  fontSize: 12,
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
      { titulo: 'Servicios Administrativos Especializados', descripcion: 'Procesamiento de nóminas docente y administrativa, gestión de prestaciones, control de plantilla académica y administración de recursos humanos.', ejemploCFDI: 'Servicios profesionales de administración de nómina · Gestión integral de RRHH académicos', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('construc') || a.includes('obra') || a.includes('edifica') || a.includes('inmobiliari')) {
    return [
      { titulo: 'Servicios de Administración de Personal de Obra', descripcion: 'Procesamiento de nómina semanal de personal de campo, control de cuadrillas, gestión IMSS de eventuales y cálculo de finiquitos por obra.', ejemploCFDI: 'Servicios de administración de nómina de personal de obra · Gestión IMSS por proyecto', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Gestión Laboral de Construcción', descripcion: 'Asesoría en cumplimiento STPS, programas de seguridad e higiene, capacitación obligatoria DC-3 y mitigación de riesgos laborales.', ejemploCFDI: 'Consultoría en seguridad e higiene industrial · Programa DC-3 de capacitación', riesgoFiscal: 'Bajo' },
      { titulo: 'Servicios de Outsourcing Especializado (REPSE)', descripcion: 'Servicios complementarios bajo registro REPSE para áreas no esenciales de la operación constructiva: limpieza de obra, vigilancia y logística.', ejemploCFDI: 'Servicios especializados REPSE · Apoyo administrativo en obra', riesgoFiscal: 'Medio' }
    ];
  }

  if (a.includes('restaurant') || a.includes('aliment') || a.includes('bebida') || a.includes('comida') || a.includes('hotel')) {
    return [
      { titulo: 'Administración de Personal de Servicio', descripcion: 'Procesamiento de nómina con propinas, control de turnos rotativos, cálculo de séptimo día, vacaciones y prima dominical.', ejemploCFDI: 'Servicios de administración de nómina restaurantera · Gestión de personal de servicio', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación en Servicio y Manejo de Alimentos', descripcion: 'Programas de capacitación NOM-251 (manejo higiénico), atención al cliente, mixología y servicio de mesa para personal operativo.', ejemploCFDI: 'Curso de manejo higiénico de alimentos NOM-251 · Capacitación en servicio al cliente', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento Sanitario y Laboral', descripcion: 'Asesoría en distintivo H, protocolos COFEPRIS, gestión de PTU específica del sector y cumplimiento de propinas.', ejemploCFDI: 'Consultoría en distintivo H y protocolos sanitarios · Asesoría laboral del sector', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('manufactur') || a.includes('fabrica') || a.includes('industri') || a.includes('producci') || a.includes('textil') || a.includes('metal') || a.includes('automotr')) {
    return [
      { titulo: 'Administración Integral de Nómina Industrial', descripcion: 'Procesamiento de nómina con turnos, primas dominical y nocturna, tiempo extra, bonos de productividad y cálculo de PTU manufacturero.', ejemploCFDI: 'Servicios de administración de nómina industrial · Cálculo de prestaciones manufactureras', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación Técnica y Certificaciones', descripcion: 'Programas DC-3 obligatorios, capacitación en operación de maquinaria, certificaciones ISO 9001 y formación en seguridad industrial.', ejemploCFDI: 'Capacitación DC-3 en operación de maquinaria · Programa ISO 9001 para personal operativo', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Gestión de Riesgos Laborales', descripcion: 'Asesoría en NOM-035 (factores psicosociales), prima de riesgo IMSS, análisis de accidentabilidad y mitigación de incapacidades.', ejemploCFDI: 'Consultoría en NOM-035 · Análisis y reducción de prima de riesgo IMSS', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('comercio') || a.includes('venta') || a.includes('distribu') || a.includes('mayoreo') || a.includes('menudeo')) {
    return [
      { titulo: 'Administración de Nómina Comercial', descripcion: 'Procesamiento de nómina con esquemas de comisiones, bonos por venta, tiempo extra de temporada alta y cálculo de PTU comercial.', ejemploCFDI: 'Servicios de administración de nómina con esquema de comisiones · Gestión de personal de ventas', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación en Ventas y Atención al Cliente', descripcion: 'Programas de formación en técnicas de venta, servicio al cliente, manejo de objeciones y CRM para fuerza de ventas.', ejemploCFDI: 'Curso de técnicas avanzadas de venta · Capacitación en CRM y servicio al cliente', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Estructura de Compensación Variable', descripcion: 'Diseño de tabuladores con esquema fijo + variable, optimización fiscal de comisiones y bonos, cumplimiento de la base de cotización mixta.', ejemploCFDI: 'Consultoría en diseño de esquemas de compensación · Asesoría fiscal de comisiones', riesgoFiscal: 'Medio' }
    ];
  }

  if (a.includes('agricul') || a.includes('ganader') || a.includes('pesca') || a.includes('agroind')) {
    return [
      { titulo: 'Nómina de Trabajadores Eventuales del Campo', descripcion: 'Procesamiento de nómina para jornaleros agrícolas, alta y baja IMSS por temporada, cálculo de cuotas reducidas y manejo de eventualidad.', ejemploCFDI: 'Servicios de administración de nómina agrícola · Gestión IMSS de eventuales del campo', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación en Seguridad Agroindustrial', descripcion: 'Programas de capacitación en manejo seguro de agroquímicos, NOM-003-STPS, primeros auxilios en campo y operación de maquinaria agrícola.', ejemploCFDI: 'Capacitación en NOM-003-STPS manejo de agroquímicos · Programa de primeros auxilios en campo', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento Laboral del Campo', descripcion: 'Asesoría en cumplimiento de la Ley Federal del Trabajo Capítulo VIII (trabajadores del campo), prestaciones obligatorias y SUA agrícola.', ejemploCFDI: 'Consultoría en LFT Capítulo VIII · Asesoría en prestaciones del trabajador del campo', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('salud') || a.includes('médic') || a.includes('hospital') || a.includes('clínic') || a.includes('farmac')) {
    return [
      { titulo: 'Administración de Nómina del Sector Salud', descripcion: 'Procesamiento de nómina con guardias médicas, prima dominical, tiempo extra hospitalario y bonos de riesgo sanitario.', ejemploCFDI: 'Servicios de administración de nómina hospitalaria · Cálculo de guardias y prestaciones médicas', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación NOM en Salud y Seguridad', descripcion: 'Programas de capacitación NOM-016, NOM-019, manejo de RPBI, bioseguridad y atención de emergencias para personal clínico y administrativo.', ejemploCFDI: 'Capacitación NOM-016 manejo de RPBI · Programa de bioseguridad hospitalaria', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento Sanitario y Laboral', descripcion: 'Asesoría en COFEPRIS para personal, gestión de cédulas profesionales, certificación CSG y cumplimiento de prima de riesgo de clase IV.', ejemploCFDI: 'Consultoría en cumplimiento COFEPRIS · Asesoría en certificación CSG', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('transport') || a.includes('logistic') || a.includes('flete') || a.includes('carga') || a.includes('paqueter')) {
    return [
      { titulo: 'Administración de Nómina de Operadores', descripcion: 'Procesamiento de nómina con bonos por viaje, viáticos, tiempo extra de ruta, primas dominical y nocturna para operadores de transporte.', ejemploCFDI: 'Servicios de administración de nómina de operadores · Gestión de bonos por viaje y viáticos', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación en Seguridad Vial y NOM-087', descripcion: 'Programas DC-3 obligatorios, capacitación en NOM-087-SCT-2017 (transporte de materiales peligrosos), manejo defensivo y bitácora electrónica.', ejemploCFDI: 'Capacitación NOM-087-SCT en transporte · Programa de manejo defensivo DC-3', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Cumplimiento SCT y Laboral', descripcion: 'Asesoría en regulación SCT, gestión de licencias federales, programas de fatiga y descanso, y cumplimiento de horas-hombre regulatorias.', ejemploCFDI: 'Consultoría en cumplimiento SCT · Asesoría en programas de fatiga y descanso', riesgoFiscal: 'Bajo' }
    ];
  }

  if (a.includes('servicio') || a.includes('consult') || a.includes('profesion') || a.includes('asesor')) {
    return [
      { titulo: 'Administración de Nómina de Personal Profesional', descripcion: 'Procesamiento de nómina para consultores y profesionistas, cálculo de prestaciones premium, bonos por proyecto y esquemas mixtos.', ejemploCFDI: 'Servicios de administración de nómina profesional · Gestión de bonos por proyecto', riesgoFiscal: 'Bajo' },
      { titulo: 'Capacitación Especializada y Certificaciones', descripcion: 'Programas de actualización profesional, certificaciones internacionales, soft skills y desarrollo de liderazgo para equipos consultivos.', ejemploCFDI: 'Programa de certificación profesional · Capacitación en habilidades de liderazgo', riesgoFiscal: 'Bajo' },
      { titulo: 'Consultoría en Diseño Organizacional', descripcion: 'Asesoría en estructura de compensación competitiva, esquemas de retención de talento, plan de carrera y evaluación de desempeño.', ejemploCFDI: 'Consultoría en diseño organizacional · Asesoría en planes de retención de talento', riesgoFiscal: 'Bajo' }
    ];
  }

  return [
    { titulo: 'Administración Integral de Nómina', descripcion: 'Procesamiento completo de nómina, cálculo de prestaciones de ley, gestión IMSS-INFONAVIT y timbrado CFDI 4.0.', ejemploCFDI: 'Servicios profesionales de administración de nómina · Procesamiento integral mensual', riesgoFiscal: 'Bajo' },
    { titulo: 'Capacitación Laboral y Desarrollo de Personal', descripcion: 'Programas DC-3 obligatorios, capacitación en NOM-035, desarrollo de habilidades blandas y formación continua.', ejemploCFDI: 'Programa DC-3 de capacitación obligatoria · Curso NOM-035 factores psicosociales', riesgoFiscal: 'Bajo' },
    { titulo: 'Consultoría en Cumplimiento Laboral y Fiscal', descripcion: 'Asesoría en obligaciones STPS, IMSS, SAT, INFONAVIT, gestión de auditorías y mitigación de riesgos regulatorios.', ejemploCFDI: 'Consultoría en cumplimiento laboral · Asesoría regulatoria integral', riesgoFiscal: 'Bajo' }
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

const KPI: React.FC<KPIProps> = ({ titulo, valor, unidad, meta, estado, divider }) => (
  <div style={{ padding: '28px 24px', borderRight: divider ? `1px solid ${C.rule}` : 'none' }}>
    <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.inkMute, marginBottom: 12, fontWeight: 700 }}>
      {titulo}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <div style={{ fontFamily: FONT, fontSize: 48, fontWeight: 700, color: estado === 'ok' ? C.ink : C.coral, lineHeight: 1, letterSpacing: '-1.5px', fontVariantNumeric: 'tabular-nums' }}>
        {valor}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 20, color: C.inkSoft, fontWeight: 400 }}>
        {unidad}
      </div>
    </div>
    <div style={{ fontFamily: FONT, fontSize: 11, color: C.inkMute, marginTop: 8 }}>
      {meta}
    </div>
  </div>
);

const KPIDetalle: React.FC<KPIDetalleProps> = ({ numero, titulo, subtitulo, valor, unidad, meta, descripcion, estado, divider }) => {
  const color = estado === 'ok' ? C.olive : C.coral;
  return (
    <div style={{ padding: '24px 20px', borderRight: divider ? `1px solid ${C.rule}` : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.coral, letterSpacing: '1px' }}>
        {numero}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
          {titulo}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 9, color: C.inkMute, marginTop: 2, fontWeight: 400 }}>
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
      <div style={{ fontFamily: FONT, fontSize: 10, color: C.inkMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {meta}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 11, color: C.inkSoft, lineHeight: 1.4, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.ruleSoft}` }}>
        {descripcion}
      </div>
    </div>
  );
};

const Panel: React.FC<PanelProps> = ({ titulo, kicker, flex, children }) => (
  <div style={{ flex: flex, padding: '0 20px 0 0' }}>
    <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: C.coral, marginBottom: 4, fontWeight: 700 }}>
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

export default Dashboard;
