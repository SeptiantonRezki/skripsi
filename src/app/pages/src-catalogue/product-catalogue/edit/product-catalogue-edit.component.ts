import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-product-catalogue-edit',
  templateUrl: './product-catalogue-edit.component.html',
  styleUrls: ['./product-catalogue-edit.component.scss']
})
export class ProductCatalogueEditComponent implements OnInit {
  formProduct: FormGroup;
  listCategory: Array<any>;
  listStock: Array<any> = [{ id: 'in-stock', name: 'Tersedia' }, { id: 'out-of-stock', name: 'Tidak Tersedia' }];
  listStatus: Array<any> = [{ id: 'active', name: 'Aktif' }, { id: 'inactive', name: 'Tidak Aktif' }];
  listStages: Array<any> = [
    { checked: false, id: 1, name: 'Baru bergabung menjadi SRC ?' },
    { checked: false, id: 2, name: 'Ingin meningkatkan penjualan toko ?' },
    { checked: false, id: 3, name: 'Ingin mengembangkan usaha lebih besar lagi ?' }
  ]
  listVendor: Array<any>;
  shortDetail: any;
  detailProduct: any;
  isDetail: Boolean;

  image_list: Array<any> = [];
  imageSku: any;
  files: File;
  fileList: Array<File> = [];
  validComboDrag: Boolean;

  vendor_id: any;
  public options: Object = Config.FROALA_CUSTOM_TITLE_CONFIG("Deskripsi Produk");

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private productCatalogueService: ProductCatalogueService,
    private activatedRoute: ActivatedRoute,
    private vendorService: VendorsService
  ) {
    this.shortDetail = this.dataService.getFromStorage("detail_product_catalogue");
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    let profile = this.dataService.getDecryptedProfile();
    if (profile) this.vendor_id = profile.vendor_company_id;
  }

  ngOnInit() {
    this.getVendors();
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
      status: ["active"],
      vendor: [""],
      weight: [null, Validators.required]
    });

    this.getDetail();
  }

  getVendors() {
    this.vendorService.get({ page: 'all' }).subscribe(res => {
      console.log('list vendors', res);
      this.listVendor = res.data ? res.data.data : []
    })
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
        stages: res.data.stages,
        vendor: res.data.vendor_company_id,
        weight: res.data.weight || null
      });

      if (res && res.data) {
        this.image_list = res.data.images;
        this.fileList = res.data.images;

        if (res.data.stages) {
          res.data.stages.map(stg => {
            let foundIdx = this.listStages.findIndex(stgg => stgg.id === stg.id);
            if (foundIdx > -1) {
              this.listStages[foundIdx].checked = true;
            }
          })
        }
      }

      if (this.isDetail) this.formProduct.disable();

      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  checkStages(idx) {
    this.listStages[idx].checked = !this.listStages[idx].checked;
  }

  changeImage(evt) {
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }
    this.fileList = [
      ...this.fileList,
      file
    ]
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image_list = [...this.image_list, myReader.result];
    }

    myReader.readAsDataURL(file);
  }

  removeImage(idx) {
    console.log('index you find!', idx);
    this.image_list.splice(idx, 1);
  }

  submit() {
    if (this.formProduct.valid) {
      this.dataService.showLoading(true);

      let body = {
        name: this.formProduct.get('name').value,
        description: this.formProduct.get('description').value,
        vendor_product_category_id: this.formProduct.get('category').value,
        price: this.formProduct.get('price').value,
        have_community_price: 0,
        community_min_qty: this.detailProduct.community_min_qty,
        community_price: this.detailProduct.community_price,
        stages: this.formProduct.get('stages').value,
        availability: this.formProduct.get('availability').value,
        images: this.fileList,
        status: this.formProduct.get('status').value,
        vendor_company_id: this.vendor_id ? this.vendor_id : this.formProduct.get('vendor').value,
        weight: this.formProduct.get('weight').value
      };
      if (this.formProduct.get('stage').value) {
        body['stages'] = this.listStages.filter(stg => stg.checked).map((stgg) => stgg.id);
      }

      // let fd = new FormData();
      // fd.append('name', this.formProduct.get('name').value);
      // fd.append('description', this.formProduct.get('description').value);
      // fd.append('vendor_product_category_id', this.formProduct.get('category').value);
      // fd.append('price', this.formProduct.get('price').value);
      // fd.append('availability', this.formProduct.get('availability').value);
      // fd.append('status', this.formProduct.get('status').value);
      // fd.append('have_community_price', this.formProduct.get('have_community_price').value);
      // fd.append('community_min_qty', this.formProduct.get('community_min_qty').value);
      // fd.append('community_price', this.formProduct.get('community_price').value);
      // fd.append('stages[]', '');
      // this.fileList.map(imgr => {
      //   fd.append('images[]', imgr);
      // });

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
