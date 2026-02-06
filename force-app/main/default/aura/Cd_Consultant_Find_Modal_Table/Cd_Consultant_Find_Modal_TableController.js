({
	Select : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
     	var consultantIdToAdd = selectedItem.dataset.record;

console.log('===='+consultantIdToAdd);        
		var cmpEvent = component.getEvent('accountSearchConsultantFindTableEvent');
		//cmpEvent.setParams({'consultantId' : consultantIdToAdd});
        cmpEvent.setParams({'consultantId' : consultantIdToAdd});
        cmpEvent.fire();
	}
})