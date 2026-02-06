import { LightningElement, wire, api, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getOpportunitiesOfAccount from '@salesforce/apex/SiteVisitBriefingDocumentController.getOpportunitiesOfAccount';
import getSiteBriefingDetails from '@salesforce/apex/SiteVisitBriefingDocumentController.getSiteBriefingDetails';
//Added by Vignesh
import { NavigationMixin } from 'lightning/navigation';
export default class SiteBriefingMainComponent extends NavigationMixin(LightningElement) {
    showErrorMessage = false;
     //isModalOpen = true;
    @api recordId;
    @api membershipActivityId;
    @track opportunitiesData = [];
    @track error;
    @track opportunityOptions = [];
    @api selectedOpportunityId;
    @track siteBrief;
    @track contactsInfo = [];
    @track bicInformation = [];
    @track pastOppInfo = [];
    @track productsInfo = [];
    
    @wire(getOpportunitiesOfAccount, { accountId: '$recordId' })
    wiredOpportunities({ data, error }) {
        if (data) {
            this.opportunitiesData = data;
            console.log('this.opportunitiesData', JSON.stringify(this.opportunitiesData));
            this.opportunityOptions = data.map((opportunity) => ({
                label: opportunity.Name,
                value: opportunity.Id
            }));
            console.log('this.opportunityOptions', JSON.stringify(this.opportunityOptions));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.opportunitiesData = [];
        }
    }
    handleRadioChange(event) {
        this.selectedOpportunityId = event.target.value;
        console.log('Selected Opportunity ID:', this.selectedOpportunityId);
    }
    formatDate(inputDate) {
        if (!inputDate) return '';


        const date = new Date(inputDate);
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();

        return `${month}/${day}/${year}`;
    }
    
    /*
    handleClickPrint() {
    
        let membershipActivityId = this.selectedOpportunityId || '';
        if (!membershipActivityId && this.opportunityOptions.length>0) {
            this.showErrorMessage = true; // Show custom error message
            return; // Prevent further execution
        }
        
        this.showErrorMessage = false;
        console.log('membershipActivityId', JSON.stringify(membershipActivityId));
        getSiteBriefingDetails({
            accountId: this.recordId,
            membershipActivityId: this.selectedOpportunityId
        })
            .then(result => {
                this.siteBrief = result;
                let objectItagesMap = result.objectItags;
                let modxmlString = result.xmlString;
                console.log('XML String:', modxmlString);
                this.contactsInfo = this.siteBrief.getContactInformation;
                this.bicInformation = this.siteBrief.getBicInformation;
                this.pastOppInfo = this.siteBrief.getClosedOpportunities;
                this.productsInfo = this.siteBrief.opportunityProductsData;
                if (this.productsInfo) {
                    this.productsData = [];
                    this.otherProductsInfo = [];
                    let MedTotal = [];
                    let PharmTtotal = [];
                    let DentalTotal = [];
                    let VisionTotal = [];
                    let otherTotal = [];
                    let totalData = JSON.parse(JSON.stringify(this.productsInfo));;
                    totalData.forEach((competitor) => {
                        let compeachRec = competitor;
                        if (compeachRec.Sold_Retained_Members__c != undefined) {
                            compeachRec.Sold_Retained_Members__c = compeachRec.Sold_Retained_Members__c.toString();
                        }
                        if (compeachRec.Product_Conversion__c != undefined) {
                            compeachRec.Product_Conversion__c = compeachRec.Product_Conversion__c.toString();
                        }
                        if (compeachRec.Members_Quoted_in_the_Proposal__c != undefined) {
                            compeachRec.Members_Quoted_in_the_Proposal__c = compeachRec.Members_Quoted_in_the_Proposal__c.toString();
                        }
                        if (compeachRec.Mbrs_Transferred_From_To_Another_Segment__c != undefined) {
                            compeachRec.Mbrs_Transferred_From_To_Another_Segment__c = compeachRec.Mbrs_Transferred_From_To_Another_Segment__c.toString();
                        }
                        if (compeachRec.Existing_Membership_at_Risk__c != undefined) {
                            compeachRec.Existing_Membership_at_Risk__c = compeachRec.Existing_Membership_at_Risk__c.toString();
                        }
                        if (compeachRec.Existing_Members_Involved_in_the_Bid__c != undefined) {
                            compeachRec.Existing_Members_Involved_in_the_Bid__c = compeachRec.Existing_Members_Involved_in_the_Bid__c.toString();
                        }
                        if (compeachRec.Estimated_Members_Existing_New__c != undefined) {
                            compeachRec.Estimated_Members_Existing_New__c = compeachRec.Estimated_Members_Existing_New__c.toString();
                        }
                        if (compeachRec.Estimated_Additional_New_Members__c != undefined) {
                            compeachRec.Estimated_Additional_New_Members__c = compeachRec.Estimated_Additional_New_Members__c.toString();
                        }
                        if (compeachRec.Annual_Revenue_Premium__c != undefined) {
                            compeachRec.Annual_Revenue_Premium__c = compeachRec.Annual_Revenue_Premium__c.toString();
                        }
                    });

                    // Loop through each product and add to the appropriate list
                    totalData.forEach((product) => {
                        if (product.Product_Line__c != null && product.Product_Line__c === 'Medical') {
                            if (product.Product2.Name == 'Total') {
                                MedTotal.push(product);
                            } else {
                                this.productsData.push(product);
                            }
                        }
                    });
                    if (MedTotal.length > 0) {
                        this.productsData.push(MedTotal[0]);
                    }
                    totalData.forEach((product) => {
                        if (product.Product_Line__c != null && product.Product_Line__c === 'Pharmacy') {
                            if (product.Product2.Name == 'Total') {
                                PharmTtotal.push(product);
                            } else {
                                this.productsData.push(product);
                            }
                        }
                    });
                    console.log('pharmacyProducts', + JSON.stringify(this.pharmacyProducts));
                    if (PharmTtotal.length > 0) {
                        this.productsData.push(PharmTtotal[0]);
                    }
                    totalData.forEach((product) => {
                        if (product.Product_Line__c != null && product.Product_Line__c === 'Dental') {
                            if (product.Product2.Name == 'Total') {
                                DentalTotal.push(product);
                            } else {
                                this.productsData.push(product);
                            }
                        }
                    });
                    if (DentalTotal.length > 0) {
                        this.productsData.push(DentalTotal[0]);
                    }
                    totalData.forEach((product) => {
                        if (product.Product_Line__c === 'Vision') {
                            if (product.Product2.Name == 'Total') {
                                VisionTotal.push(product);
                            } else {
                                this.productsData.push(product);
                            }
                        }
                    });
                    if (VisionTotal.length > 0) {
                        this.productsData.push(VisionTotal[0]);
                    }

                    totalData.forEach((product) => {
                        if (product.Product_Line__c === 'Other') {
                            if (product.Product2.Name == 'Total') {
                                otherTotal.push(product);
                            } else {
                                this.otherProductsInfo.push(product);
                                console.log('otherProductsInfo',this.otherProductsInfo);
                            }
                        }
                    });
                    if (otherTotal.length > 0) {
                        this.otherProductsInfo.push(otherTotal[0]);
                        console.log('otherTotal',this.otherTotal);
                    }
                    this.error = undefined;
                }
                function capitalizeFirstLetter(string) {
                    if (typeof string === 'string') {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }
                    return '';
                }

                for (let objectName in objectItagesMap) {
                    if (objectItagesMap.hasOwnProperty(objectName)) {
                        let keys = objectItagesMap[objectName];
                        console.log('keys++', keys)
                        if (objectName === 'Account') {
                            for (let k in objectItagesMap[objectName]) {
                                let key = objectItagesMap[objectName][k];
                                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                let value = '';
                                if (this.siteBrief.siteBriefingQuery != undefined && this.siteBrief.siteBriefingQuery != null) {

                                    if (key === "Name") {
                                        if (this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.Name) {
                                            value = this.siteBrief.siteBriefingQuery.Name;
                                        }
                                    }
                                    else if (key === 'Owner.Name') {
                                        if (this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.Owner.Name) {
                                            value = this.siteBrief.siteBriefingQuery.Owner.Name;
                                        }
                                    }
                                    else if (key === 'RecordType.Name') {
                                        if (this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.RecordType.Name) {
                                            value = this.siteBrief.siteBriefingQuery.RecordType.Name;
                                        }
                                    }
                                    else if (key === 'ConsultantFirm__r.Name') {
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.ConsultantFirm__r && this.siteBrief.siteBriefingQuery.ConsultantFirm__r.Name) {
                                            value = this.siteBrief.siteBriefingQuery.ConsultantFirm__r.Name;
                                        }
                                    }
                                    else if (key === 'Consultant__r.Name') {
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.Consultant__r && this.siteBrief.siteBriefingQuery.Consultant__r.Name) {
                                            value = this.siteBrief.siteBriefingQuery.Consultant__r.Name;
                                        }
                                    }
                                    else if (key === 'IncumbentPrimaryMedical__r.Name') {
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.IncumbentPrimaryMedical__r && this.siteBrief.siteBriefingQuery.IncumbentPrimaryMedical__r.Name) {
                                            value = this.siteBrief.siteBriefingQuery.IncumbentPrimaryMedical__r.Name;
                                        }
                                    }
                                    else if (key === 'IncumbentSecondaryMedical__r.Name') {
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.IncumbentSecondaryMedical__r && this.siteBrief.siteBriefingQuery.IncumbentSecondaryMedical__r.Name) {
                                            value = this.siteBrief.siteBriefingQuery.IncumbentSecondaryMedical__r.Name;
                                        }
                                    }
                                    else if (key === 'CVGAccount__r.Name') {
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.CVGAccount__r && this.siteBrief.siteBriefingQuery.CVGAccount__r.Name) {
                                            value = this.siteBrief.siteBriefingQuery.CVGAccount__r.Name;
                                        }
                                    }
                                    
                                    else if (key === 'Current_Deal_Next_Renewal_Date__c') {
                                        //let value = this.formatDate(strategyList[j].EffectiveDate__c);
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.Current_Deal_Next_Renewal_Date__c) {
                                            value = this.formatDate(this.siteBrief.siteBriefingQuery.Current_Deal_Next_Renewal_Date__c);
                                            console.log('datecaurrent' + this.formatDate(this.siteBrief.siteBriefingQuery.Current_Deal_Next_Renewal_Date__c));
                                        }
                                    }
                                    else if (key === 'Cancellation_Date__c') {
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.Cancellation_Date__c) {
                                            value = this.formatDate(this.siteBrief.siteBriefingQuery.Cancellation_Date__c);
                                        }
                                    }
                                    else   if(key === "AnnualRevenue__c" ){
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery[key]) {
                                        value = `$${this.siteBrief.siteBriefingQuery[key]}`;
                                        }
                                    }
                                    else   if(key === "AnnualB2BSpend__c" ){
                                        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery[key]) {
                                        value = `$${this.siteBrief.siteBriefingQuery[key]}`;
                                        }
                                    }
                                    else if (key === 'Previous_Customer__c' || key === 'ForbesGreatCompanyforWomenListing__c') {
                // Handle checkbox fields
                if (this.siteBrief.siteBriefingQuery[key] !== undefined) {
                    value = capitalizeFirstLetter(this.siteBrief.siteBriefingQuery[key] ? 'true' : 'false');
                }
            } 

                                   
                                    
                                    else
                                        value = this.siteBrief.siteBriefingQuery[key];
                                }
                                if (value !== '' && value !== null && value !== undefined) {
                                    modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                                } else {
                                    modxmlString = modxmlString.split(replaceItagName).join('');
                                }
                            }//keys for loop
                        }//close for object
                        else if (objectName === 'Opportunity') {
                            for (let k in objectItagesMap[objectName]) {
                                let key = objectItagesMap[objectName][k];
                                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                let value = '';
                                if (this.siteBrief.opportunityData != undefined && this.siteBrief.opportunityData != null) {
                                    if (key === "Name") {
                                        if (this.siteBrief.opportunityData && this.siteBrief.opportunityData.Name) {
                                            value = this.siteBrief.opportunityData.Name;
                                        }
                                    }
                                    else if (key === 'Owner.Name') {
                                        if (this.siteBrief.opportunityData && this.siteBrief.opportunityData.Owner.Name) {
                                            value = this.siteBrief.opportunityData.Owner.Name;
                                        }
                                    }
                                    else if (key === 'Benefit_Strategist__r.Name') {
                                        if (this.siteBrief && this.siteBrief.opportunityData && this.siteBrief.opportunityData.Benefit_Strategist__r && this.siteBrief.opportunityData.Benefit_Strategist__r.Name) {
                                            value = this.siteBrief.opportunityData.Benefit_Strategist__r.Name;
                                        }
                                    }
                                    else if (key === 'Win_Loss_Interview_Date__c') {
                                        if (this.siteBrief && this.siteBrief.opportunityData && this.siteBrief.opportunityData.Win_Loss_Interview_Date__c) {
                                            value = this.formatDate(this.siteBrief.opportunityData.Win_Loss_Interview_Date__c);
                                            console.log('winloss' + this.formatDate(this.siteBrief.opportunityData.Win_Loss_Interview_Date__c));
                                        }
                                    }
                                    else
                                        value = this.siteBrief.opportunityData[key];
                                    // if ([vs_Aetna__c, vs_Anthem__c, vs_Blues__c, vs_Blues_Alt__c, vs_Cigna__c,].includes(key) && value) {
                                    //     value = `${value}%`;
                                    // }

                                    if (key === "vs_Aetna__c" || key === "vs_Anthem__c" || key === "vs_Blues__c" || key === "vs_Blues_Alt__c" || key === "vs_Cigna__c") {
                                        if (this.siteBrief.opportunityData[key]) {
                                            value = `${this.siteBrief.opportunityData[key]}%`;
                                        }
                                    }

                                }


                                if (value !== '' && value !== null && value !== undefined) {
                                    modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                                } else {
                                    modxmlString = modxmlString.split(replaceItagName).join('');
                                }
                            }//keys for loop
                        }
                        else if (objectName === 'Contacts') {
                            let itagSets = objectItagesMap[objectName];
                            let startItag = '';
                            let endItag = '';
                            let setCount = 0;
                            for (let itagStrIndex in itagSets) {
                                setCount++;
                                if (setCount === 1) {
                                    startItag = itagSets[itagStrIndex];
                                }
                                if (setCount === itagSets.length) {
                                    endItag = itagSets[itagStrIndex];
                                }
                            }
                            startItag = '%%' + objectName + '.' + startItag + '@@';
                            endItag = '%%' + objectName + '.' + endItag + '@@';
                            let startIndex = modxmlString.lastIndexOf(startItag);
                            let endIndex = modxmlString.indexOf(endItag);
                            let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                            let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                            endHeaderIdx += '</w:tbl>'.length;
                            let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);
                            let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                            let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                            if (stIdx === -1) {
                                stIdx = 0;
                            }

                            if (stTableIdx === -1) {
                                stTableIdx = 0;
                            }

                            let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                            let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);
                            endIdx += '</w:tr>'.length;
                            endTableIdx += '</w:tbl>'.length;
                            let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                            let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                            modxmlString = this.returnChildData(rowToReccurse, TableToReccurse, this.contactsInfo, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);
                        }
                        else if (objectName === 'Company_Wide_BiC_Infromations__r') {
                            let itagSets = objectItagesMap[objectName];
                            let startItag = '';
                            let endItag = '';
                            let setCount = 0;
                            for (let itagStrIndex in itagSets) {
                                setCount++;
                                if (setCount === 1) {
                                    startItag = itagSets[itagStrIndex];
                                }
                                if (setCount === itagSets.length) {
                                    endItag = itagSets[itagStrIndex];
                                }
                            }
                            startItag = '%%' + objectName + '.' + startItag + '@@';
                            endItag = '%%' + objectName + '.' + endItag + '@@';
                            let startIndex = modxmlString.lastIndexOf(startItag);
                            let endIndex = modxmlString.indexOf(endItag);
                            let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                            let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                            endHeaderIdx += '</w:tbl>'.length;
                            let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);
                            let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                            let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                            if (stIdx === -1) {
                                stIdx = 0;
                            }

                            if (stTableIdx === -1) {
                                stTableIdx = 0;
                            }

                            let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                            let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);
                            endIdx += '</w:tr>'.length;
                            endTableIdx += '</w:tbl>'.length;
                            let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                            let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                            modxmlString = this.returnChildDataBic(rowToReccurse, TableToReccurse, this.bicInformation, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);
                        }
                        else if (objectName === 'Opportunities') {
                            let itagSets = objectItagesMap[objectName];
                            let startItag = '';
                            let endItag = '';
                            let setCount = 0;
                            for (let itagStrIndex in itagSets) {
                                setCount++;
                                if (setCount === 1) {
                                    startItag = itagSets[itagStrIndex];
                                }
                                if (setCount === itagSets.length) {
                                    endItag = itagSets[itagStrIndex];
                                }
                            }
                            startItag = '%%' + objectName + '.' + startItag + '@@';
                            endItag = '%%' + objectName + '.' + endItag + '@@';
                            let startIndex = modxmlString.lastIndexOf(startItag);
                            let endIndex = modxmlString.indexOf(endItag);
                            let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                            let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                            endHeaderIdx += '</w:tbl>'.length;
                            let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);
                            let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                            let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                            if (stIdx === -1) {
                                stIdx = 0;
                            }

                            if (stTableIdx === -1) {
                                stTableIdx = 0;
                            }

                            let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                            let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);
                            endIdx += '</w:tr>'.length;
                            endTableIdx += '</w:tbl>'.length;
                            let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                            let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                            modxmlString = this.returnChildDataOpp(rowToReccurse, TableToReccurse, this.pastOppInfo, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);
                        }
                        else if (objectName === 'OpportunityLineItem') {
                            let itagSets = objectItagesMap[objectName];
                            let startItag = '';
                            let endItag = '';
                            let setCount = 0;
                            for (let itagStrIndex in itagSets) {
                                setCount++;
                                if (setCount === 1) {
                                    startItag = itagSets[itagStrIndex];
                                }
                                if (setCount === itagSets.length) {
                                    endItag = itagSets[itagStrIndex];
                                }
                            }
                            startItag = '%%' + objectName + '.' + startItag + '@@';
                            endItag = '%%' + objectName + '.' + endItag + '@@';
                            console.log('startItag' + startItag + ' : endItag : ' + endItag);
                            let startIndex = modxmlString.lastIndexOf(startItag);
                            let endIndex = modxmlString.indexOf(endItag);

                            let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                            let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                            endHeaderIdx += '</w:tbl>'.length;
                            let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                            let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                            let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                            if (stIdx === -1) {
                                stIdx = 0;
                            }

                            if (stTableIdx === -1) {
                                stTableIdx = 0;
                            }

                            let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                            let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                            endIdx += '</w:tr>'.length;
                            endTableIdx += '</w:tbl>'.length;

                            let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                            let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);


                            modxmlString = this.returnChildDataLineItemsMedicalProducts(rowToReccurse, TableToReccurse, this.productsData, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                        }
                        else if (objectName === 'OpportunityLineItemOther') {
                            let itagSets = objectItagesMap[objectName];
                            let startItag = '';
                            let endItag = '';
                            let setCount = 0;
                            for (let itagStrIndex in itagSets) {
                                setCount++;
                                if (setCount === 1) {
                                    startItag = itagSets[itagStrIndex];
                                }
                                if (setCount === itagSets.length) {
                                    endItag = itagSets[itagStrIndex];
                                }
                            }
                            startItag = '%%' + objectName + '.' + startItag + '@@';
                            endItag = '%%' + objectName + '.' + endItag + '@@';
                            console.log('startItag' + startItag + ' : endItag : ' + endItag);
                            let startIndex = modxmlString.lastIndexOf(startItag);
                            let endIndex = modxmlString.indexOf(endItag);

                            let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                            let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                            endHeaderIdx += '</w:tbl>'.length;
                            let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                            let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                            let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                            if (stIdx === -1) {
                                stIdx = 0;
                            }

                            if (stTableIdx === -1) {
                                stTableIdx = 0;
                            }

                            let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                            let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                            endIdx += '</w:tr>'.length;
                            endTableIdx += '</w:tbl>'.length;

                            let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                            let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);


                            modxmlString = this.returnChildDataLineItemsOther(rowToReccurse, TableToReccurse, this.otherProductsInfo, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                        }
                    }//close for if object

                }
                let a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([modxmlString]));
                let templateName = 'Site Briefing Doc - ' + (this.siteBrief.siteBriefingQuery.Name || 'Unknown');
                a.download = templateName + '.doc';
                document.body.appendChild(a);
                a.click();
                const evnt = new CustomEvent('loaded', {
                    detail: this.loaded
                });
                this.dispatchEvent(evnt);
                 this.closeAction();

            })
            .catch(error => {
                console.error('Error fetching site briefing details:', error);

            });
            
    }   */
    closeAction(){
              this.dispatchEvent(new CloseActionScreenEvent());
    }
    
    /*
    returnChildData(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%Contacts.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%Contacts.Individual_Business_Relationship_Index__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;
        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {

                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));

                }
                else {
                    console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;
        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }

        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;

    }
    returnChildDataBic(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%Company_Wide_BiC_Infromations__r.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%Company_Wide_BiC_Infromations__r.BiC_Source_Records__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;
        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        function appendDollarIfNeeded(key, value) {
            const percentFields = ['Overall_BiC__c', 'vs_Aetna__c', 'vs_Anthem__c', 'vs_Blues__c', 'vs_Blues_Alt__c', 'vs_Cigna__c'];
            if (percentFields.includes(key) && value != null) {
                return value + '%';
            }
            return value;
        }
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(appendDollarIfNeeded(key, value)));

                }


                else {
                    console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }


                //

            }

            allStrategyRows += eachStrategyRow;

        }
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }

        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;

    }
    returnChildDataOpp(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%Opportunities.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%Opportunities.Closed_Comments__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;
        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    if (key == 'EffectiveDate__c') {
                        let value = this.formatDate(strategyList[j].EffectiveDate__c);
                        console.log('date', this.formatDate(strategyList[j].EffectiveDate__c));
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    } else {
                        let value = strategyList[j][key];
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }

                else {
                    console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;
        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }

        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;

    }
    returnChildDataLineItemsMedicalProducts(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%OpportunityLineitem.Product2.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%OpportunityLineitem.Annual_Revenue_Premium__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        function appendDollarIfNeeded(key, value) {
            const percentFields = ['Annual_Revenue_Premium__c'];
            if (percentFields.includes(key) && value != null) { // Check for null or undefined
                return '$' + value; // This includes 0 as a valid case
            }
            return value;
        }

        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (key == 'Product2.Name') {
                    if (strategyList[j].Product2.Name !== null && strategyList[j].Product2.Name !== '' && strategyList[j].Product2.Name !== undefined) {
                        let value = strategyList[j].Product2.Name;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(appendDollarIfNeeded(key, value)));
                } else {
                    console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;

    }
    returnChildDataLineItemsOther(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%OpportunityLineitemOther.Product2.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%OpportunityLineitemOther.Annual_Revenue_Premium__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        function appendDollarIfNeeded(key, value) {
            const percentFields = ['Annual_Revenue_Premium__c'];
            if (percentFields.includes(key) && value != null) { // Check for null or undefined
                return '$' + value; // This includes 0 as a valid case
            }
            return value;
        }
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (key == 'Product2.Name') {
                    if (strategyList[j].Product2.Name !== null && strategyList[j].Product2.Name !== '' && strategyList[j].Product2.Name !== undefined) {
                        let value = strategyList[j].Product2.Name;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(appendDollarIfNeeded(key, value)));
                } else {
                    console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;



    } */
    replaceXmlSpecialCharacters(value) {
        if (value != null && value !== undefined && value !== '') {
            if (typeof (value) == 'string') {
                value = value.replace(/&/g, '&amp;');
                value = value.replace(/>/g, '&gt;');
                value = value.replace(/</g, '&lt;');
                value = value.replace(/\n/g, '<w:br/>');
            }
            return value;
        }
        return '';
    }



    //Added by Vignesh
    //@api recordId; 

    handleGenerateWord(){
        console.log('inside word ');
        let membershipActivityId = this.selectedOpportunityId || '';
        if (!membershipActivityId && this.opportunityOptions.length>0) {
            this.showErrorMessage = true;
            return; 
        }       
        this.showErrorMessage = false;

        let siteBriefName = '';
        if (this.siteBrief && this.siteBrief.siteBriefingQuery && this.siteBrief.siteBriefingQuery.Name) {
          siteBriefName = this.siteBrief.siteBriefingQuery.Name;
        }
        
        let vfPageUrl = '/apex/BriefingWordDocVfPage?wordReport=word&accountId=' + this.recordId + '&membershipActivityId=' + this.selectedOpportunityId;

        let a = document.createElement('a');
        a.href = vfPageUrl;
        document.body.appendChild(a);
        a.click();
        const evnt = new CustomEvent('loaded', {
            detail: this.loaded
        });
        this.dispatchEvent(evnt);
            this.closeAction();
    }


}