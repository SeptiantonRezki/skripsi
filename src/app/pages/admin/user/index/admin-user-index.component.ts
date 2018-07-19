import { Component,ViewChild,TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';




@Component({
    selector   : 'admin-user-index',
    templateUrl: './admin-user-index.component.html',
    styleUrls  : ['./admin-user-index.component.scss']
})
export class AdminUserIndexComponent
{
	rows: any[];
    loadingIndicator = true;
    reorderable = true;
    @ViewChild('activeCell')
    activeCellTemp: TemplateRef<any>;
    constructor(private http:HttpClient)
    {
        
    }

    ngOnInit(){
    	this.http.get('api/admin_user')
            .subscribe((admin_user: any) => {
                this.rows = admin_user;
                this.loadingIndicator = false;
            });
    }

    getActives(){
    	return this.rows.map((row) => row['active_status'] );
    }
}
