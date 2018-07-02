import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Component({
    selector   : 'app-module-1',
    templateUrl: './module-1.component.html',
    styleUrls  : ['./module-1.component.scss']
})
export class Module1Component
{
	rows: any[];
    loadingIndicator = true;
    reorderable = true;
    constructor(private http: HttpClient)
    {
    	
        
    }

    ngOnInit(){
     this.http.get('api/contacts-contacts')
            .subscribe((contacts: any) => {
                this.rows = contacts;
                this.loadingIndicator = false;
            });
    }
}
