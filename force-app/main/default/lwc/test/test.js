import { LightningElement,api } from 'lwc';

export default class Test extends LightningElement {
    @api recordId;
    connectedCallback() {
    console.log('Record ID in connectedCallback:', this.recordId);
  }
}