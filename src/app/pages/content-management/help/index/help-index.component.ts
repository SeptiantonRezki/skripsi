import { Component, OnInit, ViewChild, TemplateRef, HostListener, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router } from '@angular/router';
import { HelpService } from 'app/services/content-management/help.service';

import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-help-index',
  templateUrl: './help-index.component.html',
  styleUrls: ['./help-index.component.scss']
})
export class HelpIndexComponent {

  rows: any[];
  selected: any[];
  id: any[];
  defaultType: string = 'video';

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  userGroup: any[] = [
    { name: this.ls.locale.notification.buat_notifikasi.text4, value: "" },
  ];

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  offsetPagination: Number = null;

  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private helpService: HelpService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];
    this.pagination.setType(this.defaultType);

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
    // this._fuseSplashScreenService.show();
    // this.http.get("api/ayo-b2b-user").subscribe((contacts: any) => {
    //   this.rows = contacts;
    //   this.loadingIndicator = false;
    // });
    // setTimeout(() => {
    //     this._fuseSplashScreenService.hide();
    // }, 3000);
    this.getHelp();
    this.getListUser();
  }

  getHelp() {
    console.log('PAGINATION', this.pagination);
    this.offsetPagination = 0;

    this.helpService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  onChangeTab({ index }) {
    console.log({ index });
    let type = (index === 0) ? 'video' : 'help';
    // this.helpType = helpType;
    this.pagination.setType(type);
    this.getHelp();
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.scrollToTop();

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo: any) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.helpService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.scrollToTop();
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.helpService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
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
      const page = 1;
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.helpService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  getListUser() {
    this.helpService.getListUser().subscribe(
      (res: any) => {
        console.log('getListUser', res);
        this.userGroup = res.data.map((item: any) => {
          return (
            { name: item, value: item }
          );
        });
      },
      err => {
        this.userGroup = [];
        console.error(err);
      }
    );
  }

  selectedItemFilter(event: any) {
    let e = event.value;
    this.pagination.user = e;
    this.pagination.page = 1;
    this.offsetPagination = 0;
    this.loadingIndicator = true;
    this.helpService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      }, err => {
        console.error(err);
      })
  }

  directEdit(param?: any, opsi?: string): void {
    // let navigationExtras: NavigationExtras = {
    //   queryParams: param
    // }
    if (opsi == "preview") {
      param.opsiDetail = "preview";
    } else {
      param.opsiDetail = "edit";
    }
    this.dataService.setToStorage("detail_help", param);
    this.router.navigate(["content-management", "help", "edit"]);
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  deletePage(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Bantuan",
      captionDialog: "Apakah anda yakin untuk menghapus data bantuan ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.helpService.delete({ content_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getHelp();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  @HostListener('scroll', ['$event']) onScroll($event: Event): void {
    const target = $event.srcElement as HTMLTextAreaElement;
    // console.log('....SCROLLing', this.myScrollContainer.nativeElement.scrollHeight);
    if (target.scrollTop == 0 && this.myScrollContainer.nativeElement.scrollHeight) {
      //   this.state_.isLoadMore = false;
    }
  }
  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      // console.log('OKE SCROLLing');
      try {
        // console.log('OKE SCROLLing2', this.myScrollContainer.nativeElement.scrollHeight);
        this.myScrollContainer.nativeElement.scrollTop = 0;
        document.querySelector('#target').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        console.log('Scrolling Error', err);
      }
    }
  }

}
