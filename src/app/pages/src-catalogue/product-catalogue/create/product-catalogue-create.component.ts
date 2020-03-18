import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';

@Component({
  selector: 'app-product-catalogue-create',
  templateUrl: './product-catalogue-create.component.html',
  styleUrls: ['./product-catalogue-create.component.scss']
})
export class ProductCatalogueCreateComponent implements OnInit {
  formProduct: FormGroup;
  listCategory: Array<any>;
  listStock: Array<any> = [{ id: 'in-stock', name: 'Tersedia' }, { id: 'out-stock', name: 'Tidak Tersedia' }];
  listStatus: Array<any> = [{ id: 'active', name: 'Aktif' }, { id: 'inactive', name: 'Tidak Aktif' }];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private productCatalogueService: ProductCatalogueService
  ) { }

  ngOnInit() {
    this.getCategories();

    this.formProduct = this.formBuilder.group({
      name: ["", Validators.required],
      description: ["", Validators.required],
      category: ["", Validators.required],
      images: [],
      stage: [false],
      stages: [],
      price: [0, Validators.required],
      have_community_price: [false],
      community_min_qty: [0],
      community_price: [0],
      availability: ["", Validators.required],
      status: ["active"]
    });
  }

  getCategories() {
    this.productCatalogueService.getCategories().subscribe(res => {
      this.listCategory = res.data;
    })
  }

}
