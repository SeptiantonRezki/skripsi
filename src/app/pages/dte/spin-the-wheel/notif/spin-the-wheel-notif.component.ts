import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { Config } from "app/classes/config";
import { DialogService } from "app/services/dialog.service";
import { SpinTheWheelService } from "app/services/dte/spin-the-wheel.service";
import { LanguagesService } from "app/services/languages/languages.service";
import moment from "moment";

@Component({
  selector: "app-spin-the-wheel-notif",
  templateUrl: "./spin-the-wheel-notif.component.html",
  styleUrls: ["./spin-the-wheel-notif.component.scss"],
})
export class SpinTheWheelNotifComponent implements OnInit {
  onLoad: boolean = true;
  formNotif: FormGroup;

  froalaConfig: Object = { ...Config.FROALA_CONFIG, placeholderText: "" };

  dayList: any[] = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    "minggu",
  ];

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private ls: LanguagesService,
    private spinTheWheelService: SpinTheWheelService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createFormGroup();
    this.getDetails();

    this.formNotif.controls.start_date.valueChanges.subscribe((val) => {
      this.formNotif.controls.end_date.setValue(val);
    });
  }

  createFormGroup() {
    this.formNotif = this.fb.group({
      title: ["", Validators.required],
      content: ["", [Validators.required]],
      start_date: [new Date(), Validators.required],
      end_date: ["", Validators.required],
      at: ["00:00", Validators.required],
      day: ["", Validators.required],
    });
  }

  getDetails() {
    this.onLoad = false;
  }

  submit() {
    if (!this.formNotif.valid) {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!",
      });
      commonFormValidator.validateAllFields(this.formNotif);
      return;
    }
    const body = new FormData();
    body.append("title", this.formNotif.controls.title.value);
    body.append("content", this.formNotif.controls.content.value);
    body.append(
      "start_date",
      moment(this.formNotif.controls.start_date.value).format(
        "YYYY-MM-DD HH:mm:ss"
      )
    );
    body.append(
      "end_date",
      moment(this.formNotif.controls.end_date.value).format(
        "YYYY-MM-DD HH:mm:ss"
      )
    );
    body.append("at", this.formNotif.controls.at.value);
    for (let day of this.formNotif.controls.day.value)
      body.append("day[]", day);

    this.spinTheWheelService.savePushnotif(body).subscribe((res) => {
      this.dialogService.openSnackBar({
        message: "Pushnotif berhasil disimpan!",
      });
      this.router.navigate(["/dte", "spin-the-wheel"]);
    });
  }
}
