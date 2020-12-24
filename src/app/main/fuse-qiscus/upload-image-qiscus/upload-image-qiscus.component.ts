import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { DialogService } from 'app/services/dialog.service';
import { QiscusService } from 'app/services/qiscus.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { Observable, Subject } from 'rxjs';
import * as moment from "moment";

@Component({
  selector: 'app-upload-image-qiscus',
  templateUrl: './upload-image-qiscus.component.html',
  styleUrls: ['./upload-image-qiscus.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UploadImageQiscusComponent implements OnInit {
  loadingIndicator: boolean;
  pagination: Page = new Page();
  offsetPagination: any;
  files: File;
  validComboDrag: boolean;

  dataImage: FormGroup;

  message: any;
  data: any; // data from parent
  rows: any; // data list from API
  rowsTemp: any; // data list from Temporary/History

  keyUp = new Subject<string>();
  myControl = new FormControl();

  progressBar: number;
  isProgressBar: boolean;

  constructor(
    public dialogRef: MatDialogRef<UploadImageQiscusComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private qs: QiscusService,
    private productService: ProductService,
  ) {
    this.loadingIndicator = false;
    this.message = null;
    this.data = data;
    console.log('DATA', data);
    this.rows = [];
    this.rowsTemp = [];
    this.myControl.setValue('');
    this.progressBar = 0;
    this.isProgressBar = false;
    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data, 'search');
      });

    const productListTemp = window.localStorage.getItem('product-list');
    if (productListTemp) {
      this.rowsTemp = JSON.parse(productListTemp).reverse();
    }
  }

  ngOnInit() {
    this.dataImage = this.formBuilder.group({
      image: [""]
    })
  }

  updateFilter(string: any, value: any) {
    // this.pagination['category_id'] = this.formFilter.get('category_id').value;
    // this.pagination.status = this.formFilter.get('status').value;
    if (string) {
      this.loadingIndicator = true;
      this.pagination.search = string;
      this.pagination.page = 1;
      this.offsetPagination = 0;
      this.rows = [];
      this.productService.get(this.pagination).subscribe(res => {
        Page.renderPagination(this.pagination, res.data);
        const rows = res.data ? res.data.data : [];
        if (rows.length > 0) {
          rows.map((item: any) => {
            item.prices.map((itemChild: any) => {
              this.rows.push({
                ...item,
                element: itemChild
              })
            })
          })
        }
        this.loadingIndicator = false;
      });
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  onMessageKeyPress(e: any) {
    console.log('EVENT', e);
  }

  deleteSearch() {
    this.myControl.setValue('');
  }

  async uploadProduk(item: any,) {
    const productListTemp = await window.localStorage.getItem('product-list');
    item = {
      ...item,
      element: item.element
    }
    if (productListTemp) {
      const productListTempParse = await JSON.parse(productListTemp);
      const isAvailableIndex = await productListTempParse.findIndex((itemIndex: any) => { console.log('itemIndex', itemIndex); console.log('item', item); return itemIndex.id == item.id })
      if (productListTempParse.length > 4) {
        if (isAvailableIndex >= 0) {
          productListTempParse.splice(isAvailableIndex, 1);
          window.localStorage.setItem('product-list', JSON.stringify([...productListTempParse, item]));
        } else {
          productListTempParse.splice(0, 1);
          window.localStorage.setItem('product-list', JSON.stringify([...productListTempParse, item]));
        }
      } else if (productListTemp && productListTempParse.length > 0) {
        if (isAvailableIndex >= 0) {
          productListTempParse.splice(isAvailableIndex, 1);
          window.localStorage.setItem('product-list', JSON.stringify([...productListTempParse, item]));
        } else {
          window.localStorage.setItem('product-list', JSON.stringify([...productListTempParse, item]));
        }
      }
    } else {
      window.localStorage.setItem('product-list', JSON.stringify([item]));
    }
    const payload = JSON.stringify({
      type: 'product',
      content: {
        url: item.image_url,
        product_id: item.id,
        product_name: item.name,
        packaging: item.element.packaging ? item.element.packaging : '',
        price: item.price ? item.element.price : 0,
        price_discount: item.element.price_discount ? item.element.price_discount : 0,
        price_discount_rupiah: item.element.price_discount_rupiah ? item.element.price_discount_rupiah : '',
        price_rupiah: item.element.price_rupiah ? item.element.price_rupiah : '',
        product_detail: item,
        caption: this.message
      }
    });
    const uniqueId = String(moment().unix()) + String(Math.random());
    const dataUpload = {
      roomId: this.data.roomId,
      message: this.message ? this.message : '',
      uniqueId: uniqueId,
      payload: payload
    }
    this.dialogRef.close(dataUpload);
  }

  submit() {
    if (this.files && this.files.size <= 10000000) {
      this.isProgressBar = true;
      let reader = new FileReader();
      let file = this.files;
      console.log('READERRESULTFILE', file);
      reader.readAsDataURL(file);
      let self = this;
      reader.onload = () => {
        console.log('READERRESULT', reader.result);
        console.log('ROOMID', this.data.roomId);
        // this.dialogRef.close(reader.result);
        this.qs.qiscus.upload(file, (error: any, progress: any, fileURL: any) => {
          console.log('fileURL', fileURL);
          if (error) { alert('Maaf, Terjadi kesalahan saat mengupload produk'); return console.log('error when uploading', error); }
          if (progress) { this.progressBar = progress.percent; return console.log(progress.percent) };
          if (fileURL !== null && fileURL !== undefined) {
            console.log('fileURLCOMPLETED', fileURL);
            const payload = JSON.stringify({
              type: 'image',
              content: {
                url: fileURL,
                file_name: file.name,
                caption: self.message
              }
            });
            console.log('payload', payload);
            const uniqueId = String(moment().unix()) + String(Math.random());
            const dataUpload = {
              roomId: self.data.roomId,
              message: self.message ? self.message : '',
              uniqueId: uniqueId,
              payload: payload
            }
            this.dialogRef.close(dataUpload);
          }
        });
      };

    } else {
      if (!this.files) {
        this.dialogService.openSnackBar({ message: 'Belum ada gambar yang dipilih' })
      } else {
        this.dialogService.openSnackBar({ message: 'Ukuran gambar melebihi 10MB' })
      }
    }
  }

}
