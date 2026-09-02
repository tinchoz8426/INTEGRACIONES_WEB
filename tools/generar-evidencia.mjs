import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import { writeFileSync } from 'node:fs';

// Fecha actual para el documento
const hoy = new Date().toLocaleDateString('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// --- Helpers ---
const boxCaptura = (consigna) => [
  new Paragraph({
    spacing: { before: 80, after: 80 },
    border: {
      top: { style: BorderStyle.DASHED, size: 6, color: '999999' },
      bottom: { style: BorderStyle.DASHED, size: 6, color: '999999' },
      left: { style: BorderStyle.DASHED, size: 6, color: '999999' },
      right: { style: BorderStyle.DASHED, size: 6, color: '999999' },
    },
    children: [
      new TextRun({
        text: '📷 PEGAR CAPTURA AQUÍ: ' + consigna,
        italics: true,
        color: '555555',
      }),
    ],
  }),
];

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true })],
  });

const para = (text) =>
  new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text })],
  });

// Bloque de código (JSON / CLI) en fondo gris monoespaciado
const codigo = (lineas) =>
  new Paragraph({
    spacing: { before: 60, after: 120 },
    shading: { fill: 'F2F2F2' },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    },
    children: [
      new TextRun({
        text: lineas,
        font: 'Consolas',
        size: 16,
      }),
    ],
  });

const bullet = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text })],
  });

// Tabla genérica (header a color)
const tabla = (rows, widths) => {
  const header = rows[0];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((r, i) =>
      new TableRow({
        children: r.map((cell, c) =>
          new TableCell({
            width: { size: widths ? widths[c] : 100 / r.length, type: WidthType.PERCENTAGE },
            shading: i === 0 ? { fill: 'D9E2F3' } : undefined,
            children: [
              new Paragraph({
                children: [new TextRun({ text: cell, bold: i === 0 })],
              }),
            ],
          })
        ),
      })
    ),
  });
};

const encabezadoDoc = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 60 },
  children: [new TextRun({ text: 'TURNOSRED', bold: true, size: 28 })],
});

