({
    enableFields : function(component, event) {
        
		/*var fieldsToBeEnabled = component.find('pharmacyFields');
        if(fieldsToBeEnabled != null && fieldsToBeEnabled != 'undefined') {
            if(Array.isArray(fieldsToBeEnabled)) {
                for(var i=0;i<fieldsToBeEnabled.length;i++) {
           			fieldsToBeEnabled[i].set('v.disabled', false);   
            	}
            } else {
                fieldsToBeEnabled.set('v.disabled', false);
            }
        }
        
        var outputCommentsField = component.find('OutputComments');
        var inputCommentsField = component.find('InputComments');
        if(outputCommentsField != null && outputCommentsField != undefined && inputCommentsField != null &&
          		inputCommentsField != undefined) {
        	$A.util.removeClass(inputCommentsField, 'slds-hide');
            $A.util.addClass(outputCommentsField, 'slds-hide');
            
        }*/
        
        var fieldsToBeEnabledForPrimaryIncumbent = component.find('primaryIncumbent');
        if(fieldsToBeEnabledForPrimaryIncumbent != null && fieldsToBeEnabledForPrimaryIncumbent != 'undefined') {
        	fieldsToBeEnabledForPrimaryIncumbent.set('v.disabled', false);
        }
        
        var fieldsToBeEnabledForSecIncumbent = component.find('secondaryIncumbent');
        if(fieldsToBeEnabledForSecIncumbent != null && fieldsToBeEnabledForSecIncumbent != 'undefined') {
        	fieldsToBeEnabledForSecIncumbent.set('v.disabled', false);
        }
        
        var fieldsToBeEnabledForMultiSelect = component.find('multipleSelect');
        if(fieldsToBeEnabledForMultiSelect != null && fieldsToBeEnabledForMultiSelect != 'undefined') {
        	$A.util.removeClass(fieldsToBeEnabledForMultiSelect, 'slds-hide');
            component.set('v.isEnableMultiPickListComponent', true);
        }
        
        var fieldsToBeEnabledForMultiResult = component.find('multiResult');
        if(fieldsToBeEnabledForMultiResult != null && fieldsToBeEnabledForMultiResult != 'undefined') {
        	$A.util.addClass(fieldsToBeEnabledForMultiResult, 'slds-hide');
        }
        
        /*var fieldsToBeEnabledFordeleteIcon = component.find('deleteIcon');
        if(fieldsToBeEnabledFordeleteIcon != null && fieldsToBeEnabledFordeleteIcon != 'undefined') {
        	$A.util.addClass(fieldsToBeEnabledFordeleteIcon, 'slds-hide');
        }*/
        
	},
    
    disableFields : function(component, event) {
        
		/*var fieldsToBeDisabled = component.find('pharmacyFields');
        if(fieldsToBeDisabled != null && fieldsToBeDisabled != 'undefined') {
            if(Array.isArray(fieldsToBeDisabled)) {
                for(var i=0;i<fieldsToBeDisabled.length;i++) {
           			fieldsToBeDisabled[i].set('v.disabled', true);   
            	}
            } else {
                fieldsToBeDisabled.set('v.disabled', true);
            }
        }
        
        var outputCommentsField = component.find('OutputComments');
        var inputCommentsField = component.find('InputComments');
        if(outputCommentsField != null && outputCommentsField != undefined && inputCommentsField != null &&
          		inputCommentsField != undefined) {
        	$A.util.addClass(inputCommentsField, 'slds-hide');
            $A.util.removeClass(outputCommentsField, 'slds-hide');
            
        }*/
        
        var fieldsToBeDisabledForPrimaryIncumbent = component.find('primaryIncumbent');
        if(fieldsToBeDisabledForPrimaryIncumbent != null && fieldsToBeDisabledForPrimaryIncumbent != 'undefined') {
        	fieldsToBeDisabledForPrimaryIncumbent.set('v.disabled', true);
        }
        
        var fieldsToBeDisabledForSecIncumbent = component.find('secondaryIncumbent');
        if(fieldsToBeDisabledForSecIncumbent != null && fieldsToBeDisabledForSecIncumbent != 'undefined') {
        	fieldsToBeDisabledForSecIncumbent.set('v.disabled', true);
        }
        
        var fieldsToBeDisabledForMultiSelect = component.find('multipleSelect');
        if(fieldsToBeDisabledForMultiSelect != null && fieldsToBeDisabledForMultiSelect != 'undefined') {
        	$A.util.addClass(fieldsToBeDisabledForMultiSelect, 'slds-hide');
            component.set('v.isEnableMultiPickListComponent', false);
        }
        
        var fieldsToBeDisabledForMultiResult = component.find('multiResult');
        if(fieldsToBeDisabledForMultiResult != null && fieldsToBeDisabledForMultiResult != 'undefined') {
        	$A.util.removeClass(fieldsToBeDisabledForMultiResult, 'slds-hide');
        }
        
        /*var fieldsToBeEnabledFordeleteIcon = component.find('deleteIcon');
        if(fieldsToBeEnabledFordeleteIcon != null && fieldsToBeEnabledFordeleteIcon != 'undefined') {
        	$A.util.removeClass(fieldsToBeEnabledFordeleteIcon, 'slds-hide');
        }*/
	},
    
    updateAssociatedMedicalCarrierValues : function(component, event) {
        component.set('v.pharmacyData.AssociatedMedicalCarrier__c', component.find("multipleSelect").get("v.value"));
    	/*var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'competitorPicklistSelectedVal':component.find("multipleSelect").get("v.value"),'competitorIdToBeUpdated':component.get('v.pharmacyData.CompetitorAccount__r.Id'),'competitorClassificationName':'Pharmacy'});
        compEvent.fire();*/
    },
    
    updateTotalAndPerOfMembers : function(component, event) {
        
        var numberOfMembersHeldVal = component.get('v.pharmacyData.NumberOfMembersHeld__c');
        if(numberOfMembersHeldVal != null && numberOfMembersHeldVal != undefined) {
            var valueToBeUpdated = numberOfMembersHeldVal.toString();
            if(valueToBeUpdated.indexOf('-') == 0) {
            	valueToBeUpdated = valueToBeUpdated.substring(1, valueToBeUpdated.length);
            }
            if(valueToBeUpdated.length > 13) {
                valueToBeUpdated = valueToBeUpdated.substring(0, 13);
        	}
            component.set('v.pharmacyData.NumberOfMembersHeld__c', parseInt(valueToBeUpdated));
        } else {
            component.set('v.pharmacyData.NumberOfMembersHeld__c', 0);
        }
        var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'isNumberOfMembersHeldChange':true,'competitorClassificationName':$A.get("$Label.c.Pharmacy")});
        compEvent.fire(); 
    },
    
    removePharmacyRecords : function(component, event) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
        var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'competitorDataToBeRemoved':component.get('v.pharmacyData'),'index':component.get('v.indexVal')});
        compEvent.fire();
    },
    
    showreminderPopUp : function(component, event) {
        
        var numberOfMembersHeldVal = component.get('v.pharmacyData.NumberOfMembersHeld__c');
        if(numberOfMembersHeldVal != null && numberOfMembersHeldVal != undefined) {
            var valueToBeUpdated = numberOfMembersHeldVal.toString();
            if(valueToBeUpdated.indexOf('-') == 0) {
            	valueToBeUpdated = valueToBeUpdated.substring(1, valueToBeUpdated.length);
            }
            if(valueToBeUpdated.length > 13) {
                valueToBeUpdated = valueToBeUpdated.substring(0, 13);
        	}
            component.set('v.pharmacyData.NumberOfMembersHeld__c', parseInt(valueToBeUpdated));
        } else {
            component.set('v.pharmacyData.NumberOfMembersHeld__c', 0);
        }
    	var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'competitorId':component.get('v.pharmacyData.CompetitorAccount__r.Id'),'competitorClassificationName':$A.get("$Label.c.Pharmacy")});
        compEvent.fire();
	},
    
    updatePrimaryIncumbentButtonValue : function(component, event) {
        var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'clearOtherPrimaryIncumbents':true,'index':component.get('v.indexVal'),'competitorClassificationName':$A.get("$Label.c.Pharmacy")});
        compEvent.fire();
    },
    
    updateSecondaryIncumbentButtonValue : function(component, event) {
        var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'clearOtherPrimaryIncumbents':false,'index':component.get('v.indexVal'),'competitorClassificationName':$A.get("$Label.c.Pharmacy")});
        compEvent.fire();
    },
    
    clearPrimaryIncumbentButtonValue : function(component, event) {
        if(component.find('primaryIncumbent') != undefined && component.find('primaryIncumbent') != null) {
        	component.find('primaryIncumbent').set('v.value', false);  
        }
    }, 
    
    clearSecondaryIncumbentButtonValue : function(component, event) {
        if(component.find('secondaryIncumbent') != undefined && component.find('secondaryIncumbent') != null) {
			component.find('secondaryIncumbent').set('v.value', false);            
        }
    },
    
    handleMultiPickList : function(component, event) {
        var loop = true;
        var i = 0;
        var pickListValues = '';
        var getValue = event.getParams();
        console.log('value recived is '+getValue);
        while(loop) {
            if(i < getValue.value.length) {
                if(getValue.value.length === 1 || i === getValue.value.length - 1) {
                    pickListValues = pickListValues.concat(getValue.value[i]);
                } else {
                    pickListValues = pickListValues.concat(getValue.value[i],';');
                }
                i++;
            } else {
                loop = false;
            }
        }
        component.set('v.pharmacyData.AssociatedMedicalCarrier__c',pickListValues);
    },
})