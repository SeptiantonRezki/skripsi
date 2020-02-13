import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-supplier-edit',
  templateUrl: './user-supplier-edit.component.html',
  styleUrls: ['./user-supplier-edit.component.scss']
})
export class UserSupplierEditComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
