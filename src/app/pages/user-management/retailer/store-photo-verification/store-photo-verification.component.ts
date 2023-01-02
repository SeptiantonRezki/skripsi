import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { PopUpImageBlobComponent } from 'app/components/popup-image-blob/popup-image-blob.component';
import { PopupImageComponent } from 'app/components/popup-image/popup-image.component';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StorePhotoVerificationService } from 'app/services/store-photo-verification.service';
import { OnSelectDateDropdownChange } from 'app/shared/select-date-dropdown/select-date-dropdown.component';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { DialogRejectReasonComponent } from './components/dialog-reject-reason/dialog-reject-reason.component';
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
  pagination: Page = new Page();
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
  table: DatatableComponent;

  jenisPhotoOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  searchKeywordJenisPhoto: FormControl = new FormControl('');
  loadingJenisPhoto: boolean;

  dialogRefPreviewImage: MatDialogRef<PopupImageComponent>;
  dialogRefRejectReason: MatDialogRef<DialogRejectReasonComponent>;
  dialogRefRejectPhoto: MatDialogRef<DialogRejectReasonComponent>;

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
    this.filters = this.formBuilder.group({
      query: '',
      verified_date: '',
      from_date: '',
      to_date: '',
      photo_type: '',
      status: '',
      admin: '',
    });
  }

  ngOnInit() {

    this.fetchRows();
    this.fetchJenisPhoto();
    this.storePhotoVerificationService.fetchRejectReasons();

    this.filters.valueChanges.debounceTime(300).subscribe(filterValues => {

      console.log({ filterValues });

    });

    this.keyUp
      .debounceTime(500)
      .flatMap(search => Observable.of(search).delay(500))
      .subscribe(query => { this.filters.patchValue({ query }); });

    this.searchKeywordJenisPhoto.valueChanges.debounceTime(300).subscribe(keyword => { this.fetchJenisPhoto(keyword) });


  }

  fetchRows() {
    this.loadingIndicator = true;

    // this.pagination.total = 10;
    const page = 1

    this.pagination.page = page;
    // this.pagination.per_page = 1;
    this.offsetPagination = page ? (page - 1) : 0;

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

    setTimeout(() => {
      this.jenisPhotoOptions.next([
        {
          id: 2,
          name: 'Tampak Dalam Toko'
        },
        {
          id: 3,
          name: 'Chiller'
        }
      ])
      this.loadingJenisPhoto = false;
    }, 3000)
  }

  changePerPage(event: any) {
    throw new Error('Method not implemented.');
  }
  setPage(pageInfo) {
    // this.dataService.showLoading(true);
    this.offsetPagination = pageInfo.offset;
    // this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
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

    this.filters.patchValue({ from_date: event.from, to_date: event.to });
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
    config.data = {};

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

      this.storePhotoVerificationService.postVerifyStoreVerification(payload).subscribe(res => {
  
        this.fetchRows();
        this.dialogService.brodcastCloseConfirmation();
  
      }, err => {
  
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
  onDropOne(e) {
    console.log('drop', { e });
  }
  onDragOne(e) {
    console.log('drag', { e });
  }

}
