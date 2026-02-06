({
	Select : function(component, event, helper) {
        
        var selectedContact = event.currentTarget;
        var contactId = selectedContact.dataset.record;     
        
		var cmpEvent = component.getEvent('contactSearchBGHMemberContact');
        cmpEvent.setParams({'contactId' : contactId});
        cmpEvent.fire();
	}
})