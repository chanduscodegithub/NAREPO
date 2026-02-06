import { LightningElement, api, wire } from 'lwc';
import subHeader2InstText from '@salesforce/label/c.ClientProfile_OthrBuyPrdts_InstText'
import subHeader3InstText from '@salesforce/label/c.ClientProfile_CmplandscapeSpecialityPrdts_InstText'
import headerName from '@salesforce/label/c.ClientProfile_CompLandscape_HeaderName'
import subHeader1Name from '@salesforce/label/c.ClientProfile_CmpLandCarrier_SubHeaderName'
import subHeader2Name from '@salesforce/label/c.ClientProfile_CmpLandOther_SubHeaderName'
import subHeader3Name from '@salesforce/label/c.ClientProfile_CmpLandscape_SubHeader3Name'
import subHeader1InstText from '@salesforce/label/c.ClientProfile_CompLandscapeMedCarrier_InstText'



export default class CompetitiveLandscapeComp extends LightningElement {

    label = {headerName,subHeader1Name,subHeader2Name,subHeader3Name,subHeader2InstText,subHeader3InstText,subHeader1InstText};
  

    @api recordId;

    iscompetitorDataEmpty = true;
    dentalCompetitorList = [];
    medicalCompetitorList = [];
    pharmacyCompetitorList = [];
    visionCompetitorList = [];
    otherproductsCompetitor = {};
    dentalTotalCompetitorObj = {};
    medicalTotalCompetitorObj = {};
    pharmacyTotalCompetitorObj = {};
    visionTotalCompetitorObj = {};
    lifeCarriers = '';
    disabilityCarriers = '';
    supplementalCarriers = '';
    hearingCarriers = '';
    petInsuranceCarriers = '';
    competitorsData = {};

@api
get competitorData() {

    return this.competitorsData;
}
set competitorData(value) {
    
 this.competitorsData = value;
 let competitorsData = this.competitorsData ;

 this.iscompetitorDataEmpty = false;

            if(competitorsData.hasOwnProperty('dentalCompetitorList')){
                let dentalCompetitorList = competitorsData.dentalCompetitorList;
                if(!this.isListEmpty(dentalCompetitorList)){
                    this.dentalCompetitorList = dentalCompetitorList;
                }

            }

            if(competitorsData.hasOwnProperty('medicalCompetitorList')){
                let medicalCompetitorList = competitorsData.medicalCompetitorList;
                if(!this.isListEmpty(medicalCompetitorList)){
                    this.medicalCompetitorList = medicalCompetitorList;
                    console.log('value--med-'+this.medicalCompetitorList[0].MembershipEstimate__c);
                }

            }

            if(competitorsData.hasOwnProperty('pharmacyCompetitorList')){
                let pharmacyCompetitorList = competitorsData.pharmacyCompetitorList;
                if(!this.isListEmpty(pharmacyCompetitorList)){
                    this.pharmacyCompetitorList = pharmacyCompetitorList;
                }

            }

            if(competitorsData.hasOwnProperty('visionCompetitorList')){
                let visionCompetitorList = competitorsData.visionCompetitorList;
                if(!this.isListEmpty(visionCompetitorList)){
                    this.visionCompetitorList = visionCompetitorList;
                }

            }
            if(competitorsData.hasOwnProperty('otherproductsCompetitor')){
                let otherproductsCompetitor = competitorsData.otherproductsCompetitor;
                if(!this.isListEmpty(otherproductsCompetitor)){
                    this.otherproductsCompetitor = otherproductsCompetitor;
                }

            }

            if(competitorsData.hasOwnProperty('dentalTotalCompetitorObj')){
                let dentalTotalCompetitorObj = competitorsData.dentalTotalCompetitorObj;
                if(!this.isListEmpty(dentalTotalCompetitorObj)){
                    this.dentalTotalCompetitorObj = dentalTotalCompetitorObj;
                }

            }
            if(competitorsData.hasOwnProperty('medicalTotalCompetitorObj')){
                let medicalTotalCompetitorObj = competitorsData.medicalTotalCompetitorObj;
                if(!this.isListEmpty(medicalTotalCompetitorObj)){
                    this.medicalTotalCompetitorObj = medicalTotalCompetitorObj;
                }

            }
            if(competitorsData.hasOwnProperty('pharmacyTotalCompetitorObj')){
                let pharmacyTotalCompetitorObj = competitorsData.pharmacyTotalCompetitorObj;
                if(!this.isListEmpty(pharmacyTotalCompetitorObj)){
                    this.pharmacyTotalCompetitorObj = pharmacyTotalCompetitorObj;
                }

            }
            if(competitorsData.hasOwnProperty('visionTotalCompetitorObj')){
                let visionTotalCompetitorObj = competitorsData.visionTotalCompetitorObj;
                if(!this.isListEmpty(visionTotalCompetitorObj)){
                    this.visionTotalCompetitorObj = visionTotalCompetitorObj;
                }

            }
            if(competitorsData.hasOwnProperty('lifeCarrierListString')){
                this.lifeCarriers = competitorsData.lifeCarrierListString;
        }
        if(competitorsData.hasOwnProperty('disabilityCarrierListString')){
            this.disabilityCarriers = competitorsData.disabilityCarrierListString;
        }
            if(competitorsData.hasOwnProperty('supplementalCarrierListString')){
                this.supplementalCarriers = competitorsData.supplementalCarrierListString;
        }
        if(competitorsData.hasOwnProperty('hearingCarrierListString')){
            this.hearingCarriers = competitorsData.hearingCarrierListString;
        }
        if(competitorsData.hasOwnProperty('petInsuranceCarrierListString')){
            this.petInsuranceCarriers = competitorsData.petInsuranceCarrierListString;
        }

}


    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }
}