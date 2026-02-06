({
    searchHelper : function(component,event,getInputkeyWord) {
        var listOfSearchRecords =[];
        var listOfRemaingSearchRecords = [];
        var action = component.get("c.fetchLookUpValues");
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'recordId' : component.get("v.recordId")
            
        });
        action.setCallback(this, function(response) {
            $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                    component.set("v.listOfSearchRecords", '');
                } else {
                    component.set("v.Message", '');
                    if(!storeResponse[0].hasOwnProperty('Last_Name__c')){
                        component.set("v.listOfSearchRecords", storeResponse);
                        
                    } else {
                        for(var i=0; i<storeResponse.length; i++){
                            if(storeResponse[i].hasOwnProperty('Last_Name__c')){
                                var item = {};
                                item.Name = storeResponse[i].Name + ' ' +storeResponse[i].Last_Name__c;
                                item.Id = storeResponse[i].User__c;
                                listOfSearchRecords.push(item);
                                //listOfSearchRecords.push(storeResponse[i].Name.concat(' ',storeResponse[i].Last_Name__c));
                            } else {
                                listOfRemaingSearchRecords.push(storeResponse[i]);
                            }
                        }
                        var finalSetOfRecords = listOfSearchRecords.concat(listOfRemaingSearchRecords);
                        component.set('v.listOfSearchRecords',finalSetOfRecords);
                    }
                }
                //component.set("v.listOfSearchRecords", storeResponse);
            }
            
        });
        $A.enqueueAction(action);
        
    },
    
    
    searchHelperSalesPerson1 : function(component,event,getInputkeyWord) {
        var listOfSearchRecords =[];
        var listOfRemaingSearchRecords = [];
        var action = component.get("c.fetchLookUpValues");
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'recordId' : component.get("v.recordId")
            
        });
        action.setCallback(this, function(response) {
            $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                    component.set("v.listOfSearchRecordsSalesPerson1", '');
                } else {
                    component.set("v.Message", '');
                    if(!storeResponse[0].hasOwnProperty('Last_Name__c')){
                        component.set("v.listOfSearchRecordsSalesPerson1", storeResponse);
                        
                    } else {
                        for(var i=0; i<storeResponse.length; i++){
                            if(storeResponse[i].hasOwnProperty('Last_Name__c')){
                                var item = {};
                                item.Name = storeResponse[i].Name + ' ' +storeResponse[i].Last_Name__c;
                                item.Id = storeResponse[i].User__c;
                                listOfSearchRecords.push(item);
                                //listOfSearchRecords.push(storeResponse[i].Name.concat(' ',storeResponse[i].Last_Name__c));
                            } else {
                                listOfRemaingSearchRecords.push(storeResponse[i]);
                            }
                        }
                        var finalSetOfRecords = listOfSearchRecords.concat(listOfRemaingSearchRecords);
                        component.set('v.listOfSearchRecordsSalesPerson1',finalSetOfRecords);
                    }
                }
                //component.set("v.listOfSearchRecords", storeResponse);
            }
            
        });
        $A.enqueueAction(action);
        
    },
    
    
})