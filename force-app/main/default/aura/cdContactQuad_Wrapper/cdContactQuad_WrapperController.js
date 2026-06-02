(
    {
        handleSuccess : function(component, event, helper) {
            component.set('v.message','Record updated successfully!.')
            component.set("v.showMessage", true);
            
            var closeQA = $A.get("e.force:closeQuickAction");
            
            setTimeout(function() {
                component.set("v.showMessage", false);
                closeQA.fire();
            }, 2000);
        },
        
        handleClose : function(component, event, helper) {
            $A.get("e.force:closeQuickAction").fire();
        },    
        
        
        handlefailure : function(component, event, helper) {
            component.set('v.message','Something went wrong. Please contact admin.');  
            component.set("v.showMessage", true);
            
            /*var closeQA = $A.get("e.force:closeQuickAction");
            
            setTimeout(function() {
                component.set("v.showMessage", false);
                closeQA.fire();
                
            }, 2000);*/
        }
    })