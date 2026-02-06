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
            "operator":operatorVal,
            "accountId":component.get('v.Child_Data').accountId
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    console.log('data');
                    var responseObj = response.getReturnValue();
                    if((responseObj.userList == null) || (responseObj.userList != null && responseObj.userList.length == 0)) {
                        component.find('goBtn').set("v.disabled",true);
                        component.set('v.isUserListEmpty', true);
                    } else {
                        var searchKeyText = component.find('searchKey').get('v.value');
                        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                            component.find('goBtn').set("v.disabled",false);
                        } else {
                            component.find('goBtn').set("v.disabled",true);
                        }
                        component.set('v.isUserListEmpty', false);
                    }
                    component.set("v.UsersList", responseObj.userList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                } else {
                    component.set('v.isUserListEmpty', true);
                }
            } else {
                console.log("In getUserRecordDetails method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
	}
})