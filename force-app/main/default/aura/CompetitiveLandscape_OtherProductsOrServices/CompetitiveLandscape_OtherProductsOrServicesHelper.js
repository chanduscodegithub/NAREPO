({
	enableFields : function(component, event) {
        
        
		var fieldsToBeEnabled = component.find('multipleSelect');
        if(fieldsToBeEnabled != null && fieldsToBeEnabled != 'undefined') {
        	$A.util.removeClass(fieldsToBeEnabled, 'slds-hide');
            
            /*
             * Set the Type of Other Products\Servies Provided picklist values to the Dropdown dynamically in Others Section.
             */
            
            var selectedValues = component.get('v.otherProductsData.Type_of_Products_Services_Provided__c');
            var selectedValuesArray = [];
            var typeOfOtherProductsOrServicesProvidedArrayValues = [];
            var typeOfOtherProductsOrServicesProvidedListFromSF = 
                component.get('v.competitorsAttributes.TypeOfOtherProductsOrServicesProvided');
            
            if(selectedValues != undefined && selectedValues != null && selectedValues.length > 0) {
                selectedValuesArray = selectedValues.split(';');
            }   
            
            if(typeOfOtherProductsOrServicesProvidedListFromSF != null && typeOfOtherProductsOrServicesProvidedListFromSF != undefined &&
               typeOfOtherProductsOrServicesProvidedListFromSF.length > 0) {
                for(var i=0;i<typeOfOtherProductsOrServicesProvidedListFromSF.length;i++) {
                    var typeOfOtherProductsOrServicesProvidedValueToBeAdded = '';
                    /* Avoiding Medical, Dental, Vision, Pharmacy, PickList Values */
                    if(typeOfOtherProductsOrServicesProvidedListFromSF[i] != 'Dental' && typeOfOtherProductsOrServicesProvidedListFromSF[i] != 'Medical' && typeOfOtherProductsOrServicesProvidedListFromSF[i] != 'Pharmacy' && typeOfOtherProductsOrServicesProvidedListFromSF[i] != 'Vision') {
                        if(selectedValuesArray != undefined && selectedValuesArray != null && selectedValuesArray.length > 0 &&
                           selectedValuesArray.indexOf(typeOfOtherProductsOrServicesProvidedListFromSF[i]) > -1) {
                            typeOfOtherProductsOrServicesProvidedValueToBeAdded = { text:typeOfOtherProductsOrServicesProvidedListFromSF[i], value:typeOfOtherProductsOrServicesProvidedListFromSF[i], selected:"true"};                                                                     
                        } else {
                            typeOfOtherProductsOrServicesProvidedValueToBeAdded = { text:typeOfOtherProductsOrServicesProvidedListFromSF[i], value:typeOfOtherProductsOrServicesProvidedListFromSF[i]};                      
                        }
                        typeOfOtherProductsOrServicesProvidedArrayValues.push(typeOfOtherProductsOrServicesProvidedValueToBeAdded);
                    }
                }
            }
            component.find("multipleSelect").set("v.options", typeOfOtherProductsOrServicesProvidedArrayValues);
            /* Code to set PickList Values for LWC component for choosing TYPE OF OTHER PRODUCTS/SERVICES PROVIDED using Mouse Click - START */
            component.set('v.typeOfOtherProductsOrServicesProvidedArrayPickListValues',typeOfOtherProductsOrServicesProvidedArrayValues);
            component.set('v.isEnableMultiPickListComponent',true);
            //pubsub.fire('typeOfOtherProductsOrServicesProvidedArrayValues', typeOfOtherProductsOrServicesProvidedArrayValues);
            //component.find('pubsub').fireEvent('typeOfOtherProductsOrServicesProvidedArrayValues',component.get('v.typeOfOtherProductsOrServicesProvidedArrayPickListValues'));
            /* Code to set PickList Values for LWC component for choosing TYPE OF OTHER PRODUCTS/SERVICES PROVIDED using Mouse Click - END */
            
        }
        
        /*var outputCommentsField = component.find('OutputComments');
        var inputCommentsField = component.find('InputComments');
        if(outputCommentsField != null && outputCommentsField != undefined && inputCommentsField != null &&
          		inputCommentsField != undefined) {
        	$A.util.removeClass(inputCommentsField, 'slds-hide');
            $A.util.addClass(outputCommentsField, 'slds-hide');
            
        }*/
        
        var fieldsToBeEnabled1 = component.find('multiResult');
        if(fieldsToBeEnabled1 != null && fieldsToBeEnabled1 != 'undefined') {
        	$A.util.addClass(fieldsToBeEnabled1, 'slds-hide');
        }
        
        var fieldsToBeEnabled2 = component.find('otherProductsFields');
        if(fieldsToBeEnabled2 != null && fieldsToBeEnabled2 != 'undefined') {
            if(Array.isArray(fieldsToBeEnabled2)) {
            	for(var i=0;i<fieldsToBeEnabled2.length;i++) {
           			fieldsToBeEnabled2[i].set('v.disabled', false);   
            	}   
            } else {
                fieldsToBeEnabled2.set('v.disabled', false);   
            }
        }
        
        /*var fieldsToBeEnabledFordeleteIcon = component.find('deleteIcon');
        if(fieldsToBeEnabledFordeleteIcon != null && fieldsToBeEnabledFordeleteIcon != 'undefined') {
        	$A.util.addClass(fieldsToBeEnabledFordeleteIcon, 'slds-hide');
        }*/
	},
    
    disableFields : function(component, event) {
        
        var outputCommentsField = component.find('OutputComments');
        var inputCommentsField = component.find('InputComments');
        if(outputCommentsField != null && outputCommentsField != undefined && inputCommentsField != null &&
          		inputCommentsField != undefined) {
        	$A.util.addClass(inputCommentsField, 'slds-hide');
            $A.util.removeClass(outputCommentsField, 'slds-hide');
            
        }
		var fieldsToBeEnabled = component.find('multipleSelect');
        if(fieldsToBeEnabled != null && fieldsToBeEnabled != 'undefined') {
        	$A.util.addClass(fieldsToBeEnabled, 'slds-hide');
        }
        
        var fieldsToBeEnabled1 = component.find('multiResult');
        if(fieldsToBeEnabled1 != null && fieldsToBeEnabled1 != 'undefined') {
        	$A.util.removeClass(fieldsToBeEnabled1, 'slds-hide');
        }
        
        var fieldsToBeEnabled2 = component.find('otherProductsFields');
        if(fieldsToBeEnabled2 != null && fieldsToBeEnabled2 != 'undefined') {
        	if(Array.isArray(fieldsToBeEnabled2)) {
            	for(var i=0;i<fieldsToBeEnabled2.length;i++) {
           			fieldsToBeEnabled2[i].set('v.disabled', true);   
            	}   
            } else {
                fieldsToBeEnabled2.set('v.disabled', true);   
            }
        }
        
        /*var fieldsToBeEnabledFordeleteIcon = component.find('deleteIcon');
        if(fieldsToBeEnabledFordeleteIcon != null && fieldsToBeEnabledFordeleteIcon != 'undefined') {
        	$A.util.removeClass(fieldsToBeEnabledFordeleteIcon, 'slds-hide');
        }*/
	},
    
    updateTypeOfOtherProductsProvided : function(component, event) {
        component.set('v.otherProductsData.Type_of_Products_Services_Provided__c', component.find("multipleSelect").get("v.value"));
        /*var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'competitorPicklistSelectedVal':component.find("multipleSelect").get("v.value"),'competitorIdToBeUpdated':component.get('v.otherProductsData.CompetitorAccount__r.Id'),'competitorClassificationName':'Others'});
        compEvent.fire();*/
    },
    
    removeOtherProductsRecords : function(component, event) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
        
        var compEvent = component.getEvent("competitiveLandscapeEvent");
        compEvent.setParams({'competitorDataToBeRemoved':component.get('v.otherProductsData'),'index':component.get('v.indexVal')});
        compEvent.fire();
    },
    
    handleMultiPickList : function(component, event) {
        var loop = true;
        var i = 0;
        var pickListValues = '';
        var value = event.getParams();
        console.log('value recived is '+value);
        while(loop) {
            if(value[i] != undefined) {
                pickListValues = pickListValues.concat(value[i].otherProductRecord,';');
                i++;
            } else {
                loop = false;
            }
        }     
        
        
       /* for(var i = 0; i<value.length; i++) {
            if(value[i].otherProductRecord != undefined) {
                if(i < value.length - 1) {
                   pickListValues = pickListValues.concat(value[i].otherProductRecord,';'); 
                } else if(i == value.length -1 ) {
                    pickListValues = pickListValues.concat(value[i].otherProductRecord); 
                }
            }
        } */
        //console.log('Final list generated is '+pickListValues);
        component.set('v.otherProductsData.Type_of_Products_Services_Provided__c',pickListValues);
    }
})