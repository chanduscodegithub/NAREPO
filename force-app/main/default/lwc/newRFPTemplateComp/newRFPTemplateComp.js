import { LightningElement, api } from 'lwc';
import fetchNewRFPTemplate from '@salesforce/apex/NewRFPTemplateController.fetchNewRFPTemplate';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { extractXMLVariables, mapValuesToXMLVariables, generateXMLVarialables, removeBidHistoryTableRowFromXML } from './helper';

export default class NewRFPTemplateComp extends LightningElement {

    @api recordId;
    isLoaded = true;
    
    downloadRFPHeadsUpNotification(){

        this.isLoaded = false;

        fetchNewRFPTemplate({ recordId: this.recordId })
        .then( result => {

            if( !result.isUserAuthorizedViewData ){
                this.dispatchEvent( 
                    new ShowToastEvent({
                        variant: 'error',
                        title: 'Failed To Download!',
                        message: 'You are not authorized to download the file.'
                    })
                );

                this.isLoaded = true;
                return;
            }

            let xmlTemplate = result.newRFPTemplateXML;
            result.memberShipActivityWithAccountData.documentGeneratedDate = result.documentGeneratedDate;


            // Check for loop conditions
            let xmlOppWithIndexVariablesArray = extractXMLVariables( xmlTemplate, result.templateRegxExpression.toFindOppWithIndexVariables );
            if( result.listOfBidHistory.length > 0 ){
                xmlTemplate = generateXMLVarialables( xmlTemplate, result.listOfBidHistory, result.bidHistoryLoopStartIdentifier, 
                                            result.bidHistoryLoopEndIdentifier, result.templateRegxExpression.toFindOppWithIndexVariables );
                xmlOppWithIndexVariablesArray = extractXMLVariables( xmlTemplate, result.templateRegxExpression.toFindOppWithIndexVariables );
            } else {
                // result.listOfBidHistory = [ genarateEmptyDataForXMLVariables( xmlOppWithIndexVariablesArray, '' ) ];
                xmlTemplate = removeBidHistoryTableRowFromXML( xmlTemplate, result.bidHistoryLoopStartIdentifier, result.bidHistoryLoopEndIdentifier );
            }
            xmlTemplate = mapValuesToXMLVariables( xmlTemplate, xmlOppWithIndexVariablesArray, result.listOfBidHistory, result.fieldsToFormat );

            const xmlOppAndAccVariablesArray = extractXMLVariables( xmlTemplate, result.templateRegxExpression.toFindOppAndAccVarialbes );
            xmlTemplate = mapValuesToXMLVariables( xmlTemplate, xmlOppAndAccVariablesArray, result.memberShipActivityWithAccountData, result.fieldsToFormat  );


            const aTag = window.document.createElement('a');
            const documentName = `${result.memberShipActivityWithAccountData.Name} - RFP Heads Up.doc`;
            aTag.href = window.URL.createObjectURL( new Blob( [ xmlTemplate ] ) );
            aTag.download = documentName;
            document.body.appendChild(aTag);
            aTag.click();
            document.body.removeChild(aTag);

            this.dispatchEvent( 
                new ShowToastEvent({
                    variant: 'success',
                    title: 'File Download Status!',
                    message: `" ${documentName} " Download Started.`
                })
            );

            this.isLoaded = true;

        })
        .catch( error => {

            if( error?.body?.message?.includes('do not have access') ){
                this.dispatchEvent( 
                    new ShowToastEvent({
                        title: 'Access Error',
                        variant: 'error',
                        message: 'Please contact admin for the required access',
                        mode: 'sticky'
                    })
                );
            } else {
                this.dispatchEvent( 
                    new ShowToastEvent({
                        variant: 'error',
                        title: 'File Download Status!',
                        message: `Download Failed.`
                    })
                );
                console.log( error );
            }

            this.isLoaded = true;

        });

    }
    
}