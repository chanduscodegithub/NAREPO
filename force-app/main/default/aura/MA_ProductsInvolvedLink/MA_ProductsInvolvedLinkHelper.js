({
    fetchPickListVal: function(component, fieldName, elementId) {
        var action = component.get("c.getSelectedList");
        action.setParams({
            "objObject":component.get("v.objInfo"),
            "fld" : "Product_Type_Involved_in_Opp__c",
            "oppId" : component.get("v.MA_ProductsInvolvedObj").OppId
        });  
        var opts = [];
        action.setCallback(this, function(response) {
            console.log('hello')
            if (response.getState() == "SUCCESS") {
                var allValues = response.getReturnValue();
                
                
                for (var i = 0; i < allValues.alloptions.length; i++) {
                    opts.push({
                        class: "optionClass",
                        label: allValues.alloptions[i],
                        value: allValues.alloptions[i]
                    });
                }
                component.find("updateMP").set("v.options", opts);
                component.find("updateMP").set("v.value",allValues.selectedoption);
                component.set("v.selected","");
                component.set("v.selected",allValues.selectedoption);
                component.set("v.listToCompareChanges",allValues.selectedoption);
                
            }
        });
        $A.enqueueAction(action);
    },
    saveme:function(component, fieldName, finalSelectedValues,ispickvalchanged) {
        var action = component.get("c.settingSelectedList");     
        console.log('in saveme function')
        action.setParams({
            "fld": finalSelectedValues,
            "oppId":component.get("v.MA_ProductsInvolvedObj").OppId,
            "ispickvalchanged" : ispickvalchanged,
            "removedValue" : component.get("v.productTypeRemoved")
            
        });
        action.setCallback(this, function(response) {
            if (response.getState() == "SUCCESS") {
                component.set('v.isproductsInvolvedRemoved',true);
                var buttonId = component.find('popup');
                $A.util.addClass(buttonId, 'slds-hide');
                $A.util.removeClass(buttonId, 'slds-show');                
                $A.get('e.force:refreshView').fire();
                
                var appEvent =  $A.get("e.c:MA_SAVE_SUCCESS");
                appEvent.setParams({
                    "refresh_ES":true
                });
                appEvent.fire();
            }
        });
        $A.enqueueAction(action);
        
    }
    
})