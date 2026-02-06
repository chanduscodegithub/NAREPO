import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CpwChecklistExport extends LightningElement {

    handleDownload() {
        // Create hidden <a> element
        const link = document.createElement('a');
        link.href = '/apex/ChecklistCSVExport'; 
        link.download = 'Checklist.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('CPW Export initiated successfully', 'success');
    }
    showToast(message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Checklist Export',
                message: message,
                variant: variant, 
            })
        );
    }

}