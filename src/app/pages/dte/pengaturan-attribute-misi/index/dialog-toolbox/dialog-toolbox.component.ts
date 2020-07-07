import { Component, OnInit, HostListener } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';


@Component({
  selector: "app-dialog-toolbox",
  templateUrl: "./dialog-toolbox.component.html",
  styleUrls: ["./dialog-toolbox.component.scss"],
})
export class DialogToolboxComponent implements OnInit {
  form: FormGroup;
  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  valueChange: Boolean;
  selected = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogToolboxComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
  ) {}


  ngOnInit() {
    this.form = this.formBuilder.group({
      name: "",
    });
  }

  submit(form) {
    this.dialogRef.close(`${form.value.name}`);
    // console.log(`${form.value.name}`);
    console.log(form.value);
    this.pengaturanAttributeMisiService.createToolbox(form.value).subscribe(
      (res) => {
        this.dialogService.openSnackBar({
          message: "Data Berhasil Disimpan",
        });
        this.router.navigate(["dte", "pengaturan-attribute-misi"]);
      },
      (err) => {
        this.dialogService.openSnackBar({ message: err.error.message })
        console.log(err.error.message);
      }
    )
  }
}
