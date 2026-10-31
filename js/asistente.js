// Asistente: a partir del objeto, la contraparte y lo que se pretende obtener, recomienda el tipo de
// convenio, la competencia de la CCINSHAE conforme al RISS, los requisitos previos y la doctrina aplicable.

const CONTRAPARTES = {
  ins_hfr: 'Institutos Nacionales de Salud u Hospitales Federales de Referencia o de Alta Especialidad',
  apf: 'Otra dependencia o entidad de la Administración Pública Federal (p. ej., IMSS-BIENESTAR, BIRMEX)',
  estado: 'Entidad federativa o municipio',
  academica: 'Institución educativa o de investigación',
  privada: 'Empresa o persona moral privada',
  social: 'Organización de la sociedad civil o fundación',
  internacional: 'Organismo internacional o institución extranjera'
};

const FINALIDADES = {
  intercambio: 'Intercambio de servicios de atención médica o referencia y contrarreferencia',
  suministro: 'Suministro, almacenamiento o distribución de medicamentos e insumos',
  investigacion: 'Investigación científica y desarrollo tecnológico',
  ensenanza: 'Formación de recursos humanos y enseñanza de posgrado',
  recursos: 'Aportar o transferir recursos públicos',
  apoyo: 'Recibir apoyo, servicios o aportaciones de particulares o de la sociedad civil',
  bases: 'Fijar bases generales para instrumentos posteriores',
  ejecutar: 'Ejecutar acciones concretas de un convenio general vigente',
  modificar: 'Modificar un convenio vigente',
  compra: 'Adquirir bienes o contratar servicios a cambio de un pago'
};

// Fundamento del RISS por finalidad. Textos resumidos de las fracciones citadas.
const RISS_POR_FINALIDAD = {
  intercambio: [
    ['Art. 13, fr. V', 'La CCINSHAE establece el sistema de referencia y contrarreferencia entre las instituciones coordinadas y promueve la firma de convenios de colaboración para su cumplimiento.'],
    ['Art. 22, fr. V', 'La DG de Coordinación Médica de Alta Especialidad coadyuva en la celebración y seguimiento de convenios en materia de asistencia médica de alta especialidad.'],
    ['Art. 9, fr. XXVI y XXIX', 'La SISCoSAM promueve y gestiona convenios interinstitucionales para el intercambio de servicios.']
  ],
  suministro: [
    ['Art. 13, fr. XXXI', 'La CCINSHAE dirige la integración de los requerimientos de bienes y servicios de las entidades coordinadas para compras consolidadas.'],
    ['Art. 21, fr. X', 'La DGCOES supervisa la integración de esos requerimientos para los procedimientos de compras consolidadas.']
  ],
  investigacion: [
    ['Art. 13, fr. XIII', 'La CCINSHAE celebra convenios, bases y programas de colaboración en investigación y atención médica de alta especialidad con instituciones de los sectores salud y educativo y organismos nacionales o internacionales.'],
    ['Art. 13, fr. XIV', 'La CCINSHAE promueve la suscripción de convenios de colaboración de los INS y HFR entre sí y con otras instituciones en investigación científica y desarrollo tecnológico.'],
    ['Art. 23, fr. III', 'La DG de Medicina Traslacional coadyuva en la celebración de convenios con instituciones nacionales y extranjeras.'],
    ['Art. 28, fr. VII y IX', 'La DG de Políticas de Investigación en Salud establece vínculos y convenios con los sectores académico, empresarial e industrial y da seguimiento a los convenios de investigación.']
  ],
  ensenanza: [
    ['Art. 13, fr. XIII', 'La CCINSHAE celebra convenios en formación de recursos humanos y enseñanza de posgrado en salud de alta especialidad.'],
    ['Art. 23, fr. IX', 'La DG de Medicina Traslacional participa en convenios de formación de recursos humanos, posgrado o intercambio.'],
    ['Art. 19, fr. XIX', 'La DG de Calidad y Educación en Salud participa en la elaboración de convenios de educación en salud.']
  ],
  recursos: [
    ['Art. 21, fr. XIII y XIX', 'La DGCOES coordina acciones para promover mecanismos de financiamiento para la investigación, enseñanza y atención médica de alta especialidad.']
  ],
  apoyo: [
    ['Art. 18, fr. VIII', 'Las direcciones generales proponen convenios de concertación o inducción con organizaciones o instituciones diversas, previa opinión de la UGAJ.']
  ],
  bases: [
    ['Art. 13, fr. XIII', 'La CCINSHAE celebra convenios, bases de colaboración y programas generales o específicos de colaboración.']
  ],
  ejecutar: [
    ['Art. 13, fr. XIII', 'La CCINSHAE celebra programas generales o específicos de colaboración.']
  ],
  modificar: [],
  compra: [
    ['Art. 38, fr. III', 'La DG de lo Consultivo, Convenios y Contratos asesora en las contrataciones públicas de la LAASSP y de la Ley de Obras Públicas.']
  ]
};

