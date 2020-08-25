import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MedalBadgeService } from 'app/services/user-management/retailer/medal-badge.service';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-medal-create-component',
  templateUrl: './medal-create-component.html',
  styleUrls: ['./medal-create-component.scss']
})
export class MedalCreateComponent implements OnInit {

  onLoad: boolean;
  permission: any;
  offsetPagination: any;
  reorderable = true;
  pagination: Page = new Page();
  imgMedal: File;
  imgMedalR: any;
  private _data: any = null;
  @Input() set data(value: any) {
    if (value) {
      this._data = value;
      if (value.data) {
        this._data = value.data;
        this.ngOnInit();
      }
    }
  }
  get data(): any { return this._data; }
  @Output() changes = new EventEmitter<any>();
  formMedal: FormGroup;

  constructor(
    private medalBadgeService: MedalBadgeService,
    private formBuilder: FormBuilder,
  ) {
    this.onLoad = false;
  }

  ngOnInit() {
    this.formMedal = this.formBuilder.group({
      namaMedal: ['', Validators.required],
      deskripsi: ['', Validators.required],
      gambar: [null, Validators.required]
    });

    if (this.data !== null) {
      this.formMedal.get('namaMedal').setValue(this.data.name)
      this.formMedal.get('deskripsi').setValue(this.data.description);
      this.formMedal.get('gambar').setValue(this.data.image_url);
      this.imgMedalR = this.data.image_url;
    }
  }

  removeImage(): void {
    this.imgMedal = undefined;
    this.imgMedalR = undefined;
  }

  readImage(inputValue: any): void {
    const file: File = inputValue;
    const myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imgMedalR = myReader.result;
      this.formMedal.get('gambar').setValue(this.imgMedal);
    };

    myReader.readAsDataURL(file);
  }

  cancel() {
    this.changes.emit({ selected: 'MEDAL_LIST' });
    this.data = null;
    this.formMedal.reset();
  }

  submit() {
    if (this.formMedal.valid) {
      const fd = new FormData();
      const body = {
        name: this.formMedal.get('namaMedal').value,
        description: this.formMedal.get('deskripsi').value,
        image: this.formMedal.get('gambar').value
      };
      fd.append('name', body.name);
      fd.append('description', body.description);
      fd.append('image', body.image);
      if (this.data && this.data.id) {
        fd.append('_method', 'put');
        this.medalBadgeService.put(fd, { id: this.data.id }).subscribe((res: any) => {
          console.log('updated', res);
          this.cancel();
        }, (err: any) => {
          console.log('error', err);
          this.onLoad = false;
        });
      } else {
        this.medalBadgeService.create(fd).subscribe((res: any) => {
          console.log('saved', res);
          this.cancel();
        }, (err: any) => {
          console.log('error', err);
          this.onLoad = false;
        });
      }
    } else {
      commonFormValidator.validateAllFields(this.formMedal);
    }
  }
}
