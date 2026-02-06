public with Sharing class RenewalChecklistPdfController {
    public renewalChecklistCls.returnRenewalChecklistPoc vfPrintData{get;set;}
    public Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyDataMed{get;set;}
    public Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyDataSurest{get;set;}
    public String accountName{get;set;}
    public String formatedDate{get;set;}
    public String HighPerformingAdditional{get;set;}
    public Decimal totalCurrentUHCMembers{get;set;}
    public Decimal totalSurestMembers{get;set;}  //CR-3826 Vignesh
    public Boolean isLegacy{get;set;}
    public Boolean isSimplified{get;set;}
    public Boolean isSimplified1NonStandard{get;set;}
    public Boolean isLegacySurest{get;set;}
    public Boolean isSimplifiedSurest{get;set;}
    public Boolean isNonStandard{get;set;}
    public Boolean isBHSP1{get;set;}
    public Boolean isBHSP2{get;set;}
    public String BHSPName{get;set;}
    public Boolean showAISurestSec{get;set;}
    public Boolean showCPWSection{get;set;}
    public Boolean isNaviguardSurest{get;set;}
    public String businessLine{get;set;}
    public String CMSCE{get;set;}
    public String VPCRRVP{get;set;}
    public String clientManager{get;set;}
    public String surestCM{get;set;}
    public String surestAP{get;set;}
    public String joinedPolicyNumbers{get;set;}
    public String joinedPolicyNumbersSurest{get;set;}
    public String policyInfoNameSurest{get;set;}
    public String policyInfoNumberSurest{get;set;}
    public String breakableJoinSurestUrl { get; set; }
    public List<FieldDisplayMapping> surestFields { get; set; }

    public RenewalChecklistPdfController(){
        String[] paymentIntegrityoptions = new List<String>{'Legacy Option 1','Legacy Option 2','Legacy Option 3','Legacy Non-Standard'};
        String[] paymentIntegrityoptionsSurest = new List<String>{'Surest Legacy'};
        String recordId = apexpages.currentpage().getparameters().get('recordId');
        String allData = apexpages.currentpage().getparameters().get('showAllData');
        string currentSSeason =apexpages.currentpage().getparameters().get('currentSS');
        surestFields = getSurestFields();

        Account [] accList = [SELECT Id,Name,UHC_Medical_Members__c,Surest_Members__c,Subtype__c,CM_SCE__r.Name,CMVPCRRVP__r.Name FROM Account WHERE Id =:String.escapeSingleQuotes(recordId)];
        accountName = accList[0].Name;
        totalCurrentUHCMembers = accList[0].UHC_Medical_Members__c;
        totalSurestMembers = accList[0].Surest_Members__c; //CR-3826 Vignesh
        if(accList[0].Subtype__c == 'Surest Only'){
            businessLine = 'Surest Only';
        }else{
            if(accList[0].Surest_Members__c>0){
                businessLine = 'Dual';
            }
        }
        if(accList[0].Surest_Members__c>0){
            showAISurestSec = true;
            showCPWSection = true;
        }else {
            showAISurestSec = false;
        }
        CMSCE = accList[0].CM_SCE__r != null ? accList[0].CM_SCE__r.Name : '';
        VPCRRVP = accList[0].CMVPCRRVP__r != null ? accList[0].CMVPCRRVP__r.Name : '';
        vfPrintData = renewalChecklistCls.fetchOppLnItemsData(recordId, Boolean.valueOf(allData),currentSSeason);
        policyDataMed = Medical_Membership_History_PolicyDetail.getAccountMembershipPolicyDetailsOnAppletLoad(recordId);
        policyDataSurest = Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad(recordId);
        formatedDate = System.now().format('M/d/YYYY hh:mm a');
        for(Renewal_Checklist__c rc:vfPrintData.renewalCheckListData){
            if(rc.High_performing_network__c == 'Yes' && rc.High_performing_network_Additional__c != null){
                HighPerformingAdditional = '- '+ rc.High_performing_network_Additional__c;
            }
            else{
                HighPerformingAdditional = '';
            }
            if(rc.Payment_Integrity_Bundles__c != null && rc.Payment_Integrity_Bundles__c != ''){
                isLegacy = paymentIntegrityoptions.contains(rc.Payment_Integrity_Bundles__c) ? true : false;
                isSimplified = !paymentIntegrityoptions.contains(rc.Payment_Integrity_Bundles__c) && rc.Payment_Integrity_Bundles__c != 'Simplified Option 1' &&  rc.Payment_Integrity_Bundles__c != 'Simplified Non-Standard' ? true : false;
                isSimplified1NonStandard = rc.Payment_Integrity_Bundles__c == 'Simplified Option 1' || rc.Payment_Integrity_Bundles__c == 'Simplified Non-Standard';
            }
            if(rc.Payment_Integrity_Bundles_Surest__c != null && rc.Payment_Integrity_Bundles_Surest__c != ''){
                isLegacySurest = paymentIntegrityoptionsSurest.contains(rc.Payment_Integrity_Bundles_Surest__c) ? true : false;
                isSimplifiedSurest = !paymentIntegrityoptionsSurest.contains(rc.Payment_Integrity_Bundles_Surest__c) && rc.Payment_Integrity_Bundles_Surest__c != 'Simplified Non-Standard' ? true : false;
                isNonStandard = rc.Payment_Integrity_Bundles_Surest__c == 'Simplified Non-Standard'  ? true : false;
            }
            system.debug('isLegacySurest = '+isLegacySurest+' isSimplifiedSurest = '+isSimplifiedSurest+' isNonStandard = '+isNonStandard);
        }
        for(OpportunityLineItem op:vfPrintData.detailExistingProductsList){
            if(op.ProductCode=='BH-BHSP1'){
                isBHSP1 = true;
                BHSPName = op.Product2.Name;
            }
            if(op.ProductCode=='BH-BHSP2'){
                isBHSP1 = true;
                isBHSP2 = true;
                BHSPName = op.Product2.Name;
            }
            if((op.ProductCode == 'OON-NAVN' || op.ProductCode == 'OON-NAVP' ||op.ProductCode == 'OON-PKGX') && (op.Buyup_Product_Selection__c == 'Surest & UNET' || op.Buyup_Product_Selection__c == 'Surest Only')){
                isNaviguardSurest = true;
            }
        }
        for(Service_AMT__c amtRec:vfPrintData.serviceAmt){
            if(amtRec.Contact_Role__c == 'Client Manager'){
                clientManager = amtRec.Name;
            }
            if(amtRec.Contact_Role__c == 'Surest Client Manager'){
                surestCM = amtRec.Name;
            }
            if(amtRec.Contact_Role__c == 'Surest Account Partner'){
                surestAP = amtRec.Name;
            }
        }
        List<String> policyNums = new List<String>();
        List<String> policyNames = new List<String>();
        for(Policy_Information__c poliRec:vfPrintData.policyInfoList){
            if (poliRec.Name != null) {
                policyNums.add(poliRec.Name);
            }
            if (poliRec.Policy__c != null) {
                policyNames.add(poliRec.Policy__c);
            }
        }
        policyInfoNumberSurest = String.join(policyNums, '; ');
        policyInfoNameSurest = String.join(policyNames, '; ');

        String originalUrl = vfPrintData.renewalCheckListData[0].Join_Surest_URL__c;
        if (String.isNotBlank(originalUrl)) {
            String wrappedUrl = originalUrl.replaceAll('([/:.?=&])', '$1<wbr/>');
            breakableJoinSurestUrl = '<a href="' + originalUrl + '" style="color:#0563c1;text-decoration:underline;" target="_blank">' + wrappedUrl + '</a>';
        } else {
            breakableJoinSurestUrl = '';
        }

    List<Medical_Membership_History_PolicyDetail.PolicyDetails> policyList = policyDataMed != null ? policyDataMed.policyList : new List<Medical_Membership_History_PolicyDetail.PolicyDetails>();
    List<Medical_Membership_History_Policy_Surest.PolicyDetails> policyListSurest = policyDataSurest != null ? policyDataSurest.policyList : new List<Medical_Membership_History_Policy_Surest.PolicyDetails>();
    String[] policyNumbers = new List<String>();
    String[] policyNumbersSurest = new List<String>();
    if (policyList != null && !policyList.isEmpty()) {
        for (Medical_Membership_History_PolicyDetail.PolicyDetails policy : policyList) {
            system.debug('policy.policyNumber>> = '+policy.policyNumber);
            if (String.isNotBlank(policy.policyNumber)) {
                policyNumbers.add(policy.policyNumber);
            }
        }
    }
    joinedPolicyNumbers = String.join(policyNumbers, '; ');

    if (policyListSurest != null && !policyListSurest.isEmpty()) {
        for (Medical_Membership_History_Policy_Surest.PolicyDetails policy : policyListSurest) {
            if (String.isNotBlank(policy.policyNumber)) {
                policyNumbersSurest.add(policy.policyNumber);
            }
        }
    }
    joinedPolicyNumbersSurest = String.join(policyNumbersSurest, '; ');
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
        
        for (CPW_Product_Checklist_Metadata__mdt m : metadataList) {
            
            Object existingVal = null;
            if (vfPrintData != null && !vfPrintData.renewalCheckListData.isEmpty()) {
                existingVal = vfPrintData.renewalCheckListData[0].get(m.Field_API_Name__c);
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