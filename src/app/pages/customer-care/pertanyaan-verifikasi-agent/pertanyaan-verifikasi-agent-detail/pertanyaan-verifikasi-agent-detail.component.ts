import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { DataService } from 'app/services/data.service';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-pertanyaan-verifikasi-agent-detail',
  templateUrl: './pertanyaan-verifikasi-agent-detail.component.html',
  styleUrls: ['./pertanyaan-verifikasi-agent-detail.component.scss']
})
export class PertanyaanVerifikasiAgentDetailComponent implements OnInit {
  
  formVerifikasiDinamis: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private rpPipe: RupiahFormaterPipe,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit() {
    let {
      tanggal_transaksi,
      wholesaler_name,
      kode_pesanan,
      detil_sku,
      shipping_type,
      total_sku,
      total_transaksi
    } = this.dataService.getFromStorage('customer_care_verif_detail');
    this.formVerifikasiDinamis = this.formBuilder.group({
      tanggal_transaksi: [formatDate(tanggal_transaksi, 'dd/MM/yyyy HH:MM', this.locale)],
      wholesaler_name: [wholesaler_name],
      kode_pesanan: [kode_pesanan],
      detil_sku: [detil_sku],
      shipping_type: [shipping_type],
      total_sku: [total_sku],
      total_transaksi: [this.rpPipe.transform(total_transaksi)],
    });
    this.formVerifikasiDinamis.disable();
  }
  renderDetailSku(): Array<any> {
    const skus = this.formVerifikasiDinamis.get('detil_sku').value as Array<any>;
    let printout = [];
    
    if (skus && skus.length) skus.map(sku => { printout.push(`${sku.name} - ${sku.amount} ${sku.packaging}`) });

    return printout;
  }

}
