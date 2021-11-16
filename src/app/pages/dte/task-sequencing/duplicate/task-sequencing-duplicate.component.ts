import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';
import { SequencingService } from '../../../../services/dte/sequencing.service';
import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { Page } from 'app/classes/laravel-pagination';

@Component({
  selector: 'app-task-sequencing-duplicate',
  templateUrl: './task-sequencing-duplicate.component.html',
  styleUrls: ['./task-sequencing-duplicate.component.scss']
})
export class TaskSequencingDuplicateComponent implements OnInit {

  minDateTask: any;
  maxDateTask: any;
  submitting: any;
  taskSequenceForm: FormGroup;
  programs: any[];
  audiences: any[];
  detailSequencing: any;
  data: any;
  actions: any[];
  maxDate: any;
  minDate: any;

  isDetail: Boolean;

  private _onDestroy = new Subject<void>();
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterGTA: FormControl = new FormControl();
  public filteredGTA: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private sequencingService: SequencingService
  ) {
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailSequencing = this.dataService.getFromStorage('detail_task_sequencing');
  }

  ngOnInit() {

    this.taskSequenceForm = this.formBuilder.group({
      id: ["", Validators.required],
      name: ["", Validators.required],
      trade_creator_id: ["", Validators.required],
      trade_audience_group_id: ["", Validators.required],
      start_date: ["", Validators.required],
      end_date: ["", Validators.required],
      trade_creator_name: ["", Validators.required],
      is_editable: [1],
      total_budget: ["", Validators.required],
      endDateTrade: ["", Validators.required],
      trade_audience_group_name: ["", Validators.required],
      current_week: ["", Validators.required],
      total_week: ["", Validators.required],
      status: ["", Validators.required],
    })

    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });

      this.filterGTA.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTA();
      });

      this.setValue();
  }

  selectForm(form: any){
    const selectSearch = document.getElementById('select-search-'+form);
    let inputTag = selectSearch.querySelectorAll('input');
    for (let index = 0; index < inputTag.length; index++) {
      inputTag[index].id = "search-"+form;
    }
    
    // Perbaiki lagi
    let matOption = selectSearch.parentElement.querySelectorAll('mat-option');
    if (matOption) {
      for (let index = 0; index < matOption.length; index++) {
        matOption[index].querySelector('span').id = 'options';
      }
    }
  }

  setValue(){
    this.sequencingService.show({ sequencing_id: this.detailSequencing.id }).subscribe(res => {
      this.data = res.data;
      console.log(this.data);
      this.taskSequenceForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        trade_creator_id: this.data.trade_creator_id,
        trade_audience_group_id: this.data.trade_audience_group_id,
        start_date: this.data.start_date,
        end_date: this.data.end_date,
        is_editable: 1,
        trade_creator_name: this.data.trade_creator_name,
        total_budget: this.data.total_budget,
        trade_audience_group_name: this.data.trade_audience_group_name,
        current_week: this.data.current_week,
        total_week: this.data.total_week,
        status: this.data.status,
      });
      this.actions = res.data.actions;
      this.getTradePrograms(this.data.trade_creator_name);
      this.getTradeAudience(this.data.trade_audience_group_name);
    });
  }

  selectChange(e: any){
    // console.log(e);
    const theIndex = this.programs.findIndex(x => x.id === e.value);
    console.log(this.programs[theIndex]);
    this.setDate(this.programs[theIndex].end_date);
    this.taskSequenceForm.patchValue({
      trade_creator_name: this.programs[theIndex].name,
      total_budget: this.programs[theIndex].budget,
      endDateTrade: this.programs[theIndex].end_date,
      status: "unpublish",

    });

  }

  setDate(d: any) {
    this.maxDate = moment(d).format('YYYY-MM-DD');
    this.minDate = moment(new Date()).format('YYYY-MM-DD');
  }

  selectChangeAudince(e: any){
    const theIndex = this.audiences.findIndex(x => x.id === e.value);
    console.log(this.audiences[theIndex]);
    this.taskSequenceForm.patchValue({
      trade_audience_group_name: this.audiences[theIndex].name
    });
  }

  formatDate(val: any) {
    var d = new Date(val);
    let date = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + (d.getDate())).slice(-2)].join('-');
    return date;
  }

  submit(){
    this.taskSequenceForm.get('start_date').patchValue(this.formatDate(this.taskSequenceForm.value.start_date));
    this.taskSequenceForm.get('end_date').patchValue(this.formatDate(this.taskSequenceForm.value.end_date));
    this.taskSequenceForm.value.actions = this.actions;
    this.dataService.setDataSequencing({
      data: this.taskSequenceForm.value,
    });

  }

  filteringGTP() {
    if (!this.programs) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;

    this.pagination.per_page = 30;
    this.pagination.search = search;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.programs = res.data.data;
        this.filteredGTP.next(this.programs.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )
    // filter the banks
    this.filteredGTP.next(
      this.programs.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getTradePrograms(param?: any) {
    this.pagination.search = !!param ? param : null;
    this.pagination.per_page = 30;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.programs = res.data.data;
        this.filteredGTP.next(this.programs.slice());
        // this.programs = res.data;
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  filteringGTA() {
    if (!this.audiences) {
      return;
    }
    // get the search keyword
    let search = this.filterGTA.value;

    this.pagination.per_page = 30;
    this.pagination.search = search;
    this.sequencingService.getListTradeAudienceGroup(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.audiences = res.data.data;
        this.filteredGTA.next(this.audiences.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )
    // filter the banks
    this.filteredGTA.next(
      this.audiences.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getTradeAudience(param?: any) {
    this.pagination.search = !!param ? param : null;
    this.pagination.per_page = 30;
    this.sequencingService.getListTradeAudienceGroup(this.pagination).subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.audiences = res.data.data;
        this.filteredGTA.next(this.audiences.slice());
        // this.audiences = res.data;
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

}
