import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";

export interface HasTable {
    loadingIndicator: boolean;
    listPerPage: Array<number>;
    offsetPagination: number;
    pagination: Page;
    rows: Array<any>;
    reorderable: boolean;
    table: DatatableComponent;
    
    changePerPage(event);
    setPage(event);
    onSort(event);
    onSelect(event);
}