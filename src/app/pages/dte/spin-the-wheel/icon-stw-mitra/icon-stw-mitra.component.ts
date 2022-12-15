import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import moment from 'moment';

@Component({
  selector: "app-icon-stw-mitra",
  templateUrl: "./icon-stw-mitra.component.html",
  styleUrls: ["./icon-stw-mitra.component.scss"],
})
export class IconStwMitraComponent implements OnInit {
  isDetail: boolean;
  onLoad: boolean;
  formIcon: FormGroup;
  validComboDrag: boolean;
  files: File;
  imageConverted: any;
  imageRaw: any;
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

  validationMsg: { [key: string]: Array<{ type: string; message: string }> };

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
    this.validationMsg = {
      started_at: [{ type: "required", message: "Tanggal Mulai Wajib Diisi!" }],
      ended_at: [
        { type: "required", message: "Tanggal Berakhir Wajib Diisi!" },
      ],
      at: [{ type: "required", message: "Set Waktu Wajib Diisi!" }],
      day: [{ type: "required", message: "Interval Program Wajib Diisi!" }],
    };

    this.formIcon = this.fb.group({
      title: [""],
      content: [""],
      started_at: ["", Validators.required],
      ended_at: ["", Validators.required],
      at: ["", Validators.required],
      day: ["", Validators.required],
    });

    this.minDate = moment();

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
          this.formIcon.get("title").setValue(data.title);
          this.formIcon.get("content").setValue(data.content);
          this.formIcon.get("started_at").setValue(data.started_at);
          this.formIcon.get("ended_at").setValue(data.ended_at);
          this.formIcon.get("at").setValue(data.at);
          this.formIcon.get("day").setValue(data.day);
        }
      },
      (err) => {
        this.dataService.showLoading(false);
      }
    );
  }

  checkValidation(
    namespace: string,
    validation: { type: string; message: string }
  ): boolean {
    return (
      this.formIcon.get(namespace).hasError(validation.type) &&
      this.formIcon.get(namespace).touched
    );
  }

  changeImage(event) {
    this.imageRaw = event;
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    const file: File = inputValue;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = (e) => {
      this.imageConverted = reader.result;
    };
  }

  isChecked(option: any, value: any) {
    return option && value && option.toString() === value.toString();
  }

  submitPublishUnpublish() {
    const id = this.dataService.getFromStorage("spin_the_wheel").id;
    // this.dataService.showLoading(true);
    let body = {
      status:
        this.dataService.getFromStorage("spin_the_wheel").status === "unpublish"
          ? "publish"
          : "unpublish",
    };
    // this.spinTheWheelService.publishUnpublish({id: id}, body).subscribe(({data}) => {

    // this.dataService.showLoading(false);
    // this.router.navigate(['dte', 'spin-the-wheel'])
    // }, err => {
    //   this.dataService.showLoading(false);
    // })
  }

  submitPreview() {
    this.dataService.showLoading(true);
    const fd = new FormData();
    const data = {
      icon: this.imageRaw,
      ...this.formIcon.getRawValue(),
      started_at: moment(this.formIcon.get("started_at").value).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      ended_at: moment(this.formIcon.get("ended_at").value).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };

    const { day, ...payload } = data;

    Object.keys(payload).forEach(key => {
      fd.append(key, payload[key]);
    });

    day.forEach(i => {
      fd.append('day[]', i);
    });

    this.stwService.manageSpinMitra(fd).subscribe(
      (res) => {
        this.dataService.showLoading(false);
        const{ status } = res;
        if(status === 'success') {
          this.dialogService.openSnackBar({message: "Data Berhasil Disimpan"});
          this.router.navigate([ "dte", "spin-the-wheel" ]);
        }
      },
      (err) => {
        this.dataService.showLoading(false);
      }
    );
  }
}

