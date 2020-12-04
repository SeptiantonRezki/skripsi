import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoinService } from 'app/services/sku-management/coin.service';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-coin-index',
  templateUrl: './coin-index.component.html',
  styleUrls: ['./coin-index.component.scss']
})
export class CoinIndexComponent {

  selectedTab: any;
  tsm: any;
  nontsm:any;

  constructor(
  ) {
   }

  ngOnInit() {
    this.nontsm = true;
  }
  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    console.log(tabChangeEvent.index);
    if (tabChangeEvent.index === 0) {
      this.nontsm = true;
      this.tsm = false;
    } else {
      this.nontsm = false;
      this.tsm = true;
    }
  }

}
