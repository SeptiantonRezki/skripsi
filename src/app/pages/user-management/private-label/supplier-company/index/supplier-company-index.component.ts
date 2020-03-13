import { Component, OnInit, ViewChild, TemplateRef, Inject } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { SupplierCompanyService } from "app/services/user-management/private-label/supplier-company.service";

import { Endpoint } from '../../../../../classes/endpoint';

@Component({
  selector: 'app-supplier-company-index',
  templateUrl: './supplier-company-index.component.html',
  styleUrls: ['./supplier-company-index.component.scss']
})
export class SupplierCompanyIndexComponent implements OnInit {
  onLoad: boolean;

  rows: any[];
  rows_copy: any;
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  offsetPagination: any;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  supplierStatusList: any[] = [
    { name: 'Aktif', status: 'active' },
    { name: 'Non-Aktif', status: 'inactive' }
  ];

  constructor(
    private dataService: DataService,
    private supplierCompanyService: SupplierCompanyService,
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.onLoad = false;
    this.selected = [];
    this.permission = this.roles.getRoles('principal.suppliercompany');

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
    this.getList();
  }
  
  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.supplierCompanyService.getList(this.pagination).subscribe(res => {
      if (res.status == 'success') {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.loadingIndicator = false;
      } else {
        this.dialogService.openSnackBar({ message: "Terjadi Kesalahan Pencarian" });
        Page.renderPagination(this.pagination, res.data);
        this.rows = [];
        this.loadingIndicator = false;
      }
    }, err => {
      console.warn(err);
      this.dialogService.openSnackBar({ message: "Terjadi Kesalahan Pencarian" });
      this.loadingIndicator = false;
    });
  }

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = 1;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.supplierCompanyService.getList(this.pagination).subscribe(
      res => {
        if (res.status == 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data.data;
          this.rows_copy = res.data.data.map((item: any) => ({ ...item }));
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.dialogService.openSnackBar({
            message: res.status
          });
        }
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  directDetail(item?: any): void {
    this.router.navigate(["user-management", "supplier-company", "detail", item.id]);
  }

  selectionStatus(event: any, item: any, i: number) {
    const e = event.value;
    const body = {
      name: item.name,
      address: item.address,
      telephone: item.telephone,
      cellphone: item.cellphone,
      note: item.note,
      products: item.products,
      status: e
    };
    this.supplierCompanyService.updateStatus(body, { supplierId: item.id }).subscribe(res => {
      this.dialogService.openSnackBar({ message: "Berhasil mengubah status" });
    }, err => {
      this.dialogService.openSnackBar({ message: "Gagal mengubah status" });
      this.getList();
    }
  );
  }

  directEdit(item?: any): void {
    this.router.navigate(["user-management", "supplier-company", "edit", item.id]);
  }

  deleteById(id: any) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Supplier Company",
      captionDialog: "Apakah anda yakin untuk menghapus Supplier Company ini?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.supplierCompanyService.delete({ supplierId: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
        this.getList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  onSelect({ selected }) {
    console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  
  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.supplierCompanyService.getList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.supplierCompanyService.getList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }
}
