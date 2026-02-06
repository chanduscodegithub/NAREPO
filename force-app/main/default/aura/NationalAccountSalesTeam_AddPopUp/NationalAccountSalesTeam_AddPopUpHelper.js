({
	getUserRecordDetails : function(component, page, searchKey, searchFieldVal, operatorVal) {
        
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
		var action = component.get("c.getUserRecords");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal
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
                    if((responseObj.userList == null) || (responseObj.userList != null && responseObj.userList.length == 0)) {
                        component.set('v.isUserListEmpty', true);
                    } else {
                        component.set('v.isUserListEmpty', false);
                    }
                    component.set("v.UsersList", responseObj.userList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                } else {
                    component.set('v.isUserListEmpty', true);
                }
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
                
            } else if (state === "ERROR") {
                component.set("v.UsersList", []);
                component.set('v.isUserListEmpty', true);
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    component.set('v.CMAccountTeamHistoryList', []);
					component.set('v.CMAccountTeamHistoryEmptyList', true);
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