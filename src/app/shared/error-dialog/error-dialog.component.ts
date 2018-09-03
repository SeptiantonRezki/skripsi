import { Component, Inject } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "error-dialog",
  templateUrl: "./error-dialog.component.html",
  styleUrls: ["./error-dialog.component.scss"]
})
export class ErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {}
}
