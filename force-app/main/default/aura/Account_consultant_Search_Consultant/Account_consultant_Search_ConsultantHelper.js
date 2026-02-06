({
    getConsultantsFirmsRecords : function(component, page, searchKey, searchFieldVal, operatorVal){
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
        var recordId = component.get('v.Child_Data').recordId;
        var contactRecordTypeId = component.get('v.Child_Data').contactRecordType;
        
        var action = component.get("c.getConsultantFirms");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal, 
            "accountId":recordId
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                    var searchKeyText = component.find('searchKeywordForConsultantsFirm').get('v.value');
                    if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                        component.find('goBtn1').set("v.disabled",false);
                        component.find('clrBtn1').set("v.disabled",false);
                    } else {
                        component.find('goBtn1').set("v.disabled",true);
                        component.find('clrBtn1').set("v.disabled",true);
                    }
                    if((responseObj.accountList == null) || (responseObj.accountList != null && responseObj.accountList.length == 0)) {
                        component.set('v.isConsultantFirmsListEmpty', true);
                        component.set('v.showSelect', false);
                    } else {
                        component.set('v.isConsultantFirmsListEmpty', false);
                        component.set('v.showSelect', true);
                    }
                    component.set("v.consultingFirmSearch", responseObj.accountList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                } else {
                    component.set('v.isConsultantFirmsListEmpty', true);
                    component.set('v.showSelect', false);
                }
                
                component.set('v.isSpinnertoLoad', false);
            }else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad', false);
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        $A.enqueueAction(action);
    },
    
    getConsultantsRecords : function(component, page, searchKey, searchFieldVal, operatorVal) {
    	component.set('v.isSpinnertoLoad', true);
        
        var contactRecordTypeId = component.get('v.Child_Data').contactRecordType;
        var recordId = component.get('v.Child_Data').recordId;
    
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
		var action = component.get("c.getConsultants");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal,
            "contactRecordTypeId":contactRecordTypeId,
            "accountId":recordId
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                    var searchKeyText = component.find('searchKeywordForConsultants').get('v.value');
                        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                            component.find('goBtn').set("v.disabled",false);
                            component.find('clrBtn').set("v.disabled",false);
                        } else {
                            component.find('goBtn').set("v.disabled",true);
                            component.find('clrBtn').set("v.disabled",true);
                        }
                    if((responseObj.consultantList == null) || (responseObj.consultantList != null && responseObj.consultantList.length == 0)) {
                        component.set('v.isConsultantsListEmpty', true);
                        component.set('v.hideSelect', false);
                    } else {
                        component.set('v.isConsultantsListEmpty', false);
                        component.set('v.hideSelect', true);
                    }
                    component.set("v.consultingSearch", responseObj.consultantList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set("v.isPrimaryExists", responseObj.recordExists);
                } else {
                    component.set('v.isConsultantsListEmpty', true);
                    component.set('v.hideSelect', false);
                }
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad', false);
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
				}
        });
        $A.enqueueAction(action);
	},
     openMailPopup : function(component, event, header, cmp){
         var childData = {'maId' : component.get('v.Child_Data').recordId,'opportunityData' :'','isFromQA': false};
        $A.createComponents([["c:Modal_Component_Small",{attribute:true, 'ModalBodyData':childData, 'Modalheader':header,'ModalBody':cmp}]],
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