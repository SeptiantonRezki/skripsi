import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-audience-trade-program',
  templateUrl: './audience-trade-program.component.html',
  styleUrls: ['./audience-trade-program.component.scss']
})
export class AudienceTradeProgramComponent {
  selectedTab: any;

  constructor(
    private dataService: DataService
  ) {
    const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = selectedTab ? selectedTab : 0;
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

}
