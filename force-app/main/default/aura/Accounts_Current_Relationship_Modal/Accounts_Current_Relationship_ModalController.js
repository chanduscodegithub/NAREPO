({
    navigateToAccountPage: function(component, event, helper) {    
        var navEvt = $A.get("e.force:navigateToSObject");
		alert(component.get('v.accountHistoryDataobj.AccountFirm__c'));
        navEvt.setParams({
            "recordId": component.get('v.accountHistoryDataobj.AccountFirm__c'),
            "slideDevName": "detail",
            //"isredirect":true
        });
        navEvt.fire();
    },
    
	closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length; i = i+1){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    sortFields : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"AccountFirm__r.Name":"sortAccountName","AccountFirm__r.Category__c":"sortAccountType","AccountFirm__r.Owner.Name":"sortAccountOwner"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        
        helper.sortBy(component, event, fieldNameToBeSorted, sortFieldCompName);
    }
})