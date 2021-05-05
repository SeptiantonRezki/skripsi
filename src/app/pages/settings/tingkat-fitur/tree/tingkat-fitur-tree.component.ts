import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core';
import { FeatureLevelService } from 'app/services/settings/feature-level.service';

import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { of as ofObservable, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import {
    TingkatFiturTreeData,
    TingkatFiturNode,
    TingkatFiturFlatNode,
} from './tingkat-fitur-tree-data.service';
import * as _ from 'underscore';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-tingkat-fitur-tree',
    templateUrl: './tingkat-fitur-tree.component.html',
    styleUrls: ['./tingkat-fitur-tree.component.scss']
})
export class TingkatFitureRolesComponent implements OnInit {

    @Input('disabled') disabled = false;
    @Output('onChecklistSelectionChange') _onChecklistSelectionChange = new EventEmitter();

    flatNodeMap: Map<TingkatFiturFlatNode, TingkatFiturNode> = new Map<TingkatFiturFlatNode, TingkatFiturNode>();
    nestedNodeMap: Map<TingkatFiturNode, TingkatFiturFlatNode> = new Map<TingkatFiturNode, TingkatFiturFlatNode>();

    selectedParent: TingkatFiturFlatNode | null = null;

    treeControl: FlatTreeControl<TingkatFiturFlatNode>;
    nestedTreeControl: NestedTreeControl<TingkatFiturNode>;
    treeFlattener: MatTreeFlattener<TingkatFiturNode, TingkatFiturFlatNode>;

    dataSource: MatTreeFlatDataSource<TingkatFiturNode, TingkatFiturFlatNode>;
    nestedDataSource: MatTreeNestedDataSource<TingkatFiturNode>;

    checklistSelection = new SelectionModel<TingkatFiturFlatNode>(true);

    constructor(
        private featureLevelService: FeatureLevelService,
        private database: TingkatFiturTreeData,
        private activatedRoute: ActivatedRoute,
    ) {
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<TingkatFiturFlatNode>(this.getLevel, this.isExpandable);

        this.nestedTreeControl = new NestedTreeControl<TingkatFiturNode>(this.getChildren);

        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.nestedDataSource = new MatTreeNestedDataSource();

        database.dataChange.subscribe(data => {
            this.dataSource.data = data;
            this.nestedDataSource.data = data
        }
        );
        database.defaultSelectedChange.subscribe((defaultSelected: TingkatFiturNode[]) => {
            if (defaultSelected.length) {
                this.toggleDefaultSelection(defaultSelected);
            }
        });
        this.checklistSelection.onChange.subscribe(selectionData => {
            const selectedValues = [];
            _.map(selectionData.source.selected, (item) => {
                if (item.level === 2) selectedValues.push(item.value);
            });
            this._onChecklistSelectionChange.emit(selectedValues);
        })
    }
    ngOnInit(): void {
    }

    toggleDefaultSelection(selected: TingkatFiturNode[]) {
        this.flatNodeMap.forEach((node: TingkatFiturNode, flatNode: TingkatFiturFlatNode) => {
            if (node.value && node.status) this.selectionToggle(node);
        });

    }

    transformer = (node: TingkatFiturNode, level: number) => {
        let flatNode = this.nestedNodeMap.has(node) && this.nestedNodeMap.get(node)!.item === node.item
            ? this.nestedNodeMap.get(node)!
            : new TingkatFiturFlatNode();
        flatNode.item = node.item;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        if (level === 2) {
            flatNode.value = node.value;
            flatNode.status = (node.status !== undefined) ? node.status : false;
        }
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }
    getLevel = (node: TingkatFiturFlatNode) => { return node.level; };

    isExpandable = (node: TingkatFiturFlatNode) => { return node.expandable; };

    getChildren = (node: TingkatFiturNode): Observable<TingkatFiturNode[]> => {
        return ofObservable(node.children);
    }

    hasChild = (_: number, _nodeData: TingkatFiturFlatNode) => { return _nodeData.expandable; };
    hasNestedChild = (_: number, node: TingkatFiturFlatNode) => { return node.expandable; };


    selectionToggle(node: TingkatFiturNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.nestedTreeControl.getDescendants(node);

        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);
    }

    descendantsPartiallySelected(node: TingkatFiturNode): boolean {
        const descendants = this.nestedTreeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }
    descendantsAllSelected(node: TingkatFiturNode): boolean {
        const descendants = this.nestedTreeControl.getDescendants(node);
        return descendants.every(child => this.checklistSelection.isSelected(child));
    }

}
