import { Component, ElementRef, HostBinding, Inject, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { Subscription } from 'rxjs';

import { FuseConfigService } from '@fuse/services/config.service';

import { navigation } from 'app/navigation/navigation';
import { DataService } from 'app/services/data.service';
import { environment } from 'environments/environment';
import { Emitter } from 'app/helper/emitter.helper';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
    selector: 'fuse-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseMainComponent implements OnDestroy {
    onConfigChanged: Subscription;
    fuseSettings: any;
    navigation: any;
    showLoading: Boolean;
    showProgress: Boolean;
    environment: any;
    chatIsOpen: boolean;
    listenOnLangChange: any;

    progress: any;
    isShowGTM: Boolean;
    gtmUrl: string = "https://www.googletagmanager.com/ns.html?id=GTM-WPLNLPW"
    urlSafe: SafeResourceUrl;

    @HostBinding('attr.fuse-layout-mode') layoutMode;

    constructor(
        private _renderer: Renderer2,
        private _elementRef: ElementRef,
        private fuseConfig: FuseConfigService,
        private platform: Platform,
        private dataService: DataService,
        @Inject(DOCUMENT) private document: any,
        private emitter: Emitter,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private ls: LanguagesService
    ) {
        this.onConfigChanged =
            this.fuseConfig.onConfigChanged
                .subscribe(
                    (newSettings) => {
                        this.fuseSettings = newSettings;
                        this.layoutMode = this.fuseSettings.layout.mode;
                    }
                );

        if (this.platform.ANDROID || this.platform.IOS) {
            this.document.body.className += ' is-mobile';
        }

        this.navigation = navigation;
        this.environment = environment;
        this.emitter.listenChatIsOpenQ.subscribe((value) => {
            // console.log('wehhhh', value);
            this.chatIsOpen = value;
        });

        this.isShowGTM = environment.show_gtm;
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.gtmUrl);
    }

    ngOnInit() {
        this.dataService.change.subscribe(res => {
            this.showLoading = res['show'] || res;
            this.progress = res['progress'] || undefined;

            // console.log(this.progress);
        });

        this.listenOnLangChange = this.translate.onLangChange.subscribe((res: any) => {
            if (res && res.translations ) {
                this.ls.locale = res.translations;
            }
        });
    }

    ngOnDestroy() {
        this.onConfigChanged.unsubscribe();
        this.listenOnLangChange.unsubscribe();
    }

    addClass(className: string) {
        this._renderer.addClass(this._elementRef.nativeElement, className);
    }

    removeClass(className: string) {
        this._renderer.removeClass(this._elementRef.nativeElement, className);
    }
}
