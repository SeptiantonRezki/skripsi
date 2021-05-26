import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";

@Component({
  selector: 'app-cashier-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CashierCreateComponent implements OnInit {
  formProductGroup: FormGroup;
  onLoad: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private ProductCashierService: ProductCashierService
  ) { }

  ngOnInit() {
    this.createFormGroup();
  }

  createFormGroup() {
    this.formProductGroup = this.formBuilder.group({
      name: [""],
      barcode: [""],
      purchase_price: [""],
      selling_price: [""]
    });
  }

}
