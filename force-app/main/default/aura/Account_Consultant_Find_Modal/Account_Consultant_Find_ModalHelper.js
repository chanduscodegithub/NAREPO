({
    getContactRecordsForAccounts : function(component, page, searchKey, searchFieldVal, operatorVal) {
        
    	component.set('v.isSpinnertoLoad', true);
        
        var contactRecordTypeId = component.get('v.Child_Data').contactRecordType;
    	
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
        var cfId = component.get('v.Child_Data').accountId;
        var accountId = cfId;
        
		var action = component.get("c.getConsultantOfAccount");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal, 
            "accountId":accountId,
            "contactRecordTypeId":contactRecordTypeId
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                    //alert('----->>'+JSON.stringify(responseObj));
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
                        component.set('v.showSelect', false);
                    } else {
                        component.set('v.isConsultantsListEmpty', false);
                        component.set('v.showSelect', true);
                    }
                    component.set("v.consultingSearch", responseObj.consultantList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                } else {
                    component.set('v.isConsultantsListEmpty', true);
                    component.set('v.showSelect', false);
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
	}
})