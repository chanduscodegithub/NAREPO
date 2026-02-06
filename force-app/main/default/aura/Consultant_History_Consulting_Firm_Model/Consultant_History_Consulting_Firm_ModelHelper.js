({
    getAllContactOfTypeConsultantFromController : function(component, page, searchKey, searchFieldVal, operatorVal) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
        var action = component.get("c.getAllContactOfTypeConsultantData");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if(state == "SUCCESS") {
                var consultantHistoryResponseObj = response.getReturnValue();
                var searchKeyText = component.find('searchKey').get('v.value');                        
                if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                    component.find('goBtn').set("v.disabled",false);
                    component.find('clrBtn').set("v.disabled",false);
                } else {
                    component.find('goBtn').set("v.disabled",true);
                    component.find('clrBtn').set("v.disabled",true);
                }
                if(consultantHistoryResponseObj != null && consultantHistoryResponseObj.consultantContactList != null && consultantHistoryResponseObj.consultantContactList.length > 0) {                       
                    component.set('v.isContactNoData',false);
                    
                    var paddingBottom = component.find("paddingBottom");
                    $A.util.removeClass(paddingBottom, 'ip-pad');
                    
                    component.set("v.consultantSearchHistoryList", consultantHistoryResponseObj.consultantContactList);
                    component.set("v.page", consultantHistoryResponseObj.page);
                    component.set("v.total", consultantHistoryResponseObj.total);
                    component.set("v.pages", Math.ceil(consultantHistoryResponseObj.total/consultantHistoryResponseObj.pageSize));
                } else {                
                    
                    var paddingBottom = component.find("paddingBottom");
                    $A.util.removeClass(paddingBottom, 'ip-pad');       
                    
                    component.set('v.isContactNoData',true);
                    component.set("v.page", consultantHistoryResponseObj.page);
                    component.set("v.total", consultantHistoryResponseObj.total);
                    component.set("v.pages", Math.ceil(consultantHistoryResponseObj.total/consultantHistoryResponseObj.pageSize));
                }
            } else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                            component.set('v.isContactNoData',true);
                            component.set("v.page", 1);
                            component.set("v.total", 1);
                            component.set("v.pages", 1);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    }
})