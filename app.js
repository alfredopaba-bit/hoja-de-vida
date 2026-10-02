'use strict';

const CLAVE = 'hoja_de_vida_v1';

const CUALIDADES = [
  'Responsable', 'Puntual', 'Honesto(a)', 'Trabajo en equipo', 'Proactivo(a)',
  'Buena comunicación', 'Organizado(a)', 'Aprendo rápido', 'Liderazgo',
  'Servicio al cliente', 'Adaptable al cambio', 'Orientado(a) a resultados',
  'Creativo(a)', 'Tolerancia a la presión', 'Respetuoso(a)', 'Disciplinado(a)'
];
const MAX_CUALIDADES = 8;

const NIVELES = ['Primaria', 'Bachillerato', 'Técnico', 'Tecnólogo', 'Profesional (pregrado)',
  'Especialización', 'Maestría', 'Doctorado'];

// Campos de cada lista repetible
const LISTAS = {
  educacion: { nombre: 'Estudio', campos: [
    { f: 'nivel', l: 'Nivel', ops: NIVELES },
    { f: 'titulo', l: 'Título obtenido', ph: 'Ej: Bachiller académico' },
    { f: 'institucion', l: 'Institución' },
    { f: 'ciudad', l: 'Ciudad' },
    { f: 'anio', l: 'Año de grado', ph: 'Ej: 2019', num: true },
    { f: 'enCurso', l: 'Lo estoy cursando actualmente', check: true }
  ]},
  cursos: { nombre: 'Curso', campos: [
    { f: 'nombre', l: 'Nombre del curso', ph: 'Ej: Manipulación de alimentos' },
    { f: 'institucion', l: 'Institución', ph: 'Ej: SENA' },
    { f: 'anio', l: 'Año', num: true },
    { f: 'horas', l: 'Intensidad (horas)', num: true }
  ]},
  idiomas: { nombre: 'Idioma', campos: [
    { f: 'idioma', l: 'Idioma', ph: 'Ej: Inglés' },
    { f: 'nivel', l: 'Nivel', ops: ['Básico', 'Intermedio', 'Avanzado', 'Nativo'] }
  ]},
  experiencia: { nombre: 'Trabajo', campos: [
    { f: 'cargo', l: 'Cargo' },
    { f: 'empresa', l: 'Empresa' },
    { f: 'ciudad', l: 'Ciudad' },
    { f: 'desde', l: 'Desde', mes: true },
    { f: 'hasta', l: 'Hasta', mes: true },
    { f: 'actual', l: 'Trabajo aquí actualmente', check: true },
    { f: 'funciones', l: 'Funciones y logros (uno por línea)', area: true,
      ph: 'Atención a clientes en caja\nManejo de inventario' },
    { f: 'jefe', l: 'Jefe inmediato y teléfono (opcional)' }
  ]},
  referencias: { nombre: 'Referencia', campos: [
    { f: 'tipo', l: 'Tipo', ops: ['Personal', 'Familiar', 'Laboral'] },
    { f: 'nombre', l: 'Nombre completo' },
    { f: 'relacion', l: 'Parentesco o relación', ph: 'Ej: Tía, amigo, exjefe' },
    { f: 'ocupacion', l: 'Ocupación' },
    { f: 'telefono', l: 'Teléfono', tel: true }
  ]}
};

const OBLIGATORIOS = ['nombre', 'tipoId', 'numId', 'telefono', 'correo', 'direccion'];

let datos = cargar();
let pdfArchivo = null;
let pdfUrl = null;

// ---------- Guardado local ----------
function vacio() {
  return { cualidades: [], foto: '', educacion: [], cursos: [], idiomas: [], experiencia: [], referencias: [] };
}
function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE));
    return d ? Object.assign(vacio(), d) : vacio();
  } catch (e) {
    return vacio();
  }
}
let temporizador;
function guardar() {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch (e) {
      aviso('No se pudo guardar. Pruebe con una foto más pequeña.');
    }
  }, 300);
}

// ---------- Utilidades ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function aviso(texto) {
  const t = $('#toast');
  t.textContent = texto;
  t.hidden = false;
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => { t.hidden = true; }, 3500);
}

