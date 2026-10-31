// Marco normativo de referencia. Estados:
//   pv = por verificar en fuente oficial (DOF / Cámara de Diputados)
//   sd = dato tomado de documentos de trabajo (incluido el convenio base); falta confirmarlo en fuente oficial
// Antes de firmar cualquier instrumento, confirmar el texto vigente de cada norma.
const ESTADOS = {
  pv: 'Por verificar',
  sd: 'Según documentos de trabajo',
  vf: 'Verificada'
};

const NORMATIVA = {
  cpeum: {
    nombre: 'Constitución Política de los Estados Unidos Mexicanos',
    ref: 'Artículos 4, párrafo cuarto (protección de la salud), y 134 (administración de recursos)',
    uso: 'Derecho a la protección de la salud y administración de recursos públicos con eficiencia, eficacia, economía, transparencia y honradez.',
    estado: 'sd'
  },
  loapf: {
    nombre: 'Ley Orgánica de la Administración Pública Federal',
    ref: 'Artículos 2, fracción I, 26 y 39 (Secretaría de Salud); 3, fracción I, y 45 (organismos descentralizados)',
    uso: 'Naturaleza jurídica de las dependencias y organismos que suscriben.',
    estado: 'sd'
  },
  lfep: {
    nombre: 'Ley Federal de las Entidades Paraestatales',
    ref: '',
    uso: 'Naturaleza y representación de los organismos descentralizados y empresas de participación estatal.',
    estado: 'pv'
  },
  lins: {
    nombre: 'Ley de los Institutos Nacionales de Salud',
    ref: 'Artículo 5 (relación de Institutos Nacionales de Salud)',
    uso: 'Naturaleza y atribuciones de los Institutos Nacionales de Salud.',
    estado: 'sd'
  },
  lgs: {
    nombre: 'Ley General de Salud',
    ref: '',
    uso: 'Materia sanitaria del objeto del instrumento.',
    estado: 'pv'
  },
  riss: {
    nombre: 'Reglamento Interior de la Secretaría de Salud',
    ref: 'Artículos 2, apartados A y B (unidades administrativas); 8; 13 (CCINSHAE); 21 (DGCOES)',
    uso: 'Competencia y facultades de las unidades administrativas que suscriben.',
    estado: 'sd',
    fecha: 'DOF 27-02-2025'
  },
  adscripcion: {
    nombre: 'Acuerdo por el que se adscriben orgánicamente las unidades administrativas y órganos administrativos desconcentrados de la Secretaría de Salud',
    ref: 'Artículo único',
    uso: 'Adscripción orgánica de la unidad administrativa que suscribe.',
    estado: 'sd',
    fecha: 'DOF 27-03-2025'
  },
  lp: {
    nombre: 'Ley de Planeación',
    ref: 'Capítulos de coordinación y de concertación e inducción',
    uso: 'Convenios de coordinación con entidades federativas y de concertación con grupos sociales o particulares.',
    estado: 'pv'
  },
  laassp: {
    nombre: 'Ley de Adquisiciones, Arrendamientos y Servicios del Sector Público',
    ref: '',
    uso: 'Confirmar que el instrumento es un convenio y no una contratación de bienes o servicios sujeta a esta ley.',
    estado: 'sd',
    fecha: 'DOF 16-04-2025'
  },
  rlaassp: {
    nombre: 'Reglamento de la Ley de Adquisiciones, Arrendamientos y Servicios del Sector Público',
    ref: 'Artículo 4, párrafo tercero (convenios de colaboración en materia de atención a la salud y cadena de suministro no sujetos a la Ley)',
    uso: 'Exclusión de la LAASSP para convenios de colaboración entre dependencias y entidades en materia de salud.',
    estado: 'sd',
    fecha: 'DOF 18-12-2025; reforma DOF 27-03-2026'
  },
  lfprh: {
    nombre: 'Ley Federal de Presupuesto y Responsabilidad Hacendaria',
    ref: '',
    uso: 'Disponibilidad presupuestaria, compromisos de gasto y anualidad del presupuesto.',
    estado: 'pv'
  },
  lfpa: {
    nombre: 'Ley Federal de Procedimiento Administrativo',
    ref: '',
    uso: 'Actos administrativos y su supletoriedad.',
    estado: 'pv'
  },
  ccf: {
    nombre: 'Código Civil Federal',
    ref: 'Artículos 1792 y 1793 (convenio y contrato)',
    uso: 'Supletorio: consentimiento, objeto, modificación, terminación e interpretación de los convenios.',
    estado: 'pv'
  },
  lft: {
    nombre: 'Ley Federal del Trabajo',
    ref: '',
    uso: 'Ausencia de relación laboral entre el personal de las partes.',
    estado: 'pv'
  },
  lgtaip: {
    nombre: 'Ley General de Transparencia y Acceso a la Información Pública',
    ref: '',
    uso: 'Clasificación de información reservada o confidencial.',
    estado: 'pv'
  },
  lftaip: {
    nombre: 'Ley Federal de Transparencia y Acceso a la Información Pública',
    ref: '',
    uso: 'Clasificación de información en el ámbito federal.',
    estado: 'pv'
  },
  lgpdppso: {
    nombre: 'Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados',
    ref: '',
    uso: 'Tratamiento de datos personales derivado del convenio.',
    estado: 'sd'
  },
  lfda: {
    nombre: 'Ley Federal del Derecho de Autor',
    ref: '',
    uso: 'Titularidad de obras y materiales generados.',
    estado: 'pv'
  },
  lfppi: {
    nombre: 'Ley Federal de Protección a la Propiedad Industrial',
    ref: '',
    uso: 'Titularidad de invenciones, marcas y desarrollos.',
    estado: 'pv'
  },
  lgra: {
    nombre: 'Ley General de Responsabilidades Administrativas',
    ref: '',
    uso: 'Responsabilidad de las personas servidoras públicas que intervienen.',
    estado: 'pv'
  }
};

// Normas que sustentan cada apartado del convenio.
const FUNDAMENTO_SECCION = {
  tipo: ['ccf', 'laassp', 'rlaassp'],
  naturaleza: ['loapf', 'lfep', 'lins', 'riss', 'adscripcion'],
  facultades: ['riss', 'lfep'],
  objeto: ['ccf', 'lgs', 'laassp'],
  compromisos: ['ccf'],
  recursos: ['cpeum', 'lfprh'],
  enlaces: ['ccf'],
  laboral: ['lft'],
  confidencialidad: ['lgtaip', 'lftaip'],
  datos: ['lgpdppso'],
  pi: ['lfda', 'lfppi'],
  vigencia: ['ccf'],
  modificaciones: ['ccf'],
  terminacion: ['ccf'],
  fortuito: ['ccf'],
  cesion: ['ccf'],
  avisos: ['ccf'],
  controversias: ['ccf'],
  anexos: ['ccf'],
  firmas: ['ccf', 'lgra']
};
