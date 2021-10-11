import { Component, OnInit } from '@angular/core';
import { Emitter } from 'app/helper/emitter.helper';
// import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-voucher-principal-detail-tab',
  templateUrl: './voucher-principal-detail-tab.component.html',
  styleUrls: ['./voucher-principal-detail-tab.component.scss']
})
export class VoucherPrincipalDetailTabComponent implements OnInit {
  onLoad: boolean;
  selectedTab: any;
  belum_terpakai = ['name', 'owner', 'phone', 'classification', 'status_pelanggan', 'tier', 'voucher_total', 'voucher_remaining'];
  terpakai = ['name', 'owner', 'phone', 'classification', 'tier', 'voucher_redeem', 'status_pesanan', 'order_date', 'invoice_number', 'payment_date'];

  constructor(
    public emitter: Emitter,
    // public ls: LanguagesService,
  ) {
    this.onLoad = false;
    this.emitter.listenNotifDetailEmitter.subscribe((value: any) => {
      if (value.isMitraHub) {
        this.selectedTab = 1;
      }
    });
  }

  ngOnInit() {
  }

  selectedTabChange(event: any) {
    this.selectedTab = event;
  }

}
