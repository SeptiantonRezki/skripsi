import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Config } from 'app/classes/config';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StoreTemplateLayoutService } from 'app/services/src-catalogue/store-template-layout.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-store-layout-template-edit',
  templateUrl: './store-layout-template-edit.component.html',
  styleUrls: ['./store-layout-template-edit.component.scss']
})
export class StoreLayoutTemplateEditComponent implements OnInit {
  formStoreTemplate: FormGroup;
  listStoreLength: any[] = [
    { name: '3 Meter', value: 3 },
    { name: '4 Meter', value: 4 },
    { name: '5 Meter', value: 5 },
    { name: '6 Meter', value: 6 },
    { name: '7 Meter', value: 7 },
    { name: '8 Meter', value: 8 },
    { name: '9 Meter', value: 9 },
    { name: '10 Meter', value: 10 },
    { name: '11 Meter', value: 11 },
    { name: '12 Meter', value: 12 },
  ];
  shortDetail: any;
  detailStoreLayout: any;
  isDetail: Boolean;
  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private storeTemplateLayoutService: StoreTemplateLayoutService,
    private activatedRoute: ActivatedRoute
  ) {
    this.shortDetail = this.dataService.getFromStorage("detail_store_layout")

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    this.formStoreTemplate = this.formBuilder.group({
      name: ["", Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      images: this.formBuilder.array([], Validators.required),
      description: [""]
    })

    this.getDetail();
  }

  getDetail() {
    this.storeTemplateLayoutService.show({ layout_id: this.shortDetail.id }).subscribe(res => {
      this.formStoreTemplate.setValue({
        name: res.data.name,
        length: res.data['length'],
        width: res.data['width'],
        description: res.data.description,
        images: this.formBuilder.array([])
      });

      if (this.isDetail) this.formStoreTemplate.disable();
    })
  }

}
