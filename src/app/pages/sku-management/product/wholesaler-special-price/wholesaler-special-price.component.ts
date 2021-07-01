import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { WholesalerIndexComponent } from 'app/pages/user-management/wholesaler/index/wholesaler-index.component';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { WholesalerSpecialPriceService } from 'app/services/sku-management/wholesaler-special-price.service';
import { WholesalerService } from 'app/services/user-management/wholesaler.service';

@Component({
  selector: 'app-wholesaler-special-price',
  // templateUrl: './../../../user-management/wholesaler/index/wholesaler-index.component.html',
  templateUrl: './wholesaler-special-price.component.html',
  styleUrls: ['./../../../user-management/wholesaler/index/wholesaler-index.component.scss']
})
export class WholesalerSpecialPriceComponent extends WholesalerIndexComponent {

  @Input() productId;
  @Input() exceptId;
  @Input() businessId;
  @Output() onSelectWholesaler = new EventEmitter();

  constructor(
    router: Router,
    dialogService: DialogService,
    dataService: DataService,
    fuseSplashScreen: FuseSplashScreenService,
    wholesalerService: WholesalerSpecialPriceService,
    formBuilder: FormBuilder,
    dialog: MatDialog,
    geotreeService: GeotreeService
  ) {
    super(
      router,
      dialogService,
      dataService,
      fuseSplashScreen,
      wholesalerService,
      formBuilder,
      dialog,
      geotreeService,
    );

  }

  getWholesalerList() {
    const body = {
      except: this.exceptId,
      product_id: this.productId,
      business_id: this.businessId,
    }
    super.getWholesalerList(body);

  }
  onSelect(event, row) {
    const index = this.selected.findIndex(item => item.id === row.id);

    if (index >= 0) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(row);
    }
    this.onSelectWholesaler.emit(this.selected);

  }
  setPage(pageInfo) {
    const body = {
      except: this.exceptId,
      product_id: this.productId,
      business_id: this.businessId,
    }
    super.setPage(pageInfo, body);
  }
  updateFilter(string) {
    const body = {
      except: this.exceptId,
      product_id: this.productId,
      business_id: this.businessId,
    }
    super.updateFilter(string, body);
  }
  // exportwholesaler() {
  //   const body = {
  //     business_id: this.businessId,
  //   }
  //   super.exportwholesaler(body);
    
  // }
}
