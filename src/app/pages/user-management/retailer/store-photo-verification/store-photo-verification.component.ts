import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { OnSelectDateDropdownChange } from 'app/shared/select-date-dropdown/select-date-dropdown.component';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { HasTable } from './has-table.interface';

@Component({
  selector: 'app-store-photo-verification',
  templateUrl: './store-photo-verification.component.html',
  styleUrls: ['./store-photo-verification.component.scss']
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

  // endArea: String;
  // lastLevel: any;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
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
    this.pagination.total = 10;
    this.rows = [
      {
        store_code: 111222,
        photo_type: 'Tampak Depan Photo',
        image_url: '',
        status: 'Dalam Verifikasi',
        status_id: 'verification',
        verification_date: '2022-12-01 10:00:00',
        admin: 'Mirza'
      },
    ]
    setTimeout(() => { this.loadingIndicator = false; }, 1000)
  }

  fetchJenisPhoto(keyword: string = '') {
    this.loadingJenisPhoto = true;

    setTimeout(() => {
      this.jenisPhotoOptions.next([
        {
          id: '',
          name: 'Tampak Depan Toko'
        },
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
  setPage(event: any) {
    throw new Error('Method not implemented.');
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

}