const DOCTRINA = {
  legalidad: 'Principio de legalidad y competencia: la autoridad solo puede hacer aquello para lo que la norma la faculta expresamente; por eso cada firmante debe acreditar su facultad para suscribir (en la Secretaría de Salud, en el RISS).',
  voluntad: 'El convenio es un acuerdo de voluntades para crear, transferir, modificar o extinguir obligaciones; en la Administración Pública es un instrumento de colaboración entre instituciones dentro de sus atribuciones, distinto del contrato de adquisición que se rige por la LAASSP.',
  coordinacion: 'Coordinación: instrumento entre órdenes de gobierno (Federación y entidades federativas o municipios) para conjuntar acciones y, en su caso, recursos, sin que ninguno renuncie a su competencia.',
  concertacion: 'Concertación: instrumento con los sectores social y privado para la ejecución de acciones de interés público; obliga a las partes en sus términos.',
  marco: 'Convenio marco y específicos: el marco fija bases generales y los específicos concretan acciones, sin poder exceder ni contradecir al marco.',
  modificatorio: 'Modificación: se formaliza con la misma forma que el convenio original (convenio modificatorio suscrito por quienes tengan facultades); no puede alterar la naturaleza del objeto.',
  presupuesto: 'Anualidad y disponibilidad presupuestaria: los compromisos con recursos se sujetan al presupuesto autorizado de cada ejercicio fiscal y a la suficiencia presupuestaria acreditada.',
  internacional: 'Acuerdos con organismos internacionales o instituciones extranjeras: deben revisarse como posibles acuerdos interinstitucionales y contar con la intervención del área de relaciones internacionales.'
};

function contraparteDePartes(partes) {
  const nats = partes.map(p => p.naturaleza);
  if (nats.includes('estatal')) return 'estado';
  if (nats.includes('social')) return 'social';
  if (nats.includes('privada')) return 'privada';
  if (nats.includes('academica')) return 'academica';
  return '';
}

