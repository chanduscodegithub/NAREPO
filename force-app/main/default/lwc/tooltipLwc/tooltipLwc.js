import { LightningElement, api, track } from 'lwc';

export default class TooltipLwc extends LightningElement {

    @api helpText;
    @track showHelpText = false;

    displayHelpText() {
        this.showHelpText = true;
    }

    hideHelpText() {
        this.showHelpText = false;
    }
}