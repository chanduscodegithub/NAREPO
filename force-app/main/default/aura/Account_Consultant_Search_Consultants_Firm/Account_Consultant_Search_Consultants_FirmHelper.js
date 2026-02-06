({
    getConsultantsFirmsRecords : function(component, page, searchKey, searchFieldVal, operatorVal){
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
        var action = component.get("c.getConsultantFirms");
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
                    //alert('----->>'+JSON.stringify(responseObj));
                    var searchKeyText = component.find('searchKeywordForConsultantsFirm').get('v.value');
                    if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                        component.find('goBtn').set("v.disabled",false);
                        component.find('clrBtn').set("v.disabled",false);
                    } else {
                        component.find('goBtn').set("v.disabled",true);
                        component.find('clrBtn').set("v.disabled",true);
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
            
            /*else {
                console.log("In getConsultantsFirmsRecords method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            component.set('v.isSpinnertoLoad', false);*/
        });
        $A.enqueueAction(action);
    }
})