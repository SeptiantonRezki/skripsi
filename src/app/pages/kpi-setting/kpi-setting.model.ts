export class KPIGroupModel {
    constructor(
        public id: any,
        public start_kps: any,
        public end_kps: any,
        public status: any,
        public kpi_settings?: Array<any>
    ) {
    }
}
