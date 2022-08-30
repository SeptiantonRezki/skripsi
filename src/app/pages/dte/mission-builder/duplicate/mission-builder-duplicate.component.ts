import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { Subject } from 'rxjs/Subject';
import * as shape from 'd3-shape';
import { SequencingService } from '../../../../services/dte/sequencing.service';
import moment from 'moment';
import { DialogCoinDuplicateComponent } from "./dialog-coin-duplicate/dialog-coin-duplicate.component";
import { DialogMisiDuplicateComponent } from "./dialog-misi-duplicate/dialog-misi-duplicate.component";
import { DialogPopUpNotifDuplicateComponent } from "./dialog-pop-up-notif-duplicate/dialog-pop-up-notif-duplicate.component";
import { DialogPushNotifDuplicateComponent } from "./dialog-push-notif-duplicate/dialog-push-notif-duplicate.component";
import { DialogWaktuTungguDuplicateComponent } from "./dialog-waktu-tunggu-duplicate/dialog-waktu-tunggu-duplicate.component";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: 'app-mission-builder-duplicate',
  templateUrl: './mission-builder-duplicate.component.html',
  styleUrls: ['./mission-builder-duplicate.component.scss']
})
export class MissionBuilderDuplicateComponent implements OnInit {

  dialogMisiRef: MatDialogRef<DialogMisiDuplicateComponent>;
  dialogPopUpNotificationRef: MatDialogRef<DialogPopUpNotifDuplicateComponent>;
  dialogPushNotificationRef: MatDialogRef<DialogPushNotifDuplicateComponent>;
  dialogWaktuTungguRef: MatDialogRef<DialogWaktuTungguDuplicateComponent>;
  dialogCoinRef: MatDialogRef<DialogCoinDuplicateComponent>;

  task: any = null;
  actions: any[];
  hierarchialGraph: { links: any[any]; nodes: any[any] };
  public layoutSettings = { orientation: 'LR' };
  public curve: any = shape.curveLinear;
  update$: Subject<boolean> = new Subject();
  prev_node: string;
  next_node: string;
  clickTimer: any;
  activeNode: any;
  currentNode: any;
  maxNode: any;
  yesNo = null;

  noMission: boolean;
  noPopup: boolean;
  noPush: boolean;
  noCoin: boolean;
  noDecision: boolean;
  noTime: boolean;
  noFinish: boolean;

  budget: number = 0;
  overBudget: boolean = false;

  constructor(
    private router: Router,
    public Dialog: MatDialog,
    private dataService: DataService,
    private sequencingService: SequencingService,
    private dialogService: DialogService,
    private ls: LanguagesService,
  ) {
    // this.actions = [];
    this.hierarchialGraph = {
      links: [],
      nodes: []
    }
  }

  misi = [];
  popUpNotif = [];
  pushNotif = [];
  waktuTunggu = [];

  ngOnInit() {
    this.noMission = false;
    this.noPopup = false;
    this.noPush = false;
    this.noCoin = false;
    this.noDecision = false;
    this.noTime = false;
    this.noFinish = false;
    this.currentNode = 0;
    this.maxNode = 0;
    this.dataService.getDataSequencingInfo().subscribe((res) => {
      this.task = res.data;
      if (this.task == null) {
        this.dialogService.openSnackBar({
          message: "Tidak dapat mengakses halaman ini secara langsung!!!"
        });
        this.router.navigate(['dte', 'task-sequencing']);
      } else {
        this.actions = this.task.actions;
        this.countWeeks(this.actions);
        const tempArray = this.getDaysArray(this.task.start_date, this.task.end_date);
        this.task.total_week = Math.ceil(tempArray.length / 7);
        this.actions.forEach(x => {
          if (x.type === "mission") {
            x.min_date = this.task.start_date;
            x.max_date = this.task.end_date;
            x.attribute.task_template_id = parseInt(x.attribute.task_template_id, 10);
          }
          if (x.type === "push-notification" || x.type === "pop-up-notification") {
            x.attribute.notification_id = parseInt(x.attribute.notification_id, 10);
          }
        });
        setTimeout(() => {
          this.updateGraph();
        }, 100);
      }
    });

  }

