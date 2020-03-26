import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import * as _ from 'underscore';
import { DataService } from 'app/services/data.service';
import { Observable } from 'rxjs';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';

@Component({
  templateUrl: './import-file-dialog.component.html',
  styleUrls: ['./import-file-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CatalogueProductImportFileDialogComponent {
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

  constructor(
    public dialogRef: MatDialogRef<CatalogueProductImportFileDialogComponent>,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private productService: ProductCatalogueService,
    private dataService: DataService
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // this.onBoardChanged.unsubscribe();
  }

  removeFile(): void {
    this.files = undefined;
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);

    // this.productService.previewExcel(fd).subscribe(
    //   res => {
    //     this.jsonData = res.data;

    //     /** map for price */
    //     this.rows = res.data.map(item => {
    //       return {
    //         ...item,
    //         prices: this.convert(item.prices)
    //       }
    //     })

    //     this.isInvalid = this.rows.filter(item => !item.is_valid).length > 0 ? true : false;

    //     /** map for header */
    //     const headers = res.data[0].prices.map(item => {
    //       return [{ "name": `${item.name} Harga Normal` }, { "name": `${item.name} Harga Diskon` }, { "name": `${item.name} Tanggal Kadaluarsa` }]
    //     })

    //     let pushHeader = [];
    //     headers.map(item => item.map(val => {
    //       pushHeader.push(val)
    //     }));

    //     this.headers = pushHeader;
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

  async submit() {
    const validData = this.jsonData.filter(item => item.is_valid === true);
    if (this.files && validData.length > 0 && validData.length <= 10000) {

      let fd = new FormData();
      let done = false;
      let response;
      const data = this.chunk_inefficient(validData, 50);

      console.log(data.length);

      const length = 100 / data.length;
      let current_progress = 0;

      this.importing = !this.importing;
      this.dataService.showLoading(true);
      this.dataService.setProgress({ progress: current_progress.toFixed(0) });

      for (const { item, index } of data.map((item, index) => ({ item, index }))) {
        fd.append('file', JSON.stringify(item));

        // try {
        //   response = await this.productService.importExcel(fd).toPromise();

        //   current_progress = current_progress === 0 ? length : current_progress + length;
        //   this.dataService.setProgress({ progress: current_progress.toFixed(0) });

        // } catch (error) {
        //   this.dataService.showLoading(false);
        //   throw error;
        // }

        done = (index + 1) === data.length ? true : false;
      }

      this.dataService.setProgress({ progress: 100 });
      this.importing = !this.importing;

      if (done) {
        setTimeout(() => {
          this.dialogRef.close(response);
          this.dataService.showLoading(false);
        }, 1000);
      }

      // fd.append('file', JSON.stringify(this.jsonData));

      // this.dataService.showLoading(true);
      // this.productService.importExcel(fd).subscribe(
      //   res => {
      //     this.dialogRef.close(res);
      //     this.dataService.showLoading(false);
      //   },
      //   err => {
      //     this.dataService.showLoading(false);
      //     // this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda, atau pilih Eksport File sebagai acuan File Anda."})
      //   }
      // )

    } else {
      let msg: string;

      if (validData.length > 10000) {
        msg = 'Jumlah SKU melebihi 10.000 baris';
      } else {
        msg = 'Data tidak valid';
      }

      this.dialogService.openSnackBar({ message: msg });
    }
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

  // confirm() {
  //   const leave = confirm('Perhatian: Import sedang berjalan. Tekan Cancel untuk kembali, atau tekan OK untuk meninggalkan halaman ini.');
  //   if (leave) {
  //     return true;
  //   }
  // }

}
