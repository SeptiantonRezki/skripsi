import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { Page } from 'app/classes/laravel-pagination';
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-dialog-create",
  templateUrl: "./dialog-create.component.html",
  styleUrls: ["./dialog-create.component.scss"],
})
export class DialogCreateComponent implements OnInit {
  form: FormGroup;
  pagination: Page = new Page();
  offsetPagination: Number = null;
  data: any[];
  condition: boolean;
  loadingIndicator: Boolean;
  isColor: boolean;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogCreateComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) public dataProps: {title: string, methodGet: string, methodCreate: string, isColor?: boolean},
  ) {
    this.condition = false;
    this.isColor = this.dataProps.isColor || false;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      color: ['#000000'],
    });
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService[this.dataProps.methodGet](this.pagination).subscribe(
      res => {
        this.data = res.data.data;
        console.log('ini data', this.data);
      }
    );
  }

  submit(form) {
    if(form.valid){
      this.dataService.showLoading(true);
      this.loadingIndicator = true;
      this.condition = false;

      if ( this.data !== undefined) {
        this.data.forEach((each) => {
          if (each.name.toUpperCase() === form.value.name.toUpperCase()) {
            this.condition = true;
            this.dataService.showLoading(false);
            this.loadingIndicator = false;
          }
        });
      }

      if (this.condition === false) {
        this.dialogRef.close(`${form.value.name}`);

        if (!this.isColor) {
          delete form.value.color;
        }

        this.pengaturanAttributeMisiService[this.dataProps.methodCreate](form.value).subscribe(
          (res) => {
            this.dialogService.openSnackBar({
              message: this.ls.locale.notification.popup_notifikasi.text22
            });
            this.dataService.showLoading(false);
            this.loadingIndicator = false;
            this.router.navigate(["dte", "pengaturan-attribute-misi"]);
          },
          (err) => {
            console.log(err.error.message);
            this.dataService.showLoading(false);
            this.loadingIndicator = false;
            // this.dialogService.openSnackBar({ message: err.error.message })
          }
        );
      }
    }
  }
}
