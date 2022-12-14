import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { DateAdapter, MatDatepicker, MatInput, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateRangePipe } from '@fuse/pipes/filter.pipe';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

const SELECT_DATE_DROPDOWN_DATE_FORMAT = {
  parse: {
    dateInput: "ll"
  },
  display: {
    dateInput: "ll",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

export interface SelectDateItem {
  id: string;
  title: string;
  range: number;
  readonly?: boolean;
}

export class SelectDateIds {
  static CUSTOM_RANGE: string = 'custom_range';
}

export interface OnSelectDateDropdownChange {
  from: string;
  to: string;
}

@Component({
  selector: 'select-date-dropdown',
  templateUrl: './select-date-dropdown.component.html',
  styleUrls: ['./select-date-dropdown.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS, useValue: SELECT_DATE_DROPDOWN_DATE_FORMAT
    },
    DateRangePipe
  ]
})
export class SelectDateDropdownComponent implements OnInit {

  selectedDate: SelectDateItem = {
    id: null,
    title: '',
    range: 0 // All days
  };

  dates: Array<SelectDateItem> = []

  CUSTOM_RANGE_ID: string = SelectDateIds.CUSTOM_RANGE;

  start_date = '';
  end_date = '';

  hoverOnId = null;

  _minDate = null;
  _maxDate = moment();

  @Output() onChange: EventEmitter<OnSelectDateDropdownChange> = new EventEmitter();
  @Input() placeholder: string;

  @ViewChild('startInput') startInput: MatDatepicker<Date>;

  constructor(
    private translate: TranslateService,
    private dateRangePipe: DateRangePipe,
  ) {

    this.dates = [
      {
        id: 'all',
        title: 'Semua Tanggal',
        range: 0 // All days
      },
      {
        id: 'last_7_day',
        title: '7 Hari Terakhir',
        range: 7
      },
      {
        id: 'last_30_day',
        title: '30 Hari Terakhir',
        range: 30
      },
      {
        id: 'last_90_day',
        title: '90 Hari Terakhir',
        range: 90
      },
      {
        id: this.CUSTOM_RANGE_ID,
        title: 'Pilih Tanggal Sendiri',
        range: 0,
        readonly: true,
      }
    ]

  }

  ngOnInit() { }

  compareById = function (option, value): boolean {
    return option.id === value.id;
  }

  onSelectionChange({ value }: { value: SelectDateItem }) {
    
    const result = this.dateRangePipe.transform(value.range, 'YYYY-MM-DD', value.title, true);
    this.onChange.emit(result);

  }

  onDatePickerChange(startDate: NgModel, endDate: NgModel) {

    const from = startDate.value ? startDate.value.format('DD MMM YYYY') : '';
    const to = endDate.value ? endDate.value.format('DD MM YYYY') : '';

    this.selectedDate = { id: this.CUSTOM_RANGE_ID, title: `${from} - ${to}`, range: 0 }
    
    if(startDate.valid && endDate.valid && startDate.value && endDate.value) this.onChange.emit({ from, to });

  }


}
