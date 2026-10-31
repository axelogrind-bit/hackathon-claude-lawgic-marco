# Lawgic Convenios

Aplicación web para **generar** y **revisar** convenios de la Administración Pública Federal mexicana, con el fundamento normativo de cada apartado.

## Funciones

- **Asistente: ¿qué convenio necesitas?** Pide el objeto, con quién se celebra y qué se pretende obtener. Con esos datos recomienda el tipo de convenio, sugiere la unidad firmante de la Secretaría de Salud, muestra la competencia de la CCINSHAE conforme al Reglamento Interior de la Secretaría de Salud (DOF 27-02-2025), los requisitos previos a la firma y la doctrina jurídica aplicable, y advierte cuando el caso corresponde a un contrato de la LAASSP.
- **Reglamento Interior de la Secretaría de Salud.** Catálogo de las unidades del artículo 2 con su fundamento para suscribir convenios (art. 8, fr. XVII; art. 18, fr. XVIII, o art. 46, fr. VII) y su artículo de atribuciones; al elegir una unidad se llenan su naturaleza jurídica y sus facultades en las declaraciones.
- **Catálogo de instituciones.** Base con los datos legales de cada institución: naturaleza jurídica y su fundamento, instrumento de creación, representante, cargo, nombramiento, facultades o poderes, RFC, domicilio y correo. Se agregan, editan, importan y exportan fichas en JSON. Las fichas incluidas son ficticias.
- **Proemio y declaraciones automáticos.** Al seleccionar las instituciones que participan, la app integra sus datos en el proemio y en las declaraciones de cada parte.
- **Identificación del tipo de convenio.** A partir de las partes y de tres preguntas, sugiere colaboración, general o marco, específico, coordinación, concertación o modificatorio, con su fundamento.
- **Generar.** El convenio se arma en tiempo real con la estructura de un convenio institucional: proemio, antecedentes, declaraciones, cláusulas numeradas, cierre y firmas. Los datos faltantes aparecen resaltados como `[●]`.
- **Fundamento.** Cada apartado muestra las normas que lo sustentan y su estado de verificación.
- **Revisar.** Carga un `.docx` o `.txt`, o pega el texto. La herramienta busca los elementos mínimos y los clasifica como **Crítico**, **Relevante** o **Preventivo**, con redacción sugerida. Exporta una cédula de observaciones en Word.
- **Exportar.** Word (`.doc`), impresión o PDF, copia de texto y borradores en JSON.

Tipos de convenio: colaboración, general o marco, específico, coordinación, concertación y modificatorio.

## Uso

Abre `index.html` en el navegador. No requiere instalación ni servidor.

Para publicarla con GitHub Pages: *Settings → Pages → Deploy from a branch → main / (root)*.

## Avisos

- Es una herramienta de apoyo; no sustituye la revisión de la unidad jurídica competente.
- La revisión es automática por palabras clave; cada hallazgo debe confirmarse leyendo el instrumento.
- Las normas se marcan **«Por verificar»** o **«Según documentos de trabajo»**. Antes de citar cualquier norma, confirma su texto vigente en el Diario Oficial de la Federación. El catálogo está en `js/normativa.js`.
- Los datos capturados y el catálogo se guardan solo en el navegador de quien la usa. No subas a este repositorio público convenios reales, fichas con datos reales, información reservada o confidencial, ni datos personales.

## Estructura

```
index.html
css/styles.css
js/normativa.js   catálogo de normas y fundamento por apartado
js/clausulas.js   tipos de convenio, identificación del tipo, naturalezas jurídicas y reglas de revisión
js/riss.js        unidades del Reglamento Interior de la Secretaría de Salud y su facultad para suscribir convenios
js/asistente.js   análisis: tipo recomendado, competencia, requisitos previos y doctrina
js/catalogo.js    campos de la ficha institucional y fichas de ejemplo (ficticias)
js/app.js         generador, revisión y exportación
```

La lectura de `.docx` usa [mammoth.js](https://github.com/mwilliamson/mammoth.js) desde unpkg.
