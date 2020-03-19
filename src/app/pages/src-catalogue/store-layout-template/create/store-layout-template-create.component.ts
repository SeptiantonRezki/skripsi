import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StoreTemplateLayoutService } from 'app/services/src-catalogue/store-template-layout.service';
import { Config } from 'app/classes/config';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Router } from '@angular/router';

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
  image_list: Array<any> = [];
  imageSku: any;
  files: File;
  fileList: Array<File> = [];

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private storeTemplateLayoutService: StoreTemplateLayoutService,
    private rotuer: Router
  ) { }

  ngOnInit() {
    this.formStoreTemplate = this.formBuilder.group({
      name: ["", Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      images: [],
      description: [""]
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
    this.fileList.splice(idx, 1);
  }

  async submit() {
    if (this.formStoreTemplate.valid && this.image_list.length > 0) {
      this.dataService.showLoading(true);
      let fd = new FormData();
      fd.append('name', this.formStoreTemplate.get('name').value);
      fd.append('length', this.formStoreTemplate.get('length').value);
      fd.append('width', this.formStoreTemplate.get('width').value);
      fd.append('description', this.formStoreTemplate.get('description').value);

      this.fileList.map(imgr => {
        fd.append('images[]', imgr)
      })
      this.storeTemplateLayoutService.create(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        });
        this.rotuer.navigate(['/src-catalogue', 'store-layout-template']);
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
