import { Injectable,EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../shared/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

@Injectable()
export class DialogService {
    public closeModalEmitter:EventEmitter<boolean>;
    public confirmationDialogReference:any;
    constructor(public matDialog:MatDialog){
        this.closeModalEmitter = new EventEmitter();
        this.confirmationDialogReference = {};
        this.closeModalEmitter.subscribe((res) => {
            if(res == true) {
                this.confirmationDialogReference.close();
            }
        })

    }
    openCustomDialog(title?, caption?) {
        this.matDialog.open(ErrorDialogComponent, { data: { title: title, caption: caption } });
    }

    openCustomConfirmationDialog(data = {}) {
        this.confirmationDialogReference = this.matDialog.open(ConfirmationDialogComponent,{
            panelClass: 'popup-panel',
            data: data
        });
    }

    brodcastCloseConfirmation() {
        this.closeModalEmitter.emit(true);
    }
}