function analizarConvenio(e) {
  const f = new Set(e.finalidades || []);
  const c = e.contraparte || contraparteDePartes(e.partes);
  const razones = [];
  const advertencias = [];
  const doctrina = ['legalidad', 'voluntad'];
  let tipo;

  if (f.has('modificar')) {
    tipo = 'modificatorio';
    razones.push('se pretende modificar un convenio vigente');
    doctrina.push('modificatorio');
  } else if (f.has('ejecutar')) {
    tipo = 'especifico';
    razones.push('se ejecutarán acciones concretas de un convenio general vigente');
    doctrina.push('marco');
  } else if (f.has('bases')) {
    tipo = 'marco';
    razones.push('solo se fijarán bases generales que se desarrollarán en convenios específicos');
    doctrina.push('marco');
  } else if (c === 'estado') {
    tipo = 'coordinacion';
    razones.push('la contraparte es una entidad federativa u otro orden de gobierno');
    doctrina.push('coordinacion');
  } else if (c === 'privada' || c === 'social') {
    tipo = 'concertacion';
    razones.push('la contraparte pertenece al sector privado o social');
    doctrina.push('concertacion');
  } else {
    tipo = 'colaboracion';
    razones.push(c ? 'la contraparte es una institución pública, académica u organismo con el que se suman esfuerzos dentro de las atribuciones de cada parte' : 'las partes son instituciones que suman esfuerzos dentro de sus atribuciones');
  }

  const riss = [];
  const agrega = xs => xs.forEach(x => { if (!riss.some(r => r[0] === x[0])) riss.push(x); });
  agrega([['Art. 13, fr. I', 'La CCINSHAE ejerce la coordinación sectorial de la Secretaría con los Institutos Nacionales de Salud y los Hospitales Federales de Referencia.']]);
  f.forEach(x => agrega(RISS_POR_FINALIDAD[x] || []));
  if (c === 'estado' || c === 'privada' || c === 'social') {
    agrega([['Art. 18, fr. VIII', 'Las direcciones generales proponen acuerdos de coordinación con gobiernos estatales y convenios de colaboración, coordinación, concertación o inducción, previa opinión de la UGAJ.']]);
  }
  if (c === 'internacional') {
    agrega([['Art. 13, fr. XIII', 'La CCINSHAE celebra convenios con organismos nacionales o internacionales en las materias de alta especialidad.'], ['Art. 23, fr. III', 'Coadyuvancia con la DG de Relaciones Internacionales en convenios con instituciones extranjeras.']]);
    advertencias.push('Con un organismo internacional o institución extranjera, revisa si el instrumento es un acuerdo interinstitucional y solicita la intervención de la Dirección General de Relaciones Internacionales.');
    doctrina.push('internacional');
  }
  agrega([['Art. 38, fr. IV', 'La DG de lo Consultivo, Convenios y Contratos emite la opinión jurídica de los proyectos de convenios de las unidades administrativas.']]);

  if (f.has('compra')) {
    advertencias.push('Si el objeto es adquirir bienes o contratar servicios a cambio de un pago a un proveedor, el instrumento es un contrato sujeto a la LAASSP y a su procedimiento de contratación, no un convenio.');
  }
  if (f.has('suministro') && (c === 'apf' || c === 'ins_hfr')) {
    advertencias.push('El artículo 4, párrafo tercero, del Reglamento de la LAASSP (según documentos de trabajo) excluye de esa ley los convenios de colaboración para la cadena de suministro de medicamentos e insumos entre dependencias y entidades. Verifícalo en el DOF.');
  }
  if (f.has('recursos') || f.has('suministro')) doctrina.push('presupuesto');
  if (!lleno(e.objeto)) advertencias.push('Describe el objeto del convenio para precisar la recomendación.');
  if (!c) advertencias.push('Indica con quién se celebra el convenio.');
  if (!f.size) advertencias.push('Indica qué se pretende obtener con el convenio.');

  // Unidad firmante sugerida
  let firmante = 'ccinshae';
  let motivoFirmante = 'su titular celebra convenios en materia de alta especialidad y ejerce la coordinación sectorial (RISS art. 13, fr. I y XIII).';
  if (f.has('suministro') && !f.has('investigacion') && !f.has('ensenanza')) {
    firmante = 'dgcoes';
    motivoFirmante = 'supervisa la integración de requerimientos de las entidades coordinadas (RISS art. 21, fr. X) y suscribe convenios de sus atribuciones (art. 18, fr. XVIII).';
  }

  const requisitos = requisitosUnidadRiss(e.firmanteRiss || firmante).slice();
  requisitos.push('Opinión jurídica del proyecto por la DG de lo Consultivo, Convenios y Contratos (RISS art. 38, fr. IV).');
  if (f.has('recursos') || e.recursos === 'si') requisitos.push('Constancia de suficiencia presupuestaria de cada parte que aporte recursos.');
  requisitos.push('Documentos que acrediten el cargo y las facultades de cada firmante (nombramiento, poder o estatuto).');

  return { tipo, contraparte: c, razones, advertencias, riss, doctrina: doctrina.map(k => DOCTRINA[k]), firmante, motivoFirmante, requisitos };
}

function lleno(x) {
  return x !== undefined && x !== null && String(x).trim() !== '';
}
