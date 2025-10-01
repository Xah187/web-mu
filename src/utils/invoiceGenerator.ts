'use client';

import { FinanceItem } from '@/hooks/useFinance';

interface CompanyData {
  nameCompany: string;
  nameBransh: string;
  nameProject: string;
  Email: string;
  PhoneNumber: string;
  Country: string;
}

export const generateInvoiceHTML = (
  item: FinanceItem,
  type: 'BringRevenue' | 'BringExpense' | 'BringReturns',
  companyData: CompanyData
): string => {
  const operationType = type === 'BringRevenue' ? 'عهد' : type === 'BringExpense' ? 'مصروفات' : 'مرتجعات';
  const operationId = type === 'BringRevenue' ? item.RevenueId : type === 'BringExpense' ? item.Expenseid : item.ReturnsId;

  // Format current date in Arabic format (DD/MM/YYYY)
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}م`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
<title>Receipt Voucher</title>
<style>
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
  
  .page {
    width: 794px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    border: 3px dashed #2117fb;
  }
  .header {
    display: flex;
    justify-content:space-between;
    align-items: center;
    border: 3px dashed #2117fb;
    border-radius: 15px;
    padding: 10px;
  }
  .header1{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: right;
    margin:10px
  }
  .header-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .text-header-right{
    font-family: "Tajawal", system-ui;
    font-size: 17px;
  }

  h1{
    font-family: "Tajawal", system-ui;
    font-size: 20px;
}
.header-medium{
    justify-content: center;
    align-items: center;
    text-align: center;
}
  .header-left img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
  }
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }
  .header-right p {
    margin: 0;
    font-size: 14px;
  }

  .title {
    text-align: center;
    margin: 20px 0;
    font-family: "Tajawal", system-ui;
  }
  
  .title h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    font-family: "Tajawal", system-ui;
  }
  
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: center;
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .form-row {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex: 0.5;
  }
  
  .form-label {
    font-weight: bold;
    font-family: "Tajawal", system-ui;
    margin: 15px;
    margin-left: 20px;
  }
  
  .form-input {
    padding: 8px;
    border: 1px solid #2117fb;
    border-radius: 10px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .form-input p {
    margin: 0;
    font-family: "Tajawal", system-ui;
  }
  
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    background-color: #2117fb;
    padding: 10px;
  }
  .footer-left {
    display: flex;
    align-items: center;
  }
  .footer-left p {
    font-size: 13px;
    font-family: 'Tajawal' , system-ui;
    color: #fff;
  }
  .footer-right {
    display: flex;
    align-items: center;
  }

  .footer-right p {
    margin: 0;
    font-size: 14px;
    font-family: 'Tajawal' , system-ui;
    color: #fff;
  }
.logo {
  width: 80px;
  height: auto; /* Maintain aspect ratio */
}

</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header1">
      <p class="text-header-right">No:${operationId || ''}</p>
      <p class="text-header-right">التاريخ: ${formattedDate}</p>
    </div>
        <h1 style="position: absolute;left: 28%; ;font-size: 30px; color:#ffc900 ;display:${item.InvoiceNo !== undefined ? 'flex' : 'none'}">${item.InvoiceNo || ''}</h1>
    <div class="header-medium">
      <h1>${companyData.nameCompany}</h1>
      <h1 style="font-size: 17px;">الفرع: ${companyData.nameBransh}</h1>
      <h1 style="font-size: 17px;"></h1>
    </div>
    <div class="header-left">
      <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" style="width: 80px;height: 40px;" class="logo"/>
      <h1>منصة مشرف</h1>
    </div>
  </div>

  <div class="title">
    <h1>${operationType}</h1>
    <!-- <p>Receipt Voucher</p> -->
  </div>
  
  <div class="form">
    <div class="form-row">
      <div class="form-label">السيد / السادة</div>
      <div class="form-input">
        <p>${companyData.nameProject}</p>
      </div>
      <div class="form-label">الموقر</div>
    </div>
    
    <div class="form-row">
      <div class="form-label">مبلغ وقدره</div>
      <div class="form-input">
        <p>فقط ${item.Amount} ريال سعودي لا غير</p>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-row" style=" display:${item.Bank !== undefined ? 'flex' : 'none'} " >

          <div class="form-label" style=" display:${item.Bank !== undefined ? 'flex' : 'none'} " >
            ${item.Bank !== undefined ? 'البنك' : ' '}
          </div>
          <div class="form-input" style="margin-right: 35px; display:${item.Bank !== undefined ? 'flex' : 'none'} ">
            <p>${item.Bank !== undefined ? item.Bank : ' '}.</p>
          </div>

      </div>
      <div class="form-row" style="flex:${item.Bank === undefined ? '1' : '0.5'}"  >
        <div class="form-label">تاريخ</div>
        <div class="form-input" >
          <p>${new Date(item.Date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-label">مقابل</div>
      <div class="form-input" style="margin-right: 35px;">
        <p>
            ${item.Data}
        </p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <p>${companyData.Email}</p>
    </div>
    <div class="footer-right">
      <p>${companyData.PhoneNumber}</p>
    </div>
    <div class="footer-right">
      <p>${companyData.Country}</p>
    </div>
  </div>

</div>
</body>
</html>
`;
};

export const generateInvoicePDF = async (
  item: FinanceItem,
  type: 'BringRevenue' | 'BringExpense' | 'BringReturns',
  companyData: CompanyData,
  download: boolean = false
): Promise<void> => {
  const html = generateInvoiceHTML(item, type, companyData);

  if (download) {
    // Download as PDF using html2pdf
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const operationType = type === 'BringRevenue' ? 'عهد' : type === 'BringExpense' ? 'مصروفات' : 'مرتجعات';
      const operationId = type === 'BringRevenue' ? item.RevenueId : type === 'BringExpense' ? item.Expenseid : item.ReturnsId;
      const fileName = `${operationType}_${operationId}_${new Date().toISOString().split('T')[0]}.pdf`;

      const options = {
        margin: 0.5,
        filename: fileName,
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

      // Create a temporary div to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      await html2pdf().set(options).from(tempDiv).save();

      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  } else {
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  }
};

