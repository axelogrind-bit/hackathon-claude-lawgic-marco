// Catálogos y reglas de redacción y revisión de convenios.

const ORDINALES = [
  'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SÉPTIMA', 'OCTAVA',
  'NOVENA', 'DÉCIMA', 'DÉCIMA PRIMERA', 'DÉCIMA SEGUNDA', 'DÉCIMA TERCERA',
  'DÉCIMA CUARTA', 'DÉCIMA QUINTA', 'DÉCIMA SEXTA', 'DÉCIMA SÉPTIMA', 'DÉCIMA OCTAVA',
  'DÉCIMA NOVENA', 'VIGÉSIMA', 'VIGÉSIMA PRIMERA', 'VIGÉSIMA SEGUNDA'
];

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const TIPOS = {
  colaboracion: {
    etiqueta: 'Colaboración',
    titulo: 'CONVENIO DE COLABORACIÓN',
    nombre: 'Convenio de Colaboración',
    normas: ['ccf', 'lfpa'],
    nota: 'Entre dependencias, entidades u otras instituciones públicas o privadas.'
  },
  marco: {
    etiqueta: 'General o marco de colaboración',
    titulo: 'CONVENIO GENERAL DE COLABORACIÓN',
    nombre: 'Convenio General de Colaboración',
    normas: ['ccf'],
    nota: 'Fija bases generales; se ejecuta mediante convenios específicos.'
  },
  especifico: {
    etiqueta: 'Específico (deriva de un convenio general)',
    titulo: 'CONVENIO ESPECÍFICO DE COLABORACIÓN',
    nombre: 'Convenio Específico de Colaboración',
    normas: ['ccf'],
    principal: true,
    nota: 'Desarrolla acciones concretas de un convenio general.'
  },
  coordinacion: {
    etiqueta: 'Coordinación',
    titulo: 'CONVENIO DE COORDINACIÓN',
    nombre: 'Convenio de Coordinación',
    normas: ['lp', 'lfprh'],
    nota: 'Con entidades federativas u otros órdenes de gobierno.'
  },
  concertacion: {
    etiqueta: 'Concertación',
    titulo: 'CONVENIO DE CONCERTACIÓN',
    nombre: 'Convenio de Concertación',
    normas: ['lp'],
    nota: 'Con representaciones de grupos sociales o con particulares.'
  },
  modificatorio: {
    etiqueta: 'Modificatorio',
    titulo: 'CONVENIO MODIFICATORIO',
    nombre: 'Convenio Modificatorio',
    normas: ['ccf'],
    principal: true,
    nota: 'Modifica un convenio vigente; las demás cláusulas subsisten.'
  }
};

const NATURALEZAS = {
  dependencia: {
    etiqueta: 'Dependencia de la APF centralizada',
    texto: 'una dependencia de la Administración Pública Federal centralizada'
  },
  unidad: {
    etiqueta: 'Unidad administrativa de una dependencia',
    texto: 'una unidad administrativa de una dependencia de la Administración Pública Federal centralizada'
  },
  descentralizado: {
    etiqueta: 'Organismo público descentralizado',
    texto: 'un organismo público descentralizado de la Administración Pública Federal, con personalidad jurídica y patrimonio propios'
  },
  paraestatal: {
    etiqueta: 'Empresa de participación estatal mayoritaria',
    texto: 'una empresa de participación estatal mayoritaria de la Administración Pública Federal'
  },
  desconcentrado: {
    etiqueta: 'Órgano administrativo desconcentrado',
    texto: 'un órgano administrativo desconcentrado de la Administración Pública Federal'
  },
  estatal: {
    etiqueta: 'Entidad federativa o dependencia estatal',
    texto: 'una entidad federativa, o una dependencia o entidad de su administración pública'
  },
  academica: {
    etiqueta: 'Institución de educación superior',
    texto: 'una institución de educación superior'
  },
  privada: {
    etiqueta: 'Persona moral privada',
    texto: 'una persona moral legalmente constituida conforme a las leyes de los Estados Unidos Mexicanos'
  },
  social: {
    etiqueta: 'Organización de la sociedad civil',
    texto: 'una organización de la sociedad civil legalmente constituida conforme a las leyes de los Estados Unidos Mexicanos'
  }
};