  countWeeks(array: any) {
    this.task.current_week = 0;
    let daysArray = [];
    array.forEach((x: any) => {
      if (x.type === 'mission' && x.attribute.task_template_id) {
        daysArray.push(this.getDaysArray(x.attribute.start_date, x.attribute.end_date));
      }
    });
    let theArray = [];
    daysArray.forEach(array => {
      theArray = [...theArray, ...array]
    })
    const uniqueArray = theArray.filter((item, index) => theArray.indexOf(item) === index);
    this.task.current_week = Math.ceil(uniqueArray.length / 7);
  }

  getDaysArray(s: any, e: any) {
    let a = [];
    let d = new Date(s);
    let end = new Date(e);
    for (d; d <= end; d.setDate(d.getDate() + 1)) {
      a.push((moment(d).format('YYYY-MM-DD')).toString());
    }
    return a;
  }

  submit() {
    this.task.status = "unpublish";
    this.task.actions = this.actions;
    const data = this.task;
    // Filter Nodes with type 'mission'
    let missionNodes = data.actions.filter(v => v.type === 'mission');
    let coinNodes = data.actions.filter(v => v.type === 'coin');
    // Are there any mixed verification type?
    let mixedVerification = !(missionNodes.every((v: any) => v.attribute.verification_type === missionNodes[0].attribute.verification_type)) || !(missionNodes.every((v: any) => v.attribute.is_push_to_ff === missionNodes[0].attribute.is_push_to_ff));
    // Check if coin activity is used in non-Push to FF sequence
    let validCoinNode = true;

    // Use to validate notification nodes
    let notifValid = 0;
    for (let i = 0; i < data.actions.length; i++) {
      const element = data.actions[i];
      if (element.attribute !== null && (element.attribute.verification_type === 'principal' || element.attribute.verification_type === 'field-force' || element.attribute.verification_type === null) && (element.attribute.is_push_to_ff === 0 || element.attribute.is_push_to_ff === '0')) {
        if (coinNodes.length > 0) {
          validCoinNode = false;
        }
      }
      if (element.attribute !== null && 'notification_id' in element.attribute) {
        if (element.attribute.notification_id > 0) {
          notifValid++;
        } else {
          notifValid = -1;
          break;
        }
      }
    }
    if (!validCoinNode) {
      this.dialogService.openSnackBar({
        message: "Tidak boleh ada activity coin jika misi tidak bertipe Push to FF"
      });
    } else if (mixedVerification) {
      this.dialogService.openSnackBar({
        message: "Kombinasi tipe verifikasi tidak diperbolehkan dalam satu task sequence"
      });
    } else if (this.overBudget) {
      this.dialogService.openSnackBar({
        message: "Budget trade program tidak mencukupi!"
      });
    } else if (notifValid < 0) {
      this.dialogService.openSnackBar({
        message: "Ada notifikasi yang belum diset!"
      });
    } else {
      if (missionNodes.length > 1) {
        let newAction = data.actions;
        
        newAction.forEach((action, index) => {
          if (action.type === "mission") {
            if (action.attribute.mission_reblast && action.attribute.mission_reblast === "active") {
              newAction[index].attribute.mission_reblast = "inactive";
            }
            if (action.attribute.verification_notes) {
              newAction[index].attribute.verification_notes = [];
            }
          }
        })
      }

      this.dataService.showLoading(true);
      this.sequencingService.create(data).subscribe(res => {
        this.dataService.showLoading(false);

        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(['dte', 'task-sequencing']);
      }, err => {
        console.log('err', err);
        this.dataService.showLoading(false);
      })
    }
  }

