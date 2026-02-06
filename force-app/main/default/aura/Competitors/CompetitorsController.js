({
	doInit : function(component, event, helper) {

        var selectedProductType = component.get('v.productType');
        selectedProductType = (selectedProductType != undefined && selectedProductType != null) ? selectedProductType : '';
        if(selectedProductType == 'Other') {
           selectedProductType = 'Other Buy Up'; 
        }
        component.set('v.competitorTypeHeader', selectedProductType+' '+$A.get("$Label.c.Competitors"));
        if(selectedProductType == 'Pharmacy') {
        	component.set('v.MembersInvolvedInOpp', 'Core ' +selectedProductType+' '+$A.get("$Label.c.MedicalMembersInvolvedInTheMembershipActivity"));    
        } else {
        	component.set('v.MembersInvolvedInOpp', selectedProductType+' '+$A.get("$Label.c.MedicalMembersInvolvedInTheMembershipActivity"));
        }        
        component.set('v.MACompetitorTotalList', {'Number_of_Members_Held__c':0, 'of_Members_Held__c':0,
                                                  'Number_of_Members_Awarded__c':0, 'of_Members_Awarded__c':0});
        
        helper.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Held__c', 'of_Members_Held__c');
        helper.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Awarded__c', 'of_Members_Awarded__c');
	},
    
    updatePerAndTotalCompetitorsData : function(component, event, helper) {

        var isNoOfMembersHeldChangeVal = event.getParam("isNoOfMembersHeldChange");
        var isNoOfMembersAwardedChangeVal = event.getParam("isNoOfMembersAwardedChange");
        
        if(isNoOfMembersHeldChangeVal != null && isNoOfMembersHeldChangeVal) {
            helper.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Held__c', 'of_Members_Held__c');
        } else if(isNoOfMembersAwardedChangeVal != null && isNoOfMembersAwardedChangeVal) {
            helper.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Awarded__c', 'of_Members_Awarded__c');
        }
        
    },
    
    setTotalRecordMethod : function(component, event, helper) {

        var params = event.getParam('arguments');
        if(params) {     
            var totalRecordObj = params.totalRecordObj;
            var updatedMembersInvolvedInMA = params.updatedMembersInvolvedInMAVal;
            helper.updateRecordsOnChangeInProducts(component, event, totalRecordObj, updatedMembersInvolvedInMA);
        }
    },
    
    updateMembersInvolvedInMA : function(component, event, helper) { 
    	
        var params = event.getParam('arguments');
        if(params) {  
            var updatedMembersInvolvedInMA = params.updatedMembersInvolvedInMAVal;
            helper.updateMembersInvolvedInMA(component, event, null, updatedMembersInvolvedInMA);
        }
    	
    },
    
    reCalculateTotalMACompetitorRecords : function(component, event, helper) {
        
		helper.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Held__c', 'of_Members_Held__c');
        helper.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Awarded__c', 'of_Members_Awarded__c');        
    },
    
    focusCompetitors : function(component, event, helper) {
        
        setTimeout(function() { 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 100);
    }
})