({
    editKeyRenewalDates : function(component, event, helper) {
        
        component.find('keyRenewalDateEditBtn').set("v.disabled", true);
        $A.util.removeClass(component.find("keyRenewalDateSaveBtn"), 'slds-hide');
        $A.util.removeClass(component.find("keyRenewalDateCancelBtn"), 'slds-hide');
        
        component.set("v.isEditOfKeyRenewalDates",true); 
        
    },
    cancelChangesOfKeyRenewalDates : function(component, event, helper) {
        var keyRenewalDateSectionLoadingSpinner = component.find("keyRenewalDateSectionLoadingSpinner");
        $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
        $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
        
        component.set("v.isEditOfKeyRenewalDates",false); 
        
        component.find('keyRenewalDateEditBtn').set("v.disabled", false);
        $A.util.addClass(component.find("keyRenewalDateSaveBtn"), 'slds-hide');
        $A.util.addClass(component.find("keyRenewalDateCancelBtn"), 'slds-hide');
        
        var showErrorBanner = component.find('errorToastMessage');
        $A.util.removeClass(showErrorBanner,'slds-hide');
        $A.util.addClass(showErrorBanner, 'slds-hide');  
        
        $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
        $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
        
        
    },
    saveKeyRenewalDates:function(component, event, helper) {
        
        
        var isValidationSucess=true;
        
        console.log('Inside LDS POC'+component.get("v.accountRecord").Current_Deal_Start_Date__c);
        
        var accountRecord=component.get("v.accountRecord");
        var accountKeyRenewalDateFieldNames=component.get("v.accountKeyRenewalDateFieldNames1");

        
        for(var j in accountKeyRenewalDateFieldNames)
        {
            if(accountRecord.hasOwnProperty(accountKeyRenewalDateFieldNames[j])
               && accountRecord[accountKeyRenewalDateFieldNames[j]]!=undefined && 
               helper.isValidDate(accountRecord[accountKeyRenewalDateFieldNames[j]])==false)
            {
                isValidationSucess=false;
                $A.util.addClass(component.find(accountKeyRenewalDateFieldNames[j]), 'slds-has-error');
            }
        }
          
        	if(!isValidationSucess)
            {
                var showErrorBanner = component.find('errorToastMessage');
                $A.util.removeClass(showErrorBanner,'slds-hide');
            }
            else
            {
                var showErrorBanner = component.find('errorToastMessage');
                $A.util.removeClass(showErrorBanner,'slds-hide');
                $A.util.addClass(showErrorBanner, 'slds-hide');
                
                var keyRenewalDateSectionLoadingSpinner = component.find("keyRenewalDateSectionLoadingSpinner");
                $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
                $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
            component.find("recordHandler").saveRecord($A.getCallback(function(saveResult) {
            // use the recordUpdated event handler to handle generic logic when record is changed
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                component.set("v.isEditOfKeyRenewalDates",false);
                component.find('keyRenewalDateEditBtn').set("v.disabled", false);
                $A.util.addClass(component.find("keyRenewalDateSaveBtn"), 'slds-hide');
                $A.util.addClass(component.find("keyRenewalDateCancelBtn"), 'slds-hide');
                $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
                $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
                
            } else if (saveResult.state === "INCOMPLETE") {
                console.log("User is offline, device doesn't support drafts.");
                component.set("v.isEditOfKeyRenewalDates",false);
                component.find('keyRenewalDateEditBtn').set("v.disabled", false);
                $A.util.addClass(component.find("keyRenewalDateSaveBtn"), 'slds-hide');
                $A.util.addClass(component.find("keyRenewalDateCancelBtn"), 'slds-hide');
                $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
                $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
            } else if (saveResult.state === "ERROR") {
                console.log('Problem saving record, error: ' + JSON.stringify(saveResult.error));
                component.set("v.isEditOfKeyRenewalDates",false);
                component.find('keyRenewalDateEditBtn').set("v.disabled", false);
                $A.util.addClass(component.find("keyRenewalDateSaveBtn"), 'slds-hide');
                $A.util.addClass(component.find("keyRenewalDateCancelBtn"), 'slds-hide');
                $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
                $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
            } else {
                console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
                component.set("v.isEditOfKeyRenewalDates",false);
                component.find('keyRenewalDateEditBtn').set("v.disabled", false);
                $A.util.addClass(component.find("keyRenewalDateSaveBtn"), 'slds-hide');
                $A.util.addClass(component.find("keyRenewalDateCancelBtn"), 'slds-hide');
                $A.util.removeClass(keyRenewalDateSectionLoadingSpinner, 'slds-show');
                $A.util.addClass(keyRenewalDateSectionLoadingSpinner, 'slds-hide');
            }
        }));
            }
        
        
    },
    
    keyRenewalDateChangeHandler:function(component, event, helper) {
      var keyRenewalDtAuraId = event.getSource().getLocalId(); 
      var keyRenewalDt=event.getSource().get("v.value"); 
       
      if(helper.isValidDate(keyRenewalDt)==true)
      {
         $A.util.removeClass(component.find(keyRenewalDtAuraId), 'slds-has-error'); 
      }
        
        
        
    }
    
    
    
})