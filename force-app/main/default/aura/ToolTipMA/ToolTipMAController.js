({
    display : function(component, event, helper) {
        if(component.get('v.iTag') != null && component.get('v.iTag') != undefined && component.get('v.iTag') != ''){
            if(component.get('v.iTag').includes("Sales_Stage")){
                $A.util.addClass(component.find("tooltip"), "tooltip-lg");
            }else{
                $A.util.removeClass(component.find("tooltip"), "tooltip-lg");
            } 
        }
        $A.util.removeClass(component.find("tooltip"), "slds-hide");
    },    
    displayOut : function(component, event, helper) {
        $A.util.addClass(component.find("tooltip"), "slds-hide");
    },
    stopEvent : function(component, event, helper) {
        event.stopPropagation();
    } 
})