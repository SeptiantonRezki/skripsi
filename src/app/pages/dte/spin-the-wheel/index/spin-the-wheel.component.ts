import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import moment from 'moment';
import { FormGroup, FormBuilder } from '../../../../../../node_modules/@angular/forms';
import { PagesName } from 'app/classes/pages-name';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-spin-the-wheel',
  templateUrl: './spin-the-wheel.component.html',
  styleUrls: ['./spin-the-wheel.component.scss']
})
export class SpinTheWheelComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();
  dateNow: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  area_id_list: any = [];

  // 2 geotree property
  endArea: String;
  lastLevel: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

}
