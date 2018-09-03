import { Injectable, EventEmitter } from "@angular/core";
import { MatDialog, MatSnackBar } from "@angular/material";

import { ErrorDialogComponent } from "../shared/error-dialog/error-dialog.component";
import { ConfirmationDialogComponent } from "../shared/confirmation-dialog/confirmation-dialog.component";
import { ToastInformationComponent } from "../shared/toast-information-dialog/toast-information.component";

@Injectable()
export class DialogService {
  public closeModalEmitter: EventEmitter<boolean>;
  public confirmationDialogReference: any;

  constructor(public matDialog: MatDialog, public snackBar: MatSnackBar) {
    this.closeModalEmitter = new EventEmitter();
    this.confirmationDialogReference = {};
    this.closeModalEmitter.subscribe(res => {
      if (res == true) {
        this.confirmationDialogReference.close();
      }
    });
  }
  openCustomDialog(title?, caption?) {
    this.matDialog.open(ErrorDialogComponent, {
      data: { title: title, caption: caption }
    });
  }

  openCustomConfirmationDialog(data = {}) {
    this.confirmationDialogReference = this.matDialog.open(
      ConfirmationDialogComponent,
      {
        panelClass: "popup-panel",
        data: data
      }
    );
  }

  brodcastCloseConfirmation() {
    this.closeModalEmitter.emit(true);
  }

  openSnackBar(data?) {
    this.snackBar.openFromComponent(ToastInformationComponent, {
      data: data.message
    });
  }
}
