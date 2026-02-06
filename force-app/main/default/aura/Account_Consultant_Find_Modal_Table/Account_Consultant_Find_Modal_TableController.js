({
	Select : function(component, event, helper) {
		var cmpEvent = component.getEvent('accountSearchConsultantFindTableEvent');
        cmpEvent.fire();
	}
})