function crearCampo(c, valor) {
  let el;
  if (c.check) {
    const lab = document.createElement('label');
    lab.className = 'check';
    el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = !!valor;
    lab.append(el, c.l);
    el.dataset.f = c.f;
    return lab;
  }
  const lab = document.createElement('label');
  lab.textContent = c.l;
  if (c.ops) {
    el = document.createElement('select');
    el.append(new Option('Seleccione…', ''));
    c.ops.forEach(o => el.append(new Option(o, o)));
  } else if (c.area) {
    el = document.createElement('textarea');
    el.rows = 4;
  } else {
    el = document.createElement('input');
    if (c.mes) el.type = 'month';
    if (c.num) el.inputMode = 'numeric';
    if (c.tel) el.type = 'tel';
  }
  if (c.ph) el.placeholder = c.ph;
  el.value = valor || '';
  el.dataset.f = c.f;
  lab.append(el);
  return lab;
}

// ---------- Listas repetibles ----------
function pintarLista(tipo) {
  const cont = $(`[data-lista="${tipo}"]`);
  const def = LISTAS[tipo];
  cont.innerHTML = '';
  datos[tipo].forEach((reg, i) => {
    const item = document.createElement('div');
    item.className = 'item';
    const cab = document.createElement('div');
    cab.className = 'item-cab';
    const titulo = document.createElement('b');
    titulo.textContent = `${def.nombre} ${i + 1}`;
    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.textContent = 'Eliminar';
    quitar.onclick = () => {
      if (!confirm(`¿Eliminar ${def.nombre.toLowerCase()} ${i + 1}?`)) return;
      datos[tipo].splice(i, 1);
      guardar();
      pintarLista(tipo);
    };
    cab.append(titulo, quitar);
    item.append(cab);
    def.campos.forEach(c => item.append(crearCampo(c, reg[c.f])));
    const actualizar = e => {
      const f = e.target.dataset.f;
      if (!f) return;
      reg[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      guardar();
    };
    item.addEventListener('input', actualizar);
    item.addEventListener('change', actualizar);
    cont.append(item);
  });
}

function iniciarListas() {
  Object.keys(LISTAS).forEach(pintarLista);
  $$('[data-agregar]').forEach(b => {
    b.onclick = () => {
      const tipo = b.dataset.agregar;
      datos[tipo].push({});
      guardar();
      pintarLista(tipo);
      const items = $$(`[data-lista="${tipo}"] .item`);
      const ultimo = items[items.length - 1];
      ultimo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const primero = $('input, select, textarea', ultimo);
      if (primero) primero.focus({ preventScroll: true });
    };
  });
}

// ---------- Campos simples ----------
function iniciarCampos() {
  $$('[data-k]').forEach(el => {
    el.value = datos[el.dataset.k] || '';
    const actualizar = () => {
      datos[el.dataset.k] = el.value;
      el.classList.remove('invalido');
      guardar();
    };
    el.addEventListener('input', actualizar);
    el.addEventListener('change', actualizar);
  });
}

// ---------- Cualidades ----------
function iniciarCualidades() {
  const cont = $('#cualidades');
  CUALIDADES.forEach(q => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (datos.cualidades.includes(q) ? ' activo' : '');
    b.textContent = q;
    b.onclick = () => {
      const i = datos.cualidades.indexOf(q);
      if (i >= 0) {
        datos.cualidades.splice(i, 1);
      } else {
        if (datos.cualidades.length >= MAX_CUALIDADES) {
          aviso(`Máximo ${MAX_CUALIDADES} cualidades. Quite una para agregar otra.`);
          return;
        }
        datos.cualidades.push(q);
      }
      b.classList.toggle('activo');
      guardar();
    };
    cont.append(b);
  });
}

function todasLasCualidades() {
  const otras = (datos.otrasCualidades || '').split(',').map(s => s.trim()).filter(Boolean);
  return datos.cualidades.concat(otras);
}

