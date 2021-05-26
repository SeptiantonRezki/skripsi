import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";

@Component({
  selector: 'app-cashier-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class CashierEditComponent implements OnInit {
  formProductGroup: FormGroup;
  onLoad: boolean = true;
  productId: string;
  isDetail: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private ProductCashierService: ProductCashierService
  ) {
    this.activatedRoute.url.subscribe(params => {
      this.productId = params[2].path;
      this.isDetail = params[1].path === 'detail' ? true : false;
    });
  }

  ngOnInit() {
    this.createFormGroup();
    this.getDetails();
  }

  createFormGroup() {
    this.formProductGroup = this.formBuilder.group({
      name: [""],
      barcode: [""],
      purchase_price: [""],
      selling_price: [""]
    });
  }

  getDetails() {
    try {
      this.ProductCashierService.getdetail(this.productId).subscribe(({ data }) => {
        this.onLoad = false;
        this.formProductGroup.patchValue({
          name: data.name,
          barcode: data.barcode,
          purchase_price: data.purchase_price.raw,
          selling_price: data.selling_price.raw,
        });
      })
    } catch (error) {
      this.onLoad = false;
      console.log(error);
    }
  }

}
