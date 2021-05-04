import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
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
import { IdleService } from 'app/services/idle.service';

@Component({
  selector: 'app-task-sequencing-index',
  templateUrl: './task-sequencing-index.component.html',
  styleUrls: ['./task-sequencing-index.component.scss']
})

export class TaskSequencingIndexComponent implements OnInit {

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
    private userIdle: IdleService
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
    this.pagination.sort_type = "desc";
    this.pagination.sort = 'created_at';

    this.offsetPagination = page ? (page - 1) : 0;

    this.sequencingService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
        console.log(res.data);
      },
      err => {
        this.onLoad = false;
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
      this.dataService.setToStorage("sort", 'created_at');
      this.dataService.setToStorage("sort_type", 'desc');
    }

    this.sequencingService.get(this.pagination).subscribe(res => {
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

    this.sequencingService.get(this.pagination).subscribe(res => {
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

    this.sequencingService.get(this.pagination).subscribe(res => {
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
    this.router.navigate(['dte', 'task-sequencing', 'edit']);
  }

  duplicate(param?: any): void {
    this.dataService.setToStorage('detail_task_sequencing', param);
    this.router.navigate(['dte', 'task-sequencing', 'duplicate']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_task_sequencing', param);
    this.router.navigate(['dte', 'task-sequencing', 'detail']);
  }

  deleteTaskSequencing(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Task Sequencing",
      captionDialog: "Apakah anda yakin untuk menghapus task sequencing ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.sequencingService.delete({ sequencing_id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.getSequencing();

      this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
    });
  }

  reqDownloadCondition(row): any {
    let status = { request: false, download: false };
    switch (row.status_export) {
      case "unprocessed":
        if (row.status === 'unpublish') {
          status = { request: true, download: false };
        } else if (row.status === 'publish') {
          status = { request: true, download: false };
        }
        break;
      case "running":
        status = { request: false, download: false };
        break;
      case "done":
        if (row.download_url) {
          status = { request: this.pastDate(row.last_request) ? true : false, download: true };
        } else {
          status = { request: false, download: false };
        }
        break;
    }
    return status;
  }

  requestFile(item) {
    // const length = 100 / item.trade_scheduler_templates.length === Infinity ? 0 : 100 / item.trade_scheduler_templates.length;
    // let current_progress = 0;

    this.dataService.showLoading({ show: true });
    // this.dataService.setProgress({ progress: current_progress.toFixed(0) });

    let response: any = { rand: "" };

    // if (item.trade_scheduler_templates.length === 0) {
    //   this.dataService.setProgress({ progress: 100 });
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: "Task Sequencing kosong" });
    //   return;
    // }

    let params = {
      task_sequencing_management_id: item.id,
      // last: null,
      rand: 1,
      // task_sequencing_management_template_id: item.id
    }

    this.sequencingService.export(params).subscribe(
      (response) => {
        if (response.data && response.status) {
          setTimeout(() => {
            // this.downloadLink.nativeElement.href = response.data;
            // this.downloadLink.nativeElement.click();
            this.dataService.showLoading(false);
            this.getSequencing();
          }, 1000);
        }
      }, (error) => {
        this.dataService.showLoading(false);
      }
    )

    // for (const { val, index } of item.trade_scheduler_templates.map((val, index) => ({ val, index }))) {

    //   try {
    //     this.userIdle.onHitEvent();
    //     response = await this.sequencingService.export(params).toPromise();

    //     current_progress = current_progress === 0 ? length : current_progress + length;
    //     this.dataService.setProgress({ progress: current_progress.toFixed(0) });

    //   } catch (error) {
    //     this.dataService.showLoading(false);
    //     throw error;
    //   }
    // }

    // this.dataService.setProgress({ progress: 100 });

    // if (response.data && response.status) {
    //   setTimeout(() => {
    //     this.downloadLink.nativeElement.href = response.data;
    //     this.downloadLink.nativeElement.click();
    //     this.dataService.showLoading(false);
    //   }, 1000);
    // }
  }

  async downloadFile(item) {
    this.dataService.showLoading(true);
    setTimeout(() => {
      this.downloadLink.nativeElement.href = item.download_url;
      this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
    }, 1000);
  }

  pastDate(lastDate) {
    if (!lastDate) return false;

    lastDate = new Date(lastDate);
    let now = new Date();
    if (now.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0) > 1) {
      return true;
    }
    return false;
  }

  renderStatusRequest(status_export) {
    switch (status_export) {
      case "unprocessed":
        return "Failed";
      case "running":
        return "Processing";
      case "done":
        return "Success";
      default:
        return "No Status"
    }
  }

}
