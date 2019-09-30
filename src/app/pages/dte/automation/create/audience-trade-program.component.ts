import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-audience-trade-program',
  templateUrl: './audience-trade-program.component.html',
  styleUrls: ['./audience-trade-program.component.scss']
})
export class AudienceTradeProgramComponent implements OnInit {
  selectedTab: any;
  formAutomation: FormGroup;
  listAutomation: any[] = [
    { name: 'E-Order', value: 'e-order' },
    { name: 'Digital Coupon', value: 'coupon' },
    { name: 'Referral Code', value: 'referral_code' }
  ];

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.formAutomation = this.formBuilder.group({
      automation: ['e-order', Validators.required]
    });
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

}
