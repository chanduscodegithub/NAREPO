import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class BriefingWordDocComponent extends NavigationMixin(LightningElement) {

    @api recordId; 

    handleGenerateWord(){
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url:'/apex/BriefingWordDocVfPage?wordReport=word&accountId=' + this.recordId
            }
        }).then(generatedUrl => {
            window.open(generatedUrl,'_self');
        });
    }

}