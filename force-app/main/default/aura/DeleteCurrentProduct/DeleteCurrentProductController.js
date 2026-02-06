({
	onpresscancel : function(component, event, helper) {
        debugger;
        var buttonId = component.find('popup');
        $A.util.addClass(buttonId, 'slds-hide');
        $A.util.removeClass(buttonId, 'slds-show');
        component.set('v.ShowComponent',false);
        var CurrentProductEvent = component.getEvent('CurrentProductEvent');
        CurrentProductEvent.setParams({'ShowComponent': component.get('v.ShowComponent')});
        CurrentProductEvent.fire();
    },
    
    Delete : function(component, event, helper) {
        debugger;
        console.log('Delete');
        var CPId = component.get('v.delrecordId');
        console.log('Current Product Id '+CPId);
        var CurrentProductEvent = component.getEvent('CurrentProductEvent');
        CurrentProductEvent.setParams({'CPId' : CPId});
        CurrentProductEvent.fire();
        
    }
})