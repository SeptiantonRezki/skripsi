import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail-wrapper.component.html',
  styleUrls: ['./report-detail-wrapper.component.scss']
})
export class ReportDetailComponent implements OnInit {
  selectedTab: any;
  contentTitle: string = "Detail Laporan"

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab");
    // this.selectedTab = selectedTab ? selectedTab : 0;
    this.selectedTab = 0;
  }

  ngOnInit() {
    if (this.router.url.indexOf("promo") > -1) {
      this.contentTitle = "Detail Promo";
    } else {
      this.contentTitle = "Detail Riwayat Promo"
    }
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

}
