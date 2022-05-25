import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-dokumen-dialog',
  templateUrl: './dokumen-dialog.component.html',
  styleUrls: ['./dokumen-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DokumenDialogComponent implements OnInit {
  document: FormControl = new FormControl('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DokumenDialogComponent>,
    public dialog: MatDialog,
    private ls: LanguagesService,
  ) { }

  ngOnInit() {
    if (this.data.document) {
      this.document.setValue(this.data.document);
      this.document.disable();
    }
  }

}
