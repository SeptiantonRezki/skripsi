import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';


@Component({
  selector: 'app-nontsm-coin',
  templateUrl: './nontsm.component.html',
  styleUrls: ['./nontsm.component.scss']
})
export class NontsmComponent implements OnInit {

  selectedTab: any;
  retailer: any;
  trade:any;
  category: any;
  constructor() {}

  ngOnInit() {
    this.retailer = true;
  }

  changeCategory() {
    console.log(this.category)
    if (this.category === 0) {
      this.retailer = true;
      this.trade = false;
    } else {
      this.retailer = false;
      this.trade = true;
    }
  }
}
