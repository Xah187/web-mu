import html2pdf from 'html2pdf.js';
import moment from 'moment';

export interface ReportData {
  NameCompany?: string;
  Nameproject?: string;
  TypeOFContract?: string;
  startDateProject?: string;
  EndDateProject?: string;
  Daysremaining?: number;
  countStageall?: number;
  countSTageTrue?: number;
  StagesPending?: number;
  TotalRevenue?: number;
  TotalExpense?: number;
  TotalReturns?: number;
  TotalcosttothCompany?: number;
  boss?: string;
  MostAccomplished?: Array<{
    userName: string;
    Count: number;
    rate: number;
  }>;
  DelayProject?: Array<{
    DateNote: string;
    Note: string;
    Type: string;
    countdayDelay: number;
  }>;
}

export const generateReportHTML = (result: ReportData): string => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return moment.parseZone(new Date(dateString)).format('DD-MM-YYYY');
  };
  const total = result?.countStageall || 1;
  const done = result?.countSTageTrue || 0;
  const pending = result?.StagesPending || 0;
  const percentDone = (done / total) * 100;
  const percentPending = (pending / total) * 100;
  const percentRest = 100 - percentDone - percentPending;
  // تصحيح النسب إذا كان هناك كسور
  const percentDoneFixed =
    percentDone < 0 ? 0 : percentDone > 100 ? 100 : percentDone;
  const percentPendingFixed =
    percentPending < 0 ? 0 : percentPending > 100 ? 100 : percentPending;
  const percentRestFixed =
    percentRest < 0 ? 0 : percentRest > 100 ? 100 : percentRest;
  const arcLengthDone = Math.PI * 90 * (percentDoneFixed / 100);
  const arcLengthPending = Math.PI * 90 * (percentPendingFixed / 100);
  const arcLengthRest = Math.PI * 90 * (percentRestFixed / 100);
  const isComplete = percentDoneFixed >= 100;
  const isLate = Number(result?.Daysremaining) < 0;
  const progressBarColor = isComplete
    ? '#2117FB'
    : isLate
      ? '#FF0F0F'
      : '#1B4ED1';
  const barMax = Math.max(
    result?.TotalRevenue || 0,
    result?.TotalExpense || 0,
    result?.TotalReturns || 0,
    1,
  );
  const bar = (value?: number) => (value ? (value / barMax) * 150 : 0);

  return `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', 'Tajawal', Arial, sans-serif; background: #f7faff; color: #222; }
          .container { background: #fff; border-radius: 18px; margin: 20px auto; padding: 24px; max-width: 600px; box-shadow: 0 2px 8px #eee; }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 28px; color: #1B4ED1; font-weight: bold; }
          .row { display: flex; justify-content: space-between; margin: 12px 0; }
          .label { color: #888; font-size: 16px; min-width: 120px; }
          .value { font-size: 17px; font-weight: bold; }
          .divider { border-bottom: 1px solid #eee; margin: 18px 0; }
          .progress-container { text-align: center; margin: 30px 0 10px 0; }
          .progress-label { font-size: 22px; color: #1B4ED1; font-weight: bold; }
          .progress-sub { color: #1abc9c; font-size: 16px; }

          .bar-chart { display: flex; justify-content: space-around; align-items: flex-end; height: 180px; margin: 30px 0 10px 0; }
          .bar-group { display: flex; flex-direction: column; align-items: center; width: 70px; }
          .bar-value { color: #1B4ED1; font-size: 14px; margin-bottom: 6px; font-weight: bold; }
          .bar { width: 40px; background: #2117FB; border-radius: 8px 8px 0 0; }
          .bar-label { text-align: center; font-size: 14px; margin-top: 6px; }
          .table { width: 100%; border-collapse: collapse; margin: 18px 0; }
          .table th, .table td { border: 1px solid #eee; padding: 8px; text-align: center; font-size: 15px; }
          .table th { background: #f2f6ff; color: #1B4ED1; }
          .footer { margin-top: 30px; text-align: center; font-size: 13px; color: #666; }
          .late-bar { height: 8px; background: #FF0F0F; border-radius: 4px; margin-top: 4px; }
          .late-label { color: #FF0F0F; font-weight: bold; font-size: 18px; }



          .date-cell { white-space: nowrap; direction: ltr; text-align: center; font-family: 'Cairo', Arial, sans-serif; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div id="logo-placeholder" style="max-width:160px;height:54px;margin:0 auto 10px auto;"></div>
            <div class="title">تقرير المشروع</div>
          </div>
          <div class="row"><span class="label">المشترك:</span><span class="value">${result?.NameCompany || ''}</span></div>
          <div class="row"><span class="label">اسم المشروع:</span><span class="value">${result?.Nameproject || ''}</span></div>
          <div class="row"><span class="label">النوع:</span><span class="value">${result?.TypeOFContract || ''}</span></div>
          <div class="row"><span class="label">تاريخ البداية:</span><span class="value">${formatDate(result?.startDateProject)}</span></div>
          <div class="row"><span class="label">تاريخ النهاية:</span><span class="value">${formatDate(result?.EndDateProject)}</span></div>
          <div class="row"><span class="label">الزمن المتبقي:</span><span class="value">${result?.Daysremaining || 0} يوم</span></div>
          <div style="margin: 10px 0;">
            <span style="color: ${progressBarColor}; font-weight: bold; font-size: 18px;">
              ${result?.Daysremaining} يوم
            </span>
            <div style="height: 8px; background: ${progressBarColor}; border-radius: 4px; margin-top: 4px;"></div>
          </div>
          <div class="divider"></div>
          <div class="progress-container">
            <svg width="220" height="120" viewBox="0 0 220 120">
              <path d="M20,100 A90,90 0 0,1 200,100" fill="none" stroke="#eee" stroke-width="20"/>
              <path d="M20,100 A90,90 0 0,1 200,100"
                fill="none"
                stroke="#2117FB"
                stroke-width="20"
                stroke-dasharray="${arcLengthDone},999"
                stroke-linecap="round"
              />
              <text x="110" y="80" text-anchor="middle" font-size="32" fill="#2117FB" font-family="Cairo">${percentDoneFixed.toFixed(2)}%</text>
            </svg>
            <div class="progress-label">منجز</div>
            <div class="progress-sub">${done} / ${total} مهمة</div>
          </div>
          <div class="divider"></div>
          <div class="bar-chart">
            <div class="bar-group">
              <div class="bar-value">${result?.TotalExpense?.toLocaleString() || 0}</div>
              <div class="bar" style="height:${bar(result?.TotalExpense)}px; background:#FF0F0F;"></div>
              <div class="bar-label">مصروفات</div>
            </div>
            <div class="bar-group">
              <div class="bar-value">${result?.TotalRevenue?.toLocaleString() || 0}</div>
              <div class="bar" style="height:${bar(result?.TotalRevenue)}px; background:#1abc9c;"></div>
              <div class="bar-label">عهد</div>
            </div>
            <div class="bar-group">
              <div class="bar-value">${result?.TotalReturns?.toLocaleString() || 0}</div>
              <div class="bar" style="height:${bar(result?.TotalReturns)}px; background:#FFAA05;"></div>
              <div class="bar-label">مرتجعات</div>
            </div>
          </div>
          <div class="divider"></div>
          <!-- إجمالي تكاليف المشروع -->
          <div style="border:2px solid #2222; border-radius:12px; background:#fff; margin:20px 0; padding:16px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center;">
              <svg width="70" height="40" viewBox="0 0 70 40"><polyline points="5,35 20,20 35,30 50,10 65,35" style="fill:none;stroke:#1abc9c;stroke-width:3"/><polygon points="5,35 65,35 65,40 5,40" style="fill:#b2f1e5;stroke:none"/></svg>
              <span style="font-size:16px;color:#888;margin-right:10px;">إجمالي تكاليف المشروع</span>
            </div>
            <div style="font-size:22px;font-weight:bold;color:#222;">${result?.TotalcosttothCompany?.toLocaleString() || 0} <span style="font-size:16px;color:#888;">ر.س</span></div>
          </div>
          <table class="table">
            <tr>
              <th class="date-cell">التاريخ</th>
              <th>ملاحظة</th>
              <th>المتسبب</th>
              <th>عدد التأخيرات</th>
            </tr>
            ${(result?.DelayProject || [])
              .map(
                item => `
              <tr>
                <td class="date-cell">${item.DateNote || ''}</td>
                <td>${item.Note || ''}</td>
                <td>${item.Type || ''}</td>
                <td>${item.countdayDelay || 0}</td>
              </tr>
            `,
              )
              .join('')}
          </table>
          <div class="divider"></div>
          <div class="row"><span class="label">مدير الفرع:</span><span class="value">${result?.boss || ''}</span></div>
          ${(result?.MostAccomplished || [])
            .map(
              item => `
            <div class="row"><span class="label">مهندس الموقع:</span><span class="value">${item.userName || ''} (${item.Count || 0} مهمة، ${(item.rate || 0).toFixed(2)}%)</span></div>
          `,
            )
            .join('')}
          <div class="footer">
            <p>تم إنشاء هذا التقرير بتاريخ: ${moment().format('DD-MM-YYYY HH:mm')}</p>
          </div>
        </div>
      </body>
    </html>
    `;
};

