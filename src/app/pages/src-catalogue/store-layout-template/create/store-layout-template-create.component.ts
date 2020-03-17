import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StoreTemplateLayoutService } from 'app/services/src-catalogue/store-template-layout.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-store-layout-template-create',
  templateUrl: './store-layout-template-create.component.html',
  styleUrls: ['./store-layout-template-create.component.scss']
})
export class StoreLayoutTemplateCreateComponent implements OnInit {
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
  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private storeTemplateLayoutService: StoreTemplateLayoutService
  ) { }

  ngOnInit() {
    this.formStoreTemplate = this.formBuilder.group({
      name: ["", Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      images: this.formBuilder.array([], Validators.required),
      description: [""]
    })
  }

  submit() {

  }

}
