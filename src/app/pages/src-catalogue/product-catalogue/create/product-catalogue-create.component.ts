import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

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
  listStages: Array<any> = [
    { checked: false, id: 1, name: 'Baru bergabung menjadi SRC ?' },
    { checked: false, id: 2, name: 'Ingin meningkatkan penjualan toko ?' },
    { checked: false, id: 3, name: 'Ingin mengembangkan usaha lebih besar lagi ?' }
  ]

  image_list: Array<any> = [];
  imageSku: any;
  files: File;
  fileList: Array<File> = [];

  vendor_id: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private productCatalogueService: ProductCatalogueService
  ) {
    let profile = this.dataService.getDecryptedProfile();
    if (profile) this.vendor_id = profile.vendor_company_id;
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
  }

  getCategories() {
    this.productCatalogueService.getCategories().subscribe(res => {
      this.listCategory = res.data;
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
    this.image_list.splice(idx, 1);
    this.fileList.splice(idx, 1);
  }

  submit() {
    if (this.formProduct.valid && this.image_list.length > 0) {
      this.dataService.showLoading(true);
      let fd = new FormData();
      fd.append('name', this.formProduct.get('name').value);
      fd.append('description', this.formProduct.get('description').value);
      fd.append('vendor_product_category_id', this.formProduct.get('category').value);
      fd.append('price', this.formProduct.get('price').value);
      fd.append('availability', this.formProduct.get('availability').value);
      fd.append('status', this.formProduct.get('status').value);
      fd.append('have_community_price', this.formProduct.get('have_community_price').value);
      fd.append('community_min_qty', this.formProduct.get('community_min_qty').value);
      fd.append('community_price', this.formProduct.get('community_price').value);
      fd.append('vendor_company_id', this.vendor_id ? this.vendor_id : -99);

      if (this.formProduct.get('stage').value) {
        this.listStages.map((stgg) => {
          if (stgg.checked) {
            fd.append('stages[]', stgg.id);
          }
        })
      }

      this.fileList.map(imgr => {
        fd.append('images[]', imgr);
      });

      this.productCatalogueService.create(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        });

        this.router.navigate(["/src-catalogue", "products"]);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });

      commonFormValidator.validateAllFields(this.formProduct);
    }
  }

}
