import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent {
  selectedTab: any;

  constructor(
    private dataService: DataService,
    private ls: LanguagesService
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
