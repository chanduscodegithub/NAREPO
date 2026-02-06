/**
* @description       : 
* @author            : Spoorthy
* @group             : 
* @last modified on  : 01-02-2025
* @last modified by  : Spoorthy
**/
public class SoldCaseCheckListPrintCtrl {
    
    public Map<String, List<OpportunityLineItem>> productFamilyVsLineItems{get;set;}
    public Map<String, List<OpportunityLineItem>> medProductFamilyVsLineItems{get;set;}
    public List<String> productFamilies{get;set;}
    public List<String> onnProductFamilies{get;set;}
    public List<OpportunityLineItem> medicalNecessityLst{get;set;}
    public List<OpportunityLineItem> paymentIntegrityLst{get;set;}
    public SoldChecklistHandler.oppwrapperclass soldCaseDetails{get;set;}
    public  List<Policy_Information__c> policyList{get;set;}
    public Boolean isFinancialAccountSold{get;set;}
    public Boolean isBehavioralHealthSold{get;set;}
    public Boolean isCriticalIllnesSold{get;set;}
    public Boolean paymentOption1{get;set;}
    public Boolean paymentOption2{get;set;}
    public Boolean paymentOption3{get;set;}
    public Boolean paymentOption4{get;set;}
    public Boolean paymentOptionOnly1{get;set;}
    public Boolean paymentOptionOnly1NB{get;set;}
    public Boolean surestPaymentOption123{get;set;}
    public Boolean surestPaymentOption4{get;set;}
    public Boolean surestPaymentOptionNS{get;set;}
    public Boolean isNaviguardSurestSold{get;set;}
    
    public Boolean showPhsBuyUpSection{get;set;}
    public Boolean isHeartFailurePresent{get;set;}
    public Boolean isAsthmaPresent{get;set;}
    public Boolean phsIncluded{get;set;}
    public Boolean isDiabetesPresent{get;set;}
    public Boolean isCADPresent{get;set;}
    public Boolean isCOPDPresent{get;set;}
    public Boolean isCancerPresent{get;set;}
    public Boolean isKidSolPresent{get;set;}
    public Boolean isKidResPresent{get;set;}
    public Boolean isHeartFailureSurest{get;set;}
    public Boolean isAsthmaSurest{get;set;}
    public Boolean isDiabetesSurest{get;set;}
    public Boolean isCADSurest{get;set;}
    public Boolean isCOPDSurest{get;set;}
    public Boolean isCancerSurest{get;set;}
    public Boolean isKidSolSurest{get;set;}
    public Boolean isKidResSurest{get;set;}
    public Boolean isHeartFailureTraditional{get;set;}
    public Boolean isAsthmaTraditional{get;set;}
    public Boolean isDiabetesTraditional{get;set;}
    public Boolean isCADTraditional{get;set;}
    public Boolean isCOPDTraditional{get;set;}
    public Boolean isCancerTraditional{get;set;}
    public Boolean isKidSolTraditional{get;set;}
    public Boolean isKidResTraditional{get;set;}
    public Boolean engageSol{get;set;}
    public Boolean wellRallCopy{get;set;}
    public Boolean advocacyCopy{get;set;}
    public Boolean eServicesCopy{get;set;}
    public Boolean showSpecialtyProd{get;set;}
    public Boolean isMedicalSold{get;set;}
    public Boolean isDetanalSold{get;set;}
    public Boolean isPharmacySold{get;set;}
    public Boolean isVisionSold{get;set;}
    public Boolean isOtherSold{get;set;}
    public Boolean dentVisOrBuyupSold{get;set;}
    public Boolean isSurestProductMed{get;set;}
    public Boolean isTraditionalProductMed{get;set;}
    public Boolean isSurestProductPharmacy{get;set;}
    public Boolean isTraditionalProductPharmacy{get;set;}
    public Boolean isTradSoldVision{get;set;}
    public Boolean isSurestSoldVision{get;set;}
    public Boolean isTradSoldDental{get;set;}
    public Boolean isSurestSoldDental{get;set;}
    public Boolean isTradSoldOther{get;set;}
    public Boolean isSurestSoldOther{get;set;}
    public Boolean isSurestProdAll{get;set;}
    public Boolean isTraditionalProdAll{get;set;}
    public Boolean showHistoricDataMedicalOrRx{get;set;}
    public Boolean showMedNecBuyUpSection{get;set;}
    public Boolean showPayIntFields{get;set;}
    public Boolean showInPayIntFields{get;set;}
    public Boolean showCriticalIllnessOrAccidentProd{get;set;}
    public String heartFailureName{get;set;}
    public String asthmaName{get;set;}
    public String diabetesName{get;set;}
    public String cadName{get;set;}
    public String copdName{get;set;}
    public String cancerName{get;set;}
    public String kidSolName{get;set;}
    public String kidResName{get;set;}
    public String recType{get;set;}
    public Boolean isKidSolPresent2{get;set;}
    public Date firstRenewalDate{get;set;}
    public String MedidiscValue{get;set;}
    public Boolean showCPWSection{get;set;}
    public String policyNumbersSurest{get;set;}
    public String policyNamesSurest{get;set;}
    public Boolean otherProductsStatus{get;set;}
    public List<FieldDisplayMapping> surestFields { get; set; }
    //Added By Vignesh - SC Letter
    public SoldCaseLetterWrapper soldCaseLetterWrapper { get; set; }
    public Boolean isPdf{get;private set;}
    public String ContentTypeValue{get;private set;}

