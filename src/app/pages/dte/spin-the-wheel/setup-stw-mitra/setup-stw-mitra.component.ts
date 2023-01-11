import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import moment from 'moment';

@Component({
  selector: "app-setup-stw-mitra",
  templateUrl: "./setup-stw-mitra.component.html",
  styleUrls: ["./setup-stw-mitra.component.scss"],
})
export class SetupStwMitraComponent implements OnInit {
  isDetail: boolean;
  onLoad: boolean;
  formIcon: FormGroup;
  validComboDrag: boolean;
  files: File;
  imageConverted: any;
  imageRaw: any;
  minDate: any;
  imageValidationMsg: string;

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
    this.imageValidationMsg = "";
    this.validComboDrag = true;
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
          this.imageConverted = data.icon;
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

  changeImage(file) {
    this.imageRaw = file;
    this.readThis(file);
    const imageType = file.type.split("/").pop();
    const allowType = ["jpeg", "png", "gif"];

    console.log(imageType);
    if (!allowType.includes(imageType)) {
      this.imageValidationMsg = "Hanya bisa upload image berupa file jpg, png, dan gif";
      this.validComboDrag = false;
    } else if (file.size > 2097152) {
      this.imageValidationMsg = "Image tidak boleh lebih dari 2 MB";
      this.validComboDrag = false;
    } else {
      this.imageValidationMsg = "";
      this.validComboDrag = true;
    }
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

  submit() {
    this.dataService.showLoading(true);
    const fd = new FormData();
    const data: { [key:string]: any } = {
      ...this.formIcon.getRawValue(),
      started_at: moment(this.formIcon.get("started_at").value).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      ended_at: moment(this.formIcon.get("ended_at").value).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };

    if (this.imageRaw) data.icon = this.imageRaw;

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