  nodeDisabler(type: any) {
    if (this.task.is_editable === 0) {
      this.noMission = true;
      this.noPopup = true;
      this.noPush = true;
      this.noCoin = true;
      this.noDecision = true;
      this.noTime = true;
      this.noFinish = true;
    }
    if (this.task.is_editable === 1) {
      switch (type) {
        case 'mission':
          this.noMission = true;
          this.noPopup = true;
          this.noPush = true;
          this.noCoin = true;
          this.noDecision = false;
          this.noTime = true;
          this.noFinish = false;
          break;
        case 'pop-up-notification':
          this.noMission = false;
          this.noPopup = true;
          this.noPush = true;
          this.noCoin = true;
          this.noDecision = false;
          this.noTime = false;
          this.noFinish = false;
          break;
        case 'push-notification':
          this.noMission = true;
          this.noPopup = true;
          this.noPush = true;
          this.noCoin = true;
          this.noDecision = false;
          this.noTime = false;
          this.noFinish = false;
          break;
        case 'coin':
          this.noMission = false;
          this.noPopup = false;
          this.noPush = false;
          this.noCoin = true;
          this.noDecision = true;
          this.noTime = false;
          this.noFinish = false;
          break;
        case 'decision':
          if (this.yesNo === 'yes') {
            this.noMission = false;
            this.noPopup = false;
            this.noPush = false;
            this.noCoin = false;
            this.noDecision = true;
            this.noTime = false;
            this.noFinish = false;
          }
          if (this.yesNo === 'no') {
            this.noMission = true;
            this.noPopup = true;
            this.noPush = true;
            this.noCoin = true;
            this.noDecision = true;
            this.noTime = false;
            this.noFinish = true;
          }
          break;
        case 'time':
          this.noMission = false;
          this.noPopup = false;
          this.noPush = false;
          this.noCoin = true;
          this.noDecision = false;
          this.noTime = true;
          this.noFinish = false;
          break;
        case 'finish':
          this.noMission = true;
          this.noPopup = true;
          this.noPush = true;
          this.noCoin = true;
          this.noDecision = true;
          this.noTime = true;
          this.noFinish = true;
          break;
        case null:
          this.noMission = false;
          this.noPopup = false;
          this.noPush = false;
          this.noCoin = false;
          this.noDecision = false;
          this.noTime = false;
          this.noFinish = false;
        default:
          break;
      }
    }
  }

  newDialog(type: any) {
    // Update action of current node index's next_step_component with the value of next increment of currentNode index
    if (this.actions.length > 0) {
      this.maxNode = parseInt(this.actions[this.actions.length - 1].component_id, 10) + 1;
      const curIndex = this.currentNode ? this.actions.findIndex(x => { return parseInt(x.component_id) === parseInt(this.currentNode) }) : this.actions.findIndex(x => { return parseInt(x.component_id) === parseInt(this.maxNode) - 1 });
      if (this.actions[curIndex].type === 'decision') {
        if (this.yesNo === 'yes') {
          this.actions[curIndex].decision_type === 'yes';
          this.actions[curIndex].next_step_component_yes = parseInt(this.maxNode, 10).toString();
          this.newNode(type);
        }
        if (this.yesNo === 'no') {
          this.actions[curIndex].decision_type === 'no';
          this.actions[curIndex].next_step_component_no = parseInt(this.maxNode, 10).toString();
          this.newNode(type);
        }
      } else {
        this.actions[curIndex].next_step_component = parseInt(this.maxNode, 10).toString();
        this.newNode(type);
      }
    } else {
      this.newNode(type);
    }
  }

