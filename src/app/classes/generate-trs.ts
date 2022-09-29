export class GenerateTRS {
  html(detailOrder) {
    let html = '';
    html += `<html><head> <title>Detail Pemesanan/Preorder - ${detailOrder.invoice_number}</title> <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/> <style type="text/css"> .class{font-family: "Lucida Console", Monaco, monospace;}@page{size: auto; margin: 0.08in;}body{font-size: .8em; padding-left: 15px; padding-right: 15px;}table tr td{font-size: .8em;}br{display: block; margin: 5px 0; line-height: 5px; content: " ";}.p-bottom{padding-bottom: 12px;}.p-bottom-end{padding-bottom: 0px;}.detail1{flex: 1 1 100%; box-sizing: border-box; flex-direction: row; display: flex; place-content: center space-between; align-items: center; max-width: 100%; width: 100%; padding: 5px;}.from{flex-direction: column; box-sizing: border-box; display: flex; max-width: 100%; place-content: flex-start; align-items: flex-start; text-align: left; width: 50%;}.to{flex-direction: column; box-sizing: border-box; display: flex; max-width: 100%; place-content: flex-end; align-items: flex-end; text-align: right; width: 50%;}</style></head><body class="class" onload="load()"> <center> <div style="font-size: 20px; font-weight: 600; text-decoration: underline;">Detail Pemesanan/Preorder</div><div class="py-8" fxFlex="100" fxLayout="row" fxLayoutAlign="center center"> <span>${detailOrder.invoice_number}</span> </div><div class="detail1"> <div class="from"><div><strong>Dari:</strong></div><div>${detailOrder.supplier_company_name ? detailOrder.supplier_company_name.toUpperCase() : '-'}</div><div>${detailOrder.supplier_company_address ? detailOrder.supplier_company_address : '-'}</div><div>${detailOrder.supplier_company_telephone ? detailOrder.supplier_company_telephone : '-'}</div></div><div class="to"><div><strong>Kepada:</strong></div><div>${detailOrder.owner ? detailOrder.owner.toUpperCase() : '-'}</div><div>${detailOrder.wholesaler_name ? detailOrder.wholesaler_name.toUpperCase() : '-'}</div><div>${detailOrder.address ? detailOrder.address : '-'}</div><div>${detailOrder.phone ? detailOrder.phone : '-'}</div></div></div><br/> </center>`;

    html += `<hr style="border-top: solid 1px;" />`;
    for (const obj of detailOrder.products) {
      html += `<table> <tr> <td colspan="4">${obj.name.toUpperCase()}</td></tr><tr nowrap> <td width="250px">${obj.amount}x</td><td width="250px">${obj.packaging.toUpperCase()}</td><td width="250px">${obj.price_str}</td><td width="250px" style="text-align: right;">${obj.total_price_str}</td></tr>`;
      html += `</table>`;
    }
    html += `<hr style="border-top: solid 1px;" />`;

    // if (detailOrder.total_discount_str) {
    //   html += `<div style="text-align: right; font-size:16px"> Voucher Belanja <span style="font-size: 16px; font-weight: 600;">Rp${detailOrder.total_discount_str}</span> </div>`;
    // }
    html += `<div style="text-align: right; font-size:16px"> Total Pesanan <span style="font-size: 16px; font-weight: 600;">Rp${detailOrder.total_str}</span> </div>`;
    if (detailOrder.delivery_cost) {
      html += `<div style="text-align: right; font-size:16px"> Biaya Pengiriman <span style="font-size: 16px; font-weight: 600;">Rp${detailOrder.delivery_cost}</span> </div>`;
    }
    if (detailOrder.total_discount_str) {
      html += `<div style="text-align: right; font-size:16px"> Voucher Belanja <span style="font-size: 16px; font-weight: 600;">Rp${detailOrder.total_discount_str}</span> </div>`;
    }
    html += `<hr style="border-top: solid 1px;"/><div style="text-align: right; font-size:16px"> Total Nilai Pemesanan/Preorder <span style="font-size: 16px; font-weight: 600;">${(detailOrder.grand_total) ? "Rp" + detailOrder.grand_total : detailOrder.total_str}</span> </div>`;

    html += `<br><div class="text-center"> <div style="text-align: left;">${detailOrder.created_at}</div><br><div style="font-size: 14px; text-align: center;">Terima kasih telah</div><div style="font-size: 14px; text-align: center;">menggunakan aplikasi AYO SRC</div></div></body></html>`;
    html += `<script>function load() { setTimeout(function(){ window.focus();window.print();window.close(); }, 200); }</script>`;

    return html;
  }
}