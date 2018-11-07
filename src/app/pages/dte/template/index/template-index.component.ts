import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { TemplateTaskService } from '../../../../services/dte/template-task.service';
import { Endpoint } from '../../../../classes/endpoint';
import { PagesName } from 'app/classes/pages-name';

@Component({
  selector: 'app-template-index',
  templateUrl: './template-index.component.html',
  styleUrls: ['./template-index.component.scss']
})
export class TemplateIndexComponent {

  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private templateTaskService: TemplateTaskService,
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
    this.getTemplateTask();
  }

  getTemplateTask() {
    this.templateTaskService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data.map(item => {
          return {
            ...item,
            image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
          }
        });
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.templateTaskService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      });

      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log(this.pagination)

    this.templateTaskService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      });

      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    this.templateTaskService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      });

      this.loadingIndicator = false;
    });
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_template_task', param);
    this.router.navigate(['dte', 'template-task', 'edit']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_template_task', param);
    this.router.navigate(['dte', 'template-task', 'detail']);
  }

  duplicate(param?: any): void {
    this.dataService.setToStorage('duplicate_template_task', param);
    this.router.navigate(['dte', 'template-task', 'create']);
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
    this.templateTaskService.delete({ template_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getTemplateTask();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

}
