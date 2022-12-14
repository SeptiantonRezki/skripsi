import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import moment from 'moment';

@Component({
  selector: 'app-icon-stw-mitra',
  templateUrl: './icon-stw-mitra.component.html',
  styleUrls: ['./icon-stw-mitra.component.scss']
})
export class IconStwMitraComponent implements OnInit {

  isDetail: boolean;
  onLoad: boolean;
  formIcon: FormGroup;
  validComboDrag: boolean;
  files: File;
  imageConverted: any;
  detailFormSpin: any;
  minDate: any;

  dayList: string[] = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    "minggu",
  ];

  constructor(
    private ls: LanguagesService,
    private fb: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private stwService: SpinTheWheelService
  ) {
    this.isDetail = false;
    this.onLoad = false;
  }

  ngOnInit() {
    this.formIcon = this.fb.group({
      title: [''],
      content: [''],
      started_at: [''],
      ended_at: [''],
      at: [''],
      day: ['']
    });

    this.minDate = moment();

    this.detailFormSpin = this.dataService.getFromStorage('spin_the_wheel');
    this.getConfig();
  }

  getConfig() {
    this.dataService.showLoading(true);
    this.stwService.getConfigSpinMitra().subscribe(
      (res) => {
        this.dataService.showLoading(false);
        const { data, status } = res;
        if (status === "success") {
          // this.imageConverted = data.icon;
          this.formIcon.get('title').setValue(data.title);
          this.formIcon.get('content').setValue(data.content);
          this.formIcon.get('started_at').setValue(data.started_at);
          this.formIcon.get('ended_at').setValue(data.ended_at);
          this.formIcon.get('at').setValue(data.at);
          this.formIcon.get('day').setValue(data.day);
        }
      },
      (err) => {
        this.dataService.showLoading(false);
      }
    );
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    const file: File = inputValue;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = (e) => {
      this.imageConverted = reader.result;
    }
  }

  isChecked(option: any, value: any) {
    return option && value && option.toString() === value.toString();
  }

  submitPublishUnpublish() {
    const id = this.dataService.getFromStorage('spin_the_wheel').id;
    // this.dataService.showLoading(true);
    let body = {
      status: (this.dataService.getFromStorage('spin_the_wheel').status === 'unpublish')? 'publish' : 'unpublish'
    }
    // this.spinTheWheelService.publishUnpublish({id: id}, body).subscribe(({data}) => {

    // this.dataService.showLoading(false);
    // this.router.navigate(['dte', 'spin-the-wheel'])
    // }, err => {
    //   this.dataService.showLoading(false);
    // })
  }

  submitPreview() {
    this.dataService.showLoading(true);
    const payload = {
      icon: this.imageConverted,
      ...this.formIcon.getRawValue(),
      started_at: moment(this.formIcon.get('started_at').value).format('YYYY-MM-DD HH:mm:ss'),
      ended_at: moment(this.formIcon.get('ended_at').value).format('YYYY-MM-DD HH:mm:ss'),
    }

    console.log("saved", payload);
    this.dataService.showLoading(false);
    // if (
    //   this.formPreview.valid
    //   ) {
      // let body = new FormData();
      // body.append('image', null);
      // body.append('header', this.formIcon.get('preview_header').value);
      // body.append('image', '-');
      // let body;

      // body = {
      //   // icon: '-',
      //   header: this.formPreview.get('preview_header').value,
      //   image: '-'
      // };
      // if (this.files) body.append('image', this.files)
      // if (this.files) body.append('icon', this.files)

      // this.spinTheWheelService.put_preview({ id: id },body).subscribe(res => {
      //   this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      //   this.dataService.showLoading(false);
      //   this.setStorageDetail();
      //   this.router.navigate(['dte', 'spin-the-wheel'])
      // }, err => {
      //   this.dataService.showLoading(false);
      // });
    // } else {
    //   commonFormValidator.validateAllFields(this.formSpin);
    //   // commonFormValidator.validateAllFields(this.formGeo);

    //   this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
    // }
  }
}

