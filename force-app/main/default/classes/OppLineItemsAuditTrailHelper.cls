/****************************************************************************************************
Name    :  OppLineItems_Trigger    
Purpose :  Creates Audit trails record for the Sold case checklist when product is added or removed or disposition changes for CD records
Author  :  Jnanesh Avaradi                                 Date : 05/15/2020                                  

Version      Author                   Date                 Release #           Purpose   
------------------------------------------------------------------------------------------------------
1.0 -        Jnanesh Avaradi          05/15/2020      	 052019              Initial Development             
1.1 -        Samarth Nadig            08/05/2020
*****************************************************************************************************/
public class OppLineItemsAuditTrailHelper {
    
    public static void updateSpecialtySalesDebrief(List<OpportunityLineItem> newOppLineList){
        system.debug('Inside OLI Trigger Samarth');
        Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();
        Set<Id> opportunityIdSet = new Set<Id>();
        List<Opportunity> medOppList = new List<Opportunity>();
        Set<Id> specialtyOppIdSet = new Set<Id>();
        List<OpportunityLineItem> specialtyOliList = new List<OpportunityLineItem>();
        Set<Id> eligibleSpecialtyOppId = new Set<Id>();
        
        List<Opportunity> updateSpecialtyMAList = new List<Opportunity>();
        
        for(OpportunityLineItem oli:newOppLineList){
            opportunityIdSet.add(oli.OpportunityId);
        }
        
        if(opportunityIdSet.size() > 0){
            for(Opportunity opp:[Select id,RecordTypeId,Product_Type_Involved_in_Opp__c from Opportunity where ID IN:opportunityIdSet]){
                if(opp.RecordTypeId == oppRecordTypeId && opp.Product_Type_Involved_in_Opp__c != null){
                    if(opp.Product_Type_Involved_in_Opp__c.contains('Medical')){
                        medOppList.add(opp);
                    }
                    else if(!opp.Product_Type_Involved_in_Opp__c.contains('Medical') && (opp.Product_Type_Involved_in_Opp__c.contains('Vision') || opp.Product_Type_Involved_in_Opp__c.contains('Dental') || opp.Product_Type_Involved_in_Opp__c.contains('Other Buy Up Programs'))){
                        specialtyOppIdSet.add(opp.Id);
                    }
                }
            }
        }
        
        if(specialtyOppIdSet.size() > 0){
            specialtyOliList = [SELECT id,name,OpportunityId,Disposition_Other_Buy_Up_Programs__c,Opportunity.Disposition_Dental__c,Opportunity.Disposition_Vision__c,Estimated_Additional_New_Members__c,Opportunity.WillThrBeaRFP__c,Opportunity.Sales_Debrief__c
                   FROM OpportunityLineItem
                   WHERE OpportunityId IN:specialtyOppIdSet AND Opportunity.Aggregator_Involved_in_the_Oppty_Risk__r.Name != 'Equity Healthcare' AND((((Product_Line__c = 'Dental' AND Product2.Family = 'Specialty Products' AND Opportunity.Disposition_Dental__c IN ('Sold', 'Lost: Finalist', 'Lost: Non-Finalist')) 
                           OR (Product_Line__c = 'Vision' AND Product2.Family = 'Specialty Products' AND Opportunity.Disposition_Vision__c IN ('Sold', 'Lost: Finalist', 'Lost: Non-Finalist')))
                          AND (Opportunity.WillThrBeaRFP__c IN ('Yes, RFP is Certain', 'Yes, RFP is Likely') 
                               OR Net_Results__c != 0 OR (Estimated_Additional_New_Members__c > 0 AND Net_Results__c = 0)))
                   OR((Product_Line__c = 'Other' AND Product2.Family = 'Specialty Products' AND Disposition_Other_Buy_Up_Programs__c IN ('Sold', 'Lost: Finalist', 'Lost: Non-Finalist'))
                      AND (Opportunity.WillThrBeaRFP__c IN ('Yes, RFP is Certain', 'Yes, RFP is Likely')
                           OR Net_Results__c != 0 OR (Estimated_Additional_New_Members__c > 0 AND Net_Results__c = 0))))];
        
            system.debug('specialtyOliList '+specialtyOliList);
        }
        
        if(specialtyOliList.size() > 0){
            for(OpportunityLineItem oli:specialtyOliList){
                eligibleSpecialtyOppId.add(oli.OpportunityId);
            }
            
            for(Id id:eligibleSpecialtyOppId){
                Opportunity opp = new Opportunity();
                opp.Id = id;
                opp.Sales_Debrief__c = 'Specialty Only';
                updateSpecialtyMAList.add(opp);
            }
            
            update updateSpecialtyMAList;
        }
        else{
            for(Opportunity oppt:[Select id,RecordTypeId,Product_Type_Involved_in_Opp__c,Sales_Debrief__c from Opportunity where ID IN:opportunityIdSet]){
                if(!medOppList.contains(oppt)){
                    if(oppt.RecordTypeId==oppRecordTypeId){
                        //system.debug('inside specialty inner if '+oppt.Name);
                        Opportunity opp = new Opportunity();
                        opp.Id = oppt.id;
                        opp.Sales_Debrief__c = '';
                        updateSpecialtyMAList.add(opp);
                    }
                }
            }
            update updateSpecialtyMAList;
        }
        
        
    }
    
