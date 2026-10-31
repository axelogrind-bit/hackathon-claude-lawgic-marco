// Reglamento Interior de la Secretaría de Salud (RISS), publicado en el DOF el 27 de febrero de 2025.
// Datos tomados del texto del decreto publicado; reformas posteriores por verificar.
const RISS = {
  nombre: 'Reglamento Interior de la Secretaría de Salud',
  cita: 'Reglamento Interior de la Secretaría de Salud, publicado en el Diario Oficial de la Federación el 27 de febrero de 2025'
};

// Facultad genérica para suscribir convenios según el apartado del artículo 2 al que pertenece la unidad.
const RISS_SUSCRIPCION = {
  A: {
    articulo: '8, fracción XVII',
    requisitos: ['Opinión previa de la Unidad General de Asuntos Jurídicos (RISS art. 8, fr. XVII).']
  },
  B: {
    articulo: '18, fracción XVIII',
    requisitos: [
      'Opinión previa de la Unidad General de Asuntos Jurídicos (RISS art. 18, fr. XVIII).',
      'Acuerdo favorable del superior jerárquico (RISS art. 18, fr. XVIII).'
    ]
  },
  C: {
    articulo: '46, fracción VII',
    requisitos: []
  }
};

// Unidades del artículo 2 del RISS. `art` es el artículo de atribuciones propias; `fr`, las fracciones
// relacionadas con convenios cuando existen.
const UNIDADES_RISS = [
  { id: 'siscosam', g: 'la', nombre: 'Subsecretaría de Integración Sectorial y Coordinación de Servicios de Atención Médica', ap: 'A', fx: 'I', art: '9', fr: 'fracciones XXVI y XXIX' },
  { id: 'spsbp', g: 'la', nombre: 'Subsecretaría de Políticas de Salud y Bienestar Poblacional', ap: 'A', fx: 'II', art: '10' },
  { id: 'uaf', g: 'la', nombre: 'Unidad de Administración y Finanzas', ap: 'A', fx: 'III', art: '11', fr: 'fracción XXI' },
  { id: 'ugaj', g: 'la', nombre: 'Unidad General de Asuntos Jurídicos', ap: 'A', fx: 'IV', art: '12' },
  { id: 'ccinshae', g: 'la', nombre: 'Comisión Coordinadora de Institutos Nacionales de Salud y Hospitales de Alta Especialidad', siglas: 'CCINSHAE', ap: 'A', fx: 'V', art: '13', fr: 'fracciones V, XIII, XIV y XL' },
  { id: 'ucvps', g: 'la', nombre: 'Unidad Coordinadora de Vinculación y Participación Social', ap: 'A', fx: 'VI', art: '14' },
  { id: 'uaeis', g: 'la', nombre: 'Unidad de Análisis Económico e Investigación en Salud', ap: 'A', fx: 'VII', art: '15' },
  { id: 'uaais', g: 'la', nombre: 'Unidad de Acceso y Abasto de Insumos para la Salud', ap: 'A', fx: 'VIII', art: '16' },
  { id: 'dgccc', g: 'la', nombre: 'Dirección General de lo Consultivo, Convenios y Contratos', ap: 'B', fx: 'I', art: '38' },
  { id: 'dgcpc', g: 'la', nombre: 'Dirección General de lo Contencioso y Procedimientos Constitucionales', ap: 'B', fx: 'II', art: '40' },
  { id: 'dgces', g: 'la', nombre: 'Dirección General de Calidad y Educación en Salud', ap: 'B', fx: 'III', art: '19', fr: 'fracción XIX' },
  { id: 'dgcs', g: 'la', nombre: 'Dirección General de Comunicación Social', ap: 'B', fx: 'IV', art: '20' },
  { id: 'dgcmae', g: 'la', nombre: 'Dirección General de Coordinación Médica de Alta Especialidad', ap: 'B', fx: 'V', art: '22', fr: 'fracción V' },
  { id: 'dgmteeae', g: 'la', nombre: 'Dirección General de Medicina Traslacional y Estrategias de Enseñanza de Alta Especialidad', ap: 'B', fx: 'VI', art: '23', fr: 'fracciones III y IX' },
  { id: 'dgcsm', g: 'la', nombre: 'Dirección General de Coordinación de Servicios Médicos', ap: 'B', fx: 'VII', art: '36', fr: 'fracciones III y IV' },
  { id: 'dgdif', g: 'la', nombre: 'Dirección General de Desarrollo de la Infraestructura Física', ap: 'B', fx: 'VIII', art: '24', fr: 'fracción IV' },
  { id: 'dge', g: 'la', nombre: 'Dirección General de Epidemiología', ap: 'B', fx: 'IX', art: '35' },
  { id: 'dgelns', g: 'la', nombre: 'Dirección General de Estudios Legislativos y Normativa en Salud', ap: 'B', fx: 'X', art: '39' },
  { id: 'dged', g: 'la', nombre: 'Dirección General de Evaluación del Desempeño', ap: 'B', fx: 'XI', art: '25', fr: 'fracción IX' },
  { id: 'dgis', g: 'la', nombre: 'Dirección General de Información en Salud', ap: 'B', fx: 'XII', art: '26' },
  { id: 'dgmss', g: 'la', nombre: 'Dirección General de Modernización del Sector Salud', ap: 'B', fx: 'XIII', art: '49' },
  { id: 'dgcoes', g: 'la', nombre: 'Dirección General de Coordinación de Operaciones y Enlace Sectorial', siglas: 'DGCOES', ap: 'B', fx: 'XIV', art: '21', fr: 'fracciones II y X' },
  { id: 'dgpds', g: 'la', nombre: 'Dirección General de Planeación y Desarrollo en Salud', ap: 'B', fx: 'XV', art: '27', fr: 'fracciones XX y XXI' },
  { id: 'dgpois', g: 'la', nombre: 'Dirección General de Planeación y Optimización de Insumos para la Salud', ap: 'B', fx: 'XVI', art: '37' },
  { id: 'dgpis', g: 'la', nombre: 'Dirección General de Políticas de Investigación en Salud', ap: 'B', fx: 'XVII', art: '28', fr: 'fracciones VII y IX' },
  { id: 'dgpsp', g: 'la', nombre: 'Dirección General de Políticas en Salud Pública', ap: 'B', fx: 'XVIII', art: '30', fr: 'fracción XX' },
  { id: 'dgpyp', g: 'la', nombre: 'Dirección General de Programación y Presupuesto', ap: 'B', fx: 'XIX', art: '29' },
  { id: 'dgsnsp', g: 'la', nombre: 'Dirección General del Servicio Nacional de Salud Pública', ap: 'B', fx: 'XX', art: '43' },
  { id: 'dgrho', g: 'la', nombre: 'Dirección General de Recursos Humanos y Organización', ap: 'B', fx: 'XXI', art: '31', fr: 'fracciones XX y XXVI' },
  { id: 'dgrmsg', g: 'la', nombre: 'Dirección General de Recursos Materiales y Servicios Generales', ap: 'B', fx: 'XXII', art: '32', fr: 'fracción IV' },
  { id: 'dgri', g: 'la', nombre: 'Dirección General de Relaciones Internacionales', ap: 'B', fx: 'XXIII', art: '33' },
  { id: 'dgti', g: 'la', nombre: 'Dirección General de Tecnologías de la Información', ap: 'B', fx: 'XXIV', art: '34' },
  { id: 'stcnsb', g: 'el', nombre: 'Secretariado Técnico del Consejo Nacional de Salud para el Bienestar', ap: 'B', fx: 'XXV', art: '41' },
  { id: 'stconapra', g: 'el', nombre: 'Secretariado Técnico del Consejo Nacional para la Prevención de Accidentes', ap: 'B', fx: 'XXVI', art: '42', fr: 'fracción X' },
  { id: 'apbp', g: 'la', nombre: 'Administración del Patrimonio de la Beneficencia Pública', ap: 'C', fx: 'I', art: '47' },
  { id: 'cofepris', g: 'la', nombre: 'Comisión Federal para la Protección contra Riesgos Sanitarios', ap: 'C', fx: 'II' },
  { id: 'conamed', g: 'la', nombre: 'Comisión Nacional de Arbitraje Médico', ap: 'C', fx: 'III' },
  { id: 'conbioetica', g: 'la', nombre: 'Comisión Nacional de Bioética', ap: 'C', fx: 'IV' },
  { id: 'cenatra', g: 'el', nombre: 'Centro Nacional de Trasplantes', ap: 'C', fx: 'V', art: '51', fr: 'fracción IV' },
  { id: 'cnegsr', g: 'el', nombre: 'Centro Nacional de Equidad de Género, Salud Sexual y Reproductiva', ap: 'C', fx: 'VI', art: '48', fr: 'fracción XIV' },
  { id: 'censida', g: 'el', nombre: 'Centro Nacional para la Prevención y Control del VIH/SIDA y Hepatitis', ap: 'C', fx: 'VII', art: '53' },
  { id: 'censia', g: 'el', nombre: 'Centro Nacional para la Salud de la Infancia y la Adolescencia', ap: 'C', fx: 'VIII', art: '54' },
  { id: 'cnts', g: 'el', nombre: 'Centro Nacional de la Transfusión Sanguínea', ap: 'C', fx: 'IX', art: '50', fr: 'fracción VII' },
  { id: 'cenaprece', g: 'el', nombre: 'Centro Nacional de Prevención y Control de Enfermedades', ap: 'C', fx: 'X', art: '52', fr: 'fracción XVII' },
  { id: 'conasama', g: 'la', nombre: 'Comisión Nacional de Salud Mental y Adicciones', ap: 'C', fx: 'XI' }
];

