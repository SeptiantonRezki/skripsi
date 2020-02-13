import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-supplier-create',
  templateUrl: './user-supplier-create.component.html',
  styleUrls: ['./user-supplier-create.component.scss']
})
export class UserSupplierCreateComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
