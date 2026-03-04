import {
  checklist,
  DEFAULT_TITLE,
  type StoredData,
  type Section,
  type Question,
  formatSectionTitle,
  formatQuestionNum,
} from '../data/checklist';

function getMergedSections(data: StoredData): Section[] {
  const baseSections = data.generatorSections ?? checklist;
  const customSections = data.customSections || [];
  const customQuestions = data.customQuestions || {};

  const merged = baseSections.map((s) => ({
    ...s,
    questions: [...s.questions, ...(customQuestions[s.id] || [])] as Question[],
  }));
  const custom = customSections.map((s) => ({
    ...s,
    questions: [...s.questions, ...(customQuestions[s.id] || [])] as Question[],
  }));
  return [...merged, ...custom];
}

export function downloadJSON(data: StoredData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `discovery-session-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printPDF(data: StoredData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = generatePDFHTML(data);
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    if (printWindow.document.fonts?.ready) {
      printWindow.document.fonts.ready.then(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      });
    } else {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 1500);
    }
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generatePDFHTML(data: StoredData): string {
  const docTitle = data.documentTitle || DEFAULT_TITLE;
  const allSections = getMergedSections(data);
  const skippedSet = new Set(data.skippedSections || []);

  const activeSections = allSections.filter((s) => !skippedSet.has(s.id));
  const activeKeys = activeSections.flatMap((s) => s.questions.map((q) => q.key));
  const totalQ = activeKeys.length;
  const answeredQ = activeKeys.filter(
    (k) => (data.sections[k]?.response || '').trim() !== '',
  ).length;
  const progressPct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

  const sectionRows = allSections
    .map((section, sIdx) => {
      const isSkipped = skippedSet.has(section.id);
      const sTitle = formatSectionTitle(sIdx, section.title);

      if (isSkipped) {
        return `<div class="section-skipped">
          <h2 class="skipped">${escapeHtml(sTitle)} <span class="skip-badge">SKIPPED</span></h2>
        </div>`;
      }

      const questions = section.questions
        .map((q, qIdx) => {
          const num = formatQuestionNum(sIdx, qIdx);
          const response = data.sections[q.key]?.response || '';
          return `
        <div class="question">
          <div class="question-text">${num} ${escapeHtml(q.topic)}: ${escapeHtml(q.question)}</div>
          <div class="response">
            <strong>Response:</strong>
            ${response ? escapeHtml(response).replace(/\n/g, '<br/>') : '<span class="empty">No response provided</span>'}
          </div>
        </div>`;
        })
        .join('');
      return `<h2>${escapeHtml(sTitle)}</h2>${questions}`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(docTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;700&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Red Hat Text', Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #151515;
    }

    /* Branded header */
    .header {
      background-color: #151515 !important;
      color: #ffffff !important;
      padding: 28px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .rh-logo {
      height: 36px;
      width: auto;
    }
    .header h1 {
      font-family: 'Red Hat Display', 'Red Hat Text', Arial, sans-serif;
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      border: none;
      padding: 0;
      color: #ffffff;
    }
    .header-subtitle {
      font-size: 13px;
      color: #c9190b;
      font-weight: 500;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 12px;
      color: #d2d2d2;
      line-height: 1.6;
    }

    /* Summary bar */
    .summary-bar {
      background: #f0f0f0;
      padding: 14px 40px;
      display: flex;
      gap: 32px;
      font-size: 13px;
      border-bottom: 2px solid #c9190b;
    }
    .summary-bar strong { color: #151515; }
    .progress-bar-container {
      display: inline-block;
      width: 120px;
      height: 10px;
      background: #d2d2d2;
      border-radius: 5px;
      vertical-align: middle;
      margin-left: 8px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 5px;
      background: ${progressPct >= 75 ? '#3e8635' : progressPct >= 50 ? '#06c' : progressPct >= 25 ? '#f0ab00' : '#c9190b'};
    }

    /* Content area */
    .content { padding: 10px 40px 40px; }

    h2 {
      font-family: 'Red Hat Display', 'Red Hat Text', Arial, sans-serif;
      color: #151515;
      background-color: #f0f0f0;
      padding: 10px 14px;
      margin: 24px 0 12px 0;
      border-radius: 4px;
      border-left: 4px solid #c9190b;
      font-size: 15px;
    }
    h2.skipped {
      color: #6a6e73;
      border-left-color: #d2d2d2;
      background: #fafafa;
    }

    .section-skipped { opacity: 0.7; }
    .skip-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      background: #f0f0f0;
      color: #6a6e73;
      border: 1px solid #d2d2d2;
      border-radius: 3px;
      padding: 2px 8px;
      margin-left: 10px;
      vertical-align: middle;
      letter-spacing: 0.5px;
    }

    .question { margin: 14px 0; }
    .question-text {
      font-weight: 600;
      color: #151515;
      margin-bottom: 4px;
      font-size: 13px;
    }
    .response {
      margin: 6px 0;
      padding: 10px 14px;
      background-color: #fafafa;
      border-left: 3px solid #06c;
      font-size: 13px;
      line-height: 1.5;
    }
    .empty { color: #6a6e73; font-style: italic; }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding: 16px 40px;
      border-top: 1px solid #d2d2d2;
      font-size: 11px;
      color: #6a6e73;
      text-align: center;
    }

    @media print {
      @page {
        margin: 0;
        size: A4;
        marks: none;
      }
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .header {
        padding: 20px 32px !important;
        background-color: #151515 !important;
        color: #ffffff !important;
      }
      .header h1 { color: #ffffff !important; }
      .header-subtitle { color: #c9190b !important; }
      .header-right { color: #d2d2d2 !important; }
      .summary-bar {
        padding: 10px 32px;
        background: #f0f0f0 !important;
        border-bottom-color: #c9190b !important;
      }
      .progress-bar-container { background: #d2d2d2 !important; }
      .progress-bar-fill { background: inherit !important; }
      h2 { background-color: #f0f0f0 !important; border-left-color: #c9190b !important; }
      .response { background-color: #fafafa !important; border-left-color: #06c !important; }
      .content { padding: 10px 32px 20px; }
      .footer { padding: 12px 32px; }
    }
  </style>
</head>
<body>
  <!-- Branded header -->
  <div class="header">
    <div class="header-left">
      <svg class="rh-logo" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
        <g transform="scale(0.35) translate(0,5)">
          <path d="M127.47 83.49c12.51 0 30.61-2.58 30.61-17.46a14 14 0 0 0-.31-3.42l-7.45-32.36c-1.72-7.12-3.23-10.35-15.73-16.6C124.89 8.69 103.76.5 97.51.5 91.69.5 90 8 83.06 8c-6.68 0-11.64-5.6-17.89-5.6-6 0-9.91 4.09-12.93 12.5 0 0-8.41 23.72-9.49 27.16A6.43 6.43 0 0 0 42.53 44c0 9.22 36.3 39.45 84.94 39.45M160 72.07c1.73 8.19 1.73 9.05 1.73 10.13 0 14-15.74 21.77-36.43 21.77C78.54 104 37.58 76.6 37.58 58.49a18.45 18.45 0 0 1 1.51-7.33C22.27 52 .5 55 .5 74.22c0 31.48 74.59 70.28 133.65 70.28 45.28 0 56.7-20.48 56.7-36.65 0-12.72-11-27.16-30.83-35.78" fill="#e00"/>
        </g>
        <text x="72" y="33" font-family="Red Hat Display, Red Hat Text, Arial, sans-serif" font-weight="700" font-size="26" fill="#fff">Red Hat</text>
      </svg>
      <div>
        <h1>${escapeHtml(docTitle)}</h1>
      </div>
    </div>
    <div class="header-right">
      Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
      ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>

  <!-- Summary bar -->
  <div class="summary-bar">
    <div>
      <strong>Progress:</strong> ${answeredQ}/${totalQ} questions answered (${progressPct}%)
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width:${progressPct}%"></div>
      </div>
    </div>
    <div><strong>Sections:</strong> ${activeSections.length} applicable, ${allSections.length - activeSections.length} skipped</div>
  </div>

  <!-- Content -->
  <div class="content">
    ${sectionRows}
  </div>

  <!-- Footer -->
  <div class="footer">
    ${escapeHtml(docTitle)} &mdash; Confidential
  </div>

  <div class="no-print" style="margin:20px;text-align:center">
    <button onclick="window.print()" style="padding:10px 24px;font-size:14px;cursor:pointer;background:#c9190b;color:#fff;border:none;border-radius:4px;">
      Save as PDF
    </button>
  </div>
</body>
</html>`;
}
