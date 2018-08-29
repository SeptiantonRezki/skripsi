import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';

import { fuseConfig } from './fuse-config';

import { AppComponent } from './app.component';
import { FuseMainModule } from './main/main.module';

// internal service
import { BaseInterceptor } from './services/interceptor.module';
import { AuthenticationService } from './services/authentication.service';
import { DataService } from './services/data.service';
import { DialogService } from './services/dialog.service';

// add app route module
import { AppRoutingModule } from './app-routing.module';
import { FuseFakeDbService } from './fuse-fake-db/fuse-fake-db.service';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import {SharedModule} from './shared/shared.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports     : [
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
            delay             : 0,
            passThruUnknownUrl: true
        }),
        SharedModule
    ],
    providers: [
        AuthenticationService,
        DataService,
        DialogService,
        { provide: HTTP_INTERCEPTORS, useClass: BaseInterceptor, multi: true }],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule
{
}
