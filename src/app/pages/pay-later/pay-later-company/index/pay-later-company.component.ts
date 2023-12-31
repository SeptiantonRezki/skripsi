import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PayLaterCompanyService } from 'app/services/pay-later/pay-later-company.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-pay-later-company',
  templateUrl: './pay-later-company.component.html',
  styleUrls: ['./pay-later-company.component.scss']
})
export class PayLaterCompanyComponent implements OnInit {
  @Input() dataType: string;
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: string;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private paylaterCompanyService: PayLaterCompanyService,
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
    this.getCompanies(true);
  }

  getCompanies(resetPage?) {
    this.pagination.page = resetPage ? 1 : this.dataService.getFromStorage("page_company");
    this.pagination.sort_type = resetPage ? null : this.dataService.getFromStorage("sort_type_company");
    this.pagination.sort = resetPage ? null : this.dataService.getFromStorage("sort_company");

    this.dataService.setToStorage("page_company", this.pagination.page);
    this.dataService.setToStorage("sort_type_company", this.pagination.sort_type);
    this.dataService.setToStorage("sort_company", this.pagination.sort);

    this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;
    this.paylaterCompanyService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(
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
      this.dataService.setToStorage("page_company", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_company");
    }

    this.paylaterCompanyService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
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

    this.dataService.setToStorage("page_company", this.pagination.page);
    this.dataService.setToStorage("sort_company", event.column.prop);
    this.dataService.setToStorage("sort_type_company", event.newValue);

    this.paylaterCompanyService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
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
      const page = this.dataService.getFromStorage("page_company");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.paylaterCompanyService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directAdd(): void {
    // this.dataService.setToStorage("detail_paylater_company", param);
    this.router.navigate(["paylater", "companies", "create"], {queryParams:{type: this.dataType}});
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_paylater_company", param);
    this.router.navigate(["paylater", "companies", "edit"], {queryParams:{type: this.dataType}});
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_paylater_company", param);
    this.router.navigate(["paylater", "companies", "detail"], {queryParams:{type: this.dataType}});
  }

  deleteCompany(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Spanduk",
      captionDialog: "Apakah anda yakin untuk menghapus spanduk ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.paylaterCompanyService.delete({ company_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getCompanies(true);

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

  updateStatus(row, status) {
    this.id = row.id;
    this.statusRow = status;
    let data = {
      titleDialog: "Ubah Status Perusahaan",
      captionDialog: "Apakah kamu yakin ingin mengubah status Perusahaan ini ?",
      confirmCallback: this.confirmUpdateStats.bind(this),
      orderDetail: true,
      buttonText: ["Ya, Lanjutkan", "Tidak, Batalkan"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmUpdateStats() {
    this.dataService.showLoading(true);
    this.paylaterCompanyService.updateStatus({ company_id: this.id }, { status: this.statusRow }).subscribe(res => {
      if (res && res.data) {
        this.dialogService.openSnackBar({
          message: "Berhasil mengubah status Perusahaan"
        });
      }
      this.dialogService.brodcastCloseConfirmation();
      this.dataService.showLoading(false);
      this.getCompanies();
    }, err => {
      this.dataService.showLoading(false);
    })
  }


}