  newNode(type: any) {
    // create object for the new node, based on their types
    switch (type) {
      case 'mission':
        const missionObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Mission',
          type: 'mission',
          attribute: {
            task_template_id: null,
            start_date: null,
            end_date: null,
            verification_type: 'retailer',
            coin_submission: 0,
            coin_verification: 0
          },
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo,
          min_date: this.task.start_date,
          max_date: this.task.end_date,
        }
        this.actions.push(missionObject);
        break;
      case 'decision':
        const decisionObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Split Decision',
          type: 'decision',
          attribute: null,
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo
        }
        this.actions.push(decisionObject);
        break;
      case 'pop-up-notification':
        const popupObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Pop Up Notification',
          type: 'pop-up-notification',
          attribute: {
            notification_id: null,
            time: null
          },
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo,
        }
        this.actions.push(popupObject);
        break;
      case 'push-notification':
        const pushObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Push Notification',
          type: 'push-notification',
          attribute: {
            notification_id: null,
            time: null
          },
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo,
        }
        this.actions.push(pushObject);
        break;
      case 'coin':
        const coinObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Coin',
          type: 'coin',
          attribute: {
            total_coin: null
          },
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo,
        }
        this.actions.push(coinObject);
        break;
      case 'time':
        const timeObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Waiting Period',
          type: 'time',
          attribute: {
            notification_id: null,
            time: null
          },
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo,
        }
        this.actions.push(timeObject);
        break;
      case 'finish':
        const finishObject = {
          component_id: parseInt(this.maxNode, 10).toString(),
          name: 'Finish',
          type: 'finish',
          attribute: null,
          next_step_component: null,
          next_step_component_yes: null,
          next_step_component_no: null,
          decision_type: this.yesNo,
        }
        this.actions.push(finishObject);
        break;
      default:
        break;
    }
    this.updateGraph();
    this.yesNo = null;
    this.updateCurrentNode(parseInt(this.maxNode, 10));
  }

  delNode(node: any, e: any) {
    e.stopPropagation();
    const a = JSON.parse(JSON.stringify(this.actions));
    const delNode = node.data.component_id;

    function deleteNode(arr: any, i: any) {
      let c = arr.length;
      while (c--) {
        const ca = arr.findIndex(x => x.component_id === i);
        if (arr[ca].next_step_component === null && arr[ca].next_step_component_yes === null && arr[ca].next_step_component_no === null) {
          let prevNode = -1;
          if (arr[ca].decision_type === 'yes') {
            prevNode = arr.findIndex((x: any) => { return x.next_step_component_yes === arr[ca].component_id });
            if (prevNode > -1) {
              arr[prevNode].next_step_component_yes = null;
            }
          } else if (arr[ca].decision_type === 'no') {
            prevNode = arr.findIndex((x: any) => { return x.next_step_component_no === arr[ca].component_id });
            if (prevNode > -1) {
              arr[prevNode].next_step_component_no = null;
            }
          } else {
            prevNode = arr.findIndex((x: any) => { return x.next_step_component === arr[ca].component_id });
            if (prevNode > -1) {
              arr[prevNode].next_step_component = null;
            }
          }
          arr.splice(ca, 1);
          return;
        } else {
          let newIndex = null;
          if (arr[ca].next_step_component) {
            newIndex = arr.findIndex((x: any) => { return x.component_id === arr[ca].next_step_component }); // 3
            const newNode = arr[newIndex].component_id;
            deleteNode(arr, newNode);
          }
          if (arr[ca].next_step_component_yes) {
            newIndex = arr.findIndex((x: any) => { return x.component_id === arr[ca].next_step_component_yes }); // 3
            const newNode = arr[newIndex].component_id;
            deleteNode(arr, newNode);
          }
          if (arr[ca].next_step_component_no) {
            newIndex = arr.findIndex((x: any) => { return x.component_id === arr[ca].next_step_component_no }); // 3
            const newNode = arr[newIndex].component_id;
            deleteNode(arr, newNode);
          }
        }
      }
    }

    deleteNode(a, delNode);
    this.actions = a;

    this.updateGraph();
  }

  updateCurrentNode(index: number) {
    this.currentNode = index;
  }

  setCurrentNode(node: any) {
    this.activeNode = node;
    const nodeUpdate = node ? node.data.type : null

    this.nodeDisabler(nodeUpdate);
  }

  updateGraph() {
    this.task.total_coin = 0;
    for (const a of this.actions) {
      if (a.type === 'mission') {
        this.task.total_coin += parseInt(a.attribute.coin_submission, 10) ? parseInt(a.attribute.coin_submission, 10) : 0;
        this.task.total_coin += parseInt(a.attribute.coin_verification, 10) ? parseInt(a.attribute.coin_verification, 10) : 0;
      } else if (a.type === 'coin') {
        this.task.total_coin += parseInt(a.attribute.total_coin, 10) ? parseInt(a.attribute.total_coin, 10) : 0;
      }
    }
    this.checkBudget();
    // Nodes creation
    this.hierarchialGraph.nodes = [];
    for (const a of this.actions) {
      const node = {
        id: a.component_id.toString(),
        label: a.name,
        data: {
          type: a.type,
          next_step_component: a.next_step_component,
          next_step_component_yes: a.next_step_component_yes,
          next_step_component_no: a.next_step_component_no,
          attribute: a.attribute,
          decision_type: a.decision_type,
          component_id: a.component_id,
          id: a.id ? a.id : null,
          min_date: a.min_date,
          max_date: a.max_date,
        }
      };

      this.hierarchialGraph.nodes.push(node);
    }
    if (this.actions.length > 0) {
      this.updateCurrentNode(this.hierarchialGraph.nodes[this.hierarchialGraph.nodes.length - 1].data.component_id);
      this.setCurrentNode(this.hierarchialGraph.nodes[this.hierarchialGraph.nodes.length - 1]);
    } else {
      this.updateCurrentNode(null);
      this.setCurrentNode(null);
    }

    // Links creation
    this.hierarchialGraph.links = [];

    for (const a of this.actions) {
      // Define source and target node id
      let source = null;
      let target = null;

      if (this.actions.length < 2) {
        continue;
      }

      if (a.next_step_component !== null) {
        source = a.component_id;
        target = a.next_step_component;
        const edge = {
          source: source.toString(),
          target: target.toString(),
          label: '',
          data: {
            linkText: ''
          }
        };

        this.hierarchialGraph.links.push(edge);
      }

      if (a.next_step_component === null && a.next_step_component_no) {
        source = a.component_id;
        target = a.next_step_component_no;
        const edge = {
          source: source.toString(),
          target: target.toString(),
          label: 'No',
          data: {
            linkText: 'N'
          }
        };

        this.hierarchialGraph.links.push(edge);
      }

      if (a.next_step_component === null && a.next_step_component_yes) {
        source = a.component_id;
        target = a.next_step_component_yes;
        const edge = {
          source: source.toString(),
          target: target.toString(),
          label: 'Yes',
          data: {
            linkText: 'Y'
          }
        };

        this.hierarchialGraph.links.push(edge);
      }

    }
    this.update$.next(true);
    this.countWeeks(this.actions);
  }

  checkBudget() {
    const body = {
      tsm_id: this.task.id,
      trade_creator_id: this.task.trade_creator_id,
      total_coin: this.task.total_coin,
      trade_audience_id: this.task.trade_audience_group_id
    }
    this.sequencingService.checkBudget(body).subscribe(res => {
      this.dataService.showLoading(false);
      if (res.data.remaining_budget < 0) {
        this.dialogService.openSnackBar({
          message: "Budget trade program tidak mencukupi"
        });
        this.overBudget = true;
      } else {
        this.overBudget = false;
      }
      this.task.total_budget = res.data.current_budget;
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(false);
    })
  }

  public getStyles(node: any): any {
    const styles = { 'border': '1px solid #999', 'height': '100px', 'text-align': 'center', 'padding': '20px', 'font-size': '1.5rem', 'border-radius': '10px' };
    let temp = {}
    switch (node.data.type) {
      case 'mission':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;
      case 'decision':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;
      case 'coin':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;
      case 'time':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;
      case 'pop-up-notification':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;
      case 'push-notification':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;
      case 'finish':
        temp = { 'background-color': '#c01727', 'color': '#ffffff' }
        break;

      default:
        break;
    }
    return Object.assign(styles, temp);
  }

  objectToFormData(obj, rootName, ignoreList) {
    var formData = new FormData();

    function appendFormData(data, root) {
      if (!ignore(root)) {
        root = root || '';
        if (data instanceof File) {
          formData.append(root, data);
        } else if (Array.isArray(data)) {
          for (var i = 0; i < data.length; i++) {
            appendFormData(data[i], root + '[' + i + ']');
          }
        } else if (typeof data === 'object' && data) {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              if (root === '') {
                appendFormData(data[key], key);
              } else {
                appendFormData(data[key], root + '.' + key);
              }
            }
          }
        } else {
          if (data !== null && typeof data !== 'undefined') {
            formData.append(root, data);
          }
        }
      }
    }

    function ignore(root) {
      return Array.isArray(ignoreList)
        && ignoreList.some(function (x) { return x === root; });
    }

    appendFormData(obj, rootName);

    return formData;
  }

  cardClick(node: any) {
    this.clickTimer = setTimeout(() => {
      if (node.data.type === 'decision') {

      }
      this.setCurrentNode(node);
      this.updateCurrentNode(node.data.component_id);
    }, 300);
  }
  cardDoubleClick(node: any): void {
    clearTimeout(this.clickTimer);
    this.clickTimer = undefined;
    if (node.data.type === 'mission') {
      this.openDialogMisi(node);
    }
    if (node.data.type === 'pop-up-notification') {
      this.openDialogPopUp(node);
    }
    if (node.data.type === 'push-notification') {
      this.openDialogPushNotif(node);
    }
    if (node.data.type === 'time') {
      this.openDialogWaktuTunggu(node);
    }
    if (node.data.type === 'coin') {
      this.openDialogCoin(node);
    }
  }

  setYesNo(node: any, yn: any) {
    this.yesNo = yn;
    this.cardClick(node);
  }

  openDialogMisi(node: any) {
    const totalMission = this.actions.filter(action => action.type === "mission").length;
    this.dialogMisiRef = this.Dialog.open(
      DialogMisiDuplicateComponent, { width: "600px", data: { totalMission, ...node } }
    );

    this.dialogMisiRef
      .afterClosed()
      .subscribe((res) => {
        if (res !== undefined) {
          const missionIndex = this.actions.findIndex(x => x.component_id === res.component_id);
          this.actions[missionIndex] = res;
          this.updateGraph();
        }
      });
  }

  openDialogPopUp(node: any) {
    this.dialogPopUpNotificationRef = this.Dialog.open(
      DialogPopUpNotifDuplicateComponent, { width: "600px", data: node }
    );

    this.dialogPopUpNotificationRef
      .afterClosed()
      .subscribe((res) => {
        if (res !== undefined) {
          const popupIndex = this.actions.findIndex(x => x.component_id === res.component_id);
          this.actions[popupIndex] = res;
          this.updateGraph();
        }
      });
  }

  openDialogPushNotif(node: any) {
    this.dialogPushNotificationRef = this.Dialog.open(
      DialogPushNotifDuplicateComponent, { width: "600px", data: node }
    );

    this.dialogPushNotificationRef
      .afterClosed()
      .subscribe((res) => {
        if (res !== undefined) {
          const pushIndex = this.actions.findIndex(x => x.component_id === res.component_id);
          this.actions[pushIndex] = res;
          this.updateGraph();
        }
      });
  }

  openDialogWaktuTunggu(node: any) {
    this.dialogWaktuTungguRef = this.Dialog.open(
      DialogWaktuTungguDuplicateComponent, { width: "600px", data: node }
    );

    this.dialogWaktuTungguRef
      .afterClosed()
      .subscribe((res) => {
        if (res !== undefined) {
          const timeIndex = this.actions.findIndex(x => x.component_id === res.component_id);
          this.actions[timeIndex] = res;
          this.updateGraph();
        }
      });
  }

  openDialogCoin(node: any) {
    this.dialogCoinRef = this.Dialog.open(
      DialogCoinDuplicateComponent, { width: "600px", data: node }
    );

    this.dialogCoinRef
      .afterClosed()
      .subscribe((res) => {
        if (res !== undefined) {
          const popupIndex = this.actions.findIndex(x => x.component_id === res.component_id);
          this.actions[popupIndex] = res;
          this.updateGraph();
        }
      });
  }

}
