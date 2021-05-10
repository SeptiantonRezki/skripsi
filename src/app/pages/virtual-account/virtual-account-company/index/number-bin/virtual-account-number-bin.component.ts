import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { VirtualAccountCompanyService } from 'app/services/virtual-account/virtual-account-company.service';
import { VirtualAccountBinService } from 'app/services/virtual-account/virtual-account-bin.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-virtual-account-number-bin',
  templateUrl: './virtual-account-number-bin.component.html',
  styleUrls: ['./virtual-account-number-bin.component.scss']
})
export class VirtualAccountNumberBinComponent implements OnInit {
  formBin: FormGroup;
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
  listCompany: Array<any>;
  listCompanyMap: any = {};
  listBank: Array<any>;
  listBankMap: any = {};

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private VirtualAccountBinService: VirtualAccountBinService,
    private VirtualAccountCompanyService: VirtualAccountCompanyService,
    private formBuilder: FormBuilder,
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
    this.getBanks();
    this.getBins();
  }

  getBanks() {
    this.VirtualAccountCompanyService.bankList({}).subscribe(res => {
      this.listBank = res.data;
      this.listBank.forEach(bank => {
        this.listBankMap[bank.code] = bank.name;
      });
      console.log(res.data);
      this.getCompanies();
    }, err=> {

    })
  }
  
  getCompanies() {
    this.VirtualAccountBinService.list({}).subscribe(res => {
      this.listCompany = res.data.data
      this.listCompany.forEach(company => {
        this.listCompanyMap[company.id] = this.listBankMap[company.name];
      });
      console.log(res.data.data);
    }, err=> {

    })
  }
  

  getBins() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    console.log(this.pagination);
    this.offsetPagination = page ? (page - 1) : 0;
    this.VirtualAccountBinService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        console.log("rows",this.rows);
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
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.VirtualAccountBinService.get(this.pagination).subscribe(res => {
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

    console.log("check pagination", this.pagination);

    this.VirtualAccountBinService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);

    this.VirtualAccountBinService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_virtual_account_bin", param);
    this.router.navigate(["virtual-account", "bin", "edit"]);
  }

  deleteBin(id) {
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
    this.VirtualAccountBinService.delete({ bin_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getBins();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

}
