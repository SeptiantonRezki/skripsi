import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Config } from 'app/classes/config';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StoreTemplateLayoutService } from 'app/services/src-catalogue/store-template-layout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';

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
  image_list: Array<any> = [];
  imageSku: any;
  files: File;
  fileList: Array<File> = [];

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private storeTemplateLayoutService: StoreTemplateLayoutService,
    private activatedRoute: ActivatedRoute,
    private router: Router
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
      images: [""],
      description: [""]
    })

    this.getDetail();
  }

  getDetail() {
    this.storeTemplateLayoutService.show({ layout_id: this.shortDetail.id }).subscribe(res => {
      this.detailStoreLayout = res.data;
      this.formStoreTemplate.setValue({
        name: res.data.name,
        length: res.data['length'],
        width: res.data['width'],
        description: res.data.description,
        images: []
      });

      if (res && res.data) {
        this.image_list = res.data.images;
        this.fileList = res.data.images;
      }

      if (this.isDetail) this.formStoreTemplate.disable();
    })
  }

  changeImage(evt) {
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }
    this.fileList = [
      ...this.fileList,
      file
    ]
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image_list = [...this.image_list, myReader.result];
    }

    myReader.readAsDataURL(file);
  }

  removeImage(idx) {
    console.log('index you find!', idx);
    this.image_list.splice(idx, 1);
  }

  async submit() {
    if (this.formStoreTemplate.valid && this.image_list.length > 0) {
      this.dataService.showLoading(true);
      // let fd = new FormData();
      // fd.append('_method', 'PUT');
      // fd.append('name', this.formStoreTemplate.get('name').value);
      // fd.append('length', this.formStoreTemplate.get('length').value);
      // fd.append('width', this.formStoreTemplate.get('width').value);
      // fd.append('description', this.formStoreTemplate.get('description').value);
      // fd.append('status', this.detailStoreLayout.status);

      // this.fileList.map(imgr => {
      //   fd.append('images[]', imgr)
      // })
      let body = {
        "_method": "PUT",
        name: this.formStoreTemplate.get('name').value,
        length: this.formStoreTemplate.get('length').value,
        width: this.formStoreTemplate.get('width').value,
        description: this.formStoreTemplate.get('description').value,
        status: this.detailStoreLayout.status,
        images: this.fileList
      }
      this.storeTemplateLayoutService.update({ layout_id: this.detailStoreLayout.id }, body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        });
        this.router.navigate(['/src-catalogue', 'store-layout-template']);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formStoreTemplate);
    }
  }

}
