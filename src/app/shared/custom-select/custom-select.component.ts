import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material';
import moment from 'moment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'DD MMMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: "custom-select",
  templateUrl: "./custom-select.component.html",
  styleUrls: ["./custom-select.component.scss"],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CustomSelectComponent {
  @Input() selectedPeriode: any = {
    id: 0,
    name: 'Semua Transaksi'
  };
  @Input() newListPeriode: any[] = [];
  @Output() getSelectItem: EventEmitter<string> = new EventEmitter();
  @Output() getSelectDate: EventEmitter<string> = new EventEmitter();
  maxFrom = moment();
  minTo = moment().subtract(13,'days');
  riwayatParams:any ={
    from: moment().subtract(13,'days'),
    to: moment(),
  }
  defaultListPeriode: any[] = [
    {
      id: 0,
      name: 'Semua Transaksi'
    },
    {
      id: 1,
      name: '7 Hari Terakhir',
      sub: `${moment().subtract(6, 'days').format('DD MMM YYYY')} - ${moment().format('DD MMM YYYY')}`,
      date: { from: moment().subtract(6, 'days'), to: moment() }
    },
    {
      id: 2,
      name: '30 Hari Terakhir',
      sub: `${moment().subtract(29, 'days').format('DD MMM YYYY')} - ${moment().format('DD MMM YYYY')}`,
      date: { from: moment().subtract(29, 'days'), to: moment() }
    },
    {
      id: 3,
      name: 'Pilih Tanggal Sendiri'
    },
  ];
  listPeriode: any[] = [];
  isSelectedActive: boolean = false;
  selectedPeriodeValue: string = 'Semua Transaksi';

  constructor() {}

  ngOnInit() {
    this.listPeriode = this.defaultListPeriode;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.selectedPeriode) {
      if(this.selectedPeriode.id == 3) {
        this.selectedPeriodeValue = `${this.riwayatParams.from.format('DD MMM YYYY')} - ${this.riwayatParams.to.format('DD MMM YYYY')}`;
      } else {
        this.selectedPeriodeValue =  this.selectedPeriode.sub ? `${this.selectedPeriode.name} (${this.selectedPeriode.sub})` : this.selectedPeriode.name;
      };
    };
    if(changes.newListPeriode) {
      if(changes.newListPeriode.currentValue) this.listPeriode = this.newListPeriode;
      else this.listPeriode = this.defaultListPeriode;
    };
  }

  changeDate(value,model){
    this.riwayatParams[model.name] = value.locale('en');
    if(model.name == 'from'){
      this.minTo = this.riwayatParams[model.name];
    } else if(model.name == 'to'){
      this.maxFrom = this.riwayatParams[model.name];
    }
  }

  selectingPeriode(item) {
    this.selectedPeriode = {
      id: item.id,
      name: item.name,
      date: item.date || null
    };
    if(item.sub) this.selectedPeriode.sub = item.sub;
    if(item.id !== 3) {
      this.isSelectedActive = false;
      this.selectedPeriodeValue = item.sub ? `${this.selectedPeriode.name} (${this.selectedPeriode.sub})` : this.selectedPeriode.name;
      this.getSelectItem.emit({ ...this.selectedPeriode, label: this.selectedPeriodeValue, date: this.selectedPeriode.date });
    };
  }

  toggleSelect() {
    this.isSelectedActive = !this.isSelectedActive;
    if(!this.isSelectedActive) {
      if(this.selectedPeriode.id == 3) {
        this.selectedPeriodeValue = `${this.riwayatParams.from.format('DD MMM YYYY')} - ${this.riwayatParams.to.format('DD MMM YYYY')}`;
        this.getSelectDate.emit({ ...this.selectedPeriode, label: this.selectedPeriodeValue, date: this.riwayatParams });
      } else {
        this.selectedPeriodeValue = this.selectedPeriode.sub ? `${this.selectedPeriode.name} (${this.selectedPeriode.sub})` : this.selectedPeriode.name;
        this.getSelectItem.emit({ ...this.selectedPeriode, label: this.selectedPeriodeValue, date: this.selectedPeriode.date });
      };
    };
  }
}