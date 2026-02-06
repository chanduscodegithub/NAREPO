/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
export default class ChildRow extends NavigationMixin(LightningElement) {
  @api type; //SAMARTH
  @track ifProactive; //SAMARTH

  @track attachmentStatus;
  @track incentiveStatus;

  @track eachValueChange;
  /*@track dataNotSent;
  @track dataNotExtracted;
  @track saleSplitExist;*/

  @api
  get eachdata() {
    return this.eachValueChange;
  }
  set eachdata(value) {
    this.eachValueChange = value;

    if (this.eachValueChange.AreDocumentsAttached === "Yes") {
      this.attachmentStatus = true;
    } else {
      this.attachmentStatus = false;
    }

    if (this.eachValueChange.IncentiveStatus.includes("Pending")) {
      this.incentiveStatus = true;
    } else {
      this.incentiveStatus = false;
    }

    /*if(this.eachValueChange.ReadyToSendDate==="Not Sent - Action Needed")
    {
    this.dataNotSent=true;
    }
    else{
      this.dataNotSent=false;
    }
    if(this.eachValueChange.SalesSplitExist==="Yes")
    {
    this.saleSplitExist=true;
    }
    else{
      this.saleSplitExist=false;
    }
    if(this.eachValueChange.ReadyToExtractDate==="Not Yet Extracted"){
      if(this.eachValueChange.HighLightExtractedDate==='Yes'){
      this.dataNotExtracted=true;
      }
      else if(this.eachValueChange.HighLightExtractedDate==='No'){
      this.dataNotExtracted=false;
      }
      
    }
    else{
    this.dataNotExtracted=false;
  }*/
  }

  connectedCallback() {
    let eachValueChange = {};
    eachValueChange = Object.assign({}, this.eachdata);
    this.eachValueChange = eachValueChange;

    if (this.type === "proactive") {
      //console.log('Type is proactive');
      this.ifProactive = true;
    }

    if (eachValueChange.AreDocumentsAttached === "Yes") {
      this.attachmentStatus = true;
    } else {
      this.attachmentStatus = false;
    }

    if (eachValueChange.IncentiveStatus.includes("Pending")) {
      this.incentiveStatus = true;
    } else {
      this.incentiveStatus = false;
    }

    /*if (eachValueChange.ReadyToSendDate === "Not Sent - Action Needed") {
      this.dataNotSent = true;
    } else {
      this.dataNotSent = false;
    }
    if (this.eachValueChange.SalesSplitExist === "Yes") {
      this.saleSplitExist = true;
    } else {
      this.saleSplitExist = false;
    }
    if (eachValueChange.ReadyToExtractDate === "Not Yet Extracted") {
      if (this.eachValueChange.HighLightExtractedDate === "Yes") {
        this.dataNotExtracted = true;
      } else if (this.eachValueChange.HighLightExtractedDate === "No") {
        this.dataNotExtracted = false;
      }
    } else {
      this.dataNotExtracted = false;
    }*/
  }
}