import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { TemplateTaskService } from '../../../../../services/dte/template-task.service';
import { Endpoint } from '../../../../../classes/endpoint';
import { PagesName } from 'app/classes/pages-name';
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-template-index-personalize',
  templateUrl: './template-index-personalize.component.html',
  styleUrls: ['./template-index-personalize.component.scss']
})
export class TemplateIndexPersonalizeComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  onLoad: boolean;
  offsetPagination: any;

  filterKategoryToolbox: any;
  filterKategoryMisi: any;
  filterTipeMisi: any;
  filterInternalMisi: any;
  filterProjectMisi: any;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  listKategoriToolbox: any[];
  listTipeMisi: any[];
  listTingkatinternalMisi: any[];
  listKategoriMisi: any[];
  listProjectMisi: any[];
  listCopywriting: any[];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private templateTaskService: TemplateTaskService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.tugas');
    console.log(this.permission);

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
    this.getListKategoriToolbox();
    this.getListTipeMisi();
    this.getListTingkatInternalMisi();
    this.getListKategoriMisi();
    this.getListKategoriProject();
    this.getListCopywriting();
    setTimeout(() => {
      this.getTemplateTask();
    }, 800);
  }

  getTemplateTask() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.per_page = 15;

    this.offsetPagination = page ? (page - 1) : 0;

    this.templateTaskService.getPersonalize(this.pagination).subscribe(
      res => {

        if (res.data.total < res.data.per_page && page !== 1) {
          this.dataService.setToStorage("page", 1);
          this.getTemplateTask();
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data ? res.data.data.map(item => {
            return {
              ...item,
              image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
            }
          }) : [];

          this.onLoad = false;
          this.loadingIndicator = false;
        }
        
        setTimeout(() => {
          this.addObjectToTable();
        }, 1000);
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  addObjectToTable(){
    document.querySelector("datatable-body").id = "datatable-body";

    let rows = document.querySelectorAll("datatable-row-wrapper");
    for (let index = 0; index < rows.length; index++) {
      rows[index].id = 'data-row';

      let cells = rows[index].querySelectorAll("datatable-body-cell");
      for (let indexCell = 0; indexCell < cells.length; indexCell++) {
        cells[indexCell].id = 'data-cell';
      }
    }
  }

  load() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.per_page = 15;
    this.pagination['toolbox'] = this.filterKategoryToolbox;
    this.pagination['toolbox_type'] = this.filterTipeMisi;
    this.pagination['toolbox_internal'] = this.filterInternalMisi;
    this.pagination['toolbox_categories'] = this.filterKategoryMisi;
    this.pagination['toolbox_project'] = this.filterProjectMisi;

    this.offsetPagination = page ? (page - 1) : 0;
    this.templateTaskService.getPersonalize(this.pagination).subscribe(
      res => {
        this.rows = [];
        if (res.data.total < res.data.per_page && page !== 1) {
          this.dataService.setToStorage("page", 1);
          this.getTemplateTask();
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data ? res.data.data.map(item => {
            return {
              ...item,
              image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
            }
          }) : [];
          this.onLoad = false;
          this.loadingIndicator = false;
        }
      },
      err => {
        this.onLoad = false;
      }
    );
  }
  reset() {
    this.filterInternalMisi = null;
    this.filterKategoryMisi = null;
    this.filterKategoryToolbox = null;
    this.filterProjectMisi = null;
    this.filterTipeMisi = null;
  }

  async getListKategoriToolbox() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getToolbox(this.pagination).subscribe(
      (res) => {
        // console.log("res trade listKategoriToolbox", res);
        this.listKategoriToolbox = res.data.data;
        console.log('ini kategori', this.listKategoriToolbox);
        // this.listKategoriToolbox = res.data;
      },
      (err) => {
        console.log("err List Kategori Toolbox", err);
      }
    );
  }

  async getListTipeMisi() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getTipeMisi(this.pagination).subscribe(
      (res) => {
        // console.log("res trade List Tipe Misi", res);
        this.listTipeMisi = res.data.data;
        // this.listTipeMisi = res.data;
      },
      (err) => {
        console.log("err List Tipe Misi", err);
      }
    );
  }

  async getListTingkatInternalMisi() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getInternalMisi(this.pagination).subscribe(
      (res) => {
        this.listTingkatinternalMisi = res.data.data;
      },
      (err) => {
        console.log("err List Internal Misi", err);
      }
    );
  }

  async getListKategoriMisi() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getKategoriMisi(this.pagination).subscribe(
      (res) => {
        // console.log("res Kategori Misi", res);
        this.listKategoriMisi = res.data.data;
        // this.listKategoriMisi = res.data;
      },
      (err) => {
        console.log("err List Kategori Misi", err);
      }
    );
  }

  async getListKategoriProject() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
      (res) => {
        // console.log("res Kategori Misi", res);
        this.listProjectMisi = res.data.data;
        // this.listKategoriMisi = res.data;
      },
      (err) => {
        console.log("err List Kategori Misi", err);
      }
    );
  }

  async getListCopywriting() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getCopywriting(this.pagination).subscribe(
      (res) => {
        this.listCopywriting = res.data;
      },
      (err) => {
        console.log("err", err);
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log("Select Event", selected, this.selected);
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

    this.templateTaskService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      }) : [];

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

    this.templateTaskService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      }) : [];

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

    this.templateTaskService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      }) : [];

      this.loadingIndicator = false;
    });
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_template_task', param);
    this.router.navigate(['dte', 'template-task', 'edit-personalize']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_template_task', param);
    this.router.navigate(['dte', 'template-task', 'detail-personalize']);
  }

  duplicate(param?: any): void {
    this.dataService.setToStorage('duplicate_template_task', param);
    this.router.navigate(['dte', 'template-task', 'create-personalize']);
  }

  deleteTemplateTask(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Template Tugas",
      captionDialog: "Apakah anda yakin untuk menghapus template tugas ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.templateTaskService.deletePersonalize({ id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getTemplateTask();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }
}
