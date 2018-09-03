import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { MatDialogModule, MatSnackBarModule } from "@angular/material";
import "hammerjs";

import { FuseModule } from "@fuse/fuse.module";
import { FuseSharedModule } from "@fuse/shared.module";

import { fuseConfig } from "./fuse-config";

import { AppComponent } from "./app.component";
import { FuseMainModule } from "./main/main.module";

// add app route module
import { AppRoutingModule } from "./app-routing.module";
import { FuseFakeDbService } from "./fuse-fake-db/fuse-fake-db.service";
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { SharedModule } from "./shared/shared.module";

// internal guard
import { AuthGuard } from "./classes/auth.guard";
import { NonAuthGuard } from "./classes/non-auth.guard";

// entry component
import { ErrorDialogComponent } from "./shared/error-dialog/error-dialog.component";
import { ConfirmationDialogComponent } from "./shared/confirmation-dialog/confirmation-dialog.component";
import { ToastInformationComponent } from "./shared/toast-information-dialog/toast-information.component";

// internal service
import { BaseInterceptor } from "./services/interceptor.module";
import { AuthenticationService } from "./services/authentication.service";
import { DataService } from "./services/data.service";
import { DialogService } from "./services/dialog.service";
import { AdminPrincipalService } from "./services/admin-principal.service";

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    ConfirmationDialogComponent,
    ToastInformationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot(),
    // Fuse Main and Shared modules
    FuseModule.forRoot(fuseConfig),
    FuseSharedModule,
    FuseMainModule,
    InMemoryWebApiModule.forRoot(FuseFakeDbService, {
      delay: 0,
      passThruUnknownUrl: true
    }),
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    AuthenticationService,
    DataService,
    DialogService,
    AdminPrincipalService,
    AuthGuard,
    NonAuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: BaseInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorDialogComponent,
    ConfirmationDialogComponent,
    ToastInformationComponent
  ]
})
export class AppModule {}
