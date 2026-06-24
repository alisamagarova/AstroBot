// pdf-export.js — генерация многостраничного A4-PDF из DOM-узла (на клиенте).
// Библиотеки (html2canvas, jsPDF) грузятся лениво — только при первом экспорте.
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

  // Возвращает base64 (без префикса data:) многостраничного PDF из узла node.
  window.exportNodeToPdfBase64 = async function (node, opts) {
    opts = opts || {};
    await ensureLibs();
    const bg = opts.background || '#0a0812';
    const canvas = await window.html2canvas(node, {
      scale: 2, backgroundColor: bg, useCORS: true, logging: false,
      windowWidth: node.scrollWidth,
    });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = canvas.height * (imgW / canvas.width);
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    let heightLeft = imgH;
    let pos = 0;
    pdf.addImage(imgData, 'JPEG', 0, pos, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      pos = heightLeft - imgH; // отрицательное смещение — следующая «страница» картинки
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, pos, imgW, imgH);
      heightLeft -= pageH;
    }
    return pdf.output('datauristring').split(',')[1];
  };
})();
