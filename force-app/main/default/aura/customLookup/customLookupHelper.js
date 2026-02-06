({
    searchHelper : function(component, event, getInputkeyWord) {
        var designation = component.get('v.designation');
        
        var action = component.get("c.getSeniorUHGExecutiveNames");
        action.setParams({
            'searchKeyWord': getInputkeyWord, 
            'designation' : designation
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
                    //console.log('search Results--->>'+JSON.stringify(storeResponse));
                    
                    component.set("v.Message", 'Search Result...');
                    var allNamesRecords = [];
                    
                    var result = [];
                    for (var i = 0; i < storeResponse.length; i++) {
                        if (result.indexOf(storeResponse[i]) == -1) {
                            result.push(storeResponse[i]);
                        }
                    }
                    
                    for(var j = 0; j < result.length; j++){
                        var nameRecord = {"Name" : result[j]};
                        allNamesRecords.push(nameRecord); 
                    }
                    
                    component.set("v.listOfSearchRecords", allNamesRecords);
                    
                    /* for(var i in storeResponse){
                        
                        if(designation == 'enterpriseExecutives'){
                            var executiveName = storeResponse[i].EnterpriseExecutiveSponsorName__c;    
                        }
                        if(designation == 'optumExecutives'){
                            var executiveName = storeResponse[i].OptumExecutiveSponsorName__c;    
                        }
                        if(designation == 'UHCExecutives'){
                            var executiveName = storeResponse[i].UHCExecutiveSponsorName__c;    
                        }   
                        
                        if(i != "Id"){
                            var nameRecord = {"Name" : executiveName};
                            allNamesRecords.push(nameRecord);    
                        }
                    }*/
                }
                
                //alert('allNamesRecords'+JSON.stringify(allNamesRecords));
                
                /*if(allNamesRecords == []){
                    var uniqueNames = [];
                    for(var i = 0; i < allNamesRecords.length; i++){
                        if(uniqueNames.indexOf(allNamesRecords[i].Name) === -1){
                            uniqueNames.push(allNamesRecords[i].Name);
                        }
                    }
                    
                    var listOfUniqueNames = [];
                    for(var j in uniqueNames){
                        var uniqueName = {"Name" : uniqueNames[j]};
                        listOfUniqueNames.push(uniqueName);
                    }
                }
                
                
                //alert('uniqueNames'+JSON.stringify(listOfUniqueNames));
                
                component.set("v.listOfSearchRecords", listOfUniqueNames);*/
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
                    //component.set('v.isSpinnertoLoad', false);
                }
            
        });
        $A.enqueueAction(action);
    }
})