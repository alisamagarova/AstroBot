// pdf-export.js — сборка PDF из скрытого «печатного» отчёта.
// Колесо карты — целиком на 1-й странице; расшифровки идут блоками,
// блок не разрывается между страницами (длинный блок режется по страницам).
// Библиотеки (html2canvas, jsPDF) грузятся лениво при первом экспорте.
(function () {
  function loadScript(src) {
    return new Promise((res, rej) => {
      const el = document.createElement('script');
      el.src = src; el.async = true;
      el.onload = res;
      el.onerror = () => rej(new Error('Не удалось загрузить ' + src));
      document.head.appendChild(el);
    });
  }

  let libsReady = null;
  function ensureLibs() {
    if (libsReady) return libsReady;
    libsReady = (async () => {
      if (!window.html2canvas)
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      if (!(window.jspdf && window.jspdf.jsPDF))
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    })();
    return libsReady;
  }

  function hexToRgb(hex) {
    hex = (hex || '#0a0812').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  // Собирает PDF из узла rootId: .pdf-wheel → стр.1 (целиком), .pdf-section → блоки.
  window.exportNatalReportPdf = async function (rootId, opts) {
    opts = opts || {};
    await ensureLibs();
    const root = document.getElementById(rootId);
    if (!root) throw new Error('Отчёт не найден');
    const bg = opts.background || '#0a0812';
    const rgb = hexToRgb(bg);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const M = 22, usableW = pageW - M * 2, usableH = pageH - M * 2;

    let first = true, y = M;
    function fill() { pdf.setFillColor(rgb.r, rgb.g, rgb.b); pdf.rect(0, 0, pageW, pageH, 'F'); }
    function page() { if (!first) pdf.addPage(); first = false; fill(); y = M; }
    function snap(node) {
      return window.html2canvas(node, { scale: 2, backgroundColor: bg, useCORS: true, logging: false, windowWidth: node.scrollWidth });
    }

    // ── Page 1: wheel, fully fitting ──
    const wheel = root.querySelector('.pdf-wheel');
    if (wheel) {
      const c = await snap(wheel);
      page();
      let w = usableW, h = c.height * (w / c.width);
      if (h > usableH) { h = usableH; w = c.width * (h / c.height); }
      pdf.addImage(c.toDataURL('image/jpeg', 0.95), 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h);
    }

    // ── Sections: block-by-block, no mid-block cut ──
    const secs = Array.from(root.querySelectorAll('.pdf-section'));
    let started = false;
    for (const node of secs) {
      const c = await snap(node);
      const w = usableW, h = c.height * (w / c.width);
      const img = c.toDataURL('image/jpeg', 0.92);
      if (h <= usableH) {
        if (!started || y + h > pageH - M) { page(); started = true; }
        pdf.addImage(img, 'JPEG', M, y, w, h);
        y += h + 10;
      } else {
        // блок выше страницы — режем по страницам
        page(); started = true;
        let drawn = 0;
        while (drawn < h) {
          pdf.addImage(img, 'JPEG', M, M - drawn, w, h);
          drawn += usableH;
          if (drawn < h) { pdf.addPage(); fill(); }
        }
        y = pageH; // следующий блок — с новой страницы
      }
    }
    return pdf.output('datauristring').split(',')[1];
  };
})();
