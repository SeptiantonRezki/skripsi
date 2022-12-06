import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RupiahFormaterWithoutRpPipe } from '@fuse/pipes/rupiah-formater';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-cancel-confirmation-dialog',
  templateUrl: './cancel-confirmation-dialog.component.html',
  styleUrls: ['./cancel-confirmation-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CancelConfirmationDialogComponent implements OnInit {

  formInput: FormGroup;
  // rupiahFormatter: RupiahFormaterWithoutRpPipe;

  constructor(
    public dialogRef: MatDialogRef<CancelConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private ls: LanguagesService,
    private dataService: DataService
  ) {
    // this.rupiahFormatter = new RupiahFormaterWithoutRpPipe(this.ls, this.dataService);
    console.log(data)
  }

  ngOnInit() {
    this.formInput = this.formBuilder.group({
      code: ["", Validators.required]
    })
  }

  submit() {
    if (this.formInput.valid) {

      this.dialogRef.close(this.formInput.get('code').value);
    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.lihat_pesanan.text20 });
    }
  }

}
