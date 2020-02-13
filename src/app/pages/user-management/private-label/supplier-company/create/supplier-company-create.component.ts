import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-supplier-company-create',
  templateUrl: './supplier-company-create.component.html',
  styleUrls: ['./supplier-company-create.component.scss']
})
export class SupplierCompanyCreateComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