    public Double offset{
        get{
            TimeZone tz = UserInfo.getTimeZone();
            //Milliseconds to Day
            return tz.getOffset(DateTime.now()) / (1000 * 3600 * 24.0);
        }
    }    
    public String hqAddress{
        get{
            String address = '';
            
            if(soldCaseDetails.oppdata.Account.BillingStreet != '' && soldCaseDetails.oppdata.Account.BillingStreet != null){
                address += soldCaseDetails.oppdata.Account.BillingStreet+',';
            }
            if(soldCaseDetails.oppdata.Account.BillingCity != '' && soldCaseDetails.oppdata.Account.BillingCity != null){
                address += soldCaseDetails.oppdata.Account.BillingCity+',';
            }
            if(soldCaseDetails.oppdata.Account.BillingStreet != '' && soldCaseDetails.oppdata.Account.BillingStreet != null){
                address += soldCaseDetails.oppdata.Account.BillingState+',';
            }
            if(soldCaseDetails.oppdata.Account.BillingPostalCode != '' && soldCaseDetails.oppdata.Account.BillingPostalCode != null){
                address += soldCaseDetails.oppdata.Account.BillingPostalCode+',';
            }
            if(soldCaseDetails.oppdata.Account.BillingCountry != '' && soldCaseDetails.oppdata.Account.BillingCountry != null){
                address += soldCaseDetails.oppdata.Account.BillingCountry;
            }
            return address;
        }
        set;
    }
    
    
    
    public DateTime todayDate{get;set;}
    