// Cualidad -> sustantivo, para redactar "Me destaco por mi responsabilidad, puntualidad…"
const CUALIDAD_SUSTANTIVO = {
  'Responsable': 'responsabilidad', 'Puntual': 'puntualidad', 'Honesto(a)': 'honestidad',
  'Trabajo en equipo': 'trabajo en equipo', 'Proactivo(a)': 'proactividad',
  'Buena comunicación': 'buena comunicación', 'Organizado(a)': 'organización',
  'Aprendo rápido': 'facilidad de aprendizaje', 'Liderazgo': 'liderazgo',
  'Servicio al cliente': 'vocación de servicio', 'Adaptable al cambio': 'adaptabilidad al cambio',
  'Orientado(a) a resultados': 'orientación a resultados', 'Creativo(a)': 'creatividad',
  'Tolerancia a la presión': 'tolerancia a la presión', 'Respetuoso(a)': 'respeto',
  'Disciplinado(a)': 'disciplina'
};

function unirConY(lista) {
  return lista.length > 1 ? lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1] : (lista[0] || '');
}

function sugerirPerfil() {
  const q = todasLasCualidades().map(s => CUALIDAD_SUSTANTIVO[s] || s.toLowerCase());
  const estudio = datos.educacion.find(e => e.titulo || e.nivel);
  const cargos = [...new Set(datos.experiencia.map(e => (e.cargo || '').trim()).filter(Boolean))].slice(0, 3);
  const frases = [];
  if (estudio) {
    frases.push(estudio.titulo
      ? `Cuento con formación como ${estudio.titulo.trim()}${estudio.enCurso ? ' (en curso)' : ''}.`
      : `Cuento con formación de nivel ${estudio.nivel.toLowerCase()}.`);
  }
  if (cargos.length) frases.push(`Tengo experiencia como ${unirConY(cargos)}.`);
  if (q.length) frases.push(`Me destaco por mi ${unirConY(q)}.`);
  frases.push((datos.ocupacion ? `Busco desempeñarme como ${datos.ocupacion.trim()}` : 'Busco una oportunidad laboral')
    + ' donde pueda aportar mi compromiso, seguir aprendiendo y contribuir al logro de los objetivos de la empresa.');
  const texto = frases.join(' ');

  const area = $('[data-k="perfil"]');
  if (area.value.trim() && !confirm('¿Reemplazar el perfil que ya escribió por una sugerencia?')) return;
  area.value = texto;
  area.dispatchEvent(new Event('input'));
  aviso('Revise el texto y ajústelo con sus palabras.');
}

// ---------- Foto ----------
function procesarFoto(archivo) {
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Recorte centrado 4:5 y reducción a 480x600 para que pese poco
      const W = 480, H = 600, ratio = W / H;
      let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (sw / sh > ratio) { sw = sh * ratio; sx = (img.width - sw) / 2; }
      else { sh = sw / ratio; sy = (img.height - sh) / 4; }
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      datos.foto = c.toDataURL('image/jpeg', 0.85);
      guardar();
      pintarFoto();
    };
    img.onerror = () => aviso('No se pudo leer esa imagen.');
    img.src = lector.result;
  };
  lector.readAsDataURL(archivo);
}

function pintarFoto() {
  const hay = !!datos.foto;
  $('#fotoPreview').hidden = !hay;
  $('#fotoVacia').hidden = hay;
  $('#fotoQuitar').hidden = !hay;
  if (hay) $('#fotoPreview').src = datos.foto;
}

function iniciarFoto() {
  ['#fotoCamara', '#fotoGaleria'].forEach(s => {
    $(s).addEventListener('change', e => {
      procesarFoto(e.target.files[0]);
      e.target.value = '';
    });
  });
  $('#fotoQuitar').onclick = () => {
    datos.foto = '';
    guardar();
    pintarFoto();
  };
  pintarFoto();
}

// ---------- Validación ----------
function validar() {
  $$('.seccion').forEach(s => s.classList.remove('error'));
  let primero = null;
  OBLIGATORIOS.forEach(k => {
    const el = $(`[data-k="${k}"]`);
    let ok = !!(datos[k] || '').trim();
    if (ok && k === 'correo') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos[k].trim());
    if (!ok) {
      el.classList.add('invalido');
      el.closest('.seccion').classList.add('error');
      if (!primero) primero = el;
    }
  });
  if (primero) {
    const sec = primero.closest('details');
    sec.open = true;
    primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
    primero.focus({ preventScroll: true });
    aviso('Faltan datos obligatorios (marcados en rojo).');
    return false;
  }
  return true;
}

