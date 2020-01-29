import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ReasonDialogComponent } from '../reason-dialog/reason-dialog.component';

@Component({
  selector: 'app-detail-pengajuan-src',
  templateUrl: './detail-pengajuan-src.component.html',
  styleUrls: ['./detail-pengajuan-src.component.scss']
})
export class DetailPengajuanSrcComponent implements OnInit {
  selectedTab: any = 0;
  shortDetail: any;
  detailPengajuan: any;
  productList: any[] = [];
  orderStatuses: any[] = [];
  statusForm: FormControl = new FormControl('', Validators.required);
  dialogRef: any;

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private pengajuanSrcService: PengajuanSrcService,
    private dialog: MatDialog
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_pengajuan_src');
  }

  ngOnInit() {
    this.getDetail();
  }

  getDetail() {
    this.pengajuanSrcService.show({ pengajuan_id: this.shortDetail.id })
      .subscribe(res => {
        console.log('res', res);
        this.detailPengajuan = res.data;
        if (res && res.data && res.data.product) {
          this.productList = res.data.product;
        }
        if (res && res.data && res.data.available_status) {
          this.orderStatuses = res.data.available_status;
        }
      }, err => {
        console.log('err', err);
      })
  }

  updateStatus() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { agreement: this.statusForm.value };

    this.dialogRef = this.dialog.open(ReasonDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      // if (response) {
      //   this.selected = response;
      //   this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
      // }
    });
  }

}
