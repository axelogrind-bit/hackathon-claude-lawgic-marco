# Lawgic Convenios

Aplicación web para **generar** y **revisar** convenios de la Administración Pública Federal mexicana, con el fundamento normativo de cada apartado.

## Funciones

- **Generar.** Un formulario guía la captura de la información: tipo de convenio, partes, naturaleza jurídica, facultades de quien firma, objeto, compromisos, recursos, vigencia, cláusulas opcionales y formalización. El convenio se arma en tiempo real con proemio, antecedentes, declaraciones, cláusulas numeradas y bloque de firmas. Los datos faltantes aparecen resaltados como `[●]`.
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
- Los datos capturados se guardan solo en el navegador de quien la usa. No subas a este repositorio público convenios reales, información reservada o confidencial, ni datos personales.

## Estructura

```
index.html
css/styles.css
js/normativa.js   catálogo de normas y fundamento por apartado
js/clausulas.js   tipos de convenio, naturalezas jurídicas y reglas de revisión
js/app.js         generador, revisión y exportación
```

La lectura de `.docx` usa [mammoth.js](https://github.com/mwilliamson/mammoth.js) desde unpkg.
