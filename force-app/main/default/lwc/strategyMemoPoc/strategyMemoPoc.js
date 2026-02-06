import { LightningElement, track, api, wire } from 'lwc';
import getStrategyInformation from '@salesforce/apex/StrategyMemoController.getStrategyInformation';
import getProductsInfo from '@salesforce/apex/StrategyMemoController.getProductsInfo';
import getCompetitorsInAll from '@salesforce/apex/StrategyMemoController.getCompetitorsInAll';
import getRelatedOpportunities from '@salesforce/apex/StrategyMemoController.getRelatedOpportunities';
import saveStrategyMemo from '@salesforce/apex/StrategyMemoController.saveStrategyMemo';
import { refreshApex } from '@salesforce/apex';
import getStrategyMemo from '@salesforce/apex/StrategyMemoController.getStrategyMemo';
import getSecondaryConsultants from '@salesforce/apex/StrategyMemoController.getSecondaryConsultants';
import rfpQuesNoFormat from '@salesforce/label/c.RFP_Question_No_Format_Instruction';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class StrategyMemoPoc extends LightningElement {
    //@track isprintclick = false;
    @track memoWireResult;
    isLoading = true;
    memoLoaded = false;
    @track isEditAllowed;
    strategyInfoLoaded = false;
    @track strategyMemo = {};
    @track originalData = {};
    @track strategyCallDate = '';
    @track isEditMode;
    @api recordId;
    @api eligible;
    @track isShowModal = false;
    @track strategyInfo = {};
    oppId = '';
    @track stage = '';
    @track recordType = '';
    proposalDateReceived = '';
    proposalDueDate = '';
    strBillingCity = '';
    primarySitusState = '';
    strBillingAddress = '';

    @track pharmacyProducts = [];
    @track visionProducts = [];
    @track dentalProducts = [];
    @track otherProductsInfo = [];
    @track medicalProductsInfo = [];
    //@track otherProducts =[];
    @track competitorInMedical = [];
    @track competitorInOther = [];
    @track competitorInDental = [];
    @track competitorInVision = [];
    @track competitorInPharmacy = [];
    @track relatedOpportunitiesInfo = [];
    @track bicData = [];
    @track competitorData = [];
    @track productsData = [];
    @track otherProductsData = [];
    @track secondaryConsultants = [];
    isButtonVisible = false;
    strPrimaryConsultantEmail = '';
    specialityBenefits = '';
    strategyCallDat = '';
    bidStrategy = '';
    eligibleEesAndRetirees = '';
    enrolledEmployeesProposal = '';
    membersInProposal = '';
    sceAssignment = '';
    executiveSponsor = '';
    dealSponsor = '';
    businessOverview = '';
    comments = '';
    businessPressures = '';
    potentialCompellingEvent = '';
    ourPotentialUniqueBusinessValue = '';
    keyRisks = '';
    outcomeDrivers = '';
    approachStrategy = '';
    surestLastActionTaken = '';
    surestApproachStrategy = '';
    surestNetworkConstraints = '';
    networkContractingIssueOther = '';
    surestComments = '';
    surestNextActiontobeTaken = '';
    notesTaken = '';
    billingCity = '';
    comments = '';
    webAddress = '';
    corporateMailingCity = '';
    consultantName = '';
    corporateMailingAddress = '';
    primaryConsultantEmail = '';
    primaryConsultantPhone = '';
    ownerName = '';
    anticipatedActualCloseDate = '';
    effectiveDate = '';
    financialStrategyLead = '';
    aggregatorInvolved = '';
    cvgAccount = '';
    privateEquity = '';
    averageContractSize = '';
    ownerName = '';
    covetedAccount = '';
    accountName = '';
    surestSvpInvolved = '';
    isClientCannabisBusiness = '';
    businessPressures = '';
    uniqueBusinessValues = '';
    potentialCompelling = '';
    outcomeDrivers = '';
    keyRisks = '';
    approachStrategy = '';
    surestNetworkConstraints = '';
    networkContracting = '';
    surestComments = '';
    lastAction = '';
    surestApproachStrategy = '';
    nextAction = '';
    bluesBidComments = '';
    annualRevenue = '';
    healthPlan = '';
    isRFPUser = false; 
    questNoFormat =  rfpQuesNoFormat;//"Please use the following format to add strategic questions (q)<br/><b>Word:</b> q1,q2,q3<br/><b>Excel:</b> SheetName(q1,q2,q3), SheetName2(q1,q2,q3)rfpQuesNoFormat";
    /* string
    vsAnthem = '';
    vsAetna = '';
    vsBlues = '';
    vsBluesAlt = '';
    vsCigna = '';*/
    /*@track selectedValues = [];
    multiOptions = [
        { label: 'Ref1', value: 'Ref1' },
        { label: 'Ref2', value: 'Ref2' },
        { label: 'Ref3', value: 'Ref3' },

    ];*/

     @track showHelpText = false;

    handleHelpTextHover() {
        this.showHelpText = true;
    }

    handleHelpTextLeave() {
        this.showHelpText = false;
    }
    
    @wire(getStrategyMemo, { membershipActivityId: '$recordId' })
    wiredMemo(result) {
        this.memoWireResult = result;
        if (result.data) {
            this.strategyMemo = result.data;
            this.originalData = { ...this.strategyMemo };
            if (this.strategyMemo.AMT_Names_Requested__c) {
                this.selectedCheckboxesArray = this.strategyMemo.AMT_Names_Requested__c.split(';');
            }

        } else if (result.error) {
            console.error('Error fetching Strategy Memo:', result.error);
        }
        this.memoLoaded = true;
        this.checkIfAllLoaded();
    }
    @wire(getStrategyInformation, {
        membershipActivityId: '$recordId'
    })
    wiredStrategyInfo(response) {
        this.refreshData = response;
        if (response.data != undefined && response.data != null) {
            console.log('entry');
            console.log('Record Id:', this.recordId);
            console.log('strategyInfo infor========>' + JSON.stringify(this.strategyInfo));
            //refreshApex(this.refreshData);
            this.strategyInfo = response.data;
            //let stage = response.data.stageMedical;
            if (this.strategyInfo && this.strategyInfo.stageMedical) {
                this.isEditAllowed = this.strategyInfo.stageMedical !== 'Notified';
            } else {
                this.isEditAllowed = true;
            }
           this.isRFPUser = this.strategyInfo.isRFPUser;
          // this.isRFPUser = !!this.strategyInfo.isRFPUser;
            //  if(this.isEditAllowed || (!this.isRfpUser && this.isEditAllowed) )
            // {
            //     this.isButtonVisibile = true;
            // }
            // else{
            //     this.isButtonVisibile = false;
            // }
            //this.isButtonVisible = this.isEditAllowed && !this.isRFPUser;
            if(this.isRFPUser){
                 this.isButtonVisibile = false;
            }
            else if(this.isEditAllowed)
            {
                this.isButtonVisibile = true;
            }else{
                this.isButtonVisibile = false;
            }

            console.log('+++');
            console.log('strategy infor========>' + JSON.stringify(this.strategyInfo));
            if (this.isEditAllowed) {
                const fieldsToAssign = [
                    'oppId', 'strategyCallDat', 'bidStrategy', 'eligibleEesAndRetirees',
                    'enrolledEmployeesProposal', 'membersInProposal', 'proposalDateReceived',
                    'proposalDueDate', 'primarySitusState', 'billingAddress', 'webAddress',
                    'corporateMailingAddress', 'finalistDate', 'specialityBenefits',
                    'covetedAccount', 'corporateMailingCity', 'financialStrategyLead',
                    'averageContractSize', 'businessOverview', 'businessPressures',
                    'potentialCompelling', 'uniqueBusinessValues', 'keyRisks', 'outcomeDrivers',
                    'approachStrategy', 'surestNetworkConstraints', 'networkContracting',
                    'surestComments', 'lastAction', 'nextAction', 'surestApproachStrategy',
                    'notesTaken', 'eligible', 'accountName', 'bluesBidComments',
                    //'vsAnthem','vsAetna', 'vsBlues', 'vsBluesAlt', 'vsCigna',
                    'consultantName', 'primaryConsultantEmail', 'primaryConsultantPhone', 'ownerName',
                    'sceAssignment', 'executiveSponsor', 'dealSponsor',
                    'anticipatedActualCloseDate', 'isClientCannabisBusiness', 'effectiveDate',
                    'aggregatorInvolved', 'cvgAccount', 'privateEquity', 'surestSvpInvolved', 'comments',
                    'recordType', 'billingCity', 'annualRevenue', 'healthPlan'
                ];
                /*let strategyInfo = this.strategyInfo;
                fieldsToAssign.forEach(field => {
                    this[field] = strategyInfo[field] ?? '';
                });
                 floatFields.forEach(field => {
                    this[field] =  ?? '';
                                = value != null ? parseFloat(strategyInfo[field]) : '';
                });*/
                let strategyInfo = this.strategyInfo;
                fieldsToAssign.forEach(field => {
                    this[field] = strategyInfo[field] ?? '';
                });
                const floatFields = ['vsAnthem', 'vsAetna', 'vsBlues', 'vsBluesAlt', 'vsCigna'];
                floatFields.forEach(field => {
                    const value = strategyInfo[field];
                    this[field] = value != null ? parseFloat(value) : '';
                });
                /*fieldsToAssign.forEach(field => {
                    let value = strategyInfo[field];
                    if (floatFields.includes(field)) {
                        this[field] = value != null ? parseFloat(value) : '';
                    } else {
                        this[field] = value ?? '';
                    }
                });*/

            }
            else {
                if (this.strategyMemo) {
                    const fieldMappings = {
                        strategyCallDat: 'Strategy_Call_Date__c',
                        finalistDate: 'Finalist_Date__c',
                        oppId: 'Salesforce_Opportunity_ID__c',
                        surestSvpInvolved: 'Surest_SVP__c',
                        bidStrategy: 'Bid_Strategy__c',
                        proposalDateReceived: 'Proposal_Date_Received__c',
                        proposalDueDate: 'Proposal_Date_Due__c',
                        billingCity: 'Headquarters_City__c',
                        primarySitusState: 'Primary_Situs_State__c',
                        billingAddress: 'Address__c',
                        anticipatedActualCloseDate: 'Anticipated_Actual_Close_Date__c',
                        webAddress: 'Website_URL__c',
                        primaryConsultantEmail: 'Consultant_Email__c',
                        primaryConsultantPhone: 'Phone_Number__c',
                        consultantName: 'RFP_Primary_Consultant_s__c',
                        corporateMailingCity: 'Consultant_Firm_Loc__c',
                        corporateMailingAddress: 'Consultant_Address__c',
                        specialityBenefits: 'Specialty_SVP__c',
                        covetedAccount: 'Coveted_Account_SVP__c',
                        financialStrategyLead: 'Financial_Strategy_Lead__c',
                        ownerName: 'Sales_Vice_President_CD__c',
                        sceAssignment: 'SCE_Assignment_Traditional__c',
                        executiveSponsor: 'Executive_Sponsor__c',
                        dealSponsor: 'Deal_Sponsor__c',
                        proposalDueDate: 'E_Ship_Date__c',
                        finalistDate: 'Finalist_Date__c',
                        effectiveDate: 'Effective_Date__c',
                        isClientCannabisBusiness: 'Is_the_Client_in_the_Cannabis_Business__c',
                        bluesBidComments: 'Bidding_Blue_Plans__c',
                        eligibleEesAndRetirees: 'EEs_Retirees_in_the_Proposal_Medical__c',
                        enrolledEmployeesProposal: 'Employees_in_the_Proposal_Medical__c',
                        membersInProposal: 'Members_in_the_Proposal_Medical__c',
                        averageContractSize: 'Acs__c',
                        businessOverview: 'Business_Overview__c',
                        businessPressures: 'Business_Pressures__c',
                        potentialCompelling: 'Potential_Compelling_Event__c',
                        uniqueBusinessValues: 'Unique_Business_Value__c',
                        keyRisks: 'Key_Risks_to_our_UBV__c',
                        outcomeDrivers: 'Outcome_Drivers__c',
                        approachStrategy: 'Approach_Strategy__c',
                        surestNetworkConstraints: 'Surest_Netwok__c',
                        networkContracting: 'Network_Contracting_Issue_Other__c',
                        surestComments: 'Surest_Comments__c',
                        lastAction: 'Surest_Last_Action_Taken__c',
                        nextAction: 'Surest_Next_Action_to_be_Taken__c',
                        surestApproachStrategy: 'Surest_Approach_strategy__c',
                        notesTaken: 'Notes_Taken_on_call_with_Consultant__c',
                        aggregatorInvolved: 'Aggregator_involved_in_the_opportunity__c',
                        cvgAccount: 'CVG_Association__c',
                        privateEquity: 'Private_Equity_Relationship__c',
                        accountName: 'Account_Name__c',
                        vsAnthem: 'Vs_Anthem__c',
                        vsAetna: 'Vs_Aetna__c',
                        vsBlues: 'Vs_Blues__c',
                        vsBluesAlt: 'Vs_Blues_Alt__c',
                        vsCigna: 'Vs_Cigna__c',
                        healthPlan: 'Health_Plan_Manager_Industry__c',
                        annualRevenue: 'Annual_Revenue__c',

                        // vsAetna: parseFloat(this.vsAetna),
                        recordType: 'Record_Type__c',

                    };
                    const dateFields = new Set([
                        'strategyCallDat',
                        'finalistDate',
                        'anticipatedActualCloseDate',
                        'effectiveDate',
                        'proposalDateReceived',
                        'proposalDueDate'
                    ]);
                    let strategyMemo = this.strategyMemo;
                    for (let [localVar, apiField] of Object.entries(fieldMappings)) {
                        const rawValue = strategyMemo[apiField];
                        if (dateFields.has(localVar)) {
                            this[localVar] = this.formatDate(rawValue);
                        } else {
                            this[localVar] = rawValue ?? '';
                        }
                    }
                }
            }
            this.strategyInfoLoaded = true;
            this.checkIfAllLoaded();
        }

    }


    @wire(getProductsInfo, {
        membershipActivityId: '$recordId'
    })
    wiredAllProductsInfo({
        error,
        data
    }) {
        if (data) {
            this.medicalProductsInfo = [];
            this.dentalProducts = [];
            this.visionProducts = [];
            this.otherProducts = [];
            this.pharmacyProducts = [];
            this.productsData = [];
            this.otherProductsInfo = [];
            let MedTotal = [];
            let PharmTtotal = [];
            let DentalTotal = [];
            let VisionTotal = [];
            let otherTotal = [];
            let totalData = JSON.parse(JSON.stringify(data));;
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
            totalData.forEach((product) => {
                if (product.Product_Line__c != null && product.Product_Line__c === 'Medical') {
                    if (product.Product2.Name == 'Total') {
                        MedTotal.push(product);
                    } else {
                        this.medicalProductsInfo.push(product);
                        this.productsData.push(product);
                    }
                }
            });
            if (this.medicalProductsInfo.length > 0 && MedTotal.length > 0) {
                this.medicalProductsInfo.push(MedTotal[0]);
                this.productsData.push(MedTotal[0]);
            }
            totalData.forEach((product) => {
                if (product.Product_Line__c != null && product.Product_Line__c === 'Pharmacy') {
                    if (product.Product2.Name == 'Total') {
                        PharmTtotal.push(product);
                    } else {
                        this.pharmacyProducts.push(product);
                        this.productsData.push(product);
                    }
                }
            });
            console.log('pharmacyProducts', + JSON.stringify(this.pharmacyProducts));
            if (this.pharmacyProducts.length > 0 && PharmTtotal.length > 0) {
                this.pharmacyProducts.push(PharmTtotal[0]);
                this.productsData.push(PharmTtotal[0]);
            }
            totalData.forEach((product) => {
                if (product.Product_Line__c != null && product.Product_Line__c === 'Dental') {
                    if (product.Product2.Name == 'Total') {
                        DentalTotal.push(product);
                    } else {
                        this.dentalProducts.push(product);
                        this.productsData.push(product);
                    }
                }
            });
            if (this.dentalProducts.length > 0 && DentalTotal.length > 0) {
                this.dentalProducts.push(DentalTotal[0]);
                this.productsData.push(DentalTotal[0]);
            }
            totalData.forEach((product) => {
                if (product.Product_Line__c === 'Vision') {
                    if (product.Product2.Name == 'Total') {
                        VisionTotal.push(product);
                    } else {
                        this.visionProducts.push(product);
                        this.productsData.push(product);
                    }
                }
            });
            if (this.visionProducts.length > 0 && VisionTotal.length > 0) {
                this.visionProducts.push(VisionTotal[0]);
                this.productsData.push(VisionTotal[0]);
            }

            totalData.forEach((product) => {
                if (product.Product_Line__c === 'Other') {
                    if (product.Product2.Name == 'Total') {
                        otherTotal.push(product);
                    } else {
                        this.otherProductsData.push(product);
                        this.otherProductsInfo.push(product);
                    }
                }
            });
            if (this.otherProductsData.length > 0 && otherTotal.length > 0) {
                this.otherProductsData.push(otherTotal[0]);
                this.otherProductsInfo.push(otherTotal[0]);
            }
            //this.isLoading = false;

            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.allProducts = undefined;
        }
    }
    @wire(getCompetitorsInAll, { membershipActivityId: '$recordId' })
    wiredCompetitorData({ error, data }) {
        if (data) {
            this.competitorInMedical = [];
            this.competitorInOther = [];
            this.competitorInDental = [];
            this.competitorInPharmacy = [];
            this.competitorInVision = [];
            this.competitorData = [];
            let compMedTotal = [];
            let compPharmTotal = [];
            let compDentalTotal = [];
            let compVisionTotal = [];
            let compOtherTotal = [];
            let totalData = JSON.parse(JSON.stringify(data));;
            totalData.forEach((competitor) => {
                let compeachRec = competitor;
                if (compeachRec.of_Members_Awarded__c != undefined) {
                    compeachRec.of_Members_Awarded__c = compeachRec.of_Members_Awarded__c.toString();
                }
                if (compeachRec.of_Members_Held__c != undefined) {
                    compeachRec.of_Members_Held__c = compeachRec.of_Members_Held__c.toString();
                }
                if (compeachRec.Number_of_Members_Awarded__c != undefined) {
                    compeachRec.Number_of_Members_Awarded__c = compeachRec.Number_of_Members_Awarded__c.toString();
                }
                if (compeachRec.Number_of_Members_Held__c != undefined) {
                    compeachRec.Number_of_Members_Held__c = compeachRec.Number_of_Members_Held__c.toString();
                }
            });
            totalData.forEach((competitor) => {

                if (competitor.Competitor_Classification__c == 'Medical') {
                    if (competitor.Competitor_Account__r.Name == 'Total') {
                        compMedTotal.push(competitor);

                    } else {
                        this.competitorInMedical.push(competitor);
                        this.competitorData.push(competitor);
                    }
                }
            });
            if (compMedTotal.length > 0) {
                this.competitorInMedical.push(compMedTotal[0]);
                this.competitorData.push(compMedTotal[0]);
            }

            totalData.forEach((competitor) => {
                if (competitor.Competitor_Classification__c === 'Dental') {
                    if (competitor.Competitor_Account__r.Name == 'Total') {
                        compDentalTotal.push(competitor);
                    }

                    else {
                        this.competitorInDental.push(competitor);
                        this.competitorData.push(competitor);
                    }
                }
            });
            if (compDentalTotal.length > 0) {
                this.competitorInDental.push(compDentalTotal[0]);
                this.competitorData.push(compDentalTotal[0]);
            }
            totalData.forEach((competitor) => {
                if (competitor.Competitor_Classification__c === 'Pharmacy') {
                    if (competitor.Competitor_Account__r.Name == 'Total') {
                        compPharmTotal.push(competitor);
                    }
                    else {
                        this.competitorInPharmacy.push(competitor);
                        this.competitorData.push(competitor);
                    }
                }
            });
            if (compPharmTotal.length > 0) {
                this.competitorInPharmacy.push(compPharmTotal[0]);
                this.competitorData.push(compPharmTotal[0]);
            }
            totalData.forEach((competitor) => {
                if (competitor.Competitor_Classification__c === 'Vision') {
                    if (competitor.Competitor_Account__r.Name == 'Total') {
                        compVisionTotal.push(competitor);
                    }
                    else {
                        this.competitorInVision.push(competitor);
                        this.competitorData.push(competitor);
                    }
                }
            });
            if (compVisionTotal.length > 0) {
                this.competitorInVision.push(compVisionTotal[0]);
                this.competitorData.push(compVisionTotal[0]);
            }
            totalData.forEach((competitor) => {
                if (competitor.Competitor_Classification__c === 'Other') {
                    if (competitor.Competitor_Account__r.Name == 'Total') {
                        compOtherTotal.push(competitor);
                    }
                    else {
                        this.competitorInOther.push(competitor);
                        this.competitorData.push(competitor);
                    }
                }
            });
            if (compOtherTotal.length > 0) {
                this.competitorInOther.push(compOtherTotal[0]);
                this.competitorData.push(compOtherTotal[0]);
            }
            console.log('competitorData+++' + JSON.stringify(this.competitorData));
            //this.competitorData = data;
            this.error = undefined;
            //console.log('CompetitorData+++', + JSON.stringify(this.competitorData));
            // this.isLoading = false;
        }
        else if (error) {
            this.competitorData = undefined;
            this.error = error;
            console.error('Error fetching competitorData Data:', error);

        }

    }
    @wire(getRelatedOpportunities, {
        membershipActivityId: '$recordId'
    })
    wiredRelatedOpportunities({ error, data }) {
        console.log('Data:', data, 'Error:', error);
        if (data) {
            this.relatedOpportunitiesInfo = data.map(opportunity => {
                return {
                    ...opportunity,
                    EffectiveDateFormatted: this.formatDate(opportunity.EffectiveDate__c)
                };
            });
            this.error = undefined;
            //this.isLoading = false;
            console.log('relatedOpportunitiesInfo', JSON.stringify(this.relatedOpportunitiesInfo));
        } else if (error) {
            this.error = error;
            this.relatedOpportunitiesInfo = undefined;
        }
    }
    @wire(getSecondaryConsultants,
        { membershipActivityId: '$recordId' })
    wiredSecondaryConsultants({ error, data }) {
        if (data) {
            this.secondaryConsultants = data;
            this.error = undefined;
        }
        else if (error) {
            this.error = error;
            this.secondaryConsultants = undefined;
        }

    }

    get isCDRecordType() {
        return this.recordType === 'CD Membership Activity (Prospect or Aggregator)';
    }
    get isCMRecordType() {
        return this.recordType === 'CM Membership Activity (Existing Client)';
    }
    handleChange(event) {
        let name = event.currentTarget.name;
        let value;
        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } /*else if (event.target.name === 'referencelist') {
            value = event.detail.value || [];
            this.selectedValues = [...value];
        }*/
        else {
            value = event.target.value;
        }
        this.strategyMemo = {
            ...this.strategyMemo,
            [name]: value
        };
        console.log(`Updated Field: ${name}, Value: ${value}`);
    }
    handleTimelineChange(event) {
        const { fieldName, fieldValue } = event.detail;
        console.log('this.strategyMemo', JSON.stringify(this.strategyMemo));
        this.strategyMemo = {
            ...this.strategyMemo,
            [fieldName]: fieldValue
        };
    }
    handleStrategyMemoChange(event) {
        const { fieldName, fieldValue, value } = event.detail;
        console.log('Before update - strategyMemo:', JSON.stringify(this.strategyMemo));

        /* if (fieldName === 'AMT_Names_Requested__c') {
             this.strategyMemo = {
                 ...this.strategyMemo,
                 AMT_Names_Requested__c: (value || []).join(';')
             };
         } else {
             this.strategyMemo = {
                 ...this.strategyMemo,
                 [fieldName]: fieldValue
             };
         }*/
        this.strategyMemo = {
            ...this.strategyMemo,
            [fieldName]: fieldValue
        };
        /*if (fieldName === 'Disruption_Analysis__c') {
        this.checkedDisruption = fieldValue; // Track for UI logic
    }*/


        console.log('After update - strategyMemo:', JSON.stringify(this.strategyMemo));
    }

    handleClickEdit() {
        refreshApex(this.memoWireResult);
        const amtValue = this._strategyMemo?.AMT_Names_Requested__c;
        if (typeof amtValue === 'string') {
            this.selectedCheckboxesArray = amtValue.split(';');
        } else if (Array.isArray(amtValue)) {
            this.selectedCheckboxesArray = amtValue;
        } else {
            this.selectedCheckboxesArray = [];
        }
        this.isEditMode = true;

    }
    handleCancel() {
        this.isEditMode = false;
        //refreshApex(this.wiredData);
        // this.selectedValues = this.originalData.referencelist || [];
        const amtValue = this._strategyMemo?.AMT_Names_Requested__c;
        if (typeof amtValue === 'string') {
            this.selectedCheckboxesArray = amtValue.split(';');
        } else if (Array.isArray(amtValue)) {
            this.selectedCheckboxesArray = amtValue;
        } else {
            this.selectedCheckboxesArray = [];
        }

        this.strategyMemo = { ...this.originalData };

    }

    /*@wire(getStrategyMemo, { membershipActivityId: '$recordId' })
    wiredMemo(result) {
        this.memoWireResult = result;
        if (result.data) {
            this.strategyMemo = result.data;
            this.originalData = { ...this.strategyMemo };
            if (this.strategyMemo.AMT_Names_Requested__c) {
                this.selectedCheckboxesArray = this.strategyMemo.AMT_Names_Requested__c.split(';');
            }

        } else if (result.error) {
            console.error('Error fetching Strategy Memo:', result.error);
        }
        this.memoLoaded = true;
        this.checkIfAllLoaded();
    }*/

    handleSave() {
        this.isLoading = true;
        console.log('Final Data Before Save:', JSON.stringify(this.strategyMemo));
        console.log('Business_Pressures__c', this.businessPressures);
        this.strategyMemo = {
            ...this.strategyMemo,
            Strategy_Call_Date__c: this.strategyCallDat,
            Salesforce_Opportunity_ID__c: this.oppId,
            Proposal_Date_Due__c: this.proposalDueDate,
            Proposal_Date_Received__c: this.proposalDateReceived,
            Headquarters_City__c: this.billingCity,
            Annual_Revenue__c: this.annualRevenue,
            Health_Plan_Manager_Industry__c: this.healthPlan,
            Primary_Situs_State__c: this.primarySitusState,
            Employees_in_the_Proposal_Medical__c: this.enrolledEmployeesProposal,
            Members_in_the_Proposal_Medical__c: this.membersInProposal,
            EEs_Retirees_in_the_Proposal_Medical__c: this.eligibleEesAndRetirees,
            Address__c: this.billingAddress,
            Website_URL__c: this.webAddress,
            Consultant_Firm_Loc__c: this.corporateMailingCity,
            RFP_Primary_Consultant_s__c: this.consultantName,
            Consultant_Address__c: this.corporateMailingAddress,
            Phone_Number__c: this.primaryConsultantPhone,
            Consultant_Email__c: this.primaryConsultantEmail,
            Sales_Vice_President_CD__c: this.ownerName,
            Coveted_Account_SVP__c: this.covetedAccount,
            Surest_SVP__c: this.surestSvpInvolved,
            Specialty_SVP__c: this.specialityBenefits,
            Financial_Strategy_Lead__c: this.financialStrategyLead,
            SCE_Assignment_Traditional__c: this.sceAssignment,
            Executive_Sponsor__c: this.executiveSponsor,
            Deal_Sponsor__c: this.dealSponsor,
            Finalist_Date__c: this.finalistDate,
            Anticipated_Actual_Close_Date__c: this.anticipatedActualCloseDate,
            Effective_Date__c: this.effectiveDate,
            Is_the_Client_in_the_Cannabis_Business__c: this.isClientCannabisBusiness === 'Yes',
            Eligible_for_second_Blues_bid__c: this.eligible === 'Yes',
            Bidding_Blue_Plans__c: this.bluesBidComments,
            Business_Overview__c: this.businessOverview,
            Business_Pressures__c: this.businessPressures,
            Potential_Compelling_Event__c: this.potentialCompelling,
            Unique_Business_Value__c: this.uniqueBusinessValues,
            Key_Risks_to_our_UBV__c: this.keyRisks,
            Outcome_Drivers__c: this.outcomeDrivers,
            Approach_Strategy__c: this.approachStrategy,
            Surest_Last_Action_Taken__c: this.lastAction,
            Surest_Next_Action_to_be_Taken__c: this.nextAction,
            Surest_Approach_strategy__c: this.surestApproachStrategy,
            Surest_Netwok__c: this.surestNetworkConstraints,
            Network_Contracting_Issue_Other__c: this.networkContracting,
            Surest_Comments__c: this.surestComments,
            Aggregator_involved_in_the_opportunity__c: this.aggregatorInvolved,
            CVG_Association__c: this.cvgAccount,
            Private_Equity_Relationship__c: this.privateEquity,
            Notes_Taken_on_call_with_Consultant__c: this.notesTaken,
            Acs__c: this.averageContractSize,
            Vs_Aetna__c: this.vsAetna,
            Vs_Anthem__c: this.vsAnthem,
            Vs_Cigna__c: this.vsCigna,
            Vs_Blues__c: this.vsBlues,
            Vs_Blues_Alt__c: this.vsBluesAlt,
            Account_Name__c: this.accountName,
            Record_Type__c: this.recordType,
            Bid_Strategy__c: this.bidStrategy,
            E_Ship_Date__c: this.proposalDueDate,
            //Reference_Attributes__c: (this.selectedValues || []).join(';'),
            AMT_Names_Requested__c: this.strategyMemo.AMT_Names_Requested__c,
        };

        console.log('Before Save, strategyMemo:', JSON.stringify(this.strategyMemo));
        saveStrategyMemo({
            memoData: this.strategyMemo,
            maRecordId: this.recordId,
            //selectedValues: this.selectedCheckboxes
        })
            .then(() => {
                //if(!this.isprintclick)
                this.showToast('Success', 'Strategy Memo Saved successfully', 'success');
                this.isEditMode = false;
                /*if (this.isprintclick) {
                    this.handleclickPrint2();
                    this.isprintclick = false;
                }*/
                return refreshApex(this.memoWireResult);
            })
            .then((result) => {
                if (result && result.data) {
                    this.strategyMemo = { ...result.data };
                    this.originalData = { ...result.data };
                    
                }
            })
            .catch(error => {
                console.error('Error saving Strategy Memo:', error);
                this.showToast('Error', 'Failed to save Strategy Memo', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    checkIfAllLoaded() {
        if (this.memoLoaded && this.strategyInfoLoaded) {
            this.isLoading = false;
        }
    }
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
    formatDate(inputDate) {
        if (!inputDate) return '';
        const date = new Date(inputDate);
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();

        return `${month}/${day}/${year}`;
    }
    convertToPlain(richText) {
        if (!richText) return '';

        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = richText;

        let plainText = tempDiv.textContent || tempDiv.innerText || "";

        plainText = plainText.replace(/\n\s*\n/g, '\n');
        plainText = plainText.replace(/\s\s+/g, ' ').trim();

        return plainText;
    }

   /* handleClickPrint() {
        this.isprintclick = true;
         if(this.strategyInfo.stageMedical !== 'Notified'){
            this.handleSave();
        }
        if(this.strategyInfo.stageMedical == 'Notified'){
            this.isprintclick = false;
            this.handleclickPrint2();
        }
    }*/
    handleClickPrint(){
        getStrategyInformation({
            membershipActivityId: this.recordId
        })
            .then(result => {
                let strategyInfo = result;
                console.log('result', result);
                console.log('strategyInfo.Opportunity', strategyInfo.Opportunity)
                //let relatedOpportunitiesInfo = strategyInfo.getRelatedOpportunities();
                let objectItagesMap = result.objectItags;
                console.log('objectItagesMap', objectItagesMap);
                let modxmlString = result.xmlString;
                console.log('modxmlString', modxmlString);
                for (let objectName in objectItagesMap) {
                    if (objectItagesMap.hasOwnProperty(objectName)) {
                        let keys = objectItagesMap[objectName];
                        console.log('keys++', keys)
                        console.log('objectName', objectName);
                        if (objectName === 'Strategy_Memo__c') {
                            for (let key of keys) {
                                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                let value = this.strategyMemo[key];
                                let dateFieldsToFormat = ['Intent_to_Bid_Due__c', 'Q_A_Responses_Due_Back__c', 'Implementation_Kick_Off_Date__c',
                                    'Questions_to_Consultant_Due__c', 'Bidder_s_Conference_Call_Date__c', 'NAC_Deliverables_Due_to_CD_Dir__c', 'All_Optum_Pricing_Due_to_NPS_and_Sales__c',
                                    'Executive_Summary_Cover_Letter_Due__c', 'E_Ship_Date__c', 'Strategy_Call_Date__c', 'Proposal_Date_Received__c', 'Proposal_Date_Due__c', 'Finalist_Date__c',
                                    'Anticipated_Actual_Close_Date__c', 'Effective_Date__c'];
                                if (dateFieldsToFormat.includes(key) && value) {
                                    if(key=='Effective_Date__c'){
                                    let datalist = value.split('-');
                                    // var offset = new Date().getTimezoneOffset();
                                    // //value = new Date(new Date(value).setUTCMinutes(offset));
                                    // let date = new Date(new Date(value).setUTCMinutes(offset));
                                    // let mm = date.getMonth() + 1;
                                    // let dd = date.getDate();
                                    // let yyyy = date.getFullYear();
                                    if(datalist.length>2)
                                    value = `${parseInt(datalist[1])}/${parseInt(datalist[2])}/${datalist[0]}`;
                                    }else{
                                    var offset = new Date().getTimezoneOffset();
                                    //value = new Date(new Date(value).setUTCMinutes(offset));
                                    let date = new Date(new Date(value).setUTCMinutes(offset));
                                    let mm = date.getMonth() + 1;
                                    let dd = date.getDate();
                                    let yyyy = date.getFullYear();
                                    let datalist = value.split('-');
                                    if(datalist.length>2)
                                    value = `${mm}/${dd}/${yyyy}`;
                                    }
                                
                                }
                                if (value && (key === 'AMT_Names_Requested__c' || key === 'Call_Site__c' || key === 'Claim__c')) {
                                    value = value.split(';').map(part => part.trim()).join('; ');
                                }

                                if (typeof value === 'boolean') {
                                    value = value ? 'Yes' : 'No';
                                }
                                const richTextFields = ['Discussion_Points__c', 'Special_Notes_RFP__c', 'Notes_Taken_During_Call__c',
                                    'Business_Overview__c', 'Business_Pressures__c', 'Potential_Compelling_Event__c', 'Key_Risks_to_our_UBV__c',
                                    'Unique_Business_Value__c', 'Outcome_Drivers__c', 'Approach_Strategy__c', 'Surest_Approach_strategy__c', 'Notes_Taken_on_call_with_Consultant__c',
                                    'Surest_Comments__c'];
                                if (richTextFields.includes(key)) {
                                    value = this.convertToPlain(value);
                                }
                                if (typeof value === 'string' && (key === 'Call_Site__c' || key === 'Claim__c')) {
                                    value = value.replace(/GreenBayDuluthMinnetonka/g, 'GreenBay/Duluth/Minnetonka');
                                    value = value.replace(/SanAntonioSugarLand/g, 'SanAntonio/SugarLand');
                                    value = value.replace(/GreensboroRaleigh/g, 'Greensboro/Raleigh')
                                }
                                // if (['Vs_Aetna__c', 'Vs_Anthem__c', 'Vs_Blues__c', 'Vs_Cigna__c', 'Vs_Blues_Alt__c'].includes(key) && value) {
                                //     value = `${value}%`;

                                // }
                                if (['Vs_Aetna__c', 'Vs_Anthem__c', 'Vs_Blues__c', 'Vs_Cigna__c', 'Vs_Blues_Alt__c'].includes(key) &&
                                    value !== null &&
                                    value !== undefined &&
                                    value !== '' &&
                                    !isNaN(value)) {
                                    value = `${Number(value)}%`;
                                }
                                if (['Annual_Revenue__c'].includes(key) && value) {
                                    //value = `${value}%`;
                                    value = `$${value}`;

                                }

                                if (value !== '') {
                                    modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                                } else {
                                    modxmlString = modxmlString.split(replaceItagName).join('');
                                }
                            }
                        }
                        else if (objectName === 'Opportunity') {
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
                            modxmlString = this.returnChildData(rowToReccurse, TableToReccurse, this.relatedOpportunitiesInfo, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);
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
                        else if (objectName === 'OpportunityContactRole') {
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
                            modxmlString = this.returnSecondaryConsultants(rowToReccurse, TableToReccurse, this.secondaryConsultants, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);

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
                            modxmlString = this.returnChildDataLineItemsOther(rowToReccurse, TableToReccurse, this.otherProductsData, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);

                        }
                        else if (objectName === 'MA_Competitor__c') {
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
                            modxmlString = this.returnChildDataLineItemsCompetitor(rowToReccurse, TableToReccurse, this.competitorData, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);
                        }

                    }
                }
                let a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([modxmlString]));
                let templateName = 'Strategy Memo - ' + (strategyInfo.accountName || 'Default');
                a.download = templateName + '.doc';
                document.body.appendChild(a);
                a.click();

                const evnt = new CustomEvent('loaded', {
                    detail: this.loaded
                });
                this.dispatchEvent(evnt);
            })
            .catch(error => {
                console.error('Error fetching strategy information: ', error);
                alert('An error occurred while fetching strategy information: ' + (error.body.message || 'Unknown error'));
            });
    }
    returnChildDataLineItemsCompetitor(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%MA_Competitor__c.Competitor_Account__r.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%MA_Competitor__c.Comments__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;
        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        function appendPercentageIfNeeded(key, value) {
            const percentFields = ['of_Members_Held__c', 'of_Members_Awarded__c'];
            if (percentFields.includes(key) && value != null) {
                return value + '%';
            }
            return value;
        }
        function numberFormat(key, value) {
            const numberFields = ['Number_of_Members_Held__c', 'Number_of_Members_Awarded__c'];
            if (numberFields.includes(key) && value != null) {
                const formattedValue = new Intl.NumberFormat('en-US').format(value);
                return formattedValue;
            }
            return value;
        }


        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                const numberFields = ['Number_of_Members_Held__c', 'Number_of_Members_Awarded__c'];
                if (key == 'Competitor_Account__r.Name') {
                    let value = strategyList[j].Competitor_Account__r.Name;
                    if (value) {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                else if (numberFields.includes(key)) {
                    let value = strategyList[j][key];
                    if (value != null) {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(numberFormat(key, value)));
                    } else {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                    }

                }

                else {
                    let value = strategyList[j][key];
                    if (value != null) {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(appendPercentageIfNeeded(key, value)));
                    } else {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                    }
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
    returnSecondaryConsultants(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%OpportunityContactRole.Contact.FirstName@@');
        let endStartegyIndex = eachRow.indexOf('%%OpportunityContactRole.Contact.LastName@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;
        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);



        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (key == 'Contact.FirstName') {
                    if (strategyList[j].Contact.FirstName !== null && strategyList[j].Contact.FirstName !== '' && strategyList[j].Contact.FirstName !== undefined) {
                        let value = strategyList[j].Contact.FirstName;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                if (key == 'Contact.LastName') {
                    if (strategyList[j].Contact.LastName !== null && strategyList[j].Contact.LastName !== '' && strategyList[j].Contact.LastName !== undefined) {
                        let value = strategyList[j].Contact.LastName;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                if (key == 'Contact.MailingCity') {
                    if (strategyList[j].Contact.MailingCity !== null && strategyList[j].Contact.MailingCity !== '' && strategyList[j].Contact.MailingCity !== undefined) {
                        let value = strategyList[j].Contact.MailingCity;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                if (key == 'Contact.Account.Name') {
                    if (
                        strategyList[j].Contact.Account &&
                        strategyList[j].Contact.Account.Name !== null &&
                        strategyList[j].Contact.Account.Name !== '' &&
                        strategyList[j].Contact.Account.Name !== undefined
                    ) {
                        let value = strategyList[j].Contact.Account.Name;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
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
            if (percentFields.includes(key) && value != null) {
                return '$' + value;
            }
            return value;
        }
        /*function numberFormatProducts(key, value) {
            const numberFieldsProducts = [
                'Existing_Members_Involved_in_the_Bid__c',
                'Estimated_Additional_New_Members__c',
                'Estimated_Members_Existing_New__c',
                'Product_Conversion__c',
                'Existing_Membership_at_Risk__c',
                'Net_Results__c'
            ];
            if (numberFieldsProducts.includes(key) && value != null) {
                const formattedValue = new Intl.NumberFormat('en-US').format(value);
                return formattedValue;
            }
            return value;
        }
         function appendPercentageIfNeeded(key, value) {
            const percentFields = ['of_Members_Held__c', 'of_Members_Awarded__c'];
            if (percentFields.includes(key) && value != null) {
                return value + '%';
            }
            return value;
        }*/
        function numberFormat(key, value) {
            const numberFields = ['Existing_Members_Involved_in_the_Bid__c',
                'Estimated_Additional_New_Members__c', 'Members_Quoted_in_the_Proposal__c', 'Mbrs_Transferred_From_To_Another_Segment__c',
                'Estimated_Members_Existing_New__c',
                'Product_Conversion__c',
                'Existing_Membership_at_Risk__c',
                'Net_Results__c'];
            if (numberFields.includes(key) && value != null) {
                const formattedValue = new Intl.NumberFormat('en-US').format(value);
                return formattedValue;
            }
            return value;
        }


        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                const numberFields = [
                    'Existing_Members_Involved_in_the_Bid__c',
                    'Estimated_Additional_New_Members__c', 'Members_Quoted_in_the_Proposal__c', 'Mbrs_Transferred_From_To_Another_Segment__c',
                    'Estimated_Members_Existing_New__c',
                    'Product_Conversion__c',
                    'Existing_Membership_at_Risk__c',
                    'Net_Results__c'
                ];
                if (key == 'Product2.Name') {
                    if (strategyList[j].Product2.Name !== null && strategyList[j].Product2.Name !== '' && strategyList[j].Product2.Name !== undefined) {
                        let value = strategyList[j].Product2.Name;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                /*else if (numberFieldsProducts.includes(key)) {
                    let value = strategyList[j][key];
                    if (value != null) {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(numberFormatProducts(key, value)));
                    } else {
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                    }

                }*/
                /*else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(numberFormat(key, value)));
                }*/

                /*else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(appendDollarIfNeeded(key, value)));
                }*/
                else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];

                    if (key === 'Annual_Revenue_Premium__c') {
                        value = appendDollarIfNeeded(key, value);
                    } else {
                        value = numberFormat(key, value);
                    }

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
            if (percentFields.includes(key) && value != null) {
                return '$' + value;
            }
            return value;
        }
        function numberFormat(key, value) {
            const numberFields = ['Existing_Members_Involved_in_the_Bid__c',
                'Estimated_Additional_New_Members__c', 'Members_Quoted_in_the_Proposal__c', 'Mbrs_Transferred_From_To_Another_Segment__c',
                'Estimated_Members_Existing_New__c',
                'Product_Conversion__c',
                'Existing_Membership_at_Risk__c',
                'Net_Results__c'];
            if (numberFields.includes(key) && value != null) {
                const formattedValue = new Intl.NumberFormat('en-US').format(value);
                return formattedValue;
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
                /*else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(numberFormat(key, value)));
                }*/

                /* else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                     let value = strategyList[j][key];
                     eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(appendDollarIfNeeded(key, value)));
                 }*/
                else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];

                    if (key === 'Annual_Revenue_Premium__c') {
                        value = appendDollarIfNeeded(key, value);
                    } else {
                        value = numberFormat(key, value);
                    }

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
        console.log('this.competitorData++', this.competitorData);
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%Opportunity.Name@@');
        let endStartegyIndex = eachRow.indexOf('%%Opportunity.Product_Type_Involved_in_Opp__c@@');
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
}