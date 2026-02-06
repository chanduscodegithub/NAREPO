({
    searchHelper : function(component, event, getInputkeyWord) {
        
        var action = component.get("c.getAccountNames");
        action.setParams({
            'searchKeyWord': getInputkeyWord
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                
                if (storeResponse.length == 0 || storeResponse == null || storeResponse == []) {
                    component.set("v.Message", 'No Result Found...');
                    component.set("v.listOfSearchRecords", null);
                    
                } 
                else {                    
                    component.set("v.Message", 'Search Result...');
                    var allNamesRecords = [];
                    
                    var result = [];
                    for (var i = 0; i < storeResponse.length; i++) {
                        if (result.indexOf(storeResponse[i]) == -1) {
                            result.push(storeResponse[i]);
                        }
                    }
                    
                    for(var j = 0; j < result.length; j++){
                        var nameRecord = {"Id":result[j].Id,"Name" : result[j].Name};
                        allNamesRecords.push(nameRecord); 
                    }
                    
                    component.set("v.listOfSearchRecords", allNamesRecords);
                }
            }else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    component.set('v.isSpinnertoLoad', false);
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
                }
            
        });
        $A.enqueueAction(action);
    },
    getAccountData: function(component, event,helper) {
        var accountId = component.get("v.accountId");
        var action = component.get("c.getAccountDetails");
        action.setParams({
            "accountId": accountId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.SearchKeyWord", response.getReturnValue().Name);
                component.set("v.selectedRecord", response.getReturnValue());
            }
        });
        
        $A.enqueueAction(action);
    }
})