import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class VfDocPoc extends NavigationMixin(LightningElement) {
@api recordId; 
    handleGeneratePDF(event){
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url:'/apex/GenerateWordVfPage?pdfReport=pdf&opportunityId=' + this.recordId
            }
        }).then(generatedUrl => {
            window.open(generatedUrl,'_self');
        });
    }

    handleGenerateWord(){
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url:'/apex/GenerateWordVfPage?wordReport=word&opportunityId=' + this.recordId
            }
        }).then(generatedUrl => {
            window.open(generatedUrl,'_blank');
        });
    }
}
/*import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class VfDocPoc extends NavigationMixin(LightningElement) {

    @api recordId; 

    handleGeneratePDF(event) {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: '/apex/GenerateWordVfPage?pdfReport=pdf&opportunityId=' + this.recordId
            }
        }).then(generatedUrl => {
            window.open(generatedUrl, '_self');
        });
    }

    handleGenerateWord() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: '/apex/GenerateWordVfPage?wordReport=word&opportunityId=' + this.recordId
            }
        }).then(generatedUrl => {
            window.open(generatedUrl, '_self');
        });
    }
}
*/