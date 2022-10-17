import { DomSanitizer } from '@angular/platform-browser';
import { RupiahFormaterWithoutRpPipe } from '@fuse/pipes/rupiah-formater';
import { TranslateInterpolatePipe } from '@fuse/pipes/translateInterpolate.pipe';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from "app/services/languages/languages.service";

export class GenerateReceipt {
    constructor(
        public ls: LanguagesService,
        public pipe: TranslateInterpolatePipe,
        public dataService: DataService
    ) {
    };

    html(detailOrder) {
        return new Promise(async (resolve, reject) => {
            // let rupiahWithoutRp = new RupiahFormaterWithoutRpPipe(this.ls, this.dataService);
            // let pipe = new TranslateInterpolatePipe(this.sanitizer, this.ls);
            let pipe = this.pipe;

            let html = '';
            html += `
            <html>
                <head>
                <title>INVOICE - ${detailOrder.invoice_number}</title>
                <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
                <style type="text/css"> .class {font-family: "Lucida Console", Monaco, monospace;} @page {size: auto;margin: 0.08in;} body {font-size: .8em;padding-left: 15px;padding-right: 15px;} table tr td {font-size: .8em;} br {display: block;margin: 5px 0;line-height: 5px;content: " ";} .p-bottom {padding-bottom: 12px;} .p-bottom-end {padding-bottom: 0px;}</style>
                </head>
                <body class="class" onload="load()">`;
            if (!this.ls.locale.global.nota.custom) {
                html += `
                    <center>
                    <div><strong>${this.ls.locale.global.label.delivery_detail.toUpperCase()}</strong></div>
                    <div><strong>${detailOrder.wholesaler_name.toUpperCase()}</strong></div>
                    <div>${detailOrder.wholesaler_phone}</div>
                    <div>${this.ls.locale.global.label.order_number}: ${detailOrder.invoice_number}</div><br/>${this.ls.locale.global.label.order_detail}<br/>
                    <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"><div>${detailOrder.name.toUpperCase()}</div>
                    <div>${detailOrder.address ? detailOrder.address : '-'}</div>
                    <div>${detailOrder.retailer_address_detail ? 'Detail alamat: ' + detailOrder.retailer_address_detail : '-'}</div>
                    <div>${detailOrder.phone ? detailOrder.phone : '-'}</div>${detailOrder.payment_type === 'pay-later' ?
                        this.ls.locale.global.menu.capital_corner.toUpperCase() : this.ls.locale.global.label.collect_cash.toUpperCase()}</div><br/>
                    </center>`;
            } else {

                html += `<center>`;
                const top_header = []
                this.ls.locale.global.nota.custom.top_header.map((item) => {
                    top_header.push(pipe.transform(`<div>${item}</div>`, detailOrder, false));
                })

                const result_top_header = await Promise.all(top_header);
                console.log({ result_top_header });
                html += result_top_header.join('');

                html += `<br/><div style="border-top: 1px solid #000;"></div>`;

                const bottom_header = []
                this.ls.locale.global.nota.custom.bottom_header.map((item) => {
                    bottom_header.push(pipe.transform(`<div>${item}</div>`, detailOrder, false));
                })

                const result_bottom_header = await Promise.all(bottom_header);
                console.log({ result_bottom_header });
                html += result_bottom_header.join('');

                html += `</center>`;

                html += `<br/><div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></div>`;
            }

            for (const obj of detailOrder.products) {
                html += `<table><tr><td colspan="4">${obj.other_name ? obj.other_name.toUpperCase() : obj.name.toUpperCase()}</td></tr><tr nowrap><td width="250px">${obj.packaging.toUpperCase()}</td><td width="250px">${obj.amount}x</td><td width="250px">${obj.price_nota}</td><td width="250px" style="text-align: right;">${obj.subtotal_nota}</td></tr>`;

                if (obj.discount_nota !== "0" && obj.discount_nota !== "0.00") {
                    html += `<tr nowrap><td colspan="2">&nbsp;</td><td width="250px">disc (-)</td><td width="250px" style="text-align: right;">${obj.discount_nota}</td></tr>`
                }
                html += `</table>`;
            }

            html += `<hr style="border-top: dashed 1px;" />`;

            for (const obj of detailOrder.summary) {
                if (obj.title.toLowerCase() !== this.ls.locale.pesan_produk.text69) {
                    html += `<table width="100%">
                        <tr>
                        <td ${obj.title.toLowerCase() === 'total rokok' || obj.title.toLowerCase() === 'total non rokok' ? 'style="display: list-item;list-type-style: circle;margin-left: 15px;"' : null}>
                        ${obj.title}
                        </td>
                        <td style="text-align: right;">${obj.title.toLowerCase() === 'diskon non rokok' ? '-' : ''} ${obj.value}</td>
                        </tr>
                    </table>`;
                }

                if (obj.title.toLowerCase() === this.ls.locale.pesan_produk.text69) {
                    html += `<hr style="border-top: dashed 1px;" /><table width="100%"><tr><td><strong>${obj.title}</strong></td><td style="text-align: right;"><strong>${obj.value}</strong></td></tr></table>`;
                }
            }

            html += `
            <table width="100%">
            <tr>
            <td>${this.ls.locale.global.label.total_save_spend.toUpperCase()}</td>
            <td style="text-align: right;">${detailOrder.total_discount}</td>
            </tr>
            <tr>
            <td>${detailOrder.status === 'selesai' ? this.ls.locale.global.label.additional_points.toUpperCase() : this.ls.locale.global.label.point_estimate.toUpperCase()}</td>
            <td style="text-align: right;">${detailOrder.point_received}</td>
            </tr>
            </table>`;

            if (detailOrder.point_curs !== "0" && !this.ls.locale.global.nota.custom) {
                html += `<br/><center><div class="p-bottom">
                ${this.ls.locale.global.nota.text1} <div> ${detailOrder.point_curs}</div></div></center>`;
            }
            if(detailOrder.note && (detailOrder.country =="KH")){
                html += `<p style="text-align: left;"><b>${this.ls.locale.global.label.notetoseller_text}:</b>${detailOrder.note}</p>`
            }
            if (detailOrder.payment_type && detailOrder.payment_type === 'pay-later') {
                html += `
                    </br>
                    <div style="margin-top:15px;">
                    <p><strong>${this.ls.locale.global.nota.text2} VIRTUAL ACCOUNT.</strong></p>
                    </div>
                `
                if (detailOrder.paylater_va) {
                    detailOrder.paylater_va.map(bank => {
                        html += `
                            </br>
                            <p>${bank.bankName} : ${bank.vaNumber} (${detailOrder.paylater_group_name})</P>
                        `
                    })
                }

                html += `
                <p>
                <strong>${this.ls.locale.global.nota.text3}
                ${(detailOrder.total_payment_format_currency).replace(`${this.ls.locale.global.currency}`, '')}
                </strong>
                </p>
                <p><strong>${this.ls.locale.global.nota.text4}
                    ${detailOrder.paylater_due_date}</strong></p>
                <p style="font-size: 14px;">
                ${this.ls.locale.global.nota.text5}
                </p>

                <br/><br/><div style="border-bottom: 1px solid black;margin-top:15px;margin-bottom:15px;"><b>
                ${this.ls.locale.global.nota.text6} ${detailOrder.paylater_group_name})</b>
                </div>
                `
                detailOrder.customer_contact.map(contact => {
                    html += `
                        <center><p>${contact.title} ${contact.value}</p></center>
                    `
                })
            }

            if (detailOrder && detailOrder.advocacy && Array.isArray(detailOrder.advocacy)) {
                detailOrder.advocacy.map(adv => {
                    html += `<p style="text-align: center;font-style: italic;">"${adv}"</p>`
                });
            }

            if (!this.ls.locale.global.nota.custom) {
                html += `<center><div class="p-bottom">${this.ls.locale.global.nota.text7}<div>${detailOrder.order_prepared_by.toUpperCase()}</div>${detailOrder.created_at}</div>`
                if (this.ls.selectedLanguages === 'id') {
                    html += `<div class="p-bottom">CUSTOMER SERVICE AYO SRC <div>0804 1000 234</div></div>`
                }
                html += `</center>`;
            } else {
                html += `<center>`;

                const footer = [];
                this.ls.locale.global.nota.custom.footer.map((item) => {
                    footer.push(pipe.transform(`<div>${item}</div>`, detailOrder, false));
                })

                const result_footer = await Promise.all(footer);
                console.log({ result_footer });
                html += result_footer.join('');
                html += `</center>`;

            }
            html += `<div class="p-bottom-end">&nbsp;</div></body></html>`;
            html += `<script>function load() { setTimeout(function(){ window.focus();window.print();window.close(); }, 200); }</script>`;

            resolve(html);
        });
    }
    muliplehtmlInvoices(detailOrders) {
        // let detailOrder = detailOrders[0];
        return new Promise(async (resolve, reject) => {
            // let rupiahWithoutRp = new RupiahFormaterWithoutRpPipe(this.ls, this.dataService);
            // let pipe = new TranslateInterpolatePipe(this.sanitizer, this.ls);
            let pipe = this.pipe;
    
            let html = '';
            html += `
        <html>
            <head>
            <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
            <style type="text/css"> .class {font-family: "Lucida Console", Monaco, monospace;} @page {size: auto;margin: 0.08in;} body {font-size: .8em;padding-left: 15px;padding-right: 15px;} table tr td {font-size: .8em;} br {display: block;margin: 5px 0;line-height: 5px;content: " ";} .p-bottom {padding-bottom: 12px;} .p-bottom-end {padding-bottom: 0px;}</style>
            </head>
            <body class="class" onload="load()">`;
            let counter = 1;
            for (const detailOrder of detailOrders) {
                if (!this.ls.locale.global.nota.custom) {
                    html += `
                <center>
                <div><strong>${this.ls.locale.global.label.delivery_detail.toUpperCase()}</strong></div>
                <div><strong>${detailOrder.wholesaler_name.toUpperCase()}</strong></div>
                <div>${detailOrder.wholesaler_phone}</div>
                <div>${this.ls.locale.global.label.order_number}: ${detailOrder.invoice_number}</div><br/>${this.ls.locale.global.label.order_detail}<br/>
                <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"><div>${detailOrder.name.toUpperCase()}</div>
                <div>${detailOrder.address ? detailOrder.address : '-'}</div>
                <div>${detailOrder.retailer_address_detail ? 'Detail alamat: ' + detailOrder.retailer_address_detail : '-'}</div>
                <div>${detailOrder.phone ? detailOrder.phone : '-'}</div>${detailOrder.payment_type === 'pay-later' ?
                            this.ls.locale.global.menu.capital_corner.toUpperCase() : this.ls.locale.global.label.collect_cash.toUpperCase()}</div><br/>
                </center>`;
                } else {
    
                    html += `<center>`;
                    const top_header = []
                    this.ls.locale.global.nota.custom.top_header.map((item) => {
                        top_header.push(pipe.transform(`<div>${item}</div>`, detailOrder, false));
                    })
    
                    const result_top_header = await Promise.all(top_header);
                    console.log({ result_top_header });
                    html += result_top_header.join('');
    
                    html += `<br/><div style="border-top: 1px solid #000;"></div>`;
    
                    const bottom_header = []
                    this.ls.locale.global.nota.custom.bottom_header.map((item) => {
                        bottom_header.push(pipe.transform(`<div>${item}</div>`, detailOrder, false));
                    })
    
                    const result_bottom_header = await Promise.all(bottom_header);
                    console.log({ result_bottom_header });
                    html += result_bottom_header.join('');
    
                    html += `</center>`;
    
                    html += `<br/><div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></div>`;
                }
    
                for (const obj of detailOrder.products) {
                    html += `<table><tr><td colspan="4">${obj.other_name ? obj.other_name.toUpperCase() : obj.name.toUpperCase()}</td></tr><tr nowrap><td width="250px">${obj.packaging.toUpperCase()}</td><td width="250px">${obj.amount}x</td><td width="250px">${obj.price_nota}</td><td width="250px" style="text-align: right;">${obj.subtotal_nota}</td></tr>`;
    
                    if (obj.discount_nota !== "0" && obj.discount_nota !== "0.00") {
                        html += `<tr nowrap><td colspan="2">&nbsp;</td><td width="250px">disc (-)</td><td width="250px" style="text-align: right;">${obj.discount_nota}</td></tr>`
                    }
                    html += `</table>`;
                }
    
                html += `<hr style="border-top: dashed 1px;" />`;
    
                for (const obj of detailOrder.summary) {
                    if (obj.title.toLowerCase() !== this.ls.locale.pesan_produk.text69) {
                        html += `<table width="100%">
                    <tr>
                    <td ${obj.title.toLowerCase() === 'total rokok' || obj.title.toLowerCase() === 'total non rokok' ? 'style="display: list-item;list-type-style: circle;margin-left: 15px;"' : null}>
                    ${obj.title}
                    </td>
                    <td style="text-align: right;">${obj.title.toLowerCase() === 'diskon non rokok' ? '-' : ''} ${obj.value}</td>
                    </tr>
                </table>`;
                    }
    
                    if (obj.title.toLowerCase() === this.ls.locale.pesan_produk.text69) {
                        html += `<hr style="border-top: dashed 1px;" /><table width="100%"><tr><td><strong>${obj.title}</strong></td><td style="text-align: right;"><strong>${obj.value}</strong></td></tr></table>`;
                    }
                }
    
                html += `
        <table width="100%">
        <tr>
        <td>${this.ls.locale.global.label.total_save_spend.toUpperCase()}</td>
        <td style="text-align: right;">${detailOrder.total_discount}</td>
        </tr>
        <tr>
        <td>${detailOrder.status === 'selesai' ? this.ls.locale.global.label.additional_points.toUpperCase() : this.ls.locale.global.label.point_estimate.toUpperCase()}</td>
        <td style="text-align: right;">${detailOrder.point_received}</td>
        </tr>
        </table>`;
    
                if (detailOrder.point_curs !== "0" && !this.ls.locale.global.nota.custom) {
                    html += `<br/><center><div class="p-bottom">
            ${this.ls.locale.global.nota.text1} <div> ${detailOrder.point_curs}</div></div></center>`;
                }
                if (detailOrder.note && (detailOrder.country == "KH")) {
                    html += `<p style="text-align: left;">${this.ls.locale.global.label.notetoseller_text}:${detailOrder.note}</p>`
                }
                if (detailOrder.payment_type && detailOrder.payment_type === 'pay-later') {
                    html += `
                </br>
                <div style="margin-top:15px;">
                <p><strong>${this.ls.locale.global.nota.text2} VIRTUAL ACCOUNT.</strong></p>
                </div>
            `
                    if (detailOrder.paylater_va) {
                        detailOrder.paylater_va.map(bank => {
                            html += `
                        </br>
                        <p>${bank.bankName} : ${bank.vaNumber} (${detailOrder.paylater_group_name})</P>
                    `
                        })
                    }
    
                    html += `
            <p>
            <strong>${this.ls.locale.global.nota.text3}
            ${(detailOrder.total_payment_format_currency).replace(`${this.ls.locale.global.currency}`, '')}
            </strong>
            </p>
            <p><strong>${this.ls.locale.global.nota.text4}
                ${detailOrder.paylater_due_date}</strong></p>
            <p style="font-size: 14px;">
            ${this.ls.locale.global.nota.text5}
            </p>
    
            <br/><br/><div style="border-bottom: 1px solid black;margin-top:15px;margin-bottom:15px;"><b>
            ${this.ls.locale.global.nota.text6} ${detailOrder.paylater_group_name})</b>
            </div>
            `
                    detailOrder.customer_contact.map(contact => {
                        html += `
                    <center><p>${contact.title} ${contact.value}</p></center>
                `
                    })
                }
    
                if (detailOrder && detailOrder.advocacy && Array.isArray(detailOrder.advocacy)) {
                    detailOrder.advocacy.map(adv => {
                        html += `<p style="text-align: center;font-style: italic;">"${adv}"</p>`
                    });
                }
    
                if (!this.ls.locale.global.nota.custom) {
                    html += `<center><div class="p-bottom">${this.ls.locale.global.nota.text7}<div>${detailOrder.order_prepared_by.toUpperCase()}</div>${detailOrder.created_at}</div>`
                    if (this.ls.selectedLanguages === 'id') {
                        html += `<div class="p-bottom">CUSTOMER SERVICE AYO SRC <div>0804 1000 234</div></div>`
                    }
                    html += `</center>`;
                } else {
                    html += `<center>`;
    
                    const footer = [];
                    this.ls.locale.global.nota.custom.footer.map((item) => {
                        footer.push(pipe.transform(`<div>${item}</div>`, detailOrder, false));
                    })
    
                    const result_footer = await Promise.all(footer);
                    console.log({ result_footer });
                    html += result_footer.join('');
                    html += `</center>`;
    
                }
                if(detailOrders.length !== counter ){
                    html+= `<p style="page-break-after: always;">&nbsp;</p><p style="page-break-before: always;">&nbsp;</p>`;
                }
               counter++;
            }
            html += `<div class="p-bottom-end">&nbsp;</div></body></html>`;
    
            html += `<script>function load() { setTimeout(function(){ window.focus();window.print();window.close(); }, 200); }</script>`;
    
            resolve(html);
        });
    }
}