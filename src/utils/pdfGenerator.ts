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
    return moment(new Date(dateString)).format('YYYY-MM-DD');
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString('en-US');
  };

  const total = result?.countStageall || 1;
  const done = result?.countSTageTrue || 0;
  const pending = result?.StagesPending || 0;
  const percentDone = ((done / total) * 100);
  const percentPending = ((pending / total) * 100);
  const percentRest = 100 - percentDone - percentPending;

  // تصحيح النسب إذا كان هناك كسور
  const percentDoneFixed = percentDone < 0 ? 0 : percentDone > 100 ? 100 : percentDone;
  const percentPendingFixed = percentPending < 0 ? 0 : percentPending > 100 ? 100 : percentPending;
  const percentRestFixed = percentRest < 0 ? 0 : percentRest > 100 ? 100 : percentRest;

  const arcLengthDone = Math.PI * 90 * (percentDoneFixed / 100);
  const isComplete = percentDoneFixed >= 100;
  const isLate = Number(result?.Daysremaining) < 0;
  const progressBarColor = isComplete ? '#2117FB' : isLate ? '#FF0F0F' : '#1B4ED1';

  const barMax = Math.max(result?.TotalRevenue || 0, result?.TotalExpense || 0, result?.TotalReturns || 0, 1);
  const bar = (value?: number) => (value ? (value / barMax) * 150 : 0);

  return `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          body { 
            font-family: 'Cairo', 'Tajawal', Arial, sans-serif; 
            background: #f7faff; 
            color: #222; 
            margin: 0;
            padding: 20px;
          }
          .container { 
            background: #fff; 
            border-radius: 18px; 
            margin: 0 auto; 
            padding: 24px; 
            max-width: 600px; 
            box-shadow: 0 2px 8px #eee; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 24px; 
          }
          .title { 
            font-size: 28px; 
            color: #1B4ED1; 
            font-weight: bold; 
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            margin: 12px 0; 
          }
          .label { 
            color: #888; 
            font-size: 16px; 
            min-width: 120px; 
          }
          .value { 
            font-size: 17px; 
            font-weight: bold; 
          }
          .divider { 
            border-bottom: 1px solid #eee; 
            margin: 18px 0; 
          }
          .progress-container { 
            text-align: center; 
            margin: 30px 0 10px 0; 
          }
          .progress-label { 
            font-size: 22px; 
            color: #1B4ED1; 
            font-weight: bold; 
          }
          .progress-sub { 
            color: #1abc9c; 
            font-size: 16px; 
          }
          .bar-chart { 
            display: flex; 
            justify-content: space-around; 
            align-items: flex-end; 
            height: 180px; 
            margin: 30px 0 10px 0; 
          }
          .bar-group { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            width: 70px; 
          }
          .bar-value { 
            color: #1B4ED1; 
            font-size: 14px; 
            margin-bottom: 6px; 
            font-weight: bold; 
          }
          .bar { 
            width: 40px; 
            background: #2117FB; 
            border-radius: 8px 8px 0 0; 
          }
          .bar-label { 
            text-align: center; 
            font-size: 14px; 
            margin-top: 6px; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 18px 0; 
          }
          .table th, .table td { 
            border: 1px solid #eee; 
            padding: 8px; 
            text-align: center; 
            font-size: 15px; 
          }
          .table th { 
            background: #f2f6ff; 
            color: #1B4ED1; 
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 13px; 
            color: #666; 
          }
          .date-cell { 
            white-space: nowrap; 
            direction: ltr; 
            text-align: center; 
            font-family: 'Cairo', Arial, sans-serif; 
          }
          .financial-summary {
            border: 2px solid #2222; 
            border-radius: 12px; 
            background: #fff; 
            margin: 20px 0; 
            padding: 16px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
          }
          .financial-icon {
            display: flex; 
            align-items: center;
          }
          .financial-label {
            font-size: 16px;
            color: #888;
            margin-right: 10px;
          }
          .financial-value {
            font-size: 22px;
            font-weight: bold;
            color: #222;
          }
          .currency {
            font-size: 16px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGsAAAApCAYAAAAyL9drAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAPRSURBVHgB7ZzPaxNBFMffRK/NH2Divei5IeItYsRTFSueKmLx0iBY6qFasERoycFgidSDIVWai2IO8dhKexMKPSv13uYPSEG8mDXf3U67dXezP7KzmVn3AyWhbZKZ/b735s3bN2G/fvc0cmBvV6PtTY0OD4j2f1CkZLLGz7UbjApFRlHC5723S9TtknDSaaILx3PN5Zn+3A5mJxYGu/Za0x9lYKI/gTf1FI2lSTiL8xq1Wz0aJbemGJXmUhbRLGK9XYVQox2sHRDsw6cUiUQGoTiZLKNandH4pdOocmb2sgoF4OWVl+LGhrnLIhQ4PNDozs1ef/k59aUTz2p/1mjxqZxCmYF3wcvCpNNfk69f/UMygtD/9ds5/fHEs2BZKoBQdRTioo/3enBPXiPF+DYaxvh0sba3NN3tVADjrJTDu7hrq/LPvbluGKgu1s6mGkJx2i1Nn8DQ79MP/c2G/KEfQmHt0sXCPko1kAh1hhg3XqtK6Af73zUSmwsLBNb2fD64V+C1qoR+0O2SumKBoOk8PEqWDb8flBYLNBv+LjzCn6x7STeUFwt4TedlT9PdiIVYWHsggptglbI6WxQ7YiEWQGqL8gzS+n9BmDT+pq5XgfMUI+A1CImVMgqgRtjDtuSoq643mYmVWByIg3tRcSM2YfB/IBFLIRKxFCIRSyESsRQiEUshErEUIhFLIXxviifypDddjqWNphWUcvDTUegGJppP0JvH+xBRqtrZIunxLBYaDpdfpSh35Wxn0e27TC/zoCn0S0vusg7EKT1hND1jDSgqzMGTWBAKLWBoPLQDv1+pMmJkX0iVhdo7q7Fx+Bwy2Z60t/s9rVmlOeYolJmFpZRjn/aome17lJNQZtC2HHZfYli4imXEd295CP53pSpfzgIDggheKRRJSlxngFsNfoBVTj+UxzJhQH575DMXFfWsICAcyhJKkFB4CeFm0hGcVgmCsJi1XGWRHNEZxOSUfebnhozr7vhlJk4sWDOselQY61Swz8fYZRMMy5HQbABWHfWpRc6zJf/hzww2zbKACIG5CE/dkB1GbaVI0wvF4aZ2f0aebQiPEMLFijqd95umO4FxR3U0dhCzpgQpkquIzHDhhfiwwistYYEoni/UXkYhDIbnv5s0GB6wXZYsH5BMFGWigV4UEks+Psagk1GuIZhLu8/piwRQj+miqrz40fWIzR4Ua0e7gVAwRT96fhMfF3DMKcYYWQYIyos+FoC0eDYzca6Rj+Pxx4mmEsuj2TCuX5pOa3P24uxMQzLq9xAn5+f75uIcmyD8DtuJ7w6w18CO3reSwJtDAAAAABJRU5ErkJggg==" style="max-width:120px;display:block;margin:0 auto 10px auto;" />
            <div class="title">تقرير المشروع</div>
          </div>
          
          <div class="row"><span class="label">المشترك:</span><span class="value">${result?.NameCompany || ''}</span></div>
          <div class="row"><span class="label">اسم المشروع:</span><span class="value">${result?.Nameproject || ''}</span></div>
          <div class="row"><span class="label">النوع:</span><span class="value">${result?.TypeOFContract || ''}</span></div>
          <div class="row"><span class="label">تاريخ البداية:</span><span class="value">${formatDate(result?.startDateProject)}</span></div>
          <div class="row"><span class="label">تاريخ النهاية:</span><span class="value">${formatDate(result?.EndDateProject)}</span></div>
          <div class="row"><span class="label">الزمن المتبقي:</span><span class="value">${formatNumber(result?.Daysremaining)} يوم</span></div>

          <div style="margin: 10px 0;">
            <span style="color: ${progressBarColor}; font-weight: bold; font-size: 18px;">
              ${formatNumber(result?.Daysremaining)} يوم
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
              <text x="110" y="80" text-anchor="middle" font-size="32" fill="#2117FB" font-family="Cairo">${percentDoneFixed.toFixed(1)}%</text>
            </svg>
            <div class="progress-label">منجز</div>
            <div class="progress-sub">${formatNumber(done)} / ${formatNumber(total)} مهمة</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="bar-chart">
            <div class="bar-group">
              <div class="bar" style="height:${bar(result?.TotalRevenue)}px; background:#1abc9c;"></div>
              <div class="bar-label">عهد</div>
            </div>
            <div class="bar-group">
              <div class="bar" style="height:${bar(result?.TotalExpense)}px; background:#FF0F0F;"></div>
              <div class="bar-label">مصروفات</div>
            </div>
            <div class="bar-group">
              <div class="bar" style="height:${bar(result?.TotalReturns)}px; background:#FFAA05;"></div>
              <div class="bar-label">مرتجعات</div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="financial-summary">
            <div class="financial-icon">
              <svg width="70" height="40" viewBox="0 0 70 40">
                <polyline points="5,35 20,20 35,30 50,10 65,35" style="fill:none;stroke:#1abc9c;stroke-width:3"/>
                <polygon points="5,35 65,35 65,40 5,40" style="fill:#b2f1e5;stroke:none"/>
              </svg>
              <span class="financial-label">إجمالي تكاليف المشروع</span>
            </div>
            <div class="financial-value">${formatNumber(result?.TotalcosttothCompany)} <span class="currency">ر.س</span></div>
          </div>
          
          ${(result?.DelayProject && result.DelayProject.length > 0) ? `
          <table class="table">
            <tr>
              <th class="date-cell">التاريخ</th>
              <th>ملاحظة</th>
              <th>المتسبب</th>
              <th>عدد التأخيرات</th>
            </tr>
            ${(result?.DelayProject || []).map(item => `
              <tr>
                <td class="date-cell">${formatDate(item.DateNote)}</td>
                <td>${item.Note || ''}</td>
                <td>${item.Type || ''}</td>
                <td>${formatNumber(item.countdayDelay)}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="row"><span class="label">مدير الفرع:</span><span class="value">${result?.boss || ''}</span></div>
          ${(result?.MostAccomplished || []).map(item => `
            <div class="row"><span class="label">مهندس الموقع:</span><span class="value">${item.userName || ''} (${formatNumber(item.Count)} مهمة، ${(item.rate || 0).toFixed(1)}%)</span></div>
          `).join('')}
          
          <div class="footer">
            <p>تم إنشاء هذا التقرير بتاريخ: ${moment().format('YYYY-MM-DD HH:mm')}</p>
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
      margin: 0.5,
      filename: fileName || defaultFileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    await html2pdf().set(options).from(html).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
};
