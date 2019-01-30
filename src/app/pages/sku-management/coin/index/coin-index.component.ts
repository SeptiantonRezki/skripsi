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

  constructor(
    private dataService: DataService
  ) { 
    const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = selectedTab ? selectedTab : 0;
  }

  ngOnInit() {

  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");
    
    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

}