const APARTADOS_RISS = { A: 'Subsecretarías y Unidades (art. 2, apartado A)', B: 'Unidades administrativas (art. 2, apartado B)', C: 'Órganos administrativos desconcentrados (art. 2, apartado C)' };

// Datos de declaración para una unidad del RISS: naturaleza, fundamento y facultades para suscribir.
function datosUnidadRiss(id) {
  const u = UNIDADES_RISS.find(x => x.id === id);
  if (!u) return null;
  const s = RISS_SUSCRIPCION[u.ap];
  const propio = u.art ? `${u.art}${u.fr ? ', ' + u.fr : ''}` : '';
  const arts = propio && u.art !== s.articulo.split(',')[0] ? `los artículos ${s.articulo}, y ${propio},` : `el artículo ${s.articulo},`;
  return {
    unidadRiss: u.id,
    denominacion: `la Secretaría de Salud, por conducto de ${u.g} ${u.nombre}`,
    siglas: 'SALUD',
    naturaleza: u.ap === 'C' ? 'desconcentrado' : 'unidad',
    fundNaturaleza: `el artículo 2, apartado ${u.ap}, fracción ${u.fx}, del ${RISS.cita}`,
    fundFacultades: `${arts} del ${RISS.cita}`
  };
}

function requisitosUnidadRiss(id) {
  const u = UNIDADES_RISS.find(x => x.id === id);
  return u ? RISS_SUSCRIPCION[u.ap].requisitos : [];
}
