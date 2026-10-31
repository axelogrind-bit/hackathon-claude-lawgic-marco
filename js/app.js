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
  const LETRAS = 'abcdefghijklmnopqrstuvwxyz';
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const NUMEROS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  const CLAVE = 'lawgic-convenios-borrador';

  const fecha = iso => {
    if (!lleno(iso)) return PH;
    const [a, m, d] = iso.split('-').map(Number);
    return `${d} de ${MESES[m - 1]} de ${a}`;
  };
  const normaliza = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const parteVacia = () => ({
    denominacion: '', siglas: '', naturaleza: 'dependencia', fundNaturaleza: '',
    representante: '', cargo: '', fundFacultades: '', rfc: '', domicilio: '',
    enlace: '', suficiencia: '', compromisos: ''
  });

  const estadoInicial = () => ({
    tipo: 'colaboracion', materia: '', principal: '', principalFecha: '', modificaciones: '',
    antecedentes: '', objeto: '', conjuntos: '',
    recursos: 'no', aportante: '0', monto: '', fuente: '',
    vigenciaIndef: false, vigenciaFin: '', diasAviso: '30',
    confidencialidad: true, datos: true, pi: false,
    jurisdiccion: 'los tribunales federales con sede en la Ciudad de México',
    lugar: 'la Ciudad de México', fechaFirma: '', ejemplares: '',
    partes: [parteVacia(), parteVacia()]
  });

  let estado = cargar() || estadoInicial();

  function cargar() {
    try {
      const x = JSON.parse(localStorage.getItem(CLAVE));
      return x && Array.isArray(x.partes) ? Object.assign(estadoInicial(), x) : null;
    } catch (e) { return null; }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ }
  }

  // ---------- Generación del convenio ----------

  const siglas = p => lleno(p.siglas) ? `“${esc(p.siglas.trim().toUpperCase())}”` : `“${PH}”`;

  function generar(e) {
    const t = TIPOS[e.tipo];
    const P = e.partes;
    const html = [];
    const fund = [];
    const alertas = [];
    const modif = e.tipo === 'modificatorio';

    let titulo = t.titulo;
    if (modif) titulo += ' AL ' + V(e.principal);
    else if (lleno(e.materia)) titulo += ' EN MATERIA DE ' + V(e.materia);

    const partesTxt = P.map((p, i) => {
      const pre = i === 0 ? 'POR UNA PARTE' : (i === P.length - 1 ? 'Y POR LA OTRA' : 'POR OTRA PARTE');
      return `${pre}, ${V(p.denominacion)}, EN LO SUCESIVO ${siglas(p)}, REPRESENTADA POR ${V(p.representante)}, EN SU CARÁCTER DE ${V(p.cargo)}`;
    }).join('; ');

    const antecedentes = lineas(e.antecedentes);
    if (t.principal) {
      antecedentes.unshift(`Con fecha ${fecha(e.principalFecha)}, “LAS PARTES” celebraron el ${v(e.principal)}, en lo sucesivo “EL CONVENIO PRINCIPAL”.`);
    }

    html.push(`<p class="proemio">${titulo} QUE CELEBRAN, ${partesTxt}; A QUIENES ACTUANDO DE MANERA CONJUNTA SE LES DENOMINARÁ “LAS PARTES”, AL TENOR DE ${antecedentes.length ? 'LOS ANTECEDENTES, ' : ''}LAS DECLARACIONES Y CLÁUSULAS SIGUIENTES:</p>`);
    fund.push({ t: 'Tipo de instrumento: ' + t.etiqueta.toLowerCase(), n: t.normas.concat(FUNDAMENTO_SECCION.tipo.filter(x => !t.normas.includes(x))) });

    if (antecedentes.length) {
      html.push('<h2>ANTECEDENTES</h2>');
      antecedentes.forEach((a, i) => html.push(`<p>${ROMANOS[i] || i + 1}. ${t.principal && i === 0 ? a : esc(a)}</p>`));
    }

    // Declaraciones
    html.push('<h2>DECLARACIONES</h2>');
    P.forEach((p, i) => {
      const r = ROMANOS[i];
      const d = [];
      const nat = NATURALEZAS[p.naturaleza] ? NATURALEZAS[p.naturaleza].texto : PH;
      d.push(`Es ${nat}, de conformidad con ${v(p.fundNaturaleza)}.`);
      d.push(`${v(p.representante)}, en su carácter de ${v(p.cargo)}, cuenta con las facultades necesarias para suscribir el presente instrumento, de conformidad con ${v(p.fundFacultades)}, mismas que no le han sido revocadas, modificadas ni limitadas en forma alguna.`);
      if (!modif && e.recursos === 'si' && String(e.aportante) === String(i)) {
        d.push(`Cuenta con los recursos presupuestarios necesarios para cubrir las obligaciones a su cargo derivadas del presente instrumento, conforme a ${v(p.suficiencia)}.`);
      }
      d.push(`Su Registro Federal de Contribuyentes es ${v(p.rfc)}.`);
      d.push(`Para los efectos del presente instrumento, señala como domicilio el ubicado en ${v(p.domicilio)}.`);
      html.push(`<p class="decl-h">${r}. Declara ${siglas(p)}, por conducto de su representante, que:</p>`);
      d.forEach((x, j) => html.push(`<p class="decl">${r}.${j + 1}. ${x}</p>`));
    });
    const rc = ROMANOS[P.length];
    html.push(`<p class="decl-h">${rc}. Declaran “LAS PARTES”, por conducto de sus representantes, que:</p>`);
    html.push(`<p class="decl">${rc}.1. Se reconocen mutuamente la personalidad jurídica con la que se ostentan.</p>`);
    html.push(`<p class="decl">${rc}.2. Es su voluntad celebrar el presente instrumento, sin que medie error, dolo, mala fe o cualquier otro vicio del consentimiento.</p>`);
    fund.push({ t: 'Declaraciones: naturaleza jurídica', n: FUNDAMENTO_SECCION.naturaleza });
    fund.push({ t: 'Declaraciones: facultades de quien suscribe', n: FUNDAMENTO_SECCION.facultades });

    // Cláusulas
    html.push('<h2>CLÁUSULAS</h2>');
    let k = 0;
    const cl = (tit, cuerpo, sec) => {
      const ord = ORDINALES[k++];
      html.push(`<p class="cl"><b>${ord}.- ${tit}.</b> ${cuerpo}</p>`);
      if (sec) fund.push({ t: `Cláusula ${ord.toLowerCase()}: ${tit.toLowerCase()}`, n: FUNDAMENTO_SECCION[sec] });
    };
    const lista = items => items.map((x, i) => `<br>${LETRAS[i] || '-'}) ${esc(x)}${i === items.length - 1 ? '.' : ';'}`).join('');

    if (modif) {
      cl('OBJETO', `El presente convenio tiene por objeto modificar “EL CONVENIO PRINCIPAL”, en los términos que se establecen en la cláusula siguiente.`, 'modificaciones');
      const m = lineas(e.modificaciones);
      cl('MODIFICACIONES', `“LAS PARTES” acuerdan modificar “EL CONVENIO PRINCIPAL” en los términos siguientes:${m.length ? lista(m) : ' ' + PH}`, 'modificaciones');
      cl('SUBSISTENCIA', `Las cláusulas de “EL CONVENIO PRINCIPAL” que no se modifican mediante el presente instrumento subsisten en sus términos.`, 'modificaciones');
      cl('VIGENCIA', `El presente convenio surtirá efectos a partir de la fecha de su firma y estará vigente mientras lo esté “EL CONVENIO PRINCIPAL”.`, 'vigencia');
    } else {
      cl('OBJETO', `El objeto del presente convenio es ${v(e.objeto)}${lleno(e.objeto) && !/[.;]$/.test(e.objeto.trim()) ? '.' : ''}`, 'objeto');
      if (e.tipo === 'especifico') {
        cl('RELACIÓN CON EL CONVENIO PRINCIPAL', `El presente instrumento deriva de “EL CONVENIO PRINCIPAL”, al que se sujeta en todo lo no previsto expresamente en este convenio.`, 'compromisos');
      }

      const bloques = [];
      P.forEach(p => {
        const c = lineas(p.compromisos);
        if (c.length) bloques.push(`Para el cumplimiento del objeto, ${siglas(p)} se compromete a:${lista(c)}`);
      });
      const cj = lineas(e.conjuntos);
      if (cj.length) bloques.push(`“LAS PARTES” se comprometen de manera conjunta a:${lista(cj)}`);
      cl('COMPROMISOS DE LAS PARTES', bloques.length ? bloques.join('<br><br>') : PH, 'compromisos');

      if (e.recursos === 'si') {
        const ap = P[+e.aportante] || P[0];
        cl('RECURSOS', `${siglas(ap)} aportará la cantidad de ${v(e.monto)}, con cargo a ${v(e.fuente)}. El ejercicio de los recursos queda sujeto a la disponibilidad presupuestaria y a las disposiciones aplicables en materia de ejercicio, control, comprobación y transparencia del gasto público.`, 'recursos');
      } else {
        cl('RECURSOS', `El presente convenio no implica transferencia de recursos entre “LAS PARTES”. Cada una cubrirá con su propio presupuesto los gastos que le corresponda erogar para el cumplimiento de sus compromisos, sujeto a su disponibilidad presupuestaria.`, 'recursos');
      }

      const enl = P.map(p => `por ${siglas(p)}, ${v(p.enlace)}`).join('; ');
      cl('RESPONSABLES DEL SEGUIMIENTO', `Para el adecuado desarrollo de las actividades derivadas del presente convenio, “LAS PARTES” designan como responsables del seguimiento: ${enl}. Los responsables podrán ser sustituidos mediante aviso por escrito a las demás partes.`, 'enlaces');

      cl('RELACIÓN LABORAL', `El personal que cada una de “LAS PARTES” designe para la realización de las actividades objeto del presente convenio conservará su relación laboral con la parte que lo emplea, por lo que no se crearán relaciones de carácter laboral, ni de patrón sustituto o solidario, con las demás.`, 'laboral');

      if (e.confidencialidad) {
        cl('CONFIDENCIALIDAD', `“LAS PARTES” guardarán confidencialidad sobre la información que intercambien con ese carácter con motivo del presente convenio, en términos de la legislación aplicable en materia de transparencia y acceso a la información pública.`, 'confidencialidad');
      }
      if (e.datos) {
        cl('PROTECCIÓN DE DATOS PERSONALES', `Los datos personales que “LAS PARTES” traten con motivo del presente convenio se protegerán conforme a la legislación aplicable en materia de protección de datos personales, y solo se utilizarán para el cumplimiento de su objeto.`, 'datos');
      }
      if (e.pi) {
        cl('PROPIEDAD INTELECTUAL', `La titularidad de los derechos de propiedad intelectual sobre los productos que se generen con motivo del presente convenio corresponderá a la parte que los produzca; los que se generen de forma conjunta corresponderán a “LAS PARTES” en proporción a su participación, conforme a la legislación aplicable.`, 'pi');
      }

      const fin = e.vigenciaIndef ? 'tendrá una vigencia indefinida' : `concluirá el ${fecha(e.vigenciaFin)}`;
      cl('VIGENCIA', `El presente convenio entrará en vigor a partir de la fecha de su firma y ${fin}.`, 'vigencia');
      cl('MODIFICACIONES', `El presente convenio podrá modificarse por acuerdo de “LAS PARTES”, mediante convenio modificatorio por escrito, que surtirá efectos a partir de su firma.`, 'modificaciones');
      cl('TERMINACIÓN ANTICIPADA', `Cualquiera de “LAS PARTES” podrá dar por terminado anticipadamente el presente convenio mediante aviso por escrito a las demás, con ${v(e.diasAviso)} días naturales de anticipación. En ese caso, “LAS PARTES” tomarán las medidas necesarias para concluir las acciones que se encuentren en curso.`, 'terminacion');
      cl('CASO FORTUITO O FUERZA MAYOR', `“LAS PARTES” no serán responsables por el incumplimiento de sus compromisos que derive de caso fortuito o fuerza mayor; las actividades se reanudarán cuando desaparezcan las causas que lo motivaron.`, 'fortuito');
      cl('CESIÓN DE DERECHOS', `Ninguna de “LAS PARTES” podrá ceder o transferir a terceros los derechos y obligaciones derivados del presente convenio.`, 'cesion');
    }

    cl('INTERPRETACIÓN Y CONTROVERSIAS', `“LAS PARTES” manifiestan que el presente convenio es producto de la buena fe, por lo que toda controversia que se derive de su interpretación, operación o cumplimiento se resolverá de común acuerdo, a través de los responsables del seguimiento. De persistir la controversia, “LAS PARTES” se someten a la jurisdicción de ${v(e.jurisdiccion)}, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.`, 'controversias');

    const n = parseInt(e.ejemplares, 10) || P.length;
    html.push(`<p class="cierre">Leído que fue el presente convenio y enteradas “LAS PARTES” de su contenido y alcance legal, lo firman en ${NUMEROS[n] || n} ejemplares en ${v(e.lugar)}, el ${fecha(e.fechaFirma)}.</p>`);
    fund.push({ t: 'Cierre y firmas', n: FUNDAMENTO_SECCION.firmas });

    const filas = [];
    for (let i = 0; i < P.length; i += 2) {
      const celda = p => p ? `<td><p class="firma-por">POR ${siglas(p)}</p><p class="firma-linea">${v(p.representante)}<br>${v(p.cargo)}</p></td>` : '<td></td>';
      filas.push(`<tr>${celda(P[i])}${celda(P[i + 1])}</tr>`);
    }
    html.push(`<table class="firmas">${filas.join('')}</table>`);

    // Alertas de datos faltantes
    if (t.principal && !lleno(e.principal)) alertas.push('Indica el convenio principal.');
    if (!modif && !lleno(e.objeto)) alertas.push('Falta el objeto.');
    if (modif && !lineas(e.modificaciones).length) alertas.push('Faltan las modificaciones.');
    P.forEach((p, i) => {
      const f = ['denominacion', 'siglas', 'representante', 'cargo', 'fundFacultades'].filter(c => !lleno(p[c]));
      if (f.length) alertas.push(`Parte ${i + 1}: faltan ${f.map(c => ETIQUETAS[c]).join(', ')}.`);
    });
    if (!modif && e.recursos === 'si') {
      const ap = P[+e.aportante];
      if (!lleno(e.monto) || !lleno(e.fuente)) alertas.push('Recursos: faltan monto o fuente de los recursos.');
      if (ap && !lleno(ap.suficiencia)) alertas.push('Recursos: falta el documento de suficiencia presupuestal de la parte que aporta.');
      if (e.vigenciaIndef) alertas.push('Hay recursos con vigencia indefinida: verifica la vigencia frente al ejercicio fiscal.');
    }
    if (!modif && !e.vigenciaIndef && !lleno(e.vigenciaFin)) alertas.push('Falta la fecha de término de la vigencia.');
    if (!lleno(e.fechaFirma)) alertas.push('Falta la fecha de firma.');

    return { html: html.join('\n'), fund, alertas };
  }

  const ETIQUETAS = {
    denominacion: 'denominación', siglas: 'siglas', representante: 'representante',
    cargo: 'cargo', fundFacultades: 'fundamento de facultades'
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
      f.innerHTML = `<legend>Parte ${i + 1}</legend>
        ${campo(i, 'denominacion', 'Denominación', 'la Secretaría de Salud, por conducto de …')}
        ${campo(i, 'siglas', 'Cómo se le referirá', 'LA SECRETARÍA')}
        <label>Naturaleza jurídica<select data-p="${i}" data-k="naturaleza">${opts}</select></label>
        ${campo(i, 'fundNaturaleza', 'Fundamento de su naturaleza jurídica', 'ley, decreto de creación o estatuto')}
        ${campo(i, 'representante', 'Representante', 'nombre completo')}
        ${campo(i, 'cargo', 'Cargo', 'cargo de quien firma')}
        ${campo(i, 'fundFacultades', 'Fundamento de sus facultades', 'ordenamiento y artículo, o poder')}
        ${campo(i, 'rfc', 'RFC', '')}
        ${campo(i, 'domicilio', 'Domicilio', 'calle, número, colonia, alcaldía o municipio, C.P.')}
        ${campo(i, 'enlace', 'Responsable del seguimiento', 'nombre y cargo')}
        ${campo(i, 'suficiencia', 'Suficiencia presupuestal (si aporta recursos)', 'oficio y fecha')}
        ${campo(i, 'compromisos', 'Compromisos (uno por línea)', 'Proporcionar …', true)}
        ${estado.partes.length > 2 ? `<button type="button" class="sec" data-quitar="${i}">Quitar parte</button>` : ''}`;
      c.appendChild(f);
    });
    renderAportante();
  }

  function renderAportante() {
    const sel = $('#aportante');
    sel.innerHTML = estado.partes.map((p, i) => `<option value="${i}">${esc(lleno(p.siglas) ? p.siglas : 'Parte ' + (i + 1))}</option>`).join('');
    sel.value = String(estado.aportante);
  }

  function cargarGenerales() {
    $$('#form [data-k]:not([data-p])').forEach(el => {
      const x = estado[el.dataset.k];
      if (el.type === 'checkbox') el.checked = !!x;
      else if (el.id !== 'aportante') el.value = x === undefined || x === null ? '' : x;
    });
  }

  function visibilidad() {
    const t = TIPOS[estado.tipo];
    $$('.solo-principal').forEach(el => el.classList.toggle('oculto', !t.principal));
    $$('.solo-modif').forEach(el => el.classList.toggle('oculto', estado.tipo !== 'modificatorio'));
    $$('.no-modif').forEach(el => el.classList.toggle('oculto', estado.tipo === 'modificatorio'));
    $$('.solo-recursos').forEach(el => el.classList.toggle('oculto', estado.recursos !== 'si'));
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
    if (el.dataset.p !== undefined) {
      estado.partes[+el.dataset.p][k] = val;
      if (k === 'siglas') renderAportante();
    } else {
      estado[k] = val;
    }
    if (['tipo', 'recursos', 'vigenciaIndef'].includes(k)) visibilidad();
    actualizar();
  }

  // ---------- Exportación ----------

  const WORD_CSS = 'body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.4;text-align:justify}' +
    'h1{font-size:12pt;text-align:center}h2{font-size:11pt;text-align:center;margin:14pt 0 8pt}' +
    'p{margin:0 0 8pt}.proemio{font-weight:bold}.ph{background:#ffff00}' +
    'table.firmas{width:100%;margin-top:24pt}table.firmas td{width:50%;vertical-align:top;text-align:center;padding:30pt 8pt 8pt}' +
    '.firma-por{font-weight:bold}.firma-linea{border-top:1px solid #000;padding-top:4pt}' +
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
    return '﻿<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
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

  function init() {
    $('#tipo').innerHTML = Object.entries(TIPOS).map(([k, t]) => `<option value="${k}">${t.etiqueta}</option>`).join('');
    renderPartes();
    cargarGenerales();
    visibilidad();
    actualizar();
    renderNormativa();

    $('#form').addEventListener('input', onInput);
    $('#form').addEventListener('change', onInput);
    $('#partes').addEventListener('click', ev => {
      const q = ev.target.dataset.quitar;
      if (q === undefined) return;
      estado.partes.splice(+q, 1);
      if (+estado.aportante >= estado.partes.length) estado.aportante = '0';
      renderPartes();
      actualizar();
    });
    $('#agregar-parte').addEventListener('click', () => {
      if (estado.partes.length >= 10) return aviso('Máximo 10 partes.');
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
        estado = Object.assign(estadoInicial(), x);
        renderPartes(); cargarGenerales(); visibilidad(); actualizar();
        aviso('Borrador cargado.');
      } catch (e) { aviso('El archivo no es un borrador válido.'); }
      ev.target.value = '';
    });
    $('#nuevo').addEventListener('click', () => {
      if (!confirm('¿Borrar el borrador actual y empezar uno nuevo?')) return;
      estado = estadoInicial();
      renderPartes(); cargarGenerales(); visibilidad(); actualizar();
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
