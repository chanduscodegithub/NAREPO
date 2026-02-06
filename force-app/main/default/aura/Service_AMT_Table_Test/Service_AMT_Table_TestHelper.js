({
   enableFields : function(component, event) {
        component.set('v.isEditable', true);
       /* var fieldsToBeEnabled = component.find('editableField');
        if(fieldsToBeEnabled != null && fieldsToBeEnabled != 'undefined') {
            if(Array.isArray(fieldsToBeEnabled)) {
                for(var i=0;i<fieldsToBeEnabled.length;i++) {
                    fieldsToBeEnabled[i].set("v.disabled", false);
                }
            } else {
                fieldsToBeEnabled.set("v.disabled", false);
            }
        }*/
       
    },
    
    
    disableFields : function(component, event) {
        component.set('v.isEditable', false);
        /*var fieldsToBeDisabled = component.find('editableField');
        if(fieldsToBeDisabled != null && fieldsToBeDisabled != 'undefined') {
            if(Array.isArray(fieldsToBeDisabled)) {
                for(var i=0;i<fieldsToBeDisabled.length;i++) {
                    fieldsToBeDisabled[i].set("v.disabled", true);
                }
            } else {
                fieldsToBeDisabled.set("v.disabled", true);
            }
        }*/
    },
   
    defineSobject : function (component,event){
       // alert('child compo');
        var action = component.get("c.defineSobjectType");
        
        action.setParams({'accId' : component.get("v.recordId")
                         });
        action.setCallback(this, function(response){
            var state = response.getState();
            
            if(state === 'SUCCESS'){
                if(response !='Account'){
                    component.set('v.sobjectusedAccount',false);
                  
                     if(!component.find('sobjectusedAccount')){
                        
                       
                    var deleteIconVal = component.find('divToHide');
                    $A.util.addClass(deleteIconVal, 'slds-hide');
                    $A.util.removeClass(deleteIconVal, 'slds-show');
                }
                else{
                  
                    var deleteIconVal = component.find('divToHide');
                    $A.util.removeClass(deleteIconVal, 'slds-hide');
                    $A.util.addClass(deleteIconVal, 'slds-show');
                }
                }
                $A.enqueueAction(action);
               
            }
        });
        
        
    }
})