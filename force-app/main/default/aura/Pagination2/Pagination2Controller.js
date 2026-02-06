({
	previousPage : function(component, event, helper) {
        var myEvent = component.getEvent("pageChange1");
        myEvent.setParams({ "direction": "previous","ModalPagination":component.get('v.ModalPagination')});
        myEvent.fire();
	},
    
	nextPage : function(component, event, helper) {
        var myEvent = component.getEvent("pageChange1");
        myEvent.setParams({ "direction": "next","ModalPagination":component.get('v.ModalPagination')});
        myEvent.fire();
	}
})