export const generatePDF = async (reportData: ReportData, fileName?: string): Promise<void> => {
  try {
    const html = generateReportHTML(reportData);

    // إنشاء اسم الملف
    const clean = (str: string) => (str || '').replace(/[\\/:*?"<>|\s]+/g, '_');
    const defaultFileName = `${clean(reportData?.NameCompany || 'تقرير')}_${clean(reportData?.Nameproject || 'مشروع')}_${new Date().toISOString().split('T')[0]}.pdf`;

    const options = {
      margin: 0,
      filename: fileName || defaultFileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        imageTimeout: 0,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        letterRendering: true,
        foreignObjectRendering: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element: any) => {
          // تجاهل الصور التي فشل تحميلها
          if (element.tagName === 'IMG' && element.src && element.src.startsWith('data:image/')) {
            return false; // لا تتجاهل - حاول رسمها
          }
          return false;
        }
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    // إنشاء عنصر مخفي في DOM لوضع الـ HTML بداخله لضمان تحميل الصور والخطوط قبل الالتقاط
    const container = document.createElement('div');
    container.id = '__pdf_container__';
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '-10000px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';

    // استخراج الـ <style> ومحتوى <body> من الـ HTML لضمان تطبيق الأنماط داخل الحاوية
    const styleMatch = html.match(/<style[^>]*>[\s\S]*?<\/style>/i);
    const styles = styleMatch ? styleMatch[0] : '';
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;

    console.log('Adding HTML to DOM...');
    container.innerHTML = `${styles}<div id="__pdf_content__">${bodyContent}</div>`;
    document.body.appendChild(container);
    console.log('HTML added to DOM');


    // Ensure Cairo font is loaded via <link> in <head> to avoid @import-in-style warnings
    try {
      const cairoHref = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap';
      if (!document.querySelector('link[data-cairo-font]')) {
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = cairoHref;
        linkEl.setAttribute('data-cairo-font', 'true');
        document.head.appendChild(linkEl);
      }
    } catch {}

    // إضافة الشعار من مجلد public (مسار ثابت) بدلاً من base64 لضمان التوافق مع html2canvas
    const logoPlaceholder = container.querySelector('#logo-placeholder') as HTMLElement | null;
    if (logoPlaceholder) {
      console.log('Adding logo from public file...');
      const imgEl = document.createElement('img');
      imgEl.alt = 'Logo';
      imgEl.style.height = '54px';
      imgEl.style.maxWidth = '160px';
      imgEl.style.width = 'auto';
      imgEl.style.display = 'block';
      imgEl.style.margin = '0 auto';

      await new Promise<void>((resolve) => {
        let triedFallback = false;
        const cleanup = () => {
          imgEl.removeEventListener('load', onLoad);
          imgEl.removeEventListener('error', onError);
        };
        const onLoad = () => {
          try {
            logoPlaceholder.innerHTML = '';
            logoPlaceholder.appendChild(imgEl);
            console.log('Logo <img> added to DOM');
          } finally {
            cleanup();
            resolve();
          }
        };
        const onError = () => {
          if (!triedFallback) {
            triedFallback = true;
            console.warn('Primary logo not found, trying /logo.png');
            imgEl.src = '/logo.png';
            return;
          }
          console.error('Failed to load logo image from public assets');
          cleanup();
          resolve();
        };
        imgEl.addEventListener('load', onLoad);
        imgEl.addEventListener('error', onError);
        // ابدأ بـ /logo-new.png (مستخدم في الواجهة)
        imgEl.src = '/logo-new.png';
        // مهلة أمان
        setTimeout(() => {
          console.warn('Logo load timeout');
          cleanup();
          resolve();
        }, 1500);
      });
    }


    console.log('Waiting for fonts...');
    if ((document as any).fonts && (document as any).fonts.ready) {
      await (document as any).fonts.ready.catch(() => {});
    }
    console.log('Fonts ready');

    // انتظار إضافي
    await new Promise(r => setTimeout(r, 1000));

    const element = (container.querySelector('#__pdf_content__') as HTMLElement) || container;

    console.log('Starting PDF generation...');

    // استخدام Promise للانتظار حتى اكتمال PDF generation
    await new Promise<void>((resolve, reject) => {
      try {
        html2pdf()
          .set(options)
          .from(element)
          .save()
          .then(() => {
            console.log('PDF generated successfully');
            resolve();
          })
          .catch((err: any) => {
            console.error('Error in html2pdf:', err);
            reject(err);
          });
      } catch (err) {
        console.error('Error starting PDF generation:', err);
        reject(err);
      }
    });

    // تنظيف الحاوية
    container.remove();

    console.log('PDF generation completed and cleaned up');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
};