// Identificación del tipo de convenio a partir de las partes y de tres preguntas.
// Devuelve el tipo sugerido y la razón; el orden de las reglas define la prioridad.
function sugerirTipo(e) {
  const nats = e.partes.map(p => p.naturaleza);
  if (e.qModifica) return { tipo: 'modificatorio', razon: 'modifica un convenio vigente' };
  if (e.qDeriva) return { tipo: 'especifico', razon: 'deriva de un convenio general o marco y desarrolla acciones concretas' };
  if (e.qMarco) return { tipo: 'marco', razon: 'solo fija bases generales que se ejecutarán mediante convenios específicos' };
  if (nats.includes('estatal')) return { tipo: 'coordinacion', razon: 'participa una entidad federativa u otro orden de gobierno' };
  if (nats.some(n => n === 'privada' || n === 'social')) return { tipo: 'concertacion', razon: 'participa una persona moral privada o una organización de la sociedad civil' };
  return { tipo: 'colaboracion', razon: 'participan dependencias, entidades o instituciones públicas o académicas' };
}

// Reglas de revisión. Cada `test` recibe el texto normalizado (minúsculas, sin acentos)
// y devuelve true cuando el elemento está presente o la condición se cumple.
const HAY_DINERO = /(\$\s?\d|pesos|aportara|aportacion|transferencia de recursos|recursos (federales|presupuest|economicos|financieros))/;
const SIN_RECURSOS = /no (implica|genera|conlleva) (la )?(transferencia|erogacion|compromiso)/;

