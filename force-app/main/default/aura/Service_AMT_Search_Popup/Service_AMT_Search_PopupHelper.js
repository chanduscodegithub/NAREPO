({
    getUsers : function(component, page, searchKey, searchFieldVal, operatorVal, searchKeyValSec, searchFieldValSec, operatorSec, columnName, sortOrder){
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
        var recordId = component.get('v.Child_Data').maRecordId;
        var isUser = false;
        if(component.get('v.isUserListDisplayed')){
            isUser = true;
        }
        console.log('helper--->'+searchFieldValSec);
        var action = component.get("c.getSearchList");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal, 
            "accountId":recordId,
            "isUser" : isUser,
            "searchKeyValSec":searchKeyValSec,
            "searchFieldSec":searchFieldValSec,
            "operatorSec":operatorSec,
            "columnNameFromHelper":columnName,
            "sortOrderFromHelper":sortOrder
            
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                    
                    console.log('list---->',responseObj.userList)
                    var searchKeyText = component.find('searchKeywordForUsers').get('v.value');
                     var searchKeyTextSec = component.find('searchKeywordForUsersSec').get('v.value');
        console.log('searchKeyTextSec---'+searchKeyTextSec);
        if((searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) || (searchKeyTextSec != undefined && searchKeyTextSec != null && searchKeyTextSec.trim().length > 0)) {
       
                   // if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                        component.find('goBtn').set("v.disabled",false);
                        component.find('clrBtn').set("v.disabled",false);
                    } else {
                        component.find('goBtn').set("v.disabled",true);
                        component.find('clrBtn').set("v.disabled",true);
                    }
                    
                    if(responseObj.isuser){
                        console.log('list---->'+responseObj.userList)
                        if((responseObj.userList == null) || (responseObj.userList != null && responseObj.userList.length == 0)) {
                            component.set('v.isUserssListEmpty', true);
                            component.set('v.showSelect', false);
                        } else {
                            component.set('v.isUserssListEmpty', false);
                            component.set('v.showSelect', true);
                        }
                        component.set("v.userSearch", responseObj.userList);
                    }else{
                        if((responseObj.userList == null) || (responseObj.userList != null && responseObj.userList.length == 0)) {
                            //component.set('v.isContactListDisplayed', true);
                             component.set('v.isUserssListEmpty', true);
                            component.set('v.showSelect', false);
                        } else {
                           // component.set('v.isContactListDisplayed', false);
                            component.set('v.isUserssListEmpty', false);
                            component.set('v.showSelect', true);
                        }
                        component.set("v.userSearch", responseObj.userList);
                    }
                    component.set("v.existingServiceAmtRecords", responseObj.existingServiceAmt);
                    //console.log('in search popup1 ==',responseObj.existingServiceAmt);
                    //console.log('in search popup2==',component.get("v.existingServiceAmtRecords"));
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                } else {
                    component.set('v.isUserssListEmpty', true);
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
    showHidecomponent : function(component, event, header,cmp){
        var childData = component.get('v.Child_Data').recordId;
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