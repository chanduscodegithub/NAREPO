import { LightningElement,api ,track} from 'lwc';

export default class EbdCurrentUhcCompetitors extends LightningElement {
    @api isEditMode;
   // @api competitorData;
    @api recordId;
     @track localCompetitorData = [];
     @api
    set competitorData(value) {
        this.localCompetitorData = value ? JSON.parse(JSON.stringify(value)) : [];
    }
    get competitorData() {
        return this.localCompetitorData;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        const rowIndex = parseInt(event.target.dataset.index, 10);

        if (isNaN(rowIndex) || rowIndex < 0) {
            console.error('Invalid index for competitor update:', rowIndex);
            return;
        }

        this.localCompetitorData[rowIndex] = {
            ...this.localCompetitorData[rowIndex],
            [fieldName]: fieldValue
        };

        // Dispatch updated copy to parent
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'Competitor',
                data: this.localCompetitorData
            }
        }));
    }
      
        

    }