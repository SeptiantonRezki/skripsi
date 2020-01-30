import { Component } from '@angular/core';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { QiscusService } from './services/qiscus.service';

@Component({
    selector   : 'fuse-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    constructor(
        private qs: QiscusService,
        private fuseNavigationService: FuseNavigationService,
        private fuseSplashScreen: FuseSplashScreenService
    ){}

    ngOnInit() {
        this.qs.initQiscusMC();
        this.fuseSplashScreen.hide();
    }
}