// ---------- Fechas ----------
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function mesAnio(v) {
  if (!v) return '';
  const [a, m] = v.split('-');
  return m ? `${MESES[+m - 1]}. ${a}` : v;
}
function fechaLarga(v) {
  if (!v) return '';
  const [a, m, d] = v.split('-');
  const nombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${+d} de ${nombres[+m - 1]} de ${a}`;
}
function edad(v) {
  if (!v) return '';
  const n = new Date(v + 'T00:00:00'), h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
  return e > 0 && e < 120 ? `${e} años` : '';
}

// ---------- PDF ----------
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const AZUL = [31, 58, 95], GRIS = [91, 102, 117], TEXTO = [29, 36, 48], LINEA = [207, 214, 223];
  const PW = 210, PH = 297, M = 18, ANCHO = PW - 2 * M;
  let y = 0;
  const d = datos;
  const t = s => (s || '').toString().trim();

  function salto(alto) {
    if (y + alto > PH - 20) { doc.addPage(); y = 20; }
  }
  function color(c) { doc.setTextColor(c[0], c[1], c[2]); }
  function parrafo(texto, x, ancho, tam = 10, estilo = 'normal', col = TEXTO, interl = 4.6) {
    doc.setFont('helvetica', estilo);
    doc.setFontSize(tam);
    color(col);
    doc.splitTextToSize(texto, ancho).forEach(l => {
      salto(interl);
      doc.text(l, x, y);
      y += interl;
    });
  }
  function titulo(texto) {
    salto(16);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    color(AZUL);
    doc.text(texto.toUpperCase(), M, y);
    y += 2;
    doc.setDrawColor(AZUL[0], AZUL[1], AZUL[2]);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + ANCHO, y);
    y += 6;
  }
  function vineta(texto) {
    const lineas = doc.splitTextToSize(texto, ANCHO - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    color(TEXTO);
    lineas.forEach((l, i) => {
      salto(4.6);
      if (i === 0) {
        doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
        doc.circle(M + 1.5, y - 1.2, 0.7, 'F');
      }
      doc.text(l, M + 5, y);
      y += 4.6;
    });
  }

  // Encabezado
  const altoCab = 50;
  doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
  doc.rect(0, 0, PW, altoCab, 'F');
  const anchoTexto = d.foto ? ANCHO - 40 : ANCHO;
  if (d.foto) {
    doc.setFillColor(255, 255, 255);
    doc.rect(PW - M - 33, 7, 33, 41.25, 'F');
    doc.addImage(d.foto, 'JPEG', PW - M - 32, 8, 31, 38.75);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  y = 20;
  doc.splitTextToSize(t(d.nombre).toUpperCase(), anchoTexto).slice(0, 2).forEach(l => {
    doc.text(l, M, y);
    y += 8;
  });
  if (t(d.ocupacion)) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(t(d.ocupacion), M, y);
    y += 6;
  }
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const contacto = [t(d.telefono), t(d.correo)].filter(Boolean).join('   |   ');
  doc.text(contacto, M, Math.max(y + 2, 40));
  y = altoCab + 4;

  // Datos personales
  titulo('Datos personales');
  const filas = [
    ['Documento', `${t(d.tipoId)} No. ${t(d.numId)}${t(d.expedicion) ? ' de ' + t(d.expedicion) : ''}`],
    ['Fecha de nacimiento', d.nacimiento ? `${fechaLarga(d.nacimiento)} (${edad(d.nacimiento)})`.replace(' ()', '') : ''],
    ['Estado civil', t(d.estadoCivil)],
    ['Teléfono', t(d.telefono)],
    ['Correo electrónico', t(d.correo)],
    ['Dirección', t(d.direccion)],
    ['Ciudad', t(d.ciudad)],
    ['Red profesional', t(d.linkedin)]
  ].filter(f => f[1]);
  filas.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lineas = doc.splitTextToSize(v, ANCHO - 48);
    salto(lineas.length * 4.6 + 1);
    doc.setFont('helvetica', 'bold');
    color(GRIS);
    doc.text(k + ':', M, y);
    doc.setFont('helvetica', 'normal');
    color(TEXTO);
    lineas.forEach((l, i) => doc.text(l, M + 48, y + i * 4.6));
    y += lineas.length * 4.6 + 1;
  });

  // Perfil
  if (t(d.perfil)) {
    titulo('Perfil profesional');
    parrafo(t(d.perfil), M, ANCHO);
  }

  // Experiencia
  const exp = d.experiencia.filter(e => t(e.cargo) || t(e.empresa));
  if (exp.length) {
    titulo('Experiencia laboral');
    exp.forEach((e, i) => {
      if (i) y += 3;
      salto(14);
      parrafo([t(e.cargo), t(e.empresa)].filter(Boolean).join(' — '), M, ANCHO, 11, 'bold', TEXTO, 5);
      const fechas = [mesAnio(e.desde), e.actual ? 'actualidad' : mesAnio(e.hasta)].filter(Boolean).join(' – ');
      const sub = [fechas, t(e.ciudad)].filter(Boolean).join('   |   ');
      if (sub) parrafo(sub, M, ANCHO, 9.5, 'italic', GRIS);
      y += 1;
      t(e.funciones).split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).forEach(vineta);
      if (t(e.jefe)) parrafo('Jefe inmediato: ' + t(e.jefe), M, ANCHO, 9.5, 'normal', GRIS);
    });
  }

  // Educación
  const edu = d.educacion.filter(e => t(e.titulo) || t(e.nivel) || t(e.institucion));
  if (edu.length) {
    titulo('Formación académica');
    edu.forEach((e, i) => {
      if (i) y += 2;
      salto(12);
      parrafo(t(e.titulo) || t(e.nivel), M, ANCHO, 11, 'bold', TEXTO, 5);
      const anio = e.enCurso ? 'En curso' : t(e.anio);
      const sub = [t(e.institucion), t(e.ciudad), anio, t(e.titulo) ? t(e.nivel) : ''].filter(Boolean).join('   |   ');
      if (sub) parrafo(sub, M, ANCHO, 9.5, 'normal', GRIS);
    });
  }

  // Cursos
  const cur = d.cursos.filter(c => t(c.nombre));
  if (cur.length) {
    titulo('Cursos y certificaciones');
    cur.forEach(c => {
      const extra = [t(c.institucion), t(c.anio), t(c.horas) ? t(c.horas) + ' horas' : ''].filter(Boolean).join(', ');
      vineta(t(c.nombre) + (extra ? ` — ${extra}` : ''));
    });
  }

  // Habilidades y cualidades
  const cualidades = todasLasCualidades();
  const habilidades = t(d.habilidades).split('\n').map(s => s.trim()).filter(Boolean);
  const idiomas = d.idiomas.filter(i => t(i.idioma));
  if (cualidades.length || habilidades.length || idiomas.length) {
    titulo('Competencias');
    if (cualidades.length) {
      parrafo('Cualidades personales', M, ANCHO, 10, 'bold', AZUL, 5);
      parrafo(cualidades.join('  ·  '), M, ANCHO);
      y += 2;
    }
    if (habilidades.length) {
      parrafo('Habilidades y conocimientos', M, ANCHO, 10, 'bold', AZUL, 5);
      habilidades.forEach(vineta);
      y += 2;
    }
    if (idiomas.length) {
      parrafo('Idiomas', M, ANCHO, 10, 'bold', AZUL, 5);
      idiomas.forEach(i => vineta(t(i.idioma) + (t(i.nivel) ? `: ${t(i.nivel)}` : '')));
    }
  }

  // Referencias (agrupadas por tipo)
  const refs = d.referencias.filter(r => t(r.nombre));
  if (refs.length) {
    ['Laboral', 'Personal', 'Familiar', ''].forEach(tipo => {
      const grupo = refs.filter(r => (r.tipo || '') === tipo);
      if (!grupo.length) return;
      titulo(tipo === 'Laboral' ? 'Referencias laborales' : tipo === 'Familiar' ? 'Referencias familiares'
        : tipo === 'Personal' ? 'Referencias personales' : 'Referencias');
      grupo.forEach(r => {
        salto(15);
        parrafo(t(r.nombre), M, ANCHO, 10.5, 'bold', TEXTO, 5);
        const sub = [t(r.relacion), t(r.ocupacion)].filter(Boolean).join('   |   ');
        if (sub) parrafo(sub, M, ANCHO, 9.5, 'normal', GRIS);
        if (t(r.telefono)) parrafo('Tel: ' + t(r.telefono), M, ANCHO, 9.5, 'normal', GRIS);
        y += 2;
      });
    });
  }

  // Firma
  salto(32);
  y += 14;
  doc.setDrawColor(TEXTO[0], TEXTO[1], TEXTO[2]);
  doc.setLineWidth(0.3);
  doc.line(M, y, M + 70, y);
  y += 5;
  parrafo(t(d.nombre), M, 100, 10, 'bold');
  parrafo(`${abreviarId(d.tipoId)} ${t(d.numId)}${t(d.expedicion) ? ' de ' + t(d.expedicion) : ''}`, M, 120, 9.5, 'normal', GRIS);

  // Numeración de páginas
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(LINEA[0], LINEA[1], LINEA[2]);
    doc.setLineWidth(0.2);
    doc.line(M, PH - 12, PW - M, PH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    color(GRIS);
    doc.text(t(d.nombre), M, PH - 8);
    doc.text(`Página ${p} de ${total}`, PW - M, PH - 8, { align: 'right' });
  }

  doc.setProperties({ title: `Hoja de vida - ${t(d.nombre)}`, author: t(d.nombre) });
  return doc.output('blob');
}

function abreviarId(tipo) {
  return ({
    'Cédula de ciudadanía': 'C.C.',
    'Cédula de extranjería': 'C.E.',
    'Tarjeta de identidad': 'T.I.',
    'Pasaporte': 'Pasaporte',
    'Permiso por Protección Temporal (PPT)': 'PPT'
  })[tipo] || tipo || '';
}

function nombreArchivo() {
  const base = (datos.nombre || 'hoja_de_vida').trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `Hoja_de_vida_${base}.pdf`;
}

// ---------- Acciones del panel ----------
function iniciarAcciones() {
  $('#btnGenerar').onclick = () => {
    if (!validar()) return;
    try {
      const blob = generarPDF();
      pdfArchivo = new File([blob], nombreArchivo(), { type: 'application/pdf' });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      pdfUrl = URL.createObjectURL(blob);
      $('#panelNombre').textContent = pdfArchivo.name;
      $('#btnCompartir').hidden = !(navigator.canShare && navigator.canShare({ files: [pdfArchivo] }));
      $('#panel').hidden = false;
    } catch (e) {
      console.error(e);
      aviso('Ocurrió un error al crear el PDF.');
    }
  };
  $('#btnCompartir').onclick = async () => {
    try {
      await navigator.share({ files: [pdfArchivo], title: 'Hoja de vida', text: `Hoja de vida de ${datos.nombre}` });
    } catch (e) {
      if (e.name !== 'AbortError') aviso('No se pudo compartir. Use "Guardar en el celular".');
    }
  };
  $('#btnDescargar').onclick = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = pdfArchivo.name;
    document.body.append(a);
    a.click();
    a.remove();
    aviso('Guardado en la carpeta Descargas.');
  };
  $('#btnVer').onclick = () => window.open(pdfUrl, '_blank');
  $('#btnCerrar').onclick = () => { $('#panel').hidden = true; };
  $('#panel').onclick = e => { if (e.target.id === 'panel') $('#panel').hidden = true; };

  $('#btnSugerir').onclick = sugerirPerfil;
  $('#btnBorrar').onclick = () => {
    if (!confirm('¿Seguro que quiere borrar TODOS sus datos? No se puede deshacer.')) return;
    localStorage.removeItem(CLAVE);
    location.reload();
  };
}

// ---------- Instalación como app ----------
let eventoInstalar = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  eventoInstalar = e;
  $('#btnInstalar').hidden = false;
});
window.addEventListener('appinstalled', () => { $('#btnInstalar').hidden = true; });

function iniciarInstalacion() {
  $('#btnInstalar').onclick = async () => {
    if (!eventoInstalar) return;
    eventoInstalar.prompt();
    await eventoInstalar.userChoice;
    eventoInstalar = null;
    $('#btnInstalar').hidden = true;
  };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// ---------- Arranque ----------
iniciarCampos();
iniciarCualidades();
iniciarListas();
iniciarFoto();
iniciarAcciones();
iniciarInstalacion();
