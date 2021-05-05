import { Injectable, } from '@angular/core';
import { FeatureLevelService } from 'app/services/settings/feature-level.service';

import { BehaviorSubject } from 'rxjs';

export class TingkatFiturNode {
    item: string;
    children: TingkatFiturNode[];
    expandable: boolean;
    level: number;
    value: string;
    status: boolean;
}
export class TingkatFiturFlatNode {
    item: string;
    level: number;
    expandable: boolean;
    value: string;
    status: boolean;
}

@Injectable()
export class TingkatFiturTreeData {

    dataChange: BehaviorSubject<TingkatFiturNode[]> = new BehaviorSubject<TingkatFiturNode[]>([]);
    defaultSelectedChange: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    get data(): TingkatFiturNode[] { return this.dataChange.value; }
    
    get defaultSelected(): any[] {return this.defaultSelectedChange.value;}

    constructor(
        private featureLevelService: FeatureLevelService,
    ) {
        this.init();
    }
    init() {
        this.featureLevelService.getAvailablePermissions().subscribe(({ data }) => {
            const _data = this.buildFileTree(data, 0, ['menu', 'value']);
            this.dataChange.next(_data);
        })
    }

    buildFileTree(value: any, level: number, childKey: Array<string>) {
        let data: any[] = [];

        value.map(role => {

            let node = new TingkatFiturNode();

            node.item = role.nama;
            node.expandable = true;
            node.level = level;
            if (typeof role.value === 'string') {
                node.value = role.value;
                node.status = (role.status) ? role.status : false;
            }
            const targetChilds = role[childKey[level]];
            if (typeof targetChilds === 'object') {
                node.children = this.buildFileTree(targetChilds, level + 1, childKey);
            } else {
                node.item = role.nama;
                node.expandable = false;
            }

            data.push(node);

        })
        return data;
    }

}