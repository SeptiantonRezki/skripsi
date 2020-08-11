import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { MedalBadgeService } from 'app/services/user-management/retailer/medal-badge.service';
import { Page } from 'app/classes/laravel-pagination';
import { DialogService } from 'app/services/dialog.service';
import { FuseCopierService } from '@fuse/services/copier.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-medal-index-component',
  templateUrl: './medal-index-component.html',
  styleUrls: ['./medal-index-component.scss']
})
export class MedalIndexComponent implements OnInit {

  rows: any[];
  onLoad: boolean;
  loadingIndicator: boolean;
  permission: any;
  offsetPagination: any;
  reorderable = true;
  pagination: Page = new Page();
  id: any;

  private _data: any = null;
  @Input() set data(data: any) {
    if (data !== null) {
      this._data = data;
    }
  }
  get data(): any { return this._data; }
  @Output() changes = new EventEmitter<any>();

  constructor(
    private medalBadgeService: MedalBadgeService,
    private dialogService: DialogService,
    private fuseCopierService: FuseCopierService,
    private dataService: DataService,
  ) {
    this.rows = [];
    this.onLoad = true;
    this.loadingIndicator = true;
  }

  ngOnInit() {
    this.getMedalList();
  }

  getMedalList() {
    this.medalBadgeService.getMedalList().subscribe((res: any) => {
      if (res.status === 'success') {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    }, (err: any) => {
      console.log('error', err);
      this.onLoad = false;
      this.loadingIndicator = false;
    });
  }

  setPage(pageInfo: any) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
    }

    this.medalBadgeService.getMedalList(this.pagination).subscribe((res: any) => {
      if (res.status === 'success') {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    }, (err: any) => {
      console.log('error', err);
      this.onLoad = false;
      this.loadingIndicator = false;
    });
  }

  onSort(event: any) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage('page', this.pagination.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);
    this.medalBadgeService.getMedalList(this.pagination).subscribe((res: any) => {
      if (res.status === 'success') {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    }, (err: any) => {
      console.log('error', err);
      this.onLoad = false;
      this.loadingIndicator = false;
    });
  }

  openCreateMedal() {
    this.changes.emit({ selected: 'MEDAL_CREATE' });
  }

  openEditMedal(row: any) {
    this.changes.emit({
      selected: 'MEDAL_EDIT',
      data: row,
    });
  }

  deleteMedalById(id: any): void {
    this.id = id;
    const data = {
      titleDialog: 'Hapus Medal',
      captionDialog: 'Apakah anda yakin untuk menghapus Medal ini ?',
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.medalBadgeService.delete({ id: this.id }).subscribe(() => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: 'Data Medal Berhasil Dihapus' });

        this.getMedalList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  copyTextIdMedal(id: any) {
    this.fuseCopierService.copyText(id);

    /* Alert the copied text */
    // alert('Copied Id_Medal');
  }

}
