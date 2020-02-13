import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-supplier-company-edit',
  templateUrl: './supplier-company-edit.component.html',
  styleUrls: ['./supplier-company-edit.component.scss']
})
export class SupplierCompanyEditComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
