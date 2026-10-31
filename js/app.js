(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PH = '<span class="ph">[●]</span>';
  const lleno = x => x !== undefined && x !== null && String(x).trim() !== '';
  const v = x => lleno(x) ? esc(String(x).trim()) : PH;
  const V = x => lleno(x) ? esc(String(x).trim().toUpperCase()) : PH;
  const lineas = s => (s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const sinEtiquetas = s => s.replace(/<[^>]+>/g, '');
  const mayuscula = s => s.charAt(0) === '<' ? s : s.charAt(0).toUpperCase() + s.slice(1);
  const LETRAS = 'abcdefghijklmnopqrstuvwxyz';
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const NUMEROS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  const UNIDADES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
    'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const DECENAS = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa' };
  const CLAVE = 'lawgic-convenios-borrador';
  const CLAVE_CATALOGO = 'lawgic-convenios-catalogo';

  const enLetra = n => {
    if (n < 30) return UNIDADES[n];
    if (n < 100) return DECENAS[Math.floor(n / 10)] + (n % 10 ? ' y ' + UNIDADES[n % 10] : '');
    return String(n);
  };
  const fecha = iso => {
    if (!lleno(iso)) return PH;
    const [a, m, d] = iso.split('-').map(Number);
    return `${d} de ${MESES[m - 1]} de ${a}`;
  };
  const fechaCierre = iso => {
    if (!lleno(iso)) return `a los ${PH} días del mes de ${PH} de ${PH}`;
    const [a, m, d] = iso.split('-').map(Number);
    return d === 1 ? `al primer día del mes de ${MESES[m - 1]} de ${a}` : `a los ${d} días del mes de ${MESES[m - 1]} de ${a}`;
  };
  const enumera = xs => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];
  const normaliza = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

  const parteVacia = () => ({
    denominacion: '', siglas: '', naturaleza: 'dependencia', fundNaturaleza: '', creacion: '',
    representante: '', cargo: '', nombramiento: '', fundFacultades: '', rfc: '', domicilio: '', correo: '',
    enlace: '', aporta: false, suficiencia: '', compromisos: ''
  });

  const estadoInicial = () => ({
    tipo: 'colaboracion', qModifica: false, qDeriva: false, qMarco: false,
    materia: '', principal: '', principalFecha: '', modificaciones: '',
    antecedentes: '', objeto: '', conjuntos: '',
    recursos: 'no', monto: '', fuente: '', condiciones: '',
    vigenciaIndef: false, vigenciaFin: '', diasAviso: '30',
    confidencialidad: true, datos: true, pi: false, cesion: false, anexos: '',
    jurisdiccion: 'los Tribunales Federales competentes con sede en la Ciudad de México',
    lugar: 'la Ciudad de México', fechaFirma: '', ejemplares: '',
    partes: [parteVacia(), parteVacia()]
  });

  const completar = x => {
    const e = Object.assign(estadoInicial(), x);
    e.partes = x.partes.map(p => Object.assign(parteVacia(), p));
    // Borradores de la versión anterior: una sola parte aportante.
    if (x.aportante !== undefined && e.recursos === 'si' && !e.partes.some(p => p.aporta) && e.partes[+x.aportante]) {
      e.partes[+x.aportante].aporta = true;
    }
    delete e.aportante;
    return e;
  };

  let estado = cargar() || estadoInicial();

  function cargar() {
    try {
      const x = JSON.parse(localStorage.getItem(CLAVE));
      return x && Array.isArray(x.partes) ? completar(x) : null;
    } catch (e) { return null; }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ }
  }

  // ---------- Catálogo de instituciones ----------

  const copia = x => JSON.parse(JSON.stringify(x));
  let catalogo = cargarCatalogo();
  let editando = null;

  function cargarCatalogo() {
    try {
      const x = JSON.parse(localStorage.getItem(CLAVE_CATALOGO));
      if (Array.isArray(x)) return x;
    } catch (e) { /* sin almacenamiento */ }
    return copia(CATALOGO_EJEMPLO);
  }
  function guardarCatalogo() {
    try { localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(catalogo)); } catch (e) { /* sin almacenamiento */ }
  }
  const nuevoId = () => 'f-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esEjemplo = f => String(f.id || '').startsWith('ej-');
  const etiquetaFicha = f => `${f.siglas || '[sin siglas]'} — ${f.denominacion || '[sin denominación]'}${esEjemplo(f) ? ' (ejemplo)' : ''}`;

  function fichaDeParte(p) {
    const f = {};
    CAMPOS_FICHA.forEach(c => { f[c.k] = p[c.k] || ''; });
    return f;
  }

  function agregarDesdeCatalogo(id) {
    const f = catalogo.find(x => x.id === id);
    if (!f) return;
    const datos = fichaDeParte(f);
    const vacia = estado.partes.findIndex(p => !lleno(p.denominacion) && !lleno(p.siglas) && !lleno(p.representante));
    if (vacia >= 0) estado.partes[vacia] = Object.assign(estado.partes[vacia], datos);
    else estado.partes.push(Object.assign(parteVacia(), datos));
    renderPartes();
    actualizar();
    aviso(`${f.siglas || 'Institución'} agregada al convenio.`);
  }

  function renderCatalogoSelect() {
    $('#cat-sel').innerHTML = catalogo.length
      ? catalogo.map(f => `<option value="${esc(f.id)}">${esc(etiquetaFicha(f))}</option>`).join('')
      : '<option value="">El catálogo está vacío</option>';
  }

  function renderCatalogo() {
    $('#cat-lista').innerHTML = catalogo.length
      ? `<table class="rev"><thead><tr><th>Siglas</th><th>Denominación</th><th>Naturaleza</th><th>Representante</th><th></th></tr></thead><tbody>${
        catalogo.map(f => `<tr><td>${esc(f.siglas || '')}${esEjemplo(f) ? ' <span class="badge pv">Ejemplo</span>' : ''}</td><td>${esc(f.denominacion || '')}</td><td>${esc(NATURALEZAS[f.naturaleza] ? NATURALEZAS[f.naturaleza].etiqueta : '')}</td><td>${esc(f.representante || '')}<br><span class="ayuda">${esc(f.cargo || '')}</span></td><td class="celda-acciones"><button type="button" class="sec" data-editar="${esc(f.id)}">Editar</button> <button type="button" class="sec" data-eliminar="${esc(f.id)}">Eliminar</button></td></tr>`).join('')
      }</tbody></table>`
      : '<p class="ayuda">El catálogo está vacío. Agrega una ficha o importa un archivo JSON.</p>';
    renderCatalogoSelect();
  }

  function abrirEditor(f) {
    editando = f ? f.id : null;
    const datos = f || {};
    const opts = Object.entries(NATURALEZAS).map(([k, n]) => `<option value="${k}"${datos.naturaleza === k ? ' selected' : ''}>${n.etiqueta}</option>`).join('');
    $('#cat-editor').innerHTML = `<fieldset><legend>${f ? 'Editar ficha' : 'Nueva ficha'}</legend>${
      CAMPOS_FICHA.map(c => c.tipo === 'naturaleza'
        ? `<label>${c.etiqueta}<select data-f="naturaleza">${opts}</select></label>`
        : `<label>${c.etiqueta}<input data-f="${c.k}" value="${esc(datos[c.k] || '')}" placeholder="${esc(c.ayuda || '')}"></label>`).join('')
    }<p id="error-ficha" class="error" role="alert"></p><div class="acciones"><button type="button" id="ficha-guardar">Guardar ficha</button><button type="button" class="sec" id="ficha-cancelar">Cancelar</button></div></fieldset>`;
    $('#cat-editor').classList.remove('oculto');
    $('#cat-editor input').focus();
  }

  function guardarFicha() {
    const f = {};
    $$('#cat-editor [data-f]').forEach(el => { f[el.dataset.f] = el.value.trim(); });
    if (!f.denominacion || !f.siglas) {
      $('#error-ficha').textContent = 'Escribe al menos la denominación y cómo se le referirá.';
      return;
    }
    const i = catalogo.findIndex(x => x.id === editando);
    if (i >= 0) catalogo[i] = Object.assign({ id: editando.startsWith('ej-') ? nuevoId() : editando }, f);
    else catalogo.push(Object.assign({ id: nuevoId() }, f));
    guardarCatalogo();
    cerrarEditor();
    renderCatalogo();
    aviso('Ficha guardada.');
  }

  function cerrarEditor() {
    editando = null;
    $('#cat-editor').innerHTML = '';
    $('#cat-editor').classList.add('oculto');
  }

  function renderSugerencia() {
    const s = sugerirTipo(estado);
    const t = TIPOS[s.tipo];
    const coincide = s.tipo === estado.tipo;
    $('#sugerencia-tipo').innerHTML = `<p><b>Tipo sugerido: ${esc(t.etiqueta)}</b>, porque ${esc(s.razon)}.</p><ul>${t.normas.map(badge).join('')}</ul>${
      coincide ? '<p class="ayuda">Es el tipo seleccionado.</p>' : `<button type="button" id="aplicar-tipo">Usar tipo sugerido</button>`}`;
    $('#sugerencia-tipo').classList.toggle('distinto', !coincide);
  }

  // ---------- Generación del convenio ----------

  const siglas = p => lleno(p.siglas) ? `“${esc(p.siglas.trim().toUpperCase())}”` : `“${PH}”`;
  const CONV = '“CONVENIO”';

  function generar(e) {
    const t = TIPOS[e.tipo];
    const P = e.partes;
    const html = [];
    const fund = [];
    const alertas = [];
    const modif = e.tipo === 'modificatorio';
    const conRecursos = !modif && e.recursos === 'si';
    const aportantes = conRecursos ? P.filter(p => p.aporta) : [];

    let titulo = t.titulo;
    if (modif) titulo += ' AL ' + V(e.principal);
    else if (lleno(e.materia)) titulo += ' ' + V(e.materia);

    const partesTxt = P.map((p, i) => {
      const pre = i === 0 ? 'POR UNA PARTE' : (i === P.length - 1 ? 'Y POR OTRA PARTE' : 'POR OTRA PARTE');
      return `${pre}, ${V(p.denominacion)}, EN LO SUCESIVO ${siglas(p)}, POR CONDUCTO DE SU ${V(p.cargo)}, ${V(p.representante)}`;
    }).join('; ');

    const antecedentes = lineas(e.antecedentes).map(esc);
    if (t.principal) {
      antecedentes.unshift(`Con fecha ${fecha(e.principalFecha)}, “LAS PARTES” celebraron el ${v(e.principal)}, en lo sucesivo el “CONVENIO PRINCIPAL”.`);
    }
    const hayAnt = antecedentes.length > 0;

    html.push(`<p class="proemio">${titulo}${hayAnt ? '' : ', EN LO SUCESIVO EL “CONVENIO”,'} QUE CELEBRAN, ${partesTxt}; A QUIENES, CUANDO ACTÚEN DE MANERA CONJUNTA, SE LES DENOMINARÁ “LAS PARTES”, SUJETÁNDOSE AL TENOR DE ${hayAnt ? 'LOS SIGUIENTES ANTECEDENTES, ' : 'LAS SIGUIENTES '}DECLARACIONES Y CLÁUSULAS:</p>`);
    fund.push({ t: 'Tipo de instrumento: ' + t.etiqueta.toLowerCase(), n: t.normas.concat(FUNDAMENTO_SECCION.tipo.filter(x => !t.normas.includes(x))) });

    if (hayAnt) {
      html.push('<h2>A N T E C E D E N T E S</h2>');
      antecedentes.forEach((a, i) => html.push(`<p>${i + 1}. ${a}</p>`));
      html.push(`<p>En virtud de lo anterior, “LAS PARTES” celebran el presente ${t.nombre}, en lo sucesivo el ${CONV}, al tenor de las siguientes:</p>`);
    }

    // Declaraciones
    html.push('<h2>D E C L A R A C I O N E S</h2>');
    P.forEach((p, i) => {
      const r = ROMANOS[i];
      const d = [];
      const nat = NATURALEZAS[p.naturaleza] ? NATURALEZAS[p.naturaleza].texto : PH;
      d.push(`Es ${nat}, de conformidad con ${v(p.fundNaturaleza)}${lleno(p.creacion) ? ', y su creación consta en ' + esc(p.creacion.trim()) : ''}.`);
      d.push(`${mayuscula(v(p.representante))}, en su carácter de ${v(p.cargo)}, acredita dicho cargo con ${v(p.nombramiento)}, y acredita su personalidad y facultades para suscribir el presente ${CONV} de conformidad con ${v(p.fundFacultades)}, mismas que manifiesta no le han sido revocadas, modificadas ni limitadas en forma alguna.`);
      if (lleno(p.rfc)) d.push(`Cuenta con el Registro Federal de Contribuyentes ${esc(p.rfc.trim().toUpperCase())}.`);
      d.push(`Para los fines y efectos legales del presente ${CONV}, señala como domicilio el ubicado en ${v(p.domicilio)}, y como correo electrónico institucional ${v(p.correo)}.`);
      if (conRecursos && p.aporta) {
        d.push(`Cuenta con suficiencia presupuestaria para cumplir con las obligaciones a su cargo derivadas del presente ${CONV}, conforme a su presupuesto autorizado para el ejercicio fiscal correspondiente${lleno(p.suficiencia) ? ', de conformidad con ' + esc(p.suficiencia.trim()) : ''}, sujetándose en todo momento a la disponibilidad de recursos y a las disposiciones aplicables en materia de programación, presupuestación y ejercicio del gasto público.`);
      }
      html.push(`<p class="decl-h">${r}. ${siglas(p)} declara que:</p>`);
      d.forEach((x, j) => html.push(`<p class="decl">${r}.${j + 1}. ${x}</p>`));
    });
    const rc = ROMANOS[P.length];
    html.push(`<p class="decl-h">${rc}. “LAS PARTES” declaran que:</p>`);
    html.push(`<p class="decl">${rc}.1. Manifiestan que la celebración del presente ${CONV} se realiza de manera libre y voluntaria, sin mediar error, dolo, mala fe o cualquier otro vicio del consentimiento que pudiera afectar su validez.</p>`);
    html.push(`<p class="decl">${rc}.2. Se reconocen mutuamente la personalidad jurídica, capacidad legal, atribuciones y facultades con las que comparecen para la celebración del presente ${CONV}, y manifiestan que no existe impedimento legal alguno para obligarse en sus términos, al tenor de las siguientes:</p>`);
    fund.push({ t: 'Declaraciones: naturaleza jurídica', n: FUNDAMENTO_SECCION.naturaleza });
    fund.push({ t: 'Declaraciones: cargo y facultades de quien suscribe', n: FUNDAMENTO_SECCION.facultades });
    if (aportantes.length) fund.push({ t: 'Declaraciones: suficiencia presupuestaria', n: FUNDAMENTO_SECCION.recursos });

    // Cláusulas
    html.push('<h2>C L Á U S U L A S</h2>');
    let k = 0;
    const cl = (tit, cuerpo, secs) => {
      const ord = ORDINALES[k++];
      html.push(`<p class="cl-t"><b>${ord}. ${tit}.</b></p>`);
      [].concat(cuerpo).forEach(x => html.push(`<p class="cl">${x}</p>`));
      const normas = [].concat(secs || []).flatMap(s => FUNDAMENTO_SECCION[s]).filter((x, i, a) => a.indexOf(x) === i);
      if (normas.length) fund.push({ t: `Cláusula ${ord.toLowerCase()}: ${sinEtiquetas(tit).toLowerCase()}`, n: normas });
    };
    const lista = items => items.map((x, i) => `<br>${LETRAS[i] || '-'}) ${esc(x)}${i === items.length - 1 ? '.' : ';'}`).join('');

    if (modif) {
      cl('OBJETO', `El presente ${CONV} tiene por objeto modificar el “CONVENIO PRINCIPAL”, en los términos que se establecen en la cláusula siguiente.`, 'modificaciones');
      const m = lineas(e.modificaciones);
      cl('MODIFICACIONES', `“LAS PARTES” acuerdan modificar el “CONVENIO PRINCIPAL” en los términos siguientes:${m.length ? lista(m) : ' ' + PH}`, 'modificaciones');
      cl('SUBSISTENCIA', `Las cláusulas del “CONVENIO PRINCIPAL” que no se modifican mediante el presente instrumento subsisten en sus términos.`, 'modificaciones');
      cl('VIGENCIA', `El presente ${CONV} surtirá efectos a partir de la fecha de su firma y estará vigente mientras lo esté el “CONVENIO PRINCIPAL”.`, 'vigencia');
    } else {
      cl('OBJETO', `El presente ${CONV} tiene por objeto ${v(e.objeto)}${lleno(e.objeto) && !/[.;]$/.test(e.objeto.trim()) ? '.' : ''}`, 'objeto');
      if (e.tipo === 'especifico') {
        cl('RELACIÓN CON EL CONVENIO PRINCIPAL', `El presente instrumento deriva del “CONVENIO PRINCIPAL”, al que se sujeta en todo lo no previsto expresamente en este ${CONV}.`, 'compromisos');
      }

      if (conRecursos) {
        const quien = aportantes.length ? enumera(aportantes.map(siglas)) : PH;
        const cond = lineas(e.condiciones);
        cl('MECANISMO FINANCIERO', [
          `${quien} ${aportantes.length > 1 ? 'aportarán' : 'aportará'} ${v(e.monto)}, con cargo a ${v(e.fuente)}, conforme a las disposiciones presupuestarias, contables, fiscales y administrativas aplicables${cond.length ? ', bajo las condiciones siguientes:' + lista(cond) : '.'}`,
          `El ejercicio de los recursos queda sujeto a la disponibilidad presupuestaria y a las disposiciones aplicables en materia de ejercicio, control, comprobación y transparencia del gasto público.`
        ], 'recursos');
      } else {
        cl('RECURSOS', `El presente ${CONV} no implica transferencia de recursos entre “LAS PARTES”. Cada una cubrirá con su propio presupuesto los gastos que le corresponda erogar para el cumplimiento de sus compromisos, sujeto a su disponibilidad presupuestaria.`, 'recursos');
      }

      const fin = e.vigenciaIndef ? 'tendrá una vigencia indefinida' : `estará vigente hasta el ${fecha(e.vigenciaFin)}`;
      cl('VIGENCIA', [
        `El presente ${CONV} surtirá efectos a partir de la fecha de su firma y ${fin}.${conRecursos ? ' Las obligaciones financieras estarán sujetas a la disponibilidad y suficiencia presupuestaria autorizada de “LAS PARTES”.' : ''}`,
        `Las obligaciones pendientes de cumplimiento a la conclusión de la vigencia subsistirán hasta su total cumplimiento. También subsistirán, por su naturaleza, las obligaciones relativas a confidencialidad, protección de datos personales y solución de controversias.`
      ], 'vigencia');

      if (P.some(p => lleno(p.enlace))) {
        cl('RESPONSABLES DE SEGUIMIENTO', `Para el seguimiento y cumplimiento del presente ${CONV}, “LAS PARTES” designan como responsables: ${P.map(p => `por ${siglas(p)}, ${v(p.enlace)}`).join('; ')}. Los responsables podrán ser sustituidos mediante aviso por escrito a las demás partes.`, 'enlaces');
      } else {
        cl('RESPONSABLES DE SEGUIMIENTO', `Cada una de “LAS PARTES” designará por escrito a las personas servidoras públicas responsables del seguimiento, coordinación operativa e información del presente ${CONV}, y lo hará del conocimiento de las demás.`, 'enlaces');
      }

      const conComp = P.filter(p => lineas(p.compromisos).length);
      conComp.forEach(p => cl(`COMPROMISOS DE ${siglas(p)}`, `${siglas(p)} se compromete a:${lista(lineas(p.compromisos))}`, 'compromisos'));
      const cj = lineas(e.conjuntos);
      if (cj.length) cl('COMPROMISOS CONJUNTOS', `“LAS PARTES” se comprometen a:${lista(cj)}`, 'compromisos');
      if (!conComp.length && !cj.length) cl('COMPROMISOS DE “LAS PARTES”', PH, 'compromisos');

      if (e.confidencialidad && e.datos) {
        cl('CONFIDENCIALIDAD Y PROTECCIÓN DE DATOS PERSONALES', `“LAS PARTES” deberán guardar confidencialidad respecto de la información que tenga tal carácter conforme a las disposiciones aplicables, así como proteger los datos personales que traten con motivo del presente ${CONV}, en términos de la legislación aplicable en materia de protección de datos personales. La información que intercambien sólo podrá utilizarse para el cumplimiento del objeto del presente ${CONV}.`, ['confidencialidad', 'datos']);
      } else if (e.confidencialidad) {
        cl('CONFIDENCIALIDAD', `“LAS PARTES” deberán guardar confidencialidad respecto de la información que tenga tal carácter conforme a las disposiciones aplicables en materia de transparencia y acceso a la información pública, y sólo podrán utilizarla para el cumplimiento del objeto del presente ${CONV}.`, 'confidencialidad');
      } else if (e.datos) {
        cl('PROTECCIÓN DE DATOS PERSONALES', `“LAS PARTES” deberán proteger los datos personales que traten con motivo del presente ${CONV}, en términos de la legislación aplicable en materia de protección de datos personales, y sólo podrán utilizarlos para el cumplimiento de su objeto.`, 'datos');
      }
      if (e.pi) {
        cl('PROPIEDAD INTELECTUAL', `La titularidad de los derechos de propiedad intelectual sobre los productos que se generen con motivo del presente ${CONV} corresponderá a la parte que los produzca; los que se generen de forma conjunta corresponderán a “LAS PARTES” en proporción a su participación, conforme a la legislación aplicable.`, 'pi');
      }

      cl('RESPONSABILIDAD LABORAL', `El personal contratado, empleado, comisionado o asignado por cada una de “LAS PARTES” para la ejecución del presente ${CONV} mantendrá relación laboral exclusivamente con la parte que lo contrató, empleó, comisionó o asignó, sin que la contraparte pueda ser considerada patrón sustituto, intermediario, responsable solidario o beneficiario laboral. Cada parte asumirá plena responsabilidad laboral, civil, administrativa, de seguridad social y de cualquier otra naturaleza respecto de su personal.`, 'laboral');
      cl('MODIFICACIONES AL CONVENIO', `El presente ${CONV} sólo podrá modificarse mediante convenio modificatorio suscrito por “LAS PARTES”, previa solicitud por escrito que especifique el objeto, justificación, alcance y efectos de la modificación. Las modificaciones surtirán efectos a partir de su firma.`, 'modificaciones');
      cl('CASO FORTUITO O FUERZA MAYOR', `“LAS PARTES” no serán responsables por el incumplimiento total o parcial de las obligaciones derivadas del presente ${CONV}, únicamente en la medida y durante el tiempo en que dicho incumplimiento sea consecuencia directa de un caso fortuito o fuerza mayor debidamente acreditado. La parte afectada deberá notificarlo a las demás dentro de los cinco días hábiles siguientes a que tenga conocimiento del evento, acompañando la evidencia disponible. Las actividades se reanudarán cuando desaparezcan las causas que lo motivaron.`, 'fortuito');
      const dias = parseInt(e.diasAviso, 10);
      cl('TERMINACIÓN ANTICIPADA', `El presente ${CONV} podrá darse por terminado anticipadamente por cualquiera de “LAS PARTES”, previa notificación por escrito a las demás con al menos ${dias > 0 ? `${dias} (${enLetra(dias)})` : PH} días naturales de anticipación, en cuyo caso se tomarán las medidas necesarias para concluir las acciones que se hubieran iniciado${conRecursos ? ' y se cubrirán las obligaciones efectivamente devengadas' : ''}.`, 'terminacion');
      if (e.cesion) {
        cl('CESIÓN DE DERECHOS', `Ninguna de “LAS PARTES” podrá ceder o transferir a terceros los derechos y obligaciones derivados del presente ${CONV}.`, 'cesion');
      }
      cl('AVISOS, COMUNICACIONES Y NOTIFICACIONES', [
        `Todos los avisos, comunicaciones y notificaciones con efectos jurídicos derivados del presente ${CONV} deberán realizarse por escrito, con acuse de recibo, en los domicilios señalados en las declaraciones, o mediante correo electrónico institucional con confirmación de recepción.`,
        `Cualquier cambio de domicilio, dirección electrónica o persona responsable deberá notificarse a las demás partes con al menos cinco días hábiles de anticipación. A falta de notificación, las comunicaciones realizadas en los domicilios o correos declarados se tendrán por válidamente efectuadas.`
      ], 'avisos');
    }

    cl('SOLUCIÓN DE CONTROVERSIAS', [
      `“LAS PARTES” convienen en resolver, de buena fe y mediante mecanismos de coordinación, comunicación y conciliación institucional, las dudas, diferencias o controversias derivadas de la interpretación, ejecución o cumplimiento del presente ${CONV}. En primera instancia, las controversias serán atendidas por los responsables de seguimiento.`,
      `De no alcanzarse solución mediante los mecanismos anteriores, “LAS PARTES” se sujetarán a las leyes federales y a la jurisdicción de ${v(e.jurisdiccion)}, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.`,
      `La tramitación de una controversia no suspenderá por sí misma la ejecución de las obligaciones no controvertidas.`
    ], 'controversias');

    const anexos = modif ? [] : lineas(e.anexos);
    if (anexos.length) cl('ANEXOS', `Forman parte integrante del presente ${CONV} los anexos siguientes:${lista(anexos)}`, 'anexos');

    const n = parseInt(e.ejemplares, 10);
    html.push(`<p class="cierre">Leído que fue el presente ${t.nombre} por quienes en él intervienen y enteradas “LAS PARTES” de su contenido y alcance legal, lo suscriben${n > 0 ? ` en ${NUMEROS[n] || n} ejemplares` : ''} en ${v(e.lugar)}, ${fechaCierre(e.fechaFirma)}.</p>`);
    fund.push({ t: 'Cierre y firmas', n: FUNDAMENTO_SECCION.firmas });

    html.push(`<div class="firmas">${P.map(p => `<div class="firma"><p class="firma-por">Por ${siglas(p)}</p><p class="firma-linea">${v(p.representante)}<br>${v(p.cargo)}</p></div>`).join('')}</div>`);

    // Alertas de datos faltantes
    if (t.principal && !lleno(e.principal)) alertas.push('Indica el convenio principal.');
    if (!modif && !lleno(e.objeto)) alertas.push('Falta el objeto.');
    if (modif && !lineas(e.modificaciones).length) alertas.push('Faltan las modificaciones.');
    P.forEach((p, i) => {
      const f = ['denominacion', 'siglas', 'representante', 'cargo', 'nombramiento', 'fundFacultades', 'domicilio', 'correo'].filter(c => !lleno(p[c]));
      if (f.length) alertas.push(`Parte ${i + 1}: faltan ${f.map(c => ETIQUETAS[c]).join(', ')}.`);
    });
    if (conRecursos) {
      if (!aportantes.length) alertas.push('Recursos: marca qué parte o partes aportan recursos.');
      if (!lleno(e.monto) || !lleno(e.fuente)) alertas.push('Recursos: faltan monto o fuente de los recursos.');
      if (e.vigenciaIndef) alertas.push('Hay recursos con vigencia indefinida: verifica la vigencia frente al ejercicio fiscal.');
    }
    if (!modif && !e.vigenciaIndef && !lleno(e.vigenciaFin)) alertas.push('Falta la fecha de término de la vigencia.');
    if (!lleno(e.fechaFirma)) alertas.push('Falta la fecha de firma.');

    return { html: html.join('\n'), fund, alertas };
  }

  const ETIQUETAS = {
    denominacion: 'denominación', siglas: 'siglas', representante: 'representante', cargo: 'cargo',
    nombramiento: 'nombramiento', fundFacultades: 'fundamento de facultades', domicilio: 'domicilio', correo: 'correo'
  };

  // ---------- Interfaz del generador ----------

  function campo(i, k, etiqueta, ayuda, area) {
    const val = esc(estado.partes[i][k] || '');
    const at = `data-p="${i}" data-k="${k}" placeholder="${esc(ayuda || '')}"`;
    return area
      ? `<label>${etiqueta}<textarea ${at} rows="3">${val}</textarea></label>`
      : `<label>${etiqueta}<input ${at} value="${val}"></label>`;
  }

  function renderPartes() {
    const c = $('#partes');
    c.innerHTML = '';
    estado.partes.forEach((p, i) => {
      const f = document.createElement('fieldset');
      f.className = 'parte';
      const opts = Object.entries(NATURALEZAS).map(([k, n]) => `<option value="${k}"${p.naturaleza === k ? ' selected' : ''}>${n.etiqueta}</option>`).join('');
      const titulo = lleno(p.siglas) ? `Parte ${i + 1}: ${esc(p.siglas)}` : `Parte ${i + 1}`;
      f.innerHTML = `<legend>${titulo}</legend>
        <details${lleno(p.denominacion) ? '' : ' open'}><summary>Datos de la institución</summary>
        ${CAMPOS_FICHA.map(cf => cf.tipo === 'naturaleza'
          ? `<label>${cf.etiqueta}<select data-p="${i}" data-k="naturaleza">${opts}</select></label>`
          : campo(i, cf.k, cf.etiqueta, cf.ayuda)).join('')}
        </details>
        <label class="check solo-recursos"><input type="checkbox" data-p="${i}" data-k="aporta"${p.aporta ? ' checked' : ''}> Aporta recursos</label>
        <div class="solo-recursos">${campo(i, 'suficiencia', 'Documento de suficiencia presupuestaria (opcional)', 'oficio y fecha')}</div>
        ${campo(i, 'compromisos', 'Compromisos (uno por línea)', 'Proporcionar …', true)}
        <div class="acciones">
          <button type="button" class="sec" data-guardar="${i}">Guardar en catálogo</button>
          ${i > 0 ? `<button type="button" class="sec" data-subir="${i}">Subir</button>` : ''}
          ${estado.partes.length > 2 ? `<button type="button" class="sec" data-quitar="${i}">Quitar parte</button>` : ''}
        </div>`;
      c.appendChild(f);
    });
    visibilidad();
  }

  function cargarGenerales() {
    $$('#form [data-k]:not([data-p])').forEach(el => {
      const x = estado[el.dataset.k];
      if (el.type === 'checkbox') el.checked = !!x;
      else el.value = x === undefined || x === null ? '' : x;
    });
  }

  function visibilidad() {
    const t = TIPOS[estado.tipo];
    $$('.solo-principal').forEach(el => el.classList.toggle('oculto', !t.principal));
    $$('.solo-modif').forEach(el => el.classList.toggle('oculto', estado.tipo !== 'modificatorio'));
    $$('.no-modif').forEach(el => el.classList.toggle('oculto', estado.tipo === 'modificatorio'));
    $$('.solo-recursos').forEach(el => el.classList.toggle('oculto', estado.recursos !== 'si' || estado.tipo === 'modificatorio'));
    $('#vigenciaFin').disabled = !!estado.vigenciaIndef;
    $('#nota-tipo').textContent = t.nota;
  }

  function badge(id) {
    const n = NORMATIVA[id];
    return `<li><span class="badge ${n.estado}">${ESTADOS[n.estado]}</span> ${esc(n.nombre)}${n.ref ? ' — ' + esc(n.ref) : ''}${n.fecha ? ' (' + esc(n.fecha) + ')' : ''}</li>`;
  }

  function actualizar() {
    const r = generar(estado);
    $('#doc').innerHTML = r.html;
    $('#fund').innerHTML = r.fund.map(f => `<div class="fund-item"><h4>${esc(f.t)}</h4><ul>${f.n.map(badge).join('')}</ul></div>`).join('');
    const pend = $('#doc').querySelectorAll('.ph').length;
    renderSugerencia();
    $('#alertas').innerHTML = r.alertas.length || pend
      ? `<p><b>${pend}</b> datos pendientes en el documento.</p><ul>${r.alertas.map(a => `<li>${esc(a)}</li>`).join('')}</ul>`
      : '<p>Sin datos pendientes.</p>';
    guardar();
  }

  function onInput(ev) {
    const el = ev.target;
    const k = el.dataset.k;
    if (!k) return;
    const val = el.type === 'checkbox' ? el.checked : el.value;
    if (el.dataset.p !== undefined) estado.partes[+el.dataset.p][k] = val;
    else estado[k] = val;
    if (['tipo', 'recursos', 'vigenciaIndef'].includes(k)) visibilidad();
    actualizar();
  }

  // ---------- Exportación ----------

  const WORD_CSS = 'body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.4;text-align:justify}' +
    'h1{font-size:12pt;text-align:center}h2{font-size:11pt;text-align:center;margin:14pt 0 8pt}' +
    'p{margin:0 0 8pt}.proemio{font-weight:bold}.decl-h{font-weight:bold}.cl-t{margin:10pt 0 4pt}.ph{background:#ffff00}' +
    '.firmas{margin-top:24pt}.firma{text-align:center;margin:0 0 30pt}' +
    '.firma-por{font-weight:bold;margin-bottom:36pt}.firma-linea{border-top:1px solid #000;padding-top:4pt;margin:0 25%}' +
    'table.ced{width:100%;border-collapse:collapse}table.ced th,table.ced td{border:1px solid #000;padding:4pt;font-size:9pt;text-align:left;vertical-align:top}';

  function descargar(nombre, contenido, tipo) {
    const b = new Blob([contenido], { type: tipo });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function word(cuerpo, titulo) {
    return String.fromCharCode(65279) + '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      `<head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${WORD_CSS}</style></head><body>${cuerpo}</body></html>`;
  }

  function aviso(msg) {
    const el = $('#aviso');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => el.classList.remove('visible'), 2500);
  }

  // ---------- Revisión ----------

  let ultimaRevision = null;

  async function leerArchivo(file) {
    if (/\.docx$/i.test(file.name)) {
      if (!window.mammoth) throw new Error('No se pudo cargar el lector de .docx. Pega el texto del convenio.');
      const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return r.value;
    }
    return file.text();
  }

  function revisar() {
    const texto = $('#texto-rev').value;
    if (!texto.trim()) {
      $('#error-rev').textContent = 'Pega el texto del convenio o carga un archivo.';
      return;
    }
    $('#error-rev').textContent = '';
    const t = normaliza(texto);
    const res = REVISION.map(c => Object.assign({}, c, { ok: c.test(t) }));
    ultimaRevision = res;
    const obs = res.filter(r => !r.ok);
    const cuenta = c => obs.filter(r => r.clasificacion === c).length;
    $('#resumen-rev').innerHTML =
      `<span class="chip critico">Críticas: ${cuenta('Crítico')}</span>` +
      `<span class="chip relevante">Relevantes: ${cuenta('Relevante')}</span>` +
      `<span class="chip preventivo">Preventivas: ${cuenta('Preventivo')}</span>` +
      `<span class="chip ok">Elementos presentes: ${res.length - obs.length} de ${res.length}</span>`;
    $('#tabla-rev').innerHTML = `<table class="rev"><thead><tr><th>No.</th><th>Elemento</th><th>Resultado</th><th>Fundamento</th><th>Redacción sugerida</th></tr></thead><tbody>${
      res.map((r, i) => `<tr class="${r.ok ? 'fila-ok' : ''}"><td>${i + 1}</td><td>${esc(r.elemento)}</td><td>${r.ok
        ? '<span class="chip ok">Presente</span>'
        : `<span class="chip ${normaliza(r.clasificacion)}">${r.clasificacion}</span><br>${esc(r.observacion)}`}</td><td><ul>${FUNDAMENTO_SECCION[r.seccion].map(badge).join('')}</ul></td><td>${r.ok ? '' : esc(r.sugerencia)}</td></tr>`).join('')
    }</tbody></table>`;
    $('#exportar-rev').disabled = false;
  }

  function cedula() {
    if (!ultimaRevision) return;
    const obs = ultimaRevision.filter(r => !r.ok);
    const hoy = new Date();
    const filas = obs.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.elemento)}</td><td>${r.clasificacion}</td><td>${esc(r.observacion)}</td><td>${FUNDAMENTO_SECCION[r.seccion].map(id => esc(NORMATIVA[id].nombre) + ' (' + ESTADOS[NORMATIVA[id].estado].toLowerCase() + ')').join('; ')}</td><td>${esc(r.sugerencia)}</td></tr>`).join('');
    const cuerpo = `<h1>CÉDULA DE OBSERVACIONES</h1>
      <p><b>Documento revisado:</b> ${PH}</p>
      <p><b>Fecha:</b> ${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}</p>
      <p><b>Alcance:</b> revisión automática de elementos mínimos por palabras clave. Cada observación debe confirmarse con la lectura del instrumento. Clasificación: Crítico (validez, partes, objeto, recursos o capacidad para obligar), Relevante (ambigüedad o riesgo de ejecución), Preventivo (certeza o control).</p>
      ${obs.length ? `<table class="ced"><tr><th>No.</th><th>Elemento</th><th>Clasificación</th><th>Observación</th><th>Fundamento</th><th>Redacción sugerida</th></tr>${filas}</table>` : '<p>No se detectaron omisiones en los elementos revisados.</p>'}
      <p><i>Verificar la vigencia de cada norma en el Diario Oficial de la Federación antes de citarla.</i></p>`;
    descargar('cedula-de-observaciones.doc', word(cuerpo, 'Cédula de observaciones'), 'application/msword');
  }

  // ---------- Marco normativo ----------

  function renderNormativa() {
    $('#tabla-normas').innerHTML = `<table class="rev"><thead><tr><th>Norma</th><th>Referencia</th><th>Uso en convenios</th><th>Estado</th></tr></thead><tbody>${
      Object.values(NORMATIVA).map(n => `<tr><td>${esc(n.nombre)}</td><td>${esc(n.ref || '—')}</td><td>${esc(n.uso)}</td><td><span class="badge ${n.estado}">${ESTADOS[n.estado]}</span>${n.fecha ? '<br>' + esc(n.fecha) : ''}</td></tr>`).join('')
    }</tbody></table>`;
  }

  // ---------- Arranque ----------

  function recargar() {
    renderPartes();
    cargarGenerales();
    visibilidad();
    actualizar();
  }

  function init() {
    $('#tipo').innerHTML = Object.entries(TIPOS).map(([k, t]) => `<option value="${k}">${t.etiqueta}</option>`).join('');
    recargar();
    renderNormativa();

    $('#form').addEventListener('input', onInput);
    $('#form').addEventListener('change', onInput);
    $('#partes').addEventListener('click', ev => {
      const d = ev.target.dataset;
      if (d.quitar !== undefined) {
        estado.partes.splice(+d.quitar, 1);
      } else if (d.subir !== undefined) {
        const i = +d.subir;
        [estado.partes[i - 1], estado.partes[i]] = [estado.partes[i], estado.partes[i - 1]];
      } else if (d.guardar !== undefined) {
        const f = fichaDeParte(estado.partes[+d.guardar]);
        if (!lleno(f.denominacion) || !lleno(f.siglas)) return aviso('Escribe al menos la denominación y cómo se le referirá.');
        const i = catalogo.findIndex(x => !esEjemplo(x) && x.siglas === f.siglas && x.denominacion === f.denominacion);
        if (i >= 0) catalogo[i] = Object.assign({ id: catalogo[i].id }, f);
        else catalogo.push(Object.assign({ id: nuevoId() }, f));
        guardarCatalogo();
        renderCatalogo();
        return aviso(i >= 0 ? 'Ficha actualizada en el catálogo.' : 'Institución guardada en el catálogo.');
      } else return;
      renderPartes();
      actualizar();
    });
    $('#cat-agregar').addEventListener('click', () => agregarDesdeCatalogo($('#cat-sel').value));
    $('#sugerencia-tipo').addEventListener('click', ev => {
      if (ev.target.id !== 'aplicar-tipo') return;
      estado.tipo = sugerirTipo(estado).tipo;
      $('#tipo').value = estado.tipo;
      visibilidad();
      actualizar();
    });

    renderCatalogo();
    $('#cat-lista').addEventListener('click', ev => {
      const d = ev.target.dataset;
      if (d.editar) abrirEditor(catalogo.find(x => x.id === d.editar));
      if (d.eliminar) {
        const f = catalogo.find(x => x.id === d.eliminar);
        if (!f || !confirm(`¿Eliminar la ficha de ${f.siglas || 'esta institución'} del catálogo?`)) return;
        catalogo = catalogo.filter(x => x.id !== d.eliminar);
        guardarCatalogo();
        renderCatalogo();
      }
    });
    $('#cat-editor').addEventListener('click', ev => {
      if (ev.target.id === 'ficha-guardar') guardarFicha();
      if (ev.target.id === 'ficha-cancelar') cerrarEditor();
    });
    $('#cat-editor').addEventListener('input', () => { const e = $('#error-ficha'); if (e) e.textContent = ''; });
    $('#cat-nueva').addEventListener('click', () => abrirEditor(null));
    $('#cat-exportar').addEventListener('click', () => {
      descargar('catalogo-instituciones.json', JSON.stringify(catalogo, null, 2), 'application/json');
    });
    $('#cat-importar').addEventListener('change', async ev => {
      const file = ev.target.files[0];
      if (!file) return;
      try {
        const x = JSON.parse(await file.text());
        if (!Array.isArray(x) || x.some(f => !f || typeof f !== 'object' || !f.denominacion)) throw new Error();
        const reemplazar = confirm('¿Reemplazar el catálogo actual? (Cancelar = agregar las fichas al catálogo actual)');
        const nuevas = x.map(f => Object.assign({}, f, { id: f.id && !String(f.id).startsWith('ej-') ? String(f.id) : nuevoId() }));
        catalogo = reemplazar ? nuevas : catalogo.concat(nuevas);
        guardarCatalogo();
        renderCatalogo();
        aviso(`${nuevas.length} fichas importadas.`);
      } catch (e) { aviso('El archivo no es un catálogo válido (lista JSON de fichas con denominación).'); }
      ev.target.value = '';
    });
    $('#cat-restaurar').addEventListener('click', () => {
      if (!confirm('¿Restaurar las fichas de ejemplo? Se conservan tus fichas propias.')) return;
      catalogo = catalogo.filter(f => !esEjemplo(f)).concat(copia(CATALOGO_EJEMPLO));
      guardarCatalogo();
      renderCatalogo();
    });
    $('#agregar-parte').addEventListener('click', () => {
      if (estado.partes.length >= 30) return aviso('Máximo 30 partes.');
      estado.partes.push(parteVacia());
      renderPartes();
      actualizar();
    });

    $$('.tabs button').forEach(b => b.addEventListener('click', () => {
      $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
      $$('.panel').forEach(p => p.classList.toggle('oculto', p.id !== b.dataset.tab));
    }));

    $('#ver-fund').addEventListener('change', ev => $('#fund').classList.toggle('oculto', !ev.target.checked));
    $('#descargar-doc').addEventListener('click', () => {
      descargar('convenio.doc', word($('#doc').innerHTML, 'Convenio'), 'application/msword');
    });
    $('#imprimir').addEventListener('click', () => window.print());
    $('#copiar').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#doc').innerText); aviso('Texto copiado.'); }
      catch (e) { aviso('No se pudo copiar. Selecciona el texto manualmente.'); }
    });
    $('#a-revision').addEventListener('click', () => {
      $('#texto-rev').value = $('#doc').innerText;
      $('.tabs button[data-tab="tab-revisar"]').click();
      revisar();
    });
    $('#guardar-json').addEventListener('click', () => {
      descargar('borrador-convenio.json', JSON.stringify(estado, null, 2), 'application/json');
    });
    $('#abrir-json').addEventListener('change', async ev => {
      const f = ev.target.files[0];
      if (!f) return;
      try {
        const x = JSON.parse(await f.text());
        if (!Array.isArray(x.partes)) throw new Error();
        estado = completar(x);
        recargar();
        aviso('Borrador cargado.');
      } catch (e) { aviso('El archivo no es un borrador válido.'); }
      ev.target.value = '';
    });
    $('#nuevo').addEventListener('click', () => {
      if (!confirm('¿Borrar el borrador actual y empezar uno nuevo?')) return;
      estado = estadoInicial();
      recargar();
    });

    $('#archivo-rev').addEventListener('change', async ev => {
      const f = ev.target.files[0];
      if (!f) return;
      try {
        $('#texto-rev').value = await leerArchivo(f);
        $('#error-rev').textContent = '';
      } catch (e) {
        $('#error-rev').textContent = e.message || 'No se pudo leer el archivo.';
      }
    });
    $('#texto-rev').addEventListener('input', () => { $('#error-rev').textContent = ''; });
    $('#revisar').addEventListener('click', revisar);
    $('#exportar-rev').addEventListener('click', cedula);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
