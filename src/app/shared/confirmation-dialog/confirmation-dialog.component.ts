import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector   : 'confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls  : ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent
{

    constructor(@Inject(MAT_DIALOG_DATA) public data:any, private dialogRef:MatDialogRef<ConfirmationDialogComponent>)
    {
         
    }

    ngOnInit(){
       
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
