({
    doInit : function(component, event, helper) {     
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
        }
        var Child_Data = component.get('v.Child_Data');
        var page = component.get("v.page") || 1;
        helper.getAccountsAndMembershipActivity(component,event,page,Child_Data);
    },
    
    sortFieldsMobile: function(component, event, helper) {      
        if(!event.getParam('isApply')) {
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                return;
            }
        }
        var Child_Data = component.get('v.Child_Data');
        var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
        component.set("v.lastSortField",fieldNameToBeSorted);
        var orderToBeSorted = event.getParam('orderToBeSorted');
        var fieldItagsWithAuraAttrMap = '{"Opportunity.Name":"sortMAName","Opportunity.Account.Name":"sortAccName","Opportunity.Membership_Activity_Type__c":"sortMAType","Opportunity.EffectiveDate__c":"sortMAEffectDate","Opportunity.Status__c":"sortMAStatus","Opportunity.Owner.Name":"sortMAOwner","Opportunity.Disposition_Medical__c":"sortMADispoMed"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
        if(orderToBeSorted === "DESC"){
            component.set("v."+sortFieldCompName,true); 
        }else{
            component.set("v."+sortFieldCompName,false); 
        }
        var page = 1;
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName,Child_Data);
    },
    
    pageChange: function(component, event, helper) {
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 600); 
        
        var Child_Data = component.get('v.Child_Data');
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getAccountsAndMembershipActivity(component,event,page,Child_Data);
    },
    
    sortFields : function(component, event, helper) {
        var Child_Data = component.get('v.Child_Data');
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Opportunity.Name":"sortMAName","Opportunity.Account.Name":"sortAccName","Opportunity.Sales_Stage_Medical__c":"sortSSMedical","Opportunity.Sales_Stage_Pharmacy__c":"sortSSPharmacy","Opportunity.Sales_Stage_Dental__c":"sortSSDental","Opportunity.Sales_Stage_Vision__c":"sortSSVision","Opportunity.Sales_Stage_Other__c":"sortSSOther","Opportunity.EffectiveDate__c":"sortEffectiveDate","Opportunity.Existing_Mbrs__c":"sortExistingMedMem","Opportunity.Estimated_Additional_New_Members__c":"sortEstimatedAddlNewMem","Opportunity.SoldMembers__c":"sortSoldMedMem","Opportunity.EstimatedMedicalMembershipatRisk__c":"sortEstimatedMedMem","Opportunity.ActualMedicalMembershipLoss__c":"sortActualMedMem","Opportunity.Owner.Name":"sortOwner","Opportunity.Disposition_Medical__c":"sortDispoMed"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName,Child_Data);
    },
    
    openSortingPopup : function(component, event, helper){
        
        if(!component.get('v.isDesktop')){
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        var fieldsToSort = [{"fieldName":"Opportunity.Name","fieldDisplayName":"Name","fieldOrder":component.get("v.sortMAName")},
                            {"fieldName":"Opportunity.Account.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortAccName")},          
                            {"fieldName":"Opportunity.Sales_Stage_Medical__c","fieldDisplayName":"Sales Stage (Medical)","fieldOrder":component.get("v.sortSSMedical")},
                            {"fieldName":"Opportunity.Sales_Stage_Pharmacy__c","fieldDisplayName":"Sales Stage(Pharmacy)","fieldOrder":component.get("v.sortSSPharmacy")},
                            {"fieldName":"Opportunity.Sales_Stage_Dental__c","fieldDisplayName":"Sales Stage(Dental)","fieldOrder":component.get("v.sortSSDental")},
                            {"fieldName":"Opportunity.Sales_Stage_Vision__c","fieldDisplayName":"Sales Stage(Vision)","fieldOrder":component.get("v.sortSSVision")},
                            {"fieldName":"Opportunity.Sales_Stage_Other__c","fieldDisplayName":"Sales Stage(Other Buy up Programs)","fieldOrder":component.get("v.sortSSOther")},
                            {"fieldName":"Opportunity.EffectiveDate__c","fieldDisplayName":"Effective Date","fieldOrder":component.get("v.sortEffectiveDate")},
                            {"fieldName":"Opportunity.Existing_Mbrs__c","fieldDisplayName":"Existing Medical Members","fieldOrder":component.get("v.sortExistingMedMem")},
                            {"fieldName":"Opportunity.Estimated_Additional_New_Members__c","fieldDisplayName":"Estimated Additional New Medical Members","fieldOrder":component.get("v.sortEstimatedAddlNewMem")},
                            {"fieldName":"Opportunity.SoldMembers__c","fieldDisplayName":"Sold Medical Members","fieldOrder":component.get("v.sortSoldMedMem")},
                            {"fieldName":"Opportunity.EstimatedMedicalMembershipatRisk__c","fieldDisplayName":"Estimated Medical Membership At Risk","fieldOrder":component.get("v.sortEstimatedMedMem")},
                            {"fieldName":"Opportunity.ActualMedicalMembershipLoss__c","fieldDisplayName":"Actual Medical Membership Loss","fieldOrder":component.get("v.sortActualMedMem")},
                            {"fieldName":"Opportunity.Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortOwner")},
                            {"fieldName":"Opportunity.Disposition_Medical__c","fieldDisplayName":"Disposition(Medical)","fieldOrder":component.get("v.sortDispoMed")}
                           ];        
                            $A.createComponents([["c:Panel_Component_Sorting",{attribute:true,'FieldsToSort':fieldsToSort,'lastSortField':component.get("v.lastSortField")}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });        
    }
})