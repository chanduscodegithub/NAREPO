({
	onpresscancel : function(component, event, helper) {
        var buttonId = component.find('popup');
        $A.util.addClass(buttonId, 'slds-hide');
        $A.util.removeClass(buttonId, 'slds-show');
        
    }
})