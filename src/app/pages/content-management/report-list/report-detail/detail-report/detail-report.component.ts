import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportListService } from 'app/services/content-management/report-list.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'app-detail-report',
  templateUrl: './detail-report.component.html',
  styleUrls: ['./detail-report.component.scss']
})
export class DetailReportComponent implements OnInit {
  id: any;
  formPromo: FormGroup;
  formRiwayat: FormGroup;
  isHistory: Boolean;
  detailReport: any;
  onLoad: Boolean;
  showLoadingBar: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private reportService: ReportListService,
    private dataService: DataService,
    private dialogService: DialogService
  ) {
    this.onLoad = true;
    this.isHistory = this.router.url.indexOf("promo") > -1 ? false : true;
    this.detailReport = this.dataService.getFromStorage("detail_report_item");
  }

  ngOnInit() {
    this.showLoadingBar = true;
    this.formPromo = this.formBuilder.group({
      user: [""],
      promotionType: [""],
      title: [""],
      description: [""],
      promotionDetail: [""],
      promoCreatedDate: [new Date()],
      promoExpiredDate: [new Date()]
    });

    this.formRiwayat = this.formBuilder.group({
      actionPromo: ["Dihapus"],
      promoAdmin: ["Mattie Owen"],
      actionDate: [new Date()]
    });
    this.formRiwayat.disable();
    this.formPromo.disable();
    this.getReportDetail();
  }

  getReportDetail() {
    this.reportService.show({ report_id: this.detailReport.id }).subscribe(res => {
      console.log('detail', this.detailReport, res.data);
      this.detailReport = res.data;
      this.formPromo.setValue({
        user: this.detailReport.banner.user_group,
        promotionType: this.detailReport.banner.category,
        title: this.detailReport.banner.name,
        description: this.detailReport.banner.description,
        promotionDetail: this.detailReport.banner.information,
        promoCreatedDate: this.detailReport.banner.from,
        promoExpiredDate: this.detailReport.banner.to
      });
      if (this.isHistory) {
        this.formRiwayat.setValue({
          actionPromo: this.detailReport.status === 'rejected' ? "Ditolak" : "Dihapus",
          promoAdmin: this.detailReport.banner.user_admin,
          actionDate: this.detailReport.status === 'rejected' ? this.detailReport.rejected_at : this.detailReport.deleted_at
        });
      }
      this.onLoad = false;
      this.showLoadingBar = false;
    }, err => {
      this.onLoad = false;
      this.showLoadingBar = false;
      console.log('err show', err);
    });
  }

  rejectReport(id) {
    this.id = id;
    let data = {
      titleDialog: "Apakah anda yakin ?",
      captionDialog: "Anda akan menolak laporan ini",
      confirmCallback: this.confirmReject.bind(this),
      buttonText: ["YA", "TIDAK"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  deleteReport(id) {
    this.id = id;
    let data = {
      titleDialog: "Apakah anda yakin ?",
      captionDialog: "Anda akan menghapus laporan ini",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["YA", "TIDAK"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmReject() {
    this.reportService.update({ status: 'rejected' }, { report_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        // this.getReportList();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
        this.router.navigate(["content-management", "report-list", "detail", "history"]);
      }
    });
  }

  confirmDelete() {
    this.reportService.update({ status: 'deleted' }, { report_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        // this.getReportList();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
        this.router.navigate(["content-management", "report-list", "detail", "history"]);
      }
    });
  }

}