const REVISION = [
  {
    elemento: 'Proemio con identificación de las partes',
    clasificacion: 'Crítico',
    seccion: 'naturaleza',
    test: t => /que celebran/.test(t),
    observacion: 'No se identifica el proemio con las partes que celebran el instrumento y sus representantes.',
    sugerencia: '[TIPO DE CONVENIO] QUE CELEBRAN, POR UNA PARTE, [PARTE 1], EN LO SUCESIVO “[SIGLAS]”, REPRESENTADA POR [NOMBRE], EN SU CARÁCTER DE [CARGO]; Y POR LA OTRA, [PARTE 2], EN LO SUCESIVO “[SIGLAS]”, REPRESENTADA POR [NOMBRE], EN SU CARÁCTER DE [CARGO], AL TENOR DE LAS DECLARACIONES Y CLÁUSULAS SIGUIENTES:'
  },
  {
    elemento: 'Declaraciones de cada parte (naturaleza jurídica)',
    clasificacion: 'Crítico',
    seccion: 'naturaleza',
    test: t => /declara/.test(t),
    observacion: 'No hay declaraciones que acrediten la naturaleza jurídica de cada parte.',
    sugerencia: 'Declara “[SIGLAS]”, por conducto de su representante, que: Es [naturaleza jurídica], de conformidad con [ordenamiento de creación].'
  },
  {
    elemento: 'Facultades de quien suscribe',
    clasificacion: 'Crítico',
    seccion: 'facultades',
    test: t => /facultad/.test(t),
    observacion: 'No se acreditan las facultades del representante ni el instrumento que las otorga.',
    sugerencia: '[NOMBRE], en su carácter de [CARGO], cuenta con las facultades necesarias para suscribir el presente instrumento, de conformidad con [ordenamiento y artículo, o poder notarial], mismas que no le han sido revocadas, modificadas ni limitadas en forma alguna.'
  },
  {
    elemento: 'Acreditación del cargo de quien suscribe',
    clasificacion: 'Relevante',
    seccion: 'facultades',
    test: t => /nombramiento|instrumento notarial|escritura publica|poder notarial/.test(t),
    observacion: 'No se indica con qué documento se acredita el cargo (nombramiento) o la representación (instrumento notarial).',
    sugerencia: '[NOMBRE], en su carácter de [CARGO], acredita dicho cargo con el nombramiento de fecha [fecha], y acredita su personalidad y facultades para suscribir el presente “CONVENIO” de conformidad con [ordenamiento y artículos, o instrumento notarial número, notario y fecha].'
  },
  {
    elemento: 'Domicilio y correo electrónico institucional',
    clasificacion: 'Preventivo',
    seccion: 'avisos',
    test: t => /domicilio/.test(t) && /correo electronico|@/.test(t),
    observacion: 'No se señalan domicilio y correo electrónico institucional de cada parte para avisos y notificaciones.',
    sugerencia: 'Para los fines y efectos legales del presente “CONVENIO”, señala como domicilio el ubicado en [domicilio], y como correo electrónico institucional [correo].'
  },
  {
    elemento: 'Objeto',
    clasificacion: 'Crítico',
    seccion: 'objeto',
    test: t => /objeto/.test(t),
    observacion: 'No se identifica una cláusula de objeto.',
    sugerencia: 'PRIMERA. OBJETO. El presente “CONVENIO” tiene por objeto [describir de forma clara, lícita y dentro de las atribuciones de cada parte].'
  },
  {
    elemento: 'Compromisos de las partes',
    clasificacion: 'Crítico',
    seccion: 'compromisos',
    test: t => /(se compromete|compromisos|obligaciones)/.test(t),
    observacion: 'No se precisan los compromisos u obligaciones de cada parte.',
    sugerencia: 'COMPROMISOS DE LAS PARTES. Para el cumplimiento del objeto, “[SIGLAS]” se compromete a: a) [...]; b) [...].'
  },
  {
    elemento: 'Suficiencia presupuestal cuando hay recursos',
    clasificacion: 'Crítico',
    seccion: 'recursos',
    test: t => !HAY_DINERO.test(t) || SIN_RECURSOS.test(t) || /(suficiencia|disponibilidad) presupuest/.test(t),
    observacion: 'Se mencionan recursos sin acreditar la suficiencia o disponibilidad presupuestaria.',
    sugerencia: '“[SIGLAS]” cuenta con los recursos presupuestarios necesarios para cubrir las obligaciones a su cargo, conforme a [oficio o constancia de suficiencia presupuestal], y su ejercicio queda sujeto a la disponibilidad presupuestaria y a las disposiciones aplicables.'
  },
  {
    elemento: 'Manifestación expresa sobre recursos',
    clasificacion: 'Preventivo',
    seccion: 'recursos',
    test: t => HAY_DINERO.test(t) || SIN_RECURSOS.test(t),
    observacion: 'No se aclara si el convenio implica o no transferencia de recursos.',
    sugerencia: 'RECURSOS. El presente convenio no implica transferencia de recursos entre “LAS PARTES”. Cada una cubrirá con su propio presupuesto los gastos que le correspondan, sujeto a su disponibilidad presupuestaria.'
  },
  {
    elemento: 'Vigencia',
    clasificacion: 'Relevante',
    seccion: 'vigencia',
    test: t => /vigencia/.test(t),
    observacion: 'No se establece la vigencia del instrumento.',
    sugerencia: 'VIGENCIA. El presente convenio entrará en vigor a partir de la fecha de su firma y concluirá el [fecha].'
  },
  {
    elemento: 'Responsables del seguimiento',
    clasificacion: 'Relevante',
    seccion: 'enlaces',
    test: t => /(enlace|responsables? del seguimiento|seguimiento)/.test(t),
    observacion: 'No se designan responsables del seguimiento o enlaces.',
    sugerencia: 'RESPONSABLES DEL SEGUIMIENTO. “LAS PARTES” designan como responsables del seguimiento: por “[SIGLAS]”, [nombre y cargo]. Podrán sustituirse mediante aviso por escrito.'
  },
  {
    elemento: 'Relación laboral',
    clasificacion: 'Relevante',
    seccion: 'laboral',
    test: t => /relacion laboral|laboral/.test(t),
    observacion: 'No se excluye la relación laboral entre el personal de las partes.',
    sugerencia: 'RELACIÓN LABORAL. El personal que cada parte designe conservará su relación laboral con la parte que lo emplea, por lo que no se crearán relaciones de carácter laboral ni de patrón sustituto o solidario con la otra.'
  },
  {
    elemento: 'Confidencialidad',
    clasificacion: 'Preventivo',
    seccion: 'confidencialidad',
    test: t => /confidencial/.test(t),
    observacion: 'No se regula el tratamiento de la información confidencial o reservada.',
    sugerencia: 'CONFIDENCIALIDAD. “LAS PARTES” guardarán confidencialidad sobre la información que intercambien con ese carácter, en términos de la legislación aplicable en materia de transparencia y acceso a la información pública.'
  },
  {
    elemento: 'Protección de datos personales',
    clasificacion: 'Preventivo',
    seccion: 'datos',
    test: t => /datos personales/.test(t),
    observacion: 'No se prevé el tratamiento de datos personales.',
    sugerencia: 'PROTECCIÓN DE DATOS PERSONALES. Los datos personales que se traten con motivo del presente convenio se protegerán conforme a la legislación aplicable en la materia.'
  },
  {
    elemento: 'Propiedad intelectual',
    clasificacion: 'Preventivo',
    seccion: 'pi',
    test: t => /propiedad intelectual|derechos? de autor|propiedad industrial/.test(t),
    observacion: 'No se define la titularidad de los productos o materiales que se generen.',
    sugerencia: 'PROPIEDAD INTELECTUAL. La titularidad de los derechos sobre los productos que se generen corresponderá a la parte que los produzca; los que se generen de forma conjunta corresponderán a “LAS PARTES” en proporción a su participación.'
  },
  {
    elemento: 'Modificaciones',
    clasificacion: 'Relevante',
    seccion: 'modificaciones',
    test: t => /modificad|modificac/.test(t),
    observacion: 'No se regula la forma de modificar el instrumento.',
    sugerencia: 'MODIFICACIONES. El presente convenio podrá modificarse por acuerdo de “LAS PARTES”, mediante convenio modificatorio por escrito, que surtirá efectos a partir de su firma.'
  },
  {
    elemento: 'Terminación anticipada',
    clasificacion: 'Relevante',
    seccion: 'terminacion',
    test: t => /terminacion anticipada|dar por terminado|darlo por terminado/.test(t),
    observacion: 'No se prevé la terminación anticipada.',
    sugerencia: 'TERMINACIÓN ANTICIPADA. Cualquiera de “LAS PARTES” podrá dar por terminado el presente convenio mediante aviso por escrito con [30] días naturales de anticipación; las acciones en curso deberán concluirse.'
  },
  {
    elemento: 'Caso fortuito o fuerza mayor',
    clasificacion: 'Preventivo',
    seccion: 'fortuito',
    test: t => /caso fortuito|fuerza mayor/.test(t),
    observacion: 'No se regula el incumplimiento por caso fortuito o fuerza mayor.',
    sugerencia: 'CASO FORTUITO O FUERZA MAYOR. “LAS PARTES” no serán responsables del incumplimiento derivado de caso fortuito o fuerza mayor; las actividades se reanudarán cuando cesen las causas.'
  },
  {
    elemento: 'Avisos, comunicaciones y notificaciones',
    clasificacion: 'Preventivo',
    seccion: 'avisos',
    test: t => /avisos|notificaciones/.test(t),
    observacion: 'No se regula la forma de realizar avisos, comunicaciones y notificaciones entre las partes.',
    sugerencia: 'AVISOS, COMUNICACIONES Y NOTIFICACIONES. Todos los avisos, comunicaciones y notificaciones con efectos jurídicos deberán realizarse por escrito, con acuse de recibo, en los domicilios señalados en las declaraciones, o mediante correo electrónico institucional con confirmación de recepción.'
  },
  {
    elemento: 'Interpretación y solución de controversias',
    clasificacion: 'Relevante',
    seccion: 'controversias',
    test: t => /controversia|jurisdiccion|tribunales/.test(t),
    observacion: 'No se establece la forma de resolver controversias ni la jurisdicción.',
    sugerencia: 'INTERPRETACIÓN Y CONTROVERSIAS. Las controversias se resolverán de común acuerdo; de persistir, “LAS PARTES” se someten a la jurisdicción de [tribunales competentes], renunciando a cualquier otro fuero.'
  },
  {
    elemento: 'Cierre, ejemplares y firmas',
    clasificacion: 'Relevante',
    seccion: 'firmas',
    test: t => /(firman|firmado|suscriben|ejemplares)/.test(t),
    observacion: 'No se identifica el cierre con lugar, fecha, número de ejemplares y firmas.',
    sugerencia: 'Leído que fue el presente Convenio por quienes en él intervienen y enteradas “LAS PARTES” de su contenido y alcance legal, lo suscriben en [lugar], a los [día] días del mes de [mes] de [año].'
  },
  {
    elemento: 'Datos pendientes de llenar',
    clasificacion: 'Relevante',
    seccion: 'firmas',
    test: t => !/\[\s*(●|x+|\.{3,})?\s*\]|x{4,}/.test(t),
    observacion: 'El texto conserva marcadores de datos pendientes ([●], [ ], XXXX).',
    sugerencia: 'Completar todos los datos marcados antes de enviar a revisión jurídica o a firma.'
  }
];
