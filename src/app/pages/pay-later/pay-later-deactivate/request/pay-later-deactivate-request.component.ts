import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PayLaterDeactivateService } from 'app/services/pay-later/pay-later-deactivate.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { DeactivateReasonDialogComponent } from '../deactivate-reason-dialog/deactivate-reason-dialog.component';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-pay-later-deactivate-request',
  templateUrl: './pay-later-deactivate-request.component.html',
  styleUrls: ['./pay-later-deactivate-request.component.scss']
})
export class PayLaterDeactivateRequestComponent implements OnInit {
  @Input() dataType: string;
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: string;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  offsetPagination: any;
  dialogRef: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private payLaterDeactivateService: PayLaterDeactivateService,
    private dialog: MatDialog,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.selected = [];

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getListDeactivation(true);
  }

  getListDeactivation(resetPage?) {
    this.pagination.page = resetPage ? 1 : this.dataService.getFromStorage("page_deactivate_request");
    this.pagination.sort_type = resetPage ? null : this.dataService.getFromStorage("sort_type_deactivate_request");
    this.pagination.sort = resetPage ? null : this.dataService.getFromStorage("sort_deactivate_request");

    this.dataService.setToStorage("page_deactivate_request", this.pagination.page);
    this.dataService.setToStorage("sort_type_deactivate_request", this.pagination.sort_type);
    this.dataService.setToStorage("sort_deactivate_request", this.pagination.sort);

    this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;
    this.payLaterDeactivateService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page_deactivate_request", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_deactivate_request");
    }

    this.payLaterDeactivateService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page_deactivate_request", this.pagination.page);
    this.dataService.setToStorage("sort_deactivate_request", event.column.prop);
    this.dataService.setToStorage("sort_type_deactivate_request", event.newValue);

    this.payLaterDeactivateService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page_deactivate_request");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.payLaterDeactivateService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  approval(row, status) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { status: status, row: row };

    this.dialogRef = this.dialog.open(
      DeactivateReasonDialogComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getListDeactivation();
      }
    });
  }

}
