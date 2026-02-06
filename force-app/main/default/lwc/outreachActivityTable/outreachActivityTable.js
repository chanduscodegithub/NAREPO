import { LightningElement, track, api, wire } from 'lwc';
import fetchallAccountData from '@salesforce/apex/OutreachActivityTableCtrl.fetchAccountData';



export default class OutreachActivityTable extends LightningElement {

  ExpandDetails = false;
  @api listdata;
  eventUrl;
  @api recordId;
  @track taskEventData = [];
  @track isData = true;
  onLoadSpinner = true;
  @track isShowSpinner = false;

  ExpandCollapse() {
    if (!this.ExpandDetails) {
      this.isShowSpinner=true;
      this.fetchallAccountDataList();
    }
    this.ExpandDetails = !this.ExpandDetails;
    this.showTable = this.ExpandDetails;

  }

  ExpandDetails() {
    this.ExpandDetails = false;
  }

  connectedCallback() {
    setTimeout(() => this.spinnerLoadingAwait(), 2000);
    //this.fetchallAccountDataList();  
  }
  spinnerLoadingAwait(){
    this.onLoadSpinner = false;
}


  fetchallAccountDataList() {
    fetchallAccountData({ recId: this.recordId })
      .then(result => {
        this.taskEventData = [];
        let accdata = result;
        if (result != null) {
          if (result.eventList.length != 0) {
            this.isData = true;
            for (var i = 0; i < result.eventList.length; i++) {
              let relationName = '';
              if (result.eventList[i].EventRelations != undefined) {

                for (var j = 0; j < result.eventList[i].EventRelations.length; j++) {
                  if (relationName == '') {
                    relationName = result.eventList[i].EventRelations[j].Relation.Name;
                  } else
                    relationName = relationName + ',' + result.eventList[i].EventRelations[j].Relation.Name;
                }
              }
              else {
                if (result.eventList[i].Who != undefined)
                  relationName = result.eventList[i].Who.Name;
              }
              let obj = {};
              obj.Action_Items__c = result.eventList[i].Action_Items__c;
              obj.Id = result.eventList[i].Id;
              obj.ActivityDate = this.formattedCancellationDate(result.eventList[i].EndDate);
              obj.Subject = result.eventList[i].Subject;
              obj.Type = result.eventList[i].Type;
              obj.RelationName = relationName;
              obj.createdName = result.eventList[i].CreatedBy.Name;
              this.taskEventData.push(obj);
            }
          }

          if (result.taskList.length != 0) {
            for (var i = 0; i < result.taskList.length; i++) {
              let relationName = '';
              if (result.taskList[i].TaskRelations != undefined) {

                for (var j = 0; j < result.taskList[i].TaskRelations.length; j++) {
                  if (relationName == '') {
                    relationName = result.taskList[i].TaskRelations[j].Relation.Name;
                  } else
                    relationName = relationName + ',' + result.taskList[i].TaskRelations[j].Relation.Name;
                }
              } else {
                if (result.taskList[i].Who != undefined)
                  relationName = result.taskList[i].Who.Name;
              }
              let obj = {};
              obj.Action_Items__c = result.taskList[i].Action_Items__c;
              obj.Id = result.taskList[i].Id;
              obj.ActivityDate = this.formattedCancellationDate(result.taskList[i].ActivityDate);
              obj.Subject = result.taskList[i].Subject;
              obj.Type = result.taskList[i].Type;
              obj.RelationName = relationName;
              obj.createdName = result.taskList[i].CreatedBy.Name;
              this.taskEventData.push(obj);
            }
          }
 this.taskEventData.sort((a, b) => new Date(b.ActivityDate) - new Date(a.ActivityDate));
        }
        else {
          if (this.taskEventData.length == 0)
            this.isData = false;
        }
        this.isShowSpinner = false;

        //this.listdata = accdata[0].contacts;
        //this.listdata = result;
        //console.log('data++', JSON.stringify(this.listdata));          
      })
      .catch(error => {
        this.isShowSpinner = false;
        this.errorMessage = error;
      })
      .finally(() => {

      });
  }

  handleUrl(event) {
    this.eventUrl = `/${event.target.dataset.id}`;
  }

  formattedCancellationDate(formattedDate) {

        if(formattedDate!=null  && formattedDate!=undefined){
            let dateList = formattedDate.split('-');
            let day =dateList[1];
            let month=dateList[2];
            
            if(dateList[1].indexOf('0')==0){
                day =dateList[1].replace(/^0/, '');
            }
             if(dateList[2].indexOf('0')==0){
                month =dateList[2].replace(/^0/, '');
            }
            return day +'/'+ month +'/'+ dateList[0];
        }
    }

}