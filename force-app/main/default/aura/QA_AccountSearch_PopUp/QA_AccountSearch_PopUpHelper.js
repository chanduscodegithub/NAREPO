({
	getAccountRecordsDetails : function(component, page, searchKey, searchFieldVal, operatorVal) {
        
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
		var action = component.get("c.getAccountRecords");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal,
            "isAggregator":component.get('v.IsAggregator'),
            "isAggregatorsToBeShown":component.get('v.isAggregatorsToBeShown')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                    var searchKeyText = component.find('searchKey').get('v.value');
                    if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                        component.find('goBtn').set("v.disabled",false);
                    } else {
                        component.find('goBtn').set("v.disabled",true);
                    }
                    if((responseObj.accountList == null) || (responseObj.accountList != null && responseObj.accountList.length == 0)) {
                        component.set('v.isAccountListEmpty', true);
                    } else {
                        component.set('v.isAccountListEmpty', false);
                    }
                    component.set("v.AccountsList", responseObj.accountList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                } else {
                    component.set('v.isAccountListEmpty', true);
                }
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
                
            } else if (state === "ERROR") {
                component.set("v.UsersList", []);
                component.set('v.isAccountListEmpty', true);
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.cmAccountTeamHistoryObj;i++){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
	}
})