import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { Config } from "app/classes/config";
import { DialogService } from "app/services/dialog.service";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-spin-the-wheel-notif",
  templateUrl: "./spin-the-wheel-notif.component.html",
  styleUrls: ["./spin-the-wheel-notif.component.scss"],
})
export class SpinTheWheelNotifComponent implements OnInit {
  onLoad: boolean = true;
  formNotif: FormGroup;

  froalaConfig: Object = { ...Config.FROALA_CONFIG, placeholderText: "" };

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private ls: LanguagesService
  ) {}

  ngOnInit() {
    this.createFormGroup();
    this.getDetails();
  }

  createFormGroup() {
    this.formNotif = this.fb.group({
      description: ["", [Validators.required]],
      start_date: [new Date(), Validators.required],
      end_date: [new Date(), Validators.required],
      at: ["00:00", Validators.required],
      day: ['', Validators.required]
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
  }
}
