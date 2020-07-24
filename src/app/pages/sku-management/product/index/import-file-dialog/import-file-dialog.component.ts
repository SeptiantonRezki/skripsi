import { Component, OnInit, ViewEncapsulation, HostListener, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import * as _ from 'underscore';
import { DataService } from 'app/services/data.service';
import { Observable } from 'rxjs';
import { ProductService } from "app/services/sku-management/product.service";
import { VendorsService } from 'app/services/src-catalogue/vendors.service';
import { element } from 'protractor';


@Component({
  selector: 'app-import-file-dialog',
  templateUrl: './import-file-dialog.component.html',
  styleUrls: ['./import-file-dialog.component.scss']
})
export class ImportFileDialogComponent implements OnInit {

  files: File;
  validComboDrag: boolean;

  dataImage: FormGroup;
  uploading: Boolean;
  rows: any[];
  headers: any[];
  jsonData: any[];
  asd: any[] = [];
  importing: Boolean = false;
  isInvalid: Boolean;
  payload: any;
  listVendor: Array<any>;
  vendorCompany: FormControl = new FormControl('');
  vendor_id: any;

  constructor(
    public dialogRef: MatDialogRef<ImportFileDialogComponent>,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private productService: ProductService,
    private dataService: DataService,
    private vendorService: VendorsService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.payload = data;
    this.rows = [];
    this.dataService.showLoading(false);
    let profile = this.dataService.getDecryptedProfile();
    if (profile) this.vendor_id = profile.vendor_company_id;
  }

  ngOnInit() {
    console.log('valid', this.validComboDrag);
  }

  ngOnDestroy() {
    // this.onBoardChanged.unsubscribe();
  }

  removeFile(): void {
    this.files = undefined;
  }

  preview(event) {
    console.log('valid', this.validComboDrag);
    // console.log(event);

    this.files = undefined;
    this.files = event;

    console.log('test: ',this.files);

    let fd = new FormData();
    fd.append('file', this.files);
    // this.dataService.showLoading(true);

    // this.productService.previewImport({ company_id: this.payload.company_id ? this.payload.company_id : this.vendorCompany.value }, fd).subscribe(
    //   res => {
    //     this.rows = res && res.data ? res.data.data : [];
    //     this.isInvalid = res.data.is_valid ? false : true;
    //     this.dataService.showLoading(false);
    //   },
    //   err => {
    //     this.dataService.showLoading(false);
    //     this.files = undefined;

    //     if (err.status === 404 || err.status === 500)
    //       this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda, atau pilih Eksport File sebagai acuan File Anda." })
    //   }
    // )
  }

  async submit(event) {
    console.log('test: ',this.files);
    // const validData = this.rows.filter(item => item.is_valid === true);
    // if (this.files && validData.length > 0 && validData.length <= 10000) {

      // console.log('valid', this.validComboDrag);
      // console.log(event);

      // this.files = undefined;
      // this.files = event;


      let fd = new FormData();
      fd.append('file', this.files);

      this.dataService.showLoading(true);
      this.productService.import(null, fd).subscribe(
        res => {
          this.dialogRef.close(res);
          this.dataService.showLoading(false);
        },
        err => {
          this.dataService.showLoading(false);
          // this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda, atau pilih Eksport File sebagai acuan File Anda."})
        }
      )

    // } else {
    //   let msg: string;

    //   if (validData.length > 10000) {
    //     msg = 'Jumlah SKU melebihi 10.000 baris';
    //   } else {
    //     msg = 'Data tidak valid';
    //   }

    //   this.dialogService.openSnackBar({ message: msg });
    // }
  }

  convert(array) {
    let convertedArray: any[] = [];
    array.map((obj, index) => {
      let entriedObject = Object.entries(obj).map(([key, value]) => ({ key, value }));
      let query = obj.name.replace(' ', '_').toLowerCase();
      let filterObjName = entriedObject.filter(item => item['key'].indexOf(query) >= 0);

      let newObjPrice = filterObjName.map(asd => asd.key).map(asd => { return { "value": obj[asd] } });
      convertedArray.push(...newObjPrice);
    })

    return convertedArray;
  }

  chunk_inefficient(array, chunkSize) {
    return [].concat.apply([],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  }

}
