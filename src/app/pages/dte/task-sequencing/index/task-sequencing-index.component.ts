import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../services/dialog.service";
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { SequencingService } from 'app/services/dte/sequencing.service';

@Component({
  selector: 'app-task-sequencing-index',
  templateUrl: './task-sequencing-index.component.html',
  styleUrls: ['./task-sequencing-index.component.scss']
})

export class TaskSequencingIndexComponent implements OnInit {
  idDummy: number;
  fullname: string;
  status: string;
  trade_program: string;
  total_budget_used: number;
  total_week_duration: string;
  last_update: string;
  created: string;

  dataDummy = {
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
          {idDummy: 1,fullname: "Rizal", status: "active", trade_program: "Lorem", total_budget_used: 200000, total_week_duration: "5 hari", last_update: "10 Juni 2020", created: "10 Juni 2020"},
          {idDummy: 2,fullname: "Fadilah", status: "active", trade_program: "Ipsum", total_budget_used: 5000000, total_week_duration: "5 hari", last_update: "10 Juni 2020", created: "10 Juni 2020"}
        ],
        "first_page_url": "https://task.ayo-micro.dxtr.asia/api/v1/task/principal/sequencing?page=1",
        "from": null,
        "last_page": 1,
        "last_page_url": "https://task.ayo-micro.dxtr.asia/api/v1/task/principal/sequencing?page=1",
        "next_page_url": null,
        "path": "https://task.ayo-micro.dxtr.asia/api/v1/task/principal/sequencing",
        "per_page": 15,
        "prev_page_url": null,
        "to": null,
        "total": 2
    }
  }

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

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private sequencingService: SequencingService
  ) {
    this.onLoad = false; // temporarily set to false to show the dummy table
    this.selected = []

    this.permission = this.roles.getRoles('principal.task_sequencing');
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
    this.getSequencing();
  }

  getSequencing() {

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.sequencingService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, this.dataDummy.data);
        this.rows = this.dataDummy.data.data;
        // this.rows = this.dataDummy.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
        console.log(this.rows);
      },
      err => {
        this.onLoad = false;
      }
    );

    // const page = this.dataService.getFromStorage("page");
    // const sort_type = this.dataService.getFromStorage("sort_type");
    // const sort = this.dataService.getFromStorage("sort");

    // this.pagination.page = page;
    // this.pagination.sort_type = sort_type;
    // this.pagination.sort = sort;

    // this.offsetPagination = page ? (page - 1) : 0;

    // this.sequencingService.get(this.pagination).subscribe(
    //   res => {
    //     Page.renderPagination(this.pagination, res.data);
    //     this.rows = res.data.data;
    //     this.onLoad = false;
    //     this.loadingIndicator = false;
    //     console.log(res.data);
    //   },
    //   err => {
    //     this.onLoad = false;
    //   }
    // );
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

    this.sequencingService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, this.dataDummy.data);
        this.rows = this.dataDummy.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.sequencingService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, this.dataDummy.data);
        this.rows = this.dataDummy.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
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

    this.sequencingService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, this.dataDummy.data);
        this.rows = this.dataDummy.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_task-sequencing', param);
    this.router.navigate(['dte', 'task-sequencing', 'edit']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_task-sequencing', param);
    this.router.navigate(['dte', 'task-sequencing', 'detail']);
  }

  deleteAudience(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Audience",
      captionDialog: "Apakah anda yakin untuk menghapus audience ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.sequencingService.delete({ idDummy: this.id }).subscribe(res => {
      if (res.data.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getSequencing();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

}
