import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinAdjustmentApprovalService } from 'app/services/dte/coin-adjustment-approval.service';

@Component({
  selector: 'app-approval-history',
  templateUrl: './approval-history.component.html',
  styleUrls: ['./approval-history.component.scss']
})
export class ApprovalHistoryComponent implements OnInit {
  dataApproval: any = {};
  onLoad: Boolean = true;
  showLoading: Boolean;

  permissionCoinAdjustment: any;
  permissionNotifikasi: any;
  roles: PagesName = new PagesName();

  loadingIndicator: boolean;
  rows: any[];
  pagination: Page = new Page();

  idApproval: any;
  isTSM: Boolean = false;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  constructor(
    private adapter: DateAdapter<any>,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private coinAdjustmentApprovalService: CoinAdjustmentApprovalService,
    private dataService: DataService,
  ) {
    this.permissionCoinAdjustment = this.roles.getRoles('principal.dtecoinadjustmentapproval');
    this.permissionNotifikasi = this.roles.getRoles('principal.dtenotifikasiapprovalcoinadjustment');
    // console.log(this.permissionCoinAdjustment, this.permissionNotifikasi);

    this.rows = [];
    this.loadingIndicator = false;

    activatedRoute.url.subscribe(param => {
      this.idApproval = param[2].path;
      this.isTSM = param[1] && param[1].path.indexOf("tsm") > -1 ? true : false;
    });

    this.adapter.setLocale('id');
  }

  ngOnInit() {
    this.coinAdjustmentApprovalService.getApprovalHistory({ id: this.idApproval }).subscribe(res => {
      const paginate = {
        page: 1,
        total: res.data.length
      };

      Page.renderPagination(this.pagination, paginate);
      this.rows = res.data.reverse();
      this.onLoad = false;
    }, err => {
      this.onLoad = false;
      console.log(err);
    });
  }
}
