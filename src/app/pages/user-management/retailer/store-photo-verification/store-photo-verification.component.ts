import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page, StorePhotoVerificationPage } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { PopUpImageBlobComponent } from 'app/components/popup-image-blob/popup-image-blob.component';
import { PopupImageComponent } from 'app/components/popup-image/popup-image.component';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StorePhotoVerificationService } from 'app/services/store-photo-verification.service';
import { OnSelectDateDropdownChange } from 'app/shared/select-date-dropdown/select-date-dropdown.component';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { DialogRejectReasonComponent } from './components/dialog-reject-reason/dialog-reject-reason.component';
import { WidgetStorePhotoCounterComponent } from './components/widget-store-photo-counter/widget-store-photo-counter.component';
import { HasTable } from './has-table.interface';

@Component({
  selector: 'app-store-photo-verification',
  templateUrl: './store-photo-verification.component.html',
  styleUrls: ['./store-photo-verification.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StorePhotoVerificationComponent implements OnInit {

  rows: any[];
  selected: any[];
  id: any[];
  selectedRetailer: any[] = [];

  loadingIndicator = false;
  reorderable = true;
  pagination: StorePhotoVerificationPage = new StorePhotoVerificationPage();
  onLoad: boolean;
  keyUp = new Subject<string>();
  permission: any;
  roles: PagesName = new PagesName();
  offsetPagination: any;
  needContinue: boolean = false;
  selectedPerPage = 10;
  listPerPage = [10, 20, 25, 50, 75, 100];

  filters: FormGroup;

  @ViewChild(DatatableComponent)
  @ViewChild(WidgetStorePhotoCounterComponent) widgetStorePhotoCounter: WidgetStorePhotoCounterComponent;
  table: DatatableComponent;

  jenisPhotoOptions: Array<any> = [];
  filteredJenisPhotoOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  
  statusOptions: Array<any>;
  adminOptions: Array<any> = [];
  filteredAdminOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  searchKeywordJenisPhoto: FormControl = new FormControl('');
  searchKeywordAdmin: FormControl = new FormControl('');
  loadingJenisPhoto: boolean;

  dialogRefPreviewImage: MatDialogRef<PopupImageComponent>;
  dialogRefRejectReason: MatDialogRef<DialogRejectReasonComponent>;
  dialogRefRejectPhoto: MatDialogRef<DialogRejectReasonComponent>;

  focusEditId = null;

  // endArea: String;
  // lastLevel: any;

  constructor(
    private translate: TranslateService,
    private storePhotoVerificationService: StorePhotoVerificationService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dataService: DataService,
    private dialogService: DialogService,
  ) {
    this.permission = this.roles.getRoles('principal.retailer');
    // console.log({permission: this.permission});
    this.filters = this.formBuilder.group({
      query: '',
      verified_date: '',
      start_date: '',
      end_date: '',
      jenis_foto: '',
      status: '',
      admin: '',
    });
    this.statusOptions = [
      {
        id: 'dalam-verifikasi',
        name: 'Dalam Verifikasi'
      },
      {
        id: 'success-verifikasi',
        name: 'Sukses Verifikasi'
      },
      {
        id: 'gagal-verifikasi',
        name: 'Gagal Verifikasi'
      }
    ];
    this.getRowClass = this.getRowClass.bind(this);
  }

  ngOnInit() {

    this.fetchRows();
    this.fetchJenisPhoto();
    this.fetchListAdmin();
    this.storePhotoVerificationService.fetchRejectReasons();

    this.filters.valueChanges.debounceTime(300).subscribe(filterValues => {

      console.log({ filterValues });
      this.fetchRows();

    });

    this.keyUp
      .debounceTime(500)
      .flatMap(search => Observable.of(search).delay(500))
      .subscribe(query => { this.filters.patchValue({ query }); });

    this.searchKeywordJenisPhoto.valueChanges.debounceTime(300).subscribe(keyword => {
      this.filteredJenisPhotoOptions.next(
        this.jenisPhotoOptions.filter((item) => item.type_name.toLowerCase().indexOf(String(keyword).toLowerCase()) > -1)
      )
    });
    this.searchKeywordAdmin.valueChanges.debounceTime(300).subscribe(keyword => {
      this.filteredAdminOptions.next(
        this.adminOptions.filter((item) => String(item).toLowerCase().indexOf(String(keyword).toLowerCase()) > -1)
      )
    })


  }

  fetchRows() {
    this.focusEditId = null;
    this.loadingIndicator = true;

    const page = this.dataService.getFromStorage('verifikasi_foto_page');

    this.pagination.page = page;
    // this.pagination.per_page = 10;
    this.offsetPagination = page ? (page - 1) : 0;

    // FILTERS
    const jenisFoto = this.filters.get('jenis_foto').value;
    const statuses = this.filters.get('status').value
    const admins = this.filters.get('admin').value
    this.pagination.jenis_foto = jenisFoto.length ? jenisFoto : undefined;
    this.pagination.status = statuses.length ? statuses : undefined;
    this.pagination.admin = admins.length ? admins : undefined;
    this.pagination.search = this.filters.get('query').value;
    this.pagination.start_date = this.filters.get('start_date').value
    this.pagination.end_date = this.filters.get('end_date').value
    this.storePhotoVerificationService.getListStoreVerification(this.pagination).subscribe(res => {
      const { data } = res;
      this.rows = data || [];
      Page.renderPagination(this.pagination, res);


    }, err => {

    }, () => {
      this.loadingIndicator = false
    })
  }

  fetchJenisPhoto(keyword: string = '') {
    this.loadingJenisPhoto = true;

    this.storePhotoVerificationService.getListPhotoType({search: keyword}).subscribe(res => {
      this.jenisPhotoOptions = res.data;
      this.filteredJenisPhotoOptions.next(res.data || []);
      console.log({res});
      this.loadingJenisPhoto = false;

    }, err => {

      this.loadingJenisPhoto = false;

    });
  }
  fetchListAdmin() {
    this.storePhotoVerificationService.getListAdmin().subscribe(res => {
      this.adminOptions = res.data || [];
      this.filteredAdminOptions.next(res.data || []);
    })
  }

  changePerPage(event: any) {
    console.log({event});
    this.pagination.per_page = event.value;
    this.fetchRows();
    // throw new Error('Method not implemented.');
  }
  setPage(pageInfo) {
    // this.dataService.showLoading(true);
    this.offsetPagination = pageInfo.offset;
    // this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('verifikasi_foto_page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('verifikasi_foto_page');
    }
    // this.isSetPage = true;
    // if (this.isSetPage === true) {
    this.storePhotoVerificationService.getListStoreVerification(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      // await this.getAndCreateRoomById(res);
      // this.loadingIndicator = false;
      // this.dataService.showLoading(false);
    }, err => {
      // this.dataService.showLoading(false);
    });
    // } else {
    //   this.isSetPage = false;
    //   this.dataService.showLoading(false);
    //   this.loadingIndicator = false;
    // }
  }
  onSort(event: any) {
    throw new Error('Method not implemented.');
  }
  onSelect(event: any) {
    throw new Error('Method not implemented.');
  }

  onDateFilterChange(event: OnSelectDateDropdownChange) {

    this.filters.patchValue({ start_date: event.from, end_date: event.to });
  }
  onJenisFotoFilterChange(event) {
    console.log({ event });
  }

  onClickVerify(status: string) {
    console.log({ status });
  }

  previewImage(url: string) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    // dialogConfig.panelClass = 'popup-notif';
    dialogConfig.data = { url }
    this.dialogRefPreviewImage = this.dialog.open(PopupImageComponent, dialogConfig);
  }

  onClickRejectReason() {
    const config = new MatDialogConfig();

    config.disableClose = false;
    config.autoFocus = false;
    config.data = {
      editable: this.permission.edit_verifikasi_foto
    };

    this.dialogRefRejectReason = this.dialog.open(DialogRejectReasonComponent, config);
    this.dialogRefRejectReason.afterClosed().subscribe(result => {
      // console.log({ result });
      if (!result) {
        this.storePhotoVerificationService.fetchRejectReasons();
      }
    })
  }

  onClickReject(storePhotoItem) {
    console.log({ storePhotoItem });

    const config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = false;
    config.data = { actionType: 'confirmation' };

    this.dialogRefRejectPhoto = this.dialog.open(DialogRejectReasonComponent, config);

    this.dialogRefRejectPhoto.afterClosed().subscribe(({ reason, confirmed }) => {

      //if confirmed reject clicked
      if (reason && confirmed) {

        const payload = {
          id: storePhotoItem.id,
          status: 0, // 0 is rejected
          reject_reason_id: reason.id
        }

        this.storePhotoVerificationService.postVerifyStoreVerification(payload).subscribe(res => {

          this.fetchRows();
          this.widgetStorePhotoCounter.fetchTotal();

        }, err => {

        });
      }

    })
  }
  onClickApprove(storePhotoItem, confirmed = false) {
    const payload = {
      id: storePhotoItem.id,
      status: 1, // 1 is approved
    }

    if(confirmed) {
      this.dataService.showLoading(true);
      this.storePhotoVerificationService.postVerifyStoreVerification(payload).subscribe(res => {
        this.dataService.showLoading(false);
        this.fetchRows();
        this.widgetStorePhotoCounter.fetchTotal();
        this.dialogService.brodcastCloseConfirmation();

      }, err => {
        this.dataService.showLoading(false);
      });

    } else {

      const data = {
        titleDialog: 'Approve Store Photo',
        captionDialog: 'Apakah anda yakin?',
        confirmCallback: () => { this.onClickApprove(storePhotoItem, true) },
        buttonText: ['Ya, Lanjutkan', 'Batal']
      };

      this.dialogService.openCustomConfirmationDialog(data);

    }
  }
  onClickEditStatus(storePhotoItem, cancel = false) {
    if(cancel) {
      this.focusEditId = null;
      return;
    }
    this.focusEditId = storePhotoItem.id;
  }
  getRowClass(row) {
    return {
      'inactive-row': this.focusEditId && row.id !== this.focusEditId
      // 'inactive-row': false
    }
  }
  onDropOne(e) {
    console.log('drop', { e });
  }
  onDragOne(e) {
    console.log('drag', { e });
  }
  exportImageType() {
    this.dataService.showLoading(true);

    this.storePhotoVerificationService.exportImageType(this.pagination).subscribe(({data}) => {
      const link = document.createElement('a');
      link.href = data;
      // link.download = fileName;
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

}
