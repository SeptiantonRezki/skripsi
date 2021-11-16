/**
 * An object used to get page information from the server
 */
export class Page {
  per_page: number;
  total: number;
  page: number;
  sort: any;
  sort_type: string;
  search: string;
  filter: string;
  status: string;
  start_date: string;
  end_date: string;
  area: any;
  user: any;
  product_id: any;
  category_id: any;
  type: string;
  type_banner: string;
  notification_id: any;
  
  constructor() {
    this.per_page = 15;
    this.page = 1;
    this.total = 0;
    this.sort = "";
    this.sort_type = "desc";
    this.search = "";
    this.filter = "";
    this.status = "";
    this.start_date = "";
    this.end_date = "";
    this.area = "";
    this.user = "";
    this.category_id = "";
    this.product_id = "";
    this.type = '';
    this.type_banner = '';
  }

  public static renderPagination(pagination, response) {
    pagination.page = response.page;
    pagination.per_page = response.per_page;
    pagination.total = response.total;
  }
  public setType(type) {
    this.type = type;
  }
  public renderFilters(pagination, filters) {
    Object.keys(filters).map(keyFilter => { pagination[keyFilter] = filters[keyFilter] })
  }
}
