({
    displayOpportunities : function(component, event,page) {
        
        var generateXML = component.find('generateXML');
        $A.util.addClass(generateXML, 'slds-hide');
        $A.util.removeClass(generateXML, 'slds-show');         
        var action = component.get("c.returnListOfOpportunitiesForDisplay");
         page = page || 1; 
        action.setParams({
            "maType" : "CmType",
            "page" : page
        });
        // component.set('v.selectedrefoppt',null);
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log(state);
            if (state === "SUCCESS") {
                var data = response.getReturnValue();
                 var index = 0;
                if(data.opportunityList != null){
                     index = data.opportunityList.length;
                }
               
                console.log(data);
                component.set("v.index",index)
                if(index > 0){
                    component.set('v.isSearchedResultEmpty', false);
                }else{
                    component.set('v.isSearchedResultEmpty', true);
                }
               // component.set("v.opportunities", data);
                
                component.set("v.opportunities", data.opportunityList);
                component.set("v.page", data.page);
                component.set("v.total", data.total);
                component.set("v.pages", Math.ceil(data.total/data.pageSize));
                
               
                
                
            }else if (state === "INCOMPLETE") {
                $A.get('e.force:refreshView').fire();
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
        
    }
})