({
    doInit : function(component, event, helper) { 
        component.set("v.modalcssStyle", ".slds-global-header_container{position:static} body.desktop{overflow:hidden} .forceStyle.desktop .viewport .stage{position:relative;z-index: 99}");        
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.addClass(ErrorMessage[i], 'slds-show');
            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
        }
    },
    fireComponentEvent : function(cmp, event) {
        var cmpEvent = cmp.getEvent("alerterrorcmpCloseEvent");
        cmpEvent.setParams({
            "refresh" : cmp.get("v.refreshOnClosingModel") });
        cmpEvent.fire();
    },
    alerterrorClose : function(component, event, helper) {
        console.log('close modal');
        component.set("v.modalcssStyle", ".slds-global-header_container{position:fixed} body.desktop{overflow:visible} .forceStyle.desktop .viewport .stage{position:relative;z-index: 2}");        
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0; i<=ErrorMessage.length; i++){
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
        }
    },
})