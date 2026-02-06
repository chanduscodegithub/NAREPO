({
	Select : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
     	var accIDToAdd = selectedItem.dataset.record;
        
        var cmpEvent = component.getEvent('ConsultantingFirmSearchTableEvent');
        cmpEvent.setParams({'accountId' : accIDToAdd});
        cmpEvent.fire();
	}
})