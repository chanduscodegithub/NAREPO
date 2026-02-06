({
	Select : function(component, event, helper) {
  		console.log('------select');
        var selectedItem = event.currentTarget;
     	var contactIDToAdd = selectedItem.dataset.record;
        
		var cmpEvent = component.getEvent("accountSearchConsultantTableEvent");
        //cmpEvent.setParams({"consultingSearchArr":component.get('v.consultingSearchArray')});
        cmpEvent.setParams({'contactId' : contactIDToAdd, "primaryConsultantExists" : component.get('v.isPrimaryExists')});
        cmpEvent.fire();
	}
})