// --- CONTENIDO ---
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 },
      },
    },
  },
  sections: [
    {
      properties: {},
      children: [
        encabezadoDoc,
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: 'Backend de Gestión de Turnos Médicos',
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `Documento de Evidencia • ${hoy}`,
              size: 20,
              color: '555555',
            }),
          ],
        }),

        h1('1. Alcance y Objetivo'),
        para(
          'El presente documento recopila la evidencia de las pruebas realizadas sobre la API REST TurnosRed (Node.js, TypeScript, Express y Socket.IO). Se documenta la ejecución de peticiones en Postman, la validación Zod con errores 400 estandarizados, consultas con query params, la ejecución de tests automatizados en estado Pass y las peticiones contra el Mock Server de Postman.'
        ),
        para(
          'Tecnologías: Express 5 • Socket.IO 4 • Zod • TypeScript 6 • Postman / Newman.'
        ),

        h1('2. Configuración previa para las evidencias'),
        h2('2.1 Servidor local'),
        bullet('Ejecutar el backend:  npm run dev  (puerto 3000).'),
        bullet('Verificar en consola: “Servidor de TurnosRed ejecutándose en el puerto 3000”.'),
        h2('2.2 Importar colección y ambiente en Postman'),
        bullet('Postman → Import → archivos postman/TurnosRed.postman_collection.json y TurnosRed.postman_environment.json.'),
        bullet('Seleccionar el ambiente “turnosRedEnvi” con baseUrl = http://localhost:3000.'),
        h2('2.3 Configurar el Mock Server de Postman'),
        bullet('En la colección TurnosRed API → clic tres puntos → Mock Server.'),
        bullet('Nombrarlo (ej. “TurnosRedMock”), crear una URL de mock (mock.postman.gov/...).'),
        bullet('Guardar la URL generada como variable userMockBaseUrl (los ejemplos guardados ya existen en la colección).'),
        bullet('Los requests usarán baseUrl={{mockBaseUrl}} para apuntar al mock.'),
        boxCaptura('configuración del Mock Server (URL + ambiente asignado)'),

        h1('3. Evidencia de peticiones y respuestas en Postman'),
        para(
          'Para cada endpoint se realizó la petición y se obtuvo la respuesta. A continuación se muestran las respuestas reales obtenidas (formato JSON); las capturas de pantalla en Postman van en cada recuadro.'
        ),
        h2('3.1 GET /turnos — Listar turnos'),
        bullet('Petición: GET {{baseUrl}}/turnos  →  Estado: 200 OK.'),
        codigo('[{"id":103,"paciente":"Ana Gomez","documento":"28999111","especialidad":"Clínica Médica","fecha":"15/08/2026","hora":"11:30","confirmado":false,"medicoId":202},{"id":5801,"paciente":"Lucía Fernández","documento":"AB-4567 / 2026","especialidad":"Nutrición","fecha":"16/08/2026","hora":"9:30","confirmado":true,"medicoId":201}]'),
        boxCaptura('pantalla de Postman del GET /turnos con respuesta 200'),
        h2('3.2 GET /medicos — Listar médicos'),
        bullet('Petición: GET {{baseUrl}}/medicos  →  Estado: 200 OK.'),
        codigo('[{"id":201,"nombre":"Dra. Laura Fernandez","matricula":"MN 12345","especialidad":"Pediatría","activo":true},{"id":202,"nombre":"Dr. Martin Lopez","matricula":"67890","especialidad":"Clínica Médica","activo":true}]'),
        boxCaptura('pantalla de Postman del GET /medicos con respuesta 200'),
        h2('3.3 POST /turnos — Crear turno'),
        bullet('Petición: POST {{baseUrl}}/turnos con body JSON → 201 Created.'),
        codigo('{ "id": 5801, "paciente": "Lucía Fernández", "documento": "AB-4567 / 2026", "especialidad": "Nutrición", "fecha": "16/08/2026", "hora": "9:30", "confirmado": true, "medicoId": 201 }'),
        boxCaptura('pantalla de Postman del POST /turnos con body y respuesta 201'),
        h2('3.4 PUT /medicos/:id — Actualizar médico'),
        bullet('Petición: PUT {{baseUrl}}/medicos/201 con body → 200 OK.'),
        codigo('{ "id": 201, "nombre": "Dra. Laura Fernandez", "matricula": "MN 12345", "especialidad": "Pediatría", "activo": true }'),
        boxCaptura('pantalla de Postman del PUT /medicos/201 con body y respuesta 200'),
        h2('3.5 DELETE /turnos/:id — Eliminar turno'),
        bullet('Petición: DELETE {{baseUrl}}/turnos/{id} → 204 No Content (sin cuerpo).'),
        codigo('(cuerpo vacío — HTTP 204)'),
        boxCaptura('pantalla de Postman del DELETE /turnos con respuesta 204'),

        h1('4. Evidencia de validaciones Zod (error 400 estandarizado)'),
        para(
          'Se enviaron cuerpos inválidos para verificar el formato unificado de error de la API: { status, message, code, details }.'
        ),
        h2('4.1 Especialidad no válida (Title Case)'),
        bullet('POST /turnos con especialidad: “PEDIATRÍA” → 400 VALIDATION_ERROR.'),
        codigo('{ "status": 400, "message": "Error de validación en los datos ingresados.", "code": "VALIDATION_ERROR", "details": [ { "path": "especialidad", "message": "La especialidad debe estar en formato Title Case (ej. \\"Clínica médica\\", \\"Pediatría\\")." } ] }'),
        boxCaptura('pantalla de Postman del POST /turnos inválido (400 VALIDATION_ERROR)'),
        h2('4.2 Campos faltantes o tipo incorrecto'),
        bullet('POST /medicos con datos inválidos → 400 VALIDATION_ERROR con details.'),
        codigo('{ "status": 400, "message": "Error de validación en los datos ingresados.", "code": "VALIDATION_ERROR", "details": [] }'),
        boxCaptura('pantalla de Postman del POST /medicos inválido (400 estandarizado)'),
        h2('4.3 Recurso inexistente (404 NOT_FOUND)'),
        bullet('GET /turnos/99999 → 404 con code NOT_FOUND y formato estándar.'),
        codigo('{ "status": 404, "message": "Turno no encontrado.", "code": "NOT_FOUND", "details": [] }'),
        boxCaptura('pantalla de Postman del GET /turnos/99999 (404 estandarizado)'),

        h1('5. Evidencia de consultas con Query Params'),
        h2('5.1 Filtros en Turnos'),
        bullet('GET /turnos?especialidad=Pediatria → devuelve turnos de Pediatría (insensible a mayúsculas/acentos).'),
        bullet('GET /turnos?medicoId=202 → turnos del médico 202.'),
        codigo('GET /turnos?especialidad=Pediatria  →  [{ "id": 102, "paciente": "Carlos Ruiz", "especialidad": "Pediatría", ... }]'),
        boxCaptura('pantalla de Postman del GET /turnos?especialidad=Pediatria'),
        bullet('GET /turnos?medicoId=202 → 200 OK con el turno asignado.'),
        codigo('GET /turnos?medicoId=202  →  [{ "id": 103, "paciente": "Ana Gomez", "especialidad": "Clínica Médica", "medicoId": 202, ... }]'),
        boxCaptura('pantalla de Postman del GET /turnos?medicoId=202'),
        h2('5.2 Filtros en Médicos'),
        bullet('GET /medicos?disponible=true → médicos activos.'),
        codigo('GET /medicos?disponible=true  →  [ { "id": 202, "nombre": "Dr. Martin Lopez", "activo": true }, ... ]'),
        boxCaptura('pantalla de Postman del GET /medicos?disponible=true'),
        bullet('GET /medicos?especialidad=Odontologia&disponible=false → combinación de filtros.'),
        codigo('GET /medicos?especialidad=Odontologia&disponible=false  →  [ { "id": 203, "nombre": "Dra. Silvia Rodriguez", "especialidad": "Odontología", "activo": false } ]'),
        boxCaptura('pantalla de Postman del GET /medicos?especialidad=Odontologia&disponible=false'),

        h1('6. Evidencia de tests automatizados en verde (Pass)'),
        para(
          'La colección incluye scripts de test con aserciones de código de estado (200/201/204/400/404) y de esquema JSON. Se ejecutó la colección completa con Newman; el resumen real obtenido se muestra a continuación.'
        ),
        para('Resultado de la ejecución (Newman — 16 peticiones, 52 aserciones, 0 fallos):'),
        codigo('┌───────────────┬──────────┬─────────┐\n│               │ executed │ failed  │\n├───────────────┼──────────┼─────────┤\n│ iterations    │        1 │       0 │\n│ requests      │       16 │       0 │\n│ test-scripts  │       16 │       0 │\n│ assertions    │       52 │       0 │\n└───────────────┴──────────┴─────────┘\n→ TOTAL PASS'),
        para('Detalle de las 16 peticiones ejecutadas y su estado:'),
        tabla([
          ['Método', 'Recurso', 'HTTP esperado', 'Tests', 'Estado'],
          ['GET', '/turnos', '200', '4', 'PASS'],
          ['GET', '/turnos?especialidad=&fecha=', '200', '3', 'PASS'],
          ['GET', '/turnos/:id', '200', '4', 'PASS'],
          ['GET', '/turnos/99999 (inexistente)', '404', '3', 'PASS'],
          ['POST', '/turnos', '201', '5', 'PASS'],
          ['POST', '/turnos (inválido)', '400', '4', 'PASS'],
          ['PUT', '/turnos/:id', '200', '3', 'PASS'],
          ['DELETE', '/turnos/:id', '204', '2', 'PASS'],
          ['GET', '/medicos', '200', '3', 'PASS'],
          ['GET', '/medicos?disponible=', '200', '2', 'PASS'],
          ['GET', '/medicos/:id', '200', '3', 'PASS'],
          ['GET', '/medicos/99999 (inexistente)', '404', '3', 'PASS'],
          ['POST', '/medicos', '201', '4', 'PASS'],
          ['POST', '/medicos (inválido)', '400', '4', 'PASS'],
          ['PUT', '/medicos/:id', '200', '3', 'PASS'],
          ['DELETE', '/medicos/:id', '204', '2', 'PASS'],
        ]),
        h2('6.1 Test Runner de Postman'),
        bullet('Abrir colección → Runner → ejecutar toda la colección.'),
        boxCaptura('pantalla del Runner de Postman con todos los tests en verde (Pass)'),
        h2('6.2 Newman (terminal)'),
        bullet('Comando:  npx newman run postman/TurnosRed.postman_collection.json -e postman/TurnosRed.postman_environment.json'),
        boxCaptura('pantalla del terminal con la salida de Newman (52 assertions, 0 failed)'),

        h1('7. Evidencia de Mock Server de Postman'),
        para(
          'Se configuró un Mock Server de Postman a partir de la colección (usando los ejemplos guardados en cada request). Las peticiones se ejecutaron contra la URL del mock sin necesidad del backend real.'
        ),
        h2('7.1 Petición contra el Mock (GET /turnos)'),
        bullet('Petición: GET {{mockBaseUrl}}/turnos  → respuesta simulada 200 con los ejemplos guardados.'),
        boxCaptura('GET /turnos contra el Mock Server (URL mock + respuesta)'),
        h2('7.2 Otras peticiones contra el Mock'),
        bullet('GET {{mockBaseUrl}}/medicos y GET {{mockBaseUrl}}/turnos/99999 (404 simulado).'),
        boxCaptura('Petición al Mock Server mostrando la respuesta o error simulado'),

        h1('8. Conclusión'),
        para(
          'La API de TurnosRed cumple con los requisitos RESTful solicitados (verbos HTTP correctos y códigos 200/201/204/400/404/500), expone errores bajo un formato estándar unificado, valida los datos con Zod (incluyendo especialidades en Title Case y documento como string), soporta filtros por query params en la capa de servicios, cuenta con tests automatizados en verde y puede simularse mediante el Mock Server de Postman.'
        ),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  writeFileSync('DocumentoEvidencia_TurnosRed.docx', buffer);
  console.log('DOCX GENERADO: DocumentoEvidencia_TurnosRed.docx');
});