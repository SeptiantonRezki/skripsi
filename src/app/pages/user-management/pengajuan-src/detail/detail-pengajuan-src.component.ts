import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ReasonDialogComponent } from '../reason-dialog/reason-dialog.component';
import { PagesName } from 'app/classes/pages-name';
import { LanguagesService } from 'app/services/languages/languages.service';

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
  onLoad: Boolean;

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private pengajuanSrcService: PengajuanSrcService,
    private dialog: MatDialog,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.permission = this.roles.getRoles("principal.pengajuansrc");
    this.shortDetail = this.dataService.getFromStorage('detail_pengajuan_src');
  }

  ngOnInit() {
    this.getDetail();
  }

  getDetail() {
    this.pengajuanSrcService.show({ pengajuan_id: this.shortDetail.id })
      .subscribe(res => {
        console.log('res', res);
        this.onLoad = false
        this.detailPengajuan = res.data;
        if (res && res.data && res.data.product) {
          this.productList = res.data.product;
        }
        if (res && res.data && res.data.available_status) {
          this.orderStatuses = res.data.available_status;
        }
        console.log(this.permission.ubah, this.orderStatuses)
      }, err => {
        this.onLoad = false
        console.log('err', err);
      })
  }

  updateStatus() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { agreement: this.statusForm.value, pengajuan_id: this.shortDetail.id };

    this.dialogRef = this.dialog.open(ReasonDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.getDetail();
      }
    });
  }

  renderStatusName(status) {
    switch (status) {
      case 'new':
        return { name: 'APLIKASI MASUK', bgColor: '#34a5eb', textColor: '#fff' };
      case 'processed':
        return { name: 'APLIKASI DALAM PROSES', bgColor: '#ebd034', textColor: '#000' };
      case 'approved':
        return { name: 'APLIKASI DISETUJUI', bgColor: '#35c704', textColor: '#fff' };
      default:
        return { name: 'APLIKASI DITOLAK', bgColor: '#ff2626', textColor: '#fff' }
    }
  }

}
