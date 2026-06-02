public class OLI_CPWHandler {
    public static void syncCPWFields(Set<Id> oppIds, map<id,OpportunityLineItem> oldOLIMap) {
        
       
        
        
        Map<String, CPW_Product_Checklist_Metadata__mdt> cpwMap = new Map<String, CPW_Product_Checklist_Metadata__mdt>();
        
        for (CPW_Product_Checklist_Metadata__mdt record : [
            SELECT Product_Code__c, Field_API_Name__c, Label__c, Is_Dual__c, Yes_No_Only__c, Display_Order__c, IsActive__c
            FROM CPW_Product_Checklist_Metadata__mdt 
        ]) {
            if (record.Product_Code__c != null) {
                cpwMap.put(record.Product_Code__c, record);
            }
        }
        
        // Query OLIs for these opps where product exists in metadata
        Map<Id, List<OpportunityLineItem>> oppToOliMap = new Map<Id, List<OpportunityLineItem>>();
        for (OpportunityLineItem oli : [
            SELECT Id, OpportunityId, Disposition_Other_Buy_Up_Programs__c, Product_Line__c,Sales_Stage__c ,
            Buyup_Product_Selection__c, Product2.ProductCode
            FROM OpportunityLineItem
            WHERE OpportunityId IN :oppIds
            AND Product2.ProductCode IN :cpwMap.keySet()
        ]) {
            System.debug('>>>OliMap: ' + oli);
            if (!oppToOliMap.containsKey(oli.OpportunityId)) {
                oppToOliMap.put(oli.OpportunityId, new List<OpportunityLineItem>());
            }
            oppToOliMap.get(oli.OpportunityId).add(oli);
        }
        
        // Query SCC/PCC records for these opps
        Map<Id, Sold_Case_Checklist__c> oppToSCC = new Map<Id, Sold_Case_Checklist__c>();
        
        for (Sold_Case_Checklist__c scc : [SELECT Id, Membership_Activity__c FROM Sold_Case_Checklist__c WHERE Membership_Activity__c IN :oppIds]) {
            oppToSCC.put(scc.Membership_Activity__c, scc);
        }
        
        Set<Id> acctIds = new Set<Id>();
        Map<Id, Id> oppToAccountMap = new Map<Id, Id>();
        
        for (Opportunity opp : [SELECT Id, AccountId FROM Opportunity WHERE Id IN :oppIds]) {
            if (opp.AccountId != null){   
                acctIds.add(opp.AccountId);
                oppToAccountMap.put(opp.Id, opp.AccountId);
            }
        }
        
        Map<Id, List<Renewal_Checklist__c>> acctToPccMap = new Map<Id, List<Renewal_Checklist__c>>();
        for (Renewal_Checklist__c pcc : [
            SELECT Id, Company__c
            FROM Renewal_Checklist__c
            WHERE Company__c IN :acctIds
        ]) {
            if (!acctToPccMap.containsKey(pcc.Company__c)) {
                acctToPccMap.put(pcc.Company__c, new List<Renewal_Checklist__c>());
            }
            acctToPccMap.get(pcc.Company__c).add(pcc);
        }
        
        System.debug('>>> acctToPccMap: ' + acctToPccMap);
        
        List<Sold_Case_Checklist__c> sccToUpdate = new List<Sold_Case_Checklist__c>();
        List<Renewal_Checklist__c> pccToUpdate = new List<Renewal_Checklist__c>();
        
        //  Evaluate OLI dispositions against metadata mapping
        for (Id oppId : oppToOliMap.keySet()) {
            System.debug('>>> Processing Opp: ' + oppId);
            Sold_Case_Checklist__c scc = oppToSCC.get(oppId);
            Id acctId = oppToAccountMap.get(oppId);
            List<Renewal_Checklist__c> pcc = acctToPccMap.get(acctId);
            
            if (scc == null && (pcc == null || pcc.isEmpty())) continue;
            
            Map<String, String> fieldUpdates = new Map<String, String>();
            
            for (OpportunityLineItem oli : oppToOliMap.get(oppId)) {
                
                    CPW_Product_Checklist_Metadata__mdt md = cpwMap.get(oli.Product2.ProductCode);
                    if (md == null) continue;
                    
                    Boolean isSold = new List<String>{'Sold','Transfer In','Spin-Off'}
                    .contains(oli.Disposition_Other_Buy_Up_Programs__c);
                    Boolean isSurest = new List<String>{'Surest Only','Surest & UNET'}
                    .contains(oli.Buyup_Product_Selection__c);
                    
                    if (oli.Product2.ProductCode == 'TWS-REALAPL' && (oli.Sales_Stage__c == 'Sold' || oli.Sales_Stage__c == 'Transfer In' || oli.Sales_Stage__c == 'Spin-Off')) {
                        isSurest = true;
                        isSold = true;
                    }
                    
                    String value = (isSold && isSurest) ? 'Yes - Sold' : null;
                if(oldOLIMap!=null){
                    if(oldOLIMap.get(oli.id)!=null){
                         if(oli.Product_Line__c=='Other'  && oli.Disposition_Other_Buy_Up_Programs__c!=oldOLIMap.get(oli.id).Disposition_Other_Buy_Up_Programs__c ){
                            fieldUpdates.put(md.Field_API_Name__c, value);
                            System.debug('>>> Final value for ' + md.Field_API_Name__c + ' = ' + value);
                        }
                        if(oli.Product2.ProductCode == 'TWS-REALAPL'  && oli.Sales_Stage__c!=oldOLIMap.get(oli.id).Sales_Stage__c){  
                            fieldUpdates.put(md.Field_API_Name__c, value);
                            System.debug('>>> Final value for ' + md.Field_API_Name__c + ' = ' + value);
                        }
                   }
                }else if(oldOLIMap==null){
                    fieldUpdates.put(md.Field_API_Name__c, value);
                }
            }
            
            // Apply updates to SCC and PCC dynamically
            if (!fieldUpdates.isEmpty()) {
                if (scc != null) {
                    Sold_Case_Checklist__c sccUpdate = new Sold_Case_Checklist__c(Id = scc.Id);
                    for (String fieldName : fieldUpdates.keySet()) {
                        sccUpdate.put(fieldName, fieldUpdates.get(fieldName));
                    }
                    sccToUpdate.add(sccUpdate);
                }
                if (pcc != null) {
                    for (Renewal_Checklist__c p : pcc) {
                        Renewal_Checklist__c pccUpdate = new Renewal_Checklist__c(Id = p.Id);
                        for (String fieldName : fieldUpdates.keySet()) {
                            pccUpdate.put(fieldName, fieldUpdates.get(fieldName));
                        }
                        pccToUpdate.add(pccUpdate);
                    }
                }
            }
        }
        System.debug('>>> SCC Updates: ' + sccToUpdate);
        System.debug('>>> PCC Updates: ' + pccToUpdate);
        
        if (!sccToUpdate.isEmpty()) update sccToUpdate;
        if (!pccToUpdate.isEmpty()) update pccToUpdate;
    }
}