    public SoldCaseCheckListPrintCtrl(){
        String recordId = ApexPages.currentPage().getParameters().get('Id');
        phsIncluded = false;
        productFamilies = new List<String>();
        onnProductFamilies = new List<String>();
        productFamilyVsLineItems =  new Map<String, List<OpportunityLineItem>>();
        medProductFamilyVsLineItems = new Map<String, List<OpportunityLineItem>>();
        medicalNecessityLst    = new List<OpportunityLineItem>();
        paymentIntegrityLst    = new List<OpportunityLineItem> ();
        isFinancialAccountSold = false;
        isHeartFailurePresent  = false;
        showSpecialtyProd 	   = false;
        isBehavioralHealthSold = false;
        showMedNecBuyUpSection = false;
        showPayIntFields       = false;
        showInPayIntFields       = false;
        isOtherSold			   = false;
        isAsthmaPresent		   = false;
        isDiabetesPresent	   = false;
        isCADPresent		   = false;
        isCOPDPresent		   = false;
        isCancerPresent		   = false;
        isKidSolPresent		   = false;
        isKidResPresent		   = false;
        isKidSolPresent2	   = false;
        engageSol			   = false;
        wellRallCopy		   = false;
        advocacyCopy		   = false;
        eServicesCopy		   = false;
        showCriticalIllnessOrAccidentProd = false;
        isNaviguardSurestSold = false;

        Boolean firstDatePresentInScc = false;
        
        onnProductFamilies.add('Out-of-Network Reimbursement Program - PREFERRED PACKAGE');
        onnProductFamilies.add('Out-of-Network Reimbursement Program - LEGACY/NON-PREFERRED PACKAGE');
        
        for(String productFamily : onnProductFamilies){
            productFamilyVsLineItems.put(productFamily, new List<OpportunityLineItem>() );
        }
        
        soldCaseDetails = SoldChecklistHandler.getClientData(recordId);
        todayDate = System.now();
        
        surestFields = getSurestFields();
        
        Opportunity OppDatarec = [SELECT Id,Name,AccountId FROM Opportunity WHERE Id=: string.escapesinglequotes(recordId) WITH USER_MODE];
        policyList = SoldChecklistHandler.getAccountPolicyInfoSurest(OppDatarec.AccountId);
        List<String> policyNumbers = new List<String>();
        List<String> policyNames = new List<String>();
        for (Policy_Information__c rec : policyList) {
            if (rec.Name != null) {
                policyNumbers.add(rec.Name);
            }
            if (rec.Policy__c != null) {
                policyNames.add(rec.Policy__c);
            }
        }
        policyNumbersSurest = String.join(policyNumbers, '; ');
        policyNamesSurest = String.join(policyNames, '; ');


        if(soldCaseDetails.sccData.First_Renewal_Date__c != null){
            firstRenewalDate = soldCaseDetails.sccData.First_Renewal_Date__c;
            firstDatePresentInScc = true;
        }
        else if(!firstDatePresentInScc && soldCaseDetails.oppdata.Account.Current_Deal_Next_Renewal_Date__c != null){
            firstRenewalDate = soldCaseDetails.oppdata.Account.Current_Deal_Next_Renewal_Date__c;
        }
        recType =soldCaseDetails.oppdata.BusinessType__c;
        
        if (soldCaseDetails.sccData.Payment_Integrity__c == 'Simplified Option 1' || soldCaseDetails.sccData.Payment_Integrity__c == 'Simplified Option 2' || soldCaseDetails.sccData.Payment_Integrity__c == 'Simplified Option 3' || soldCaseDetails.sccData.Payment_Integrity__c == 'Simplified Non-Standard' || soldCaseDetails.sccData.Payment_Integrity__c == 'Blackstone Equity Health 2025') {
            paymentOption1 = true;
            paymentOption2 = false;
            paymentOption3 = false;
            paymentOption4 = false;
            if(soldCaseDetails.sccData.Payment_Integrity__c == 'Simplified Option 1' || soldCaseDetails.sccData.Payment_Integrity__c == 'Simplified Non-Standard')
                paymentOptionOnly1 =true;
            else
                paymentOptionOnly1 =false;
        }
        if (soldCaseDetails.sccData.Payment_Integrity__c == 'Legacy Option 1' || soldCaseDetails.sccData.Payment_Integrity__c == 'Legacy Option 2' || soldCaseDetails.sccData.Payment_Integrity__c == 'Legacy Option 3' || soldCaseDetails.sccData.Payment_Integrity__c == 'Legacy Non-Standard') {
            paymentOption1 = false;
            paymentOption2 = true;
            paymentOption3 = false;
            paymentOption4 = false;
            if(recType =='Client Development'){
                if(soldCaseDetails.sccData.Payment_Integrity__c == 'Legacy Non-Standard'){
                    paymentOptionOnly1NB =true;
                }else{
                    paymentOptionOnly1NB =false;
                }
            }
            
             if(recType =='Client Management'){
                paymentOptionOnly1NB =true;
            }
        }
        if (soldCaseDetails.sccData.Payment_Integrity__c == 'Equity Healthcare') {
            paymentOption1 = false;
            paymentOption2 = false;
            paymentOption3 = false;
            paymentOption4 = true;
        }
        if (soldCaseDetails.sccData.Surest_Payment_Integrity__c == 'Simplified Option 1' || soldCaseDetails.sccData.Surest_Payment_Integrity__c == 'Simplified Option 2' || soldCaseDetails.sccData.Surest_Payment_Integrity__c == 'Simplified Option 3' || soldCaseDetails.sccData.Surest_Payment_Integrity__c == 'Simplified Non-Standard') {
            surestPaymentOption123 = true;
            surestPaymentOption4 = false;
            if(soldCaseDetails.sccData.Surest_Payment_Integrity__c == 'Simplified Non-Standard')
                surestPaymentOptionNS =true;
            else
                surestPaymentOptionNS =false;
        }
        if (soldCaseDetails.sccData.Surest_Payment_Integrity__c == 'Surest Legacy') {
            surestPaymentOption123 = false;
            surestPaymentOption4 = true;
        }
        for(OpportunityLineItem objLineItem: soldCaseDetails.otheropplineitems){
            
            if (objLineItem.ProductCode == 'CLN-CMPHS30T2' || objLineItem.ProductCode == 'CLN-CMPHS30T3' || objLineItem.ProductCode == 'CLN-CMPHS30T4') 
            {
                phsIncluded = true;
            }
            
            //Standard Communications
            if (objLineItem.ProductCode == 'COMM-CCES' && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')) {
                engageSol = true;
            }
            
            //Rally Base
            if ((objLineItem.ProductCode == 'CLN-WRE' || objLineItem.ProductCode == 'CLN-WRP') && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')) {
                wellRallCopy = true;
            }
            
            //A4MeCore
            if ((objLineItem.ProductCode == 'CLN-CMA4MEED' || objLineItem.ProductCode == 'CLN-CMA4MEEHD' || objLineItem.ProductCode == 'CLN-CMA4MEPD' ||objLineItem.ProductCode == 'CLN-CMA4MEEA' ||
                 objLineItem.ProductCode == 'CLN-CMA4MEPHD' || objLineItem.ProductCode == 'CLN-CMOHCA') && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')) 
            {       
                advocacyCopy = true;
            }
            
            //eServices Select Reporting
            if(objLineItem.ProductCode =='RPT-ESVCSE' && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                eServicesCopy = true;
            }
            
        }
        if(soldCaseDetails.medilineitem?.size()>0){
            for(OpportunityLineItem objLineItem: soldCaseDetails.medilineitem){
                if(medProductFamilyVsLineItems.get(objLineItem.Product2.Family)== null){
                    medProductFamilyVsLineItems.put(objLineItem.Product2.Family, new List<OpportunityLineItem>());
                }
                medProductFamilyVsLineItems.get(objLineItem.Product2.Family).add(objLineItem);
            }
        }
        for(OpportunityLineItem objLineItem: soldCaseDetails.otheropplineitems){
            if(objLineItem.Product2.Name.Contains('Critical Illness') || objLineItem.Product2.Name.Contains('Accident')){
                showCriticalIllnessOrAccidentProd = true;
            }
            if (objLineItem.Product2.Family == 'Medical Necessity') {
                showMedNecBuyUpSection = true;
                medicalNecessityLst.add(objLineItem);
            }else if (objLineItem.Product2.Family == 'Payment Integrity') {
                Boolean isTraditional = (soldCaseDetails.isTraditionalProductMed == true);
                Boolean isSurest = (soldCaseDetails.isSurestProductMed == true);
                if (!isTraditional && !isSurest) {
                    showPayIntFields = true;
                }
                if (isTraditional || isSurest) {
                    showInPayIntFields = true;
                }
                paymentIntegrityLst.add(objLineItem);
            }else{
                if(!productFamilies.contains(objLineItem.Product2.Family) && !onnProductFamilies.contains(objLineItem.Product2.Family)){
                    productFamilies.add(objLineItem.Product2.Family);
                    productFamilyVsLineItems.put(objLineItem.Product2.Family, new List<OpportunityLineItem>() );
                }
                
                
                productFamilyVsLineItems.get(objLineItem.Product2.Family).add(objLineItem);
                if(!isOtherSold && objLineItem.Disposition_Other_Buy_Up_Programs__c!=null && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isOtherSold = true;
                }
                if(objLineItem.Product2.Family == 'Financial Accounts' && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isFinancialAccountSold = true;
                }else if(objLineItem.Product2.Family == 'Behavioral Health' && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isBehavioralHealthSold = true;
                }else if( (objLineItem.Product2.Name.containsIgnoreCase('Critical Illness') ||  objLineItem.Product2.Name.containsIgnoreCase('Accident')) 
                         && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In'))
                {
                    isCriticalIllnesSold = true;
                } else if (objLineItem.Product2.Family == 'Specialty Products' && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')) {
                    showSpecialtyProd = true;
                }
                
                if((objLineItem.ProductCode == 'OON-PKGX' || objLineItem.ProductCode == 'OON-NAVN' || objLineItem.ProductCode == 'OON-NAVP')
                   && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')
                   && (objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only')){
                    isNaviguardSurestSold = true;
                }
                
                if(objLineItem.ProductCode == 'CLN-DMCHF' && phsIncluded && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isHeartFailurePresent = true;
                    heartFailureName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isHeartFailureSurest = true;
                    }else{
                        isHeartFailureSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isHeartFailureTraditional = true;
                    }else{
                        isHeartFailureTraditional = false;
                    }
                }
                else if(objLineItem.ProductCode == 'CLN-DMA' && phsIncluded && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isAsthmaPresent = true;
                    asthmaName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isAsthmaSurest = true;
                    }else{
                        isAsthmaSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isAsthmaTraditional = true;
                    }else{
                        isAsthmaTraditional = false;
                    }
                }
                else if(objLineItem.ProductCode == 'CLN-DMD' && phsIncluded  && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isDiabetesPresent = true;
                    diabetesName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isDiabetesSurest = true;
                    }else{
                        isDiabetesSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isDiabetesTraditional = true;
                    }else{
                        isDiabetesTraditional = false;
                    }
                }
                else if(objLineItem.ProductCode == 'CLN-DMCAD' && phsIncluded  && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isCADPresent = true;
                    cadName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isCADSurest = true;
                    }else{
                        isCADSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isCADTraditional = true;
                    }else{
                        isCADTraditional = false;
                    }
                }
                else if(objLineItem.ProductCode == 'CLN-DMCOPD' && phsIncluded  && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isCOPDPresent = true;
                    copdName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isCOPDSurest = true;
                    }else{
                        isCOPDSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isCOPDTraditional = true;
                    }else{
                        isCOPDTraditional = false;
                    }
                }
                else if(objLineItem.ProductCode == 'CLN-CCCSP' && phsIncluded  && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isCancerPresent = true;
                    cancerName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isCancerSurest = true;
                    }else{
                        isCancerSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isCancerTraditional = true;
                    }else{
                        isCancerTraditional = false;
                    }
                }
                else if(objLineItem.ProductCode == 'CLN-CCKRS' && phsIncluded  && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')){
                    isKidSolPresent = true;
                    isKidSolPresent2 =true;
                    kidSolName = objLineItem.Product2.Name;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isKidSolSurest = true;
                    }else{
                        isKidSolSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isKidSolTraditional = true;
                    }else{
                        isKidSolTraditional = false;
                    }
                }
                else if (objLineItem.ProductCode == 'CLN-CCCKS' && phsIncluded  && (objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Sold' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || objLineItem.Disposition_Other_Buy_Up_Programs__c == 'Transfer In')) {
                    kidResName = objLineItem.Product2.Name;
                    isKidResPresent = true;
                    isKidSolPresent2 = true;
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'Surest Only'){
                        isKidResSurest = true;
                    }else{
                        isKidResSurest = false;
                    }
                    if(objLineItem.Buyup_Product_Selection__c == 'Surest & UNET' || objLineItem.Buyup_Product_Selection__c == 'UNET or UMR Only'){
                        isKidResTraditional = true;
                    }else{
                        isKidResTraditional = false;
                    }
                }
                
                if(objLineItem.Disposition_Other_Buy_Up_Programs__c != 'Sold' && objLineItem.Disposition_Other_Buy_Up_Programs__c != 'Spin-Off' && objLineItem.Disposition_Other_Buy_Up_Programs__c != 'Transfer In'){
                    objLineItem.Disposition_Other_Buy_Up_Programs__c = 'TBD';
                }
            }
            
        }    
        
        if (isAsthmaPresent == true || isDiabetesPresent == true ||
            isHeartFailurePresent == true || isCADPresent == true ||
            isCOPDPresent == true || isCancerPresent == true ||
            isKidSolPresent == true || isKidResPresent == true) {
                showPhsBuyUpSection = true;
            }
        
        
        for(String productFamily :  productFamilyVsLineItems.keySet()){
            List<OpportunityLineItem> temp = new List<OpportunityLineItem>();
            List<OpportunityLineItem> lineItemsToAdd = new List<OpportunityLineItem>();
            if(productFamilyVsLineItems.get(productFamily).size()>0){
                for(OpportunityLineItem objLineItem: productFamilyVsLineItems.get(productFamily)){
                    if(objLineItem.ProductCode == 'CLN-CMPHS30T2' || objLineItem.ProductCode == 'CLN-CMPHS30T3' || objLineItem.ProductCode== 'CLN-CMPHS30T4'){
                        temp.add(objLineItem);
                        //system.debug('Veera 1'+objLineItem.ProductCode);
                    }else{
                        if(!(isHeartFailurePresent && objLineItem.ProductCode == 'CLN-DMCHF') && 
                           !(objLineItem.ProductCode == 'CLN-DMA' && isAsthmaPresent) && 
                           !(objLineItem.ProductCode == 'CLN-DMD' && isDiabetesPresent) && 
                           !(objLineItem.ProductCode == 'CLN-DMCAD' && isCADPresent) && 
                           !(objLineItem.ProductCode == 'CLN-DMCOPD' && isCOPDPresent) && 
                           !(objLineItem.ProductCode == 'CLN-CCCSP' && isCancerPresent) && 
                           !(objLineItem.ProductCode == 'CLN-CCCKS' && isKidResPresent) && 
                           !(objLineItem.ProductCode == 'CLN-CCKRS' && isKidSolPresent) 
                          ){
                              lineItemsToAdd.add(objLineItem);
                              //system.debug('Veera 2'+objLineItem.ProductCode);
                          }
                        
                    }
                }
                lineItemsToAdd.addAll(temp);
                productFamilyVsLineItems.put(productFamily,lineItemsToAdd);
                
            }
            else{
                if(onnProductFamilies.contains(productFamily)){
                    onnProductFamilies.remove(onnProductFamilies.indexOf(productFamily));
                }else{
                    productFamilies.remove(productFamilies.indexOf(productFamily));
                }
            }
        }
        
        
        isDetanalSold	= (soldCaseDetails.dentallineitem != null && soldCaseDetails.dentallineitem.size() >0 && (soldCaseDetails.oppdata.Disposition_Dental__c == 'Sold'|| soldCaseDetails.oppdata.Disposition_Dental__c == 'Spin-Off' || soldCaseDetails.oppdata.Disposition_Dental__c == 'Transfer In')) ? true :false;
        isPharmacySold  = (soldCaseDetails.pharmacylineitem != null && soldCaseDetails.pharmacylineitem.size() > 0 && (soldCaseDetails.oppdata.Disposition_Pharmacy__c == 'Sold' || soldCaseDetails.oppdata.Disposition_Pharmacy__c == 'Spin-Off' || soldCaseDetails.oppdata.Disposition_Pharmacy__c == 'Transfer In')) ? true: false;
        isVisionSold 	= (soldCaseDetails.visionlineitem != null && soldCaseDetails.visionlineitem.size() >0 && (soldCaseDetails.oppdata.Disposition_Vision__c == 'Sold' || soldCaseDetails.oppdata.Disposition_Vision__c == 'Spin-Off' || soldCaseDetails.oppdata.Disposition_Vision__c == 'Transfer In')) ? true : false;
        isMedicalSold	= soldCaseDetails.medilineitem != null && soldCaseDetails.medilineitem.size() >0 && (soldCaseDetails.oppdata.Disposition_Medical__c == 'Sold' || soldCaseDetails.oppdata.Disposition_Medical__c == 'Spin-Off' || soldCaseDetails.oppdata.Disposition_Medical__c == 'Transfer In') ? true: false;
        showCPWSection = soldCaseDetails.showCPWSection != null ? soldCaseDetails.showCPWSection:false;
        otherProductsStatus = (soldCaseDetails.otherProductsStatus != null && soldCaseDetails.otherProductsStatus == 'Sold' || soldCaseDetails.otherProductsStatus == 'Spin-Off' || soldCaseDetails.otherProductsStatus == 'Transfer In')  ? true : false;
        isSurestProductMed = soldCaseDetails.isSurestProductMed != null ? soldCaseDetails.isSurestProductMed:false;
        isTraditionalProductMed = soldCaseDetails.isTraditionalProductMed != null ? soldCaseDetails.isTraditionalProductMed:false;
        isSurestProductPharmacy = soldCaseDetails.isSurestProductPharmacy != null ? soldCaseDetails.isSurestProductPharmacy:false;
        isTraditionalProductPharmacy = soldCaseDetails.isTraditionalProductPharmacy != null ? soldCaseDetails.isTraditionalProductPharmacy:false;
        isSurestSoldDental = soldCaseDetails.isSurestSoldDental != null ? soldCaseDetails.isSurestSoldDental:false;
        isTradSoldDental = soldCaseDetails.isTradSoldDental != null ? soldCaseDetails.isTradSoldDental:false;
        isSurestSoldVision = soldCaseDetails.isSurestSoldVision != null ? soldCaseDetails.isSurestSoldVision:false;
        isTradSoldVision = soldCaseDetails.isTradSoldVision != null ? soldCaseDetails.isTradSoldVision:false;
        isTradSoldOther = soldCaseDetails.isTradSoldOther != null ? soldCaseDetails.isTradSoldOther:false;
     	isSurestSoldOther = soldCaseDetails.isSurestSoldOther != null ? soldCaseDetails.isSurestSoldOther:false;
        isSurestProdAll = soldCaseDetails.isSurestProdAll != null ? soldCaseDetails.isSurestProdAll:false;
        isTraditionalProdAll = soldCaseDetails.isTraditionalProdAll != null ? soldCaseDetails.isTraditionalProdAll:false;

        dentVisOrBuyupSold = isDetanalSold || isOtherSold || isVisionSold;
        showHistoricDataMedicalOrRx =  (soldCaseDetails.sccData.Historic_Data__c == 'Rx' || soldCaseDetails.sccData.Historic_Data__c == 'Medical' || soldCaseDetails.sccData.Historic_Data__c == 'Both') ? true:false;
        soldCaseDetails.oppdata.Account.UMR_Client_Platform__c  = formatComaSeprated(soldCaseDetails.oppdata.Account.UMR_Client_Platform__c);
        soldCaseDetails.sccData.Implementation_Year_1__c 		= formatComaSeprated(soldCaseDetails.sccData.Implementation_Year_1__c);
        soldCaseDetails.sccData.Surest_Pre_Implementation_Audit_Year_1__c = formatComaSeprated(soldCaseDetails.sccData.Surest_Pre_Implementation_Audit_Year_1__c);
        soldCaseDetails.sccData.Offshore_Provisions_Level_0__c  = formatComaSeprated(soldCaseDetails.sccData.Offshore_Provisions_Level_0__c);
        soldCaseDetails.sccData.Surest_Offshore_Provisions_Level_0__c  = formatComaSeprated(soldCaseDetails.sccData.Surest_Offshore_Provisions_Level_0__c);
        soldCaseDetails.sccData.Pre_Implementation_Audit_Level_2__c = formatComaSeprated(soldCaseDetails.sccData.Pre_Implementation_Audit_Level_2__c);
        soldCaseDetails.sccData.Surest_Pre_Implementation_Audit_Level_2__c = formatComaSeprated(soldCaseDetails.sccData.Surest_Pre_Implementation_Audit_Level_2__c);
        
        
        
        //Added By Vignesh -- SC Letter
        String membershipActivityId = ApexPages.currentPage().getParameters().get('Id');
        
        soldCaseLetterWrapper = getSoldCaseDetails(membershipActivityId);
        map<String,String> UrlParameterMap = ApexPages.currentPage().getParameters();
        for(String str:UrlParameterMap.keySet()){
            if(str =='wordReport'){
                this.isPdf=true;
            }
        }
        
        if(this.isPdf == true){
            this.ContentTypeValue = 'application/msword#';
            this.ContentTypeValue += this.getWordFileName()+'.doc';
        }
    
    }
    
    
    @AuraEnabled(cacheable=true)
    public static SoldCaseLetterWrapper getSoldCaseDetails(String membershipActivityId){
        SoldCaseLetterWrapper soldCaseLetterWrapper = new SoldCaseLetterWrapper();
        Opportunity soldCaseLetterQuery = null;
        try{        
        soldCaseLetterQuery = [SELECT Id,Name,EffectiveDate__c, AccountId, OwnerId, Primary_Consulting_Firm__c,
                               Account.Name, Owner.Name, Primary_Consulting_Firm__r.Name,Product_Type_Involved_in_Opp__c from Opportunity where Id =: membershipActivityId WITH USER_MODE];
        soldCaseLetterWrapper.soldCaseLetterQuery = soldCaseLetterQuery;
        }catch(Exception e){
            System.debug('Exception message - '+e.getMessage());
        }
        return soldCaseLetterWrapper;
    }
    
    
    public class SoldCaseLetterWrapper{
      @AuraEnabled
      public Opportunity soldCaseLetterQuery {get; set;}
      @AuraEnabled 
      public Boolean isVisionLevel2 { get; set; } 
    }
    
    
    
    //Added by Vignesh -- SC Letter
    public String getFormattedDate() {
        Date datetoday = System.today();
        String monthStr = String.valueOf(datetoday.month());
        String dayStr = String.valueOf(datetoday.day());
        String yearStr = String.valueOf(datetoday.year());        
        return monthStr + '/' + dayStr + '/' + yearStr;
    }
    
    public String getFormattedEffectiveDate() {   //Added Vignesh CR - 3925
        Date dt = soldCaseLetterWrapper.soldCaseLetterQuery.EffectiveDate__c;
        Integer month = dt.month();
        Integer day = dt.day();
        Integer year = dt.year();

        return month + '/' + day + '/' + year;
    }
    
    public String getWordFileName() {         
        String sanitizedName = soldCaseLetterWrapper.soldCaseLetterQuery.Name.replaceAll('[\\.,&\\+\\/\\-]', '_');
        date datetoday = System.today();
        String monthStr = String.valueOf(datetoday.month());
        String dayStr = String.valueOf(datetoday.day());
        String yearStr = String.valueOf(datetoday.year());         
        String formattedDate = monthStr + '_' + dayStr + '_' + yearStr + '_';         
        String docName = 'SC Letter_' + sanitizedName;
        return docName;
    }
    
    public String getOtherBuyProductsMA() {
        if (soldCaseLetterWrapper != null && soldCaseLetterWrapper.soldCaseLetterQuery != null 
            && soldCaseLetterWrapper.soldCaseLetterQuery.Product_Type_Involved_in_Opp__c != null) {
         Boolean hasOtherBuyUp = soldCaseLetterWrapper.soldCaseLetterQuery.Product_Type_Involved_in_Opp__c.contains('Other Buy Up Programs');
        return String.valueOf(hasOtherBuyUp);        }
        return '';
    }  
    
    
    
    //End SC Letter
    
    private String formatComaSeprated(String str){
        if(str != null && str != ''){
            return str.replace(';', '; ');
        }else{
            return str;
        }
    }

    public class FieldDisplayMapping {
        public String fieldApiName { get; set; }
        public String fieldLabel { get; set; }
        public Boolean isDual { get; set; }
    
        public FieldDisplayMapping(String api, String label, Boolean dual) {
            this.fieldApiName = api;
            this.fieldLabel = label;
            this.isDual = dual;
        }
    }

    public List<FieldDisplayMapping> getSurestFields() {
        List<FieldDisplayMapping> fields = new List<FieldDisplayMapping>();
    
        List<CPW_Product_Checklist_Metadata__mdt> metadataList = [SELECT MasterLabel, Product_Code__c, Field_API_Name__c, Label__c, Is_Dual__c, Yes_No_Only__c, Display_Order__c,IsActive__c FROM CPW_Product_Checklist_Metadata__mdt ORDER BY Display_Order__c ASC];
        
        Set<String> productCodes = new Set<String>();
        for (CPW_Product_Checklist_Metadata__mdt m : metadataList) {
            if (String.isNotBlank(m.Product_Code__c)) {
                productCodes.add(m.Product_Code__c);
            }
        }

        Map<String, Product2> productMap = new Map<String, Product2>();
        for (Product2 p : [SELECT ProductCode, Surest_Applicable_Products__c FROM Product2 WHERE ProductCode IN :productCodes]) {
            if (String.isNotBlank(p.ProductCode)) {
                productMap.put(p.ProductCode, p);
            }
        }

        system.debug('productMap>>>>>'+productMap);
        
        for (CPW_Product_Checklist_Metadata__mdt m : metadataList) {

            Object existingVal = null;
            if (soldCaseDetails != null && soldCaseDetails.sccData != null) {
                existingVal = soldCaseDetails.sccData.get(m.Field_API_Name__c);
            }

            if (!m.IsActive__c && (existingVal == null || String.valueOf(existingVal).trim() == '')) {
                continue;
            }
            
            Boolean Dual = false;
            if (productMap.containsKey(m.Product_Code__c)) {
                Product2 prod = productMap.get(m.Product_Code__c);
                Dual = (prod.Surest_Applicable_Products__c == 'Available for Surest only with UNET');
            }
    
            fields.add(new FieldDisplayMapping(
                m.Field_API_Name__c,
                m.Label__c,
                Dual
            ));
        }
    
        return fields;
    }

}