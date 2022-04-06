import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { SequencingService } from 'app/services/dte/sequencing.service';
import { IdleService } from 'app/services/idle.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-task-sequencing-index-personalize',
  templateUrl: './task-sequencing-index-personalize.component.html',
  styleUrls: ['./task-sequencing-index-personalize.component.scss']
})
export class TaskSequencingIndexPersonalizeComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: Number = null;
  keyUp = new Subject<string>();

  @ViewChild("activeCell") activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  @ViewChild('downloadLink') downloadLink: ElementRef;

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private sequencingService: SequencingService,
    private userIdle: IdleService,
    private ls: LanguagesService,
  ) {
    this.onLoad = false; // temporarily set to false to show the dummy table
    this.selected = []

    this.permission = this.roles.getRoles('principal.dtepublishmission');
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
    if (this.permission.lihat) {
      this.getSequencing();
    }
  }

  getSequencing() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = "desc";
    this.pagination.sort = 'created_at';

    this.offsetPagination = page ? (page - 1) : 0;

    this.sequencingService.getPersonalize(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
        console.log(res.data);

        setTimeout(() => {
          this.addObjectToTable();
        }, 1500);
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
      this.dataService.setToStorage("sort", 'created_at');
      this.dataService.setToStorage("sort_type", 'desc');
    }

    this.sequencingService.getPersonalize(this.pagination).subscribe(res => {
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

    this.sequencingService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;

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

    this.sequencingService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;

      this.loadingIndicator = false;
    });

  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_task_sequencing', param);
    this.router.navigate(['dte', 'publish-mission', 'edit', param.id]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_task_sequencing', param);
    this.router.navigate(['dte', 'publish-mission', 'detail', param.id]);
  }

  deleteTaskSequencing(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Task Sequencing Personalize",
      captionDialog: "Apakah anda yakin untuk menghapus Task Sequencing Personalize ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.sequencingService.deletePersonalize({ sequencing_id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.getSequencing();

      this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
    });
  }
}
