import { LightningElement,api } from 'lwc';

export default class EbdCompanyConsultants extends LightningElement {
    @api isEditMode;
    @api recordId;
    @api consultantsData;
}