    ////Creates audit trail records when dispostion changes on Line items of type other buy up programmes in CD Membership Activities 
    public static void addAuditOnDispChange(List<OpportunityLineItem> newOppLineList,Map<id,OpportunityLineItem> oldOppLineMap){
        system.debug('Entering addAuditOnDispChange');
        List<Audit_Trail__c> auditList = new List<Audit_Trail__c>();   
        Map<Id,Opportunity> oppMap = new Map<Id,Opportunity>();	
        Map<Id, Opportunity> oppDataMap = OppLineItemsAuditTrailHelper.getOppInfo(newOppLineList);
        
        Map<Id,Audit_Trail__c> medicalAuditMap = new Map<Id,Audit_Trail__c>();
        Map<Id,Audit_Trail__c> dentalAuditMap = new Map<Id,Audit_Trail__c>();
        Map<Id,Audit_Trail__c> visionAuditMap = new Map<Id,Audit_Trail__c>();
        Map<Id,Audit_Trail__c> pharmacyAuditMap = new Map<Id,Audit_Trail__c>();
                
        Map<Id, OpportunityLineItem> prod2Map = OppLineItemsAuditTrailHelper.getProductName(newOppLineList);
        for(OpportunityLineItem item:newOppLineList){
            if(oppDataMap.get(item.OpportunityId).MACategory__c == 'Client Development'){            
                system.debug('MA Type in update='+item.Opportunity.MACategory__c );
                
                 //-----------------------------------------------------------SAMARTH-----------------------------------------------------------
                //FOR SOLD/RETAINED MEMBERS
                if((item.Product_Line__c == 'Medical' && oppDataMap.get(item.OpportunityId).Disposition_Medical__c == 'Sold')||
                   (item.Product_Line__c == 'Dental' && oppDataMap.get(item.OpportunityId).Disposition_Dental__c == 'Sold')||
                   (item.Product_Line__c == 'Vision' && oppDataMap.get(item.OpportunityId).Disposition_Vision__c == 'Sold')||
                   (item.Product_Line__c == 'Pharmacy' && oppDataMap.get(item.OpportunityId).Disposition_Pharmacy__c == 'Sold')){
                       if(item.Sold_Retained_Members__c != oldOppLineMap.get(item.id).Sold_Retained_Members__c && prod2Map.get(item.Id).Product2.Name != 'Total'){
                           system.debug('Sold/Retained Members Changed '+item.Id);
                           system.debug('Opportunity Id '+ item.OpportunityId);
                           auditList.add(new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = UserInfo.getUserId(),
                                                            Field__c = item.Product_Line__c+'->'+prod2Map.get(item.Id).Product2.Name+'->Sold/Retained Members',Original_Value__c = String.valueOf(oldOppLineMap.get(item.id).Sold_Retained_Members__c),
                                                            New_Value__c = String.valueOf(item.Sold_Retained_Members__c),Event__c='Field Change',Membership_Activity__c = item.OpportunityId));
                       }
                   }
                
                //-----------------------------------------------------------SAMARTH-----------------------------------------------------------
                system.debug('prod2Map.get(item.Id).Product2.Product_Line__c '+prod2Map.get(item.Id).Product2.Product_Line__c);
                system.debug('item.Disposition_Other_Buy_Up_Programs__c '+item.Disposition_Other_Buy_Up_Programs__c);
                system.debug('oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c '+oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c);
                system.debug('oppMap.containsKey(item.opportunityId) '+oppMap.containsKey(item.opportunityId));
                system.debug('oldOppLineMap.get(item.id).Disposition_Other_Buy_Up_Programs__c '+oldOppLineMap.get(item.id).Disposition_Other_Buy_Up_Programs__c);
                system.debug('item.Disposition_Other_Buy_Up_Programs__c '+item.Disposition_Other_Buy_Up_Programs__c);
                if(prod2Map.get(item.Id).Product2.Product_Line__c == 'Other' &&  item.Disposition_Other_Buy_Up_Programs__c == 'Sold' && oldOppLineMap.get(item.id).Disposition_Other_Buy_Up_Programs__c != item.Disposition_Other_Buy_Up_Programs__c && oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c != true && oppMap.containsKey(item.opportunityId) == false){
                    system.debug('inside email statement');
                    oppMap.put(item.opportunityId,new opportunity(id=item.OpportunityId,Is_email_sent_to_implementation_team__c = true));
                }                                
                if((item.Disposition_Other_Buy_Up_Programs__c == 'Sold' || oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c == true) && prod2Map.get(item.Id).Product2.Product_Line__c == 'Other' && item.Disposition_Other_Buy_Up_Programs__c != null && item.Disposition_Other_Buy_Up_Programs__c != oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c){
                    auditList.add(new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = UserInfo.getUserId(),
                                                     Field__c = item.Product_Line__c+'->'+prod2Map.get(item.Id).Product2.Name,Original_Value__c = oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c,
                                                     New_Value__c = item.Disposition_Other_Buy_Up_Programs__c,Event__c='Disposition Change',Membership_Activity__c = item.OpportunityId));
                }
                
                /*if((item.Disposition_Other_Buy_Up_Programs__c == 'Sold' || oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c == true) && prod2Map.get(item.Id).Product2.Product_Line__c != 'Other' && prod2Map.get(item.Id).Product2.Name != 'Total' && item.Disposition_Other_Buy_Up_Programs__c != oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c){
                    system.debug('entering 1st if');
                    if(medicalAuditMap.containsKey(item.opportunityId) == false && prod2Map.get(item.Id).Product2.Product_Line__c == 'Medical'){
                        medicalAuditMap.put(item.OpportunityId,new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = item.CreatedById,
                                                                                  Field__c = item.Product_Line__c,Original_Value__c = oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c,
                                                                                  New_Value__c = item.Disposition_Other_Buy_Up_Programs__c,Event__c='Disposition Change',Membership_Activity__c = item.OpportunityId));
                    }
                    
                    else if(dentalAuditMap.containsKey(item.opportunityId) == false && prod2Map.get(item.Id).Product2.Product_Line__c == 'Dental'){
                        dentalAuditMap.put(item.OpportunityId,new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = item.CreatedById,
                                                                                 Field__c = item.Product_Line__c,Original_Value__c = oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c,
                                                                                 New_Value__c = item.Disposition_Other_Buy_Up_Programs__c,Event__c='Disposition Change',Membership_Activity__c = item.OpportunityId));
                    }
                    
                    else if(visionAuditMap.containsKey(item.opportunityId) == false && prod2Map.get(item.Id).Product2.Product_Line__c == 'Vision'){
                        visionAuditMap.put(item.OpportunityId,new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = item.CreatedById,
                                                                                 Field__c = item.Product_Line__c,Original_Value__c = oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c,
                                                                                 New_Value__c = item.Disposition_Other_Buy_Up_Programs__c,Event__c='Disposition Change',Membership_Activity__c = item.OpportunityId));
                    }
                    
                    else if(pharmacyAuditMap.containsKey(item.opportunityId) == false && prod2Map.get(item.Id).Product2.Product_Line__c == 'Pharmacy'){
                        pharmacyAuditMap.put(item.OpportunityId,new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = item.CreatedById,
                                                                                   Field__c = item.Product_Line__c,Original_Value__c = oldOppLineMap.get(item.Id).Disposition_Other_Buy_Up_Programs__c,
                                                                                   New_Value__c = item.Disposition_Other_Buy_Up_Programs__c,Event__c='Disposition Change',Membership_Activity__c = item.OpportunityId));
                    }
                }*/
            }
        }
        /*if(medicalAuditMap.size()>0){
            auditList.addAll(medicalAuditMap.values());
        }
        
        if(dentalAuditMap.size()>0){
            auditList.addAll(dentalAuditMap.values());
        }
        
        if(visionAuditMap.size()>0){
            auditList.addAll(visionAuditMap.values());
        }
        
        if(pharmacyAuditMap.size()>0){
            auditList.addAll(pharmacyAuditMap.values());
        }*/
        
        if(oppMap.size()>0){
            update oppMap.values();   
        }
        if(auditList.size() > 0){
            insert auditList;
        }  
    }
    
    //Creates audit trail records when new Line item is added in CD Membership Activities
    public static void addAuditOnAddLineItem(List<OpportunityLineItem> newOppLineList){
        List<Audit_Trail__c> auditList = new List<Audit_Trail__c>();
        Map<Id, Opportunity> oppDataMap = OppLineItemsAuditTrailHelper.getOppInfo(newOppLineList);
        Map<Id, OpportunityLineItem> prod2Map = OppLineItemsAuditTrailHelper.getProductName(newOppLineList);
        for(OpportunityLineItem item:newOppLineList){
            system.debug('MA Type in add='+oppDataMap.get(item.OpportunityId).MACategory__c);
            if(oppDataMap.get(item.OpportunityId).MACategory__c == 'Client Development' && prod2Map.get(item.Id).Product2.Name != 'Total' && (item.Disposition_Other_Buy_Up_Programs__c == 'Sold' || oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c == true)){                           
                auditList.add(new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = UserInfo.getUserId(),
                                                 Field__c = item.Product_Line__c+'->'+prod2Map.get(item.Id).Product2.Name,Original_Value__c = 'NA',
                                                 New_Value__c = 'NA',Membership_Activity__c = item.OpportunityId,Event__c = 'Product Added'));                                              
            }           
        } 
        if(auditList.size() > 0){
            insert auditList;
        }  
    }
    
    //Creates audit trail records when Line item is removed in CD Membership Activities
    public static void addAuditOnRemoveLineItem(List<OpportunityLineItem> oldOppLineList){
        List<Audit_Trail__c> auditList = new List<Audit_Trail__c>();
        Map<Id, Opportunity> oppDataMap = OppLineItemsAuditTrailHelper.getOppInfo(oldOppLineList);
        Map<Id, OpportunityLineItem> prod2Map = OppLineItemsAuditTrailHelper.getProductName(oldOppLineList);       
        for(OpportunityLineItem item:oldOppLineList){
            system.debug('MA Type in remove='+item.Opportunity.MACategory__c );            
            if(oppDataMap.get(item.OpportunityId).MACategory__c == 'Client Development' && oppDataMap.get(item.OpportunityId).Is_email_sent_to_implementation_team__c == true){                           
                auditList.add(new Audit_Trail__c(CreatedDate = Datetime.now(),User__c = UserInfo.getUserId(),
                                                 Field__c = item.Product_Line__c+'->'+prod2Map.get(item.Id).Product2.Name,Original_Value__c = 'NA',
                                                 New_Value__c = 'NA',Membership_Activity__c = item.OpportunityId,Event__c = 'Product Removed'));                                              
            }  
        }
        if(auditList.size() > 0){
            insert auditList;
        }  
    }
    
    //Get the opportinty record details 
    public static Map<Id, Opportunity> getOppInfo(List<OpportunityLineItem> oppLineList){
        List<Id> oppIds = new List<Id>();
        for(OpportunityLineItem item:oppLineList){
            oppIds.add(item.OpportunityId);
        }        
        Map<Id, Opportunity> oppDataMap = new Map<Id, Opportunity>([
            SELECT Id, MACategory__c,Is_email_sent_to_implementation_team__c,Disposition_Medical__c,Disposition_Dental__c,Disposition_Pharmacy__c,Disposition_Vision__c 
            FROM Opportunity
            WHERE Id IN : oppIds
        ]);
        //Disposition_Dental__c,Disposition_Pharmacy__c,Disposition_Vision__c ADDED BY SAMARTH
        return oppDataMap;
    }
    
    
    //Get the product Name
    public static Map<Id, OpportunityLineItem> getProductName(List<OpportunityLineItem> oppLineList){              
        return new Map<Id, OpportunityLineItem>([
            SELECT Id, Product2.Name,Product2.Product_Line__c 
            FROM OpportunityLineItem
            WHERE Id IN : oppLineList
        ]);       
    }
}