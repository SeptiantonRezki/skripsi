import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { CountrySetupService } from 'app/services/user-management/country-setup.service';
import { LanguageSetupService } from 'app/services/user-management/language-setup.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-language-setup',
  templateUrl: './language-setup.component.html',
  styleUrls: ['./language-setup.component.scss']
})
export class LanguageSetupComponent implements OnInit {

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

  permission: any = {ubah: true};
  roles: PagesName = new PagesName();

  constructor(
    private ls: LanguagesService,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private countrySetupService: CountrySetupService,
    private languageSetupService: LanguageSetupService,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.languages');
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
    this.getData();
  }

  getData() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.languageSetupService.get(this.pagination).subscribe(
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
    // this.countrySetupService.getMenus().subscribe(res => console.log({res}));
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

    this.languageSetupService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
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

    this.languageSetupService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  directEdit(row?: any): void {
    // this.dataService.setToStorage("detail_admin_principal", param);
    this.dataService.setToStorage("language_setup_data", row);
    this.router.navigate(["user-management", "languages", "edit", row.id]);
  }
  delete(row, confirmed = false) {
    
    if(confirmed) {

      this.dataService.showLoading(true);
      this.languageSetupService.delete({id: row.id}).subscribe(res => {
        
        console.log({res});
        this.dataService.showLoading(false);
        this.dialogService.brodcastCloseConfirmation();
        this.getData();

      }, err => {
        
        this.dataService.showLoading(false);

      });
    }
    else {
      let dialogData = {
        titleDialog: 'Hapus Language',
        captionDialog: `Apa Anda yakin menghapus Language ${row.name}?`,
        confirmCallback: this.delete.bind(this, row, true),
        buttonText: ['Hapus', this.ls.locale.global.button.cancel]
      }
      this.dialogService.openCustomConfirmationDialog(dialogData);
    }
  }
  getFileName(path) {
    try {
      let paths = path.split('/');
      
      return paths[paths.length - 1];

    } catch (error) {
      return '';
    }
  }

  export(row) {
    this.dataService.showLoading(true);
    this.languageSetupService.export({language_id: row.id}).subscribe(({data}) => {
      
      console.log({data});
      this.downLoadFile(data.file);
      this.dataService.showLoading(false);

    }, err => {

      this.dataService.showLoading(false);
    })
  }
  directDetail(row) {
    this.dataService.setToStorage("language_setup_data", row);
    this.router.navigate(["user-management", "languages", "detail", row.id]);
  }

  downLoadFile(url) {

    var link = document.createElement('a');
    link.href = url;
    // link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

}
