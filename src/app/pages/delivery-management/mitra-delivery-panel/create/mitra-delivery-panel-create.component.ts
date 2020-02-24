import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MitraPanelService } from 'app/services/delivery-management/mitra-panel.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { ImportPanelMitraDialogComponent } from '../import-panel-mitra-dialog/import-panel-mitra-dialog.component';

@Component({
  selector: 'app-mitra-delivery-panel-create',
  templateUrl: './mitra-delivery-panel-create.component.html',
  styleUrls: ['./mitra-delivery-panel-create.component.scss']
})
export class MitraDeliveryPanelCreateComponent implements OnInit {
  formPanelMitra: FormGroup;
  formPanelMitraError: any;

  rows: any[];
  selected: any[] = [];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: Number = null;
  selectedMitra: any[] = [];

  keyUp = new Subject<string>();
  dialogRef: any;

  @ViewChild("activeCell") activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private mitraPanelService: MitraPanelService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.formPanelMitra = this.formBuilder.group({
      courier: ["", Validators.required],
      service: ["", Validators.required]
    });

    this.getPanelMitraList();
  }

  getPanelMitraList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.mitraPanelService.getMitraList(this.pagination).subscribe(
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

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.mitraPanelService.getMitraList(this.pagination).subscribe(res => {
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

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.mitraPanelService.getMitraList(this.pagination).subscribe(res => {
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
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.mitraPanelService.getMitraList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  bindSelector(isSelected, row) {
    let index = this.selectedMitra.findIndex(r => r.id === row.id);
    if (index > - 1) {
      return true;
    }
    return false;
  }

  onSelectAudience(event, row) {
    let index = this.selectedMitra.findIndex(r => r.id === row.id);
    if (index > - 1) {
      this.selectedMitra.splice(index, 1);
    } else {
      this.selectedMitra.push(row);
    }
    this.onSelect({ selected: this.selectedMitra });
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    console.log('selecteds', this.selected);
  }

  async export() {
    this.dataService.showLoading(true);
    // let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    // let area_id: any = areaSelected[areaSelected.length - 1].value;
    let fd = new FormData();
    fd.append('area', "1");
    this.selectedMitra.map(item => {
      fd.append('wholesaler_id[]', item.id);
    })
    try {
      const response = await this.mitraPanelService.export(fd).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_PanelMitra_${new Date().toLocaleString()}.xlsx`);
      // this.downLoadFile(response, "data:text/csv;charset=utf-8", `Export_Retailer_${new Date().toLocaleString()}.csv`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  import(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { password: 'P@ssw0rd' };

    this.dialogRef = this.dialog.open(ImportPanelMitraDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.selected = response;
        if (response) {
          this.selectedMitra = this.selectedMitra.concat(response);
          console.log('this selected', this.selectedMitra);
          this.onSelect({ selected: this.selectedMitra });
          this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
        }
      }
    });
  }

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

}
