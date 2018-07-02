import { Component } from '@angular/core';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';



@Component({
    selector   : 'fuse-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    constructor(
        
        private fuseNavigationService: FuseNavigationService,
        private fuseSplashScreen: FuseSplashScreenService
    )
    {
    }
}
