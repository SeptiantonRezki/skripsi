import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-product-catalogue-edit',
  templateUrl: './product-catalogue-edit.component.html',
  styleUrls: ['./product-catalogue-edit.component.scss']
})
export class ProductCatalogueEditComponent implements OnInit {
  formProduct: FormGroup;
  listCategory: Array<any>;
  listStock: Array<any> = [{ id: 'in-stock', name: 'Tersedia' }, { id: 'out-stock', name: 'Tidak Tersedia' }];
  listStatus: Array<any> = [{ id: 'active', name: 'Aktif' }, { id: 'inactive', name: 'Tidak Aktif' }];
  shortDetail: any;
  detailProduct: any;
  isDetail: Boolean;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private productCatalogueService: ProductCatalogueService,
    private activatedRoute: ActivatedRoute
  ) {
    this.shortDetail = this.dataService.getFromStorage("detail_product_catalogue");
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

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

    this.getDetail();
  }

  getCategories() {
    this.productCatalogueService.getCategories().subscribe(res => {
      this.listCategory = res.data;
    })
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.productCatalogueService.show({ product_id: this.shortDetail.id }).subscribe(res => {
      this.detailProduct = res.data;

      this.formProduct.setValue({
        name: res.data.name,
        description: res.data.description,
        category: res.data.vendor_product_category_id ? res.data.vendor_product_category_id : '',
        price: res.data.price,
        have_community_price: res.data.have_community_price,
        community_min_qty: res.data.community_min_qty,
        community_price: res.data.community_price,
        stage: res.data.stages && res.data.stages.length > 0 ? true : false,
        availability: res.data.availability,
        status: res.data.status,
        images: res.data.images,
        stages: res.data.stages
      });

      if (this.isDetail) this.formProduct.disable();

      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  submit() {
    if (this.formProduct.valid) {
      this.dataService.showLoading(true);

      let body = {
        name: this.formProduct.get('name').value,
        description: this.formProduct.get('description').value,
        vendor_product_category_id: this.formProduct.get('category').value,
        price: this.formProduct.get('price').value,
        have_community_price: this.formProduct.get('have_community_price').value ? 1 : 0,
        community_min_qty: this.formProduct.get('community_min_qty').value,
        community_price: this.formProduct.get('community_price').value,
        stages: this.formProduct.get('stages').value,
        availability: this.formProduct.get('availability').value,
        images: this.formProduct.get('images').value,
        status: this.formProduct.get('status').value
      }

      this.productCatalogueService.update({ product_id: this.detailProduct.id }, body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        });

        this.router.navigate(["/src-catalogue", "products"]);
      }, err => {
        this.dataService.showLoading(false);
      })

    } else {
      this.dataService.showLoading(false);
      commonFormValidator.validateAllFields(this.formProduct);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
    }
  }

}
