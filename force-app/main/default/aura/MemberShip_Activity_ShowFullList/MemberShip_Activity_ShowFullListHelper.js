({
	sortBy : function(component, event, fieldName,page,sortFieldComp,Child_Data) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var action = component.get("c.getMembershipActivityOnShowFullListLoad");
        if(component.get("v."+sortFieldComp) ===  true) {
            action.setParams({
                "accountId" : Child_Data.accountId,
                "columnName" : fieldName,
                "sortType" : 'Desc',
                "pageNumber":page 
            });
            component.set("v."+sortFieldComp, false);
        } else {
            action.setParams({
                "accountId" : Child_Data.accountId,
                "columnName" : fieldName,
                "sortType" : 'Asc',
                "pageNumber":page
            });
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue().membershipActivityShowFullList != null && response.getReturnValue().membershipActivityShowFullList.length > 0) {
                    component.set('v.MembershipActivityEmptyList', false);
                    var responseArray = response.getReturnValue().membershipActivityShowFullList;                    
                    component.set('v.membershipActivitiesDataArray',this.getUniqueRecords(component, event,responseArray));
                    /*component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));*/
                }else{
                    component.set('v.MembershipActivityEmptyList', true);
                    /*component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));*/
                }        
            } else {
                console.log("In sortBy method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                    console.log("Unknown error");
                }
            }           
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });        
        $A.enqueueAction(action);
    },
    
    getAccountsAndMembershipActivity : function(component, event,page,Child_Data) {
        console.log('Show Full List');
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        page = page || 1;
        
        var action = component.get("c.getMembershipActivityOnShowFullListLoad");
        action.setParams({
            "accountId" : Child_Data.accountId,
            "columnName" : 'Opportunity.Account.Name',
            "sortType" : 'ASC',
            "pageNumber":page 
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue().membershipActivityShowFullList != null && response.getReturnValue().membershipActivityShowFullList.length > 0) {
                    var responseArray = response.getReturnValue().membershipActivityShowFullList;                                        
                   
                    component.set('v.membershipActivitiesDataArray', this.getUniqueRecords(component, event,responseArray));
                    /*component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));*/
                }else{
                    component.set('v.MembershipActivityEmptyList', true);
                    /*component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));*/
                }
            } else {
                console.log("In getAccountsAndMembershipActivity method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                    console.log("Unknown error");
                }
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    isExist : function(component, event, accId,arr1){
        var isExist = false;
        for(var i=0;i<arr1.length;i++){           
            if(arr1[i].Opportunity.Id === accId){
                isExist = true;
            }          
        }
        return isExist;
    },
    getUniqueRecords : function(component, event,responseArray){
        var uniqueContacts = [];
        if(responseArray.length > 0){
            uniqueContacts.push(responseArray[0]);
        }
        for(var i = 0;i < responseArray.length; i++){
            var accId = responseArray[i].Opportunity.Id; 
            if(!this.isExist(component,event,accId,uniqueContacts)){                                                                             
                uniqueContacts.push(responseArray[i]);                                         
            }                       
        }
        return uniqueContacts;
    }
})