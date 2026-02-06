({
    doinit : function(component, event, helper) {
        helper.onLoadOfPage(component, event);
    }, 
    
    EnableInput : function(component, event, helper) {
        component.set('v.enableInput', true);
        
    },
    
    disableInput : function(component, event, helper) {
        helper.onLoadOfPage(component, event);
        component.set('v.enableInput', false);
    },
    
    saveData : function(component, event, helper) {
        helper.updateAcc(component, event);
        component.set('v.enableInput', false);
    },
    
})