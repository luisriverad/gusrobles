# Gustavo Robles Nóminas · Dashboard Operativo

Dashboard de gestión de nóminas multi-cliente construido con Vite + React + TypeScript.

## Stack técnico

- **Vite 5** — build tool y dev server
- **React 18** con TypeScript
- **Recharts 2.12** — visualización de datos
- **PDF.js** — lectura de PDFs en el navegador (carga dinámica desde CDN)
- **Arial** — tipografía única (sistema nativo, sin dependencias externas)

## Instalación

```bash
npm install
```

## Uso

Iniciar servidor de desarrollo (abre http://localhost:5173 automáticamente):

```bash
npm run dev
```

Build de producción:

```bash
npm run build
```

Preview del build de producción:

```bash
npm run preview
```

## Estructura

```
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── main.tsx
    ├── index.css
    └── DashboardNominasArial.tsx   ← componente principal con las dos pestañas
```

## Pestaña 1 · Tablero Operativo

1. Header editorial — Gustavo Robles Nóminas · Gestión de Nóminas
2. 4 KPIs ejecutivos — SLA, Timbrado CFDI, Variación vs Presupuesto, Margen Operativo
3. Procesamiento Semanal — barras apiladas por día (completadas, pendientes, atrasadas)
4. Timbrado CFDI mensual — área chart con gradiente coral
5. Nómina Real vs Presupuesto — barras comparativas 6 meses
6. Cumplimiento Fiscal — radar chart de 6 entidades (SAT, IMSS, INFONAVIT, FONACOT, ISR, Estatales)
7. Rentabilidad por Cuenta — ranking horizontal de 12 clientes
8. Periodicidad de Plantilla — pie chart en 3 colores contrastantes
9. Cartera de Clientes — tabla filtrable por estatus
10. 5 KPIs de Calidad y Cumplimiento — exactitud, timeliness, costo, tiempo de resolución, errores legales

## Pestaña 2 · Estrategia de Materialidad

1. Zona de arrastre para subir Constancia de Situación Fiscal (CSF) en PDF
2. Lectura automática del PDF en el navegador con PDF.js (sin enviar el archivo a ningún servidor)
3. Extracción de datos clave: RFC, Razón Social, Régimen Fiscal, Fecha Inicio, Actividad Económica
4. Motor de estrategias que detecta el sector (educación, construcción, restaurantero, manufactura, comercio, agroindustria, salud, transporte, servicios profesionales) y propone 3 estrategias específicas de facturación con materialidad
5. Cada estrategia incluye: título, descripción, ejemplo de concepto CFDI listo para copiar, badge de riesgo fiscal
6. Captura manual de actividad económica como fallback si el PDF tiene OCR débil

## Paleta de colores

- Papel crema: `#faf7f2`
- Tinta profunda: `#1a1814`
- Coral (acento): `#d4553a`
- Oliva oscuro: `#4a5d3a`
- Ámbar: `#c4953a`

## Editar en Cursor

1. Descomprime el ZIP
2. Abre Cursor
3. File → Open Folder → selecciona la carpeta `vite-project`
4. Abre la terminal integrada (Ctrl+\` o Cmd+\`)
5. Ejecuta `npm install`
6. Ejecuta `npm run dev`
7. El componente principal está en `src/DashboardNominasArial.tsx`

Cursor reconoce automáticamente TypeScript y React. Las extensiones recomendadas son: ESLint, Prettier, y la extensión de TypeScript que Cursor trae por defecto.
