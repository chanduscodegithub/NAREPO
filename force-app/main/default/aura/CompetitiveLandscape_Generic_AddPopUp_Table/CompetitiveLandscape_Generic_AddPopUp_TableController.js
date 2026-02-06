({
	doInit : function(component, event, helper) {
		
	},
    
    readCards : function(component, event, helper){
        console.log('readcards');
        var selectedRec = event.currentTarget;
        var dept = selectedRec.dataset.record;
        var recordId = selectedRec.id;
        var checkedUnchecked = selectedRec.checked;
        var category = selectedRec.dataset.category;
        
        var cmpEvent = component.getEvent("getUpdatedCards");
        cmpEvent.setParams({"competitorsData": component.get('v.competitorsArray')});
        cmpEvent.setParams({"departMent": dept});
        cmpEvent.setParams({"addRemove" : checkedUnchecked});
        cmpEvent.setParams({"recordId" : recordId});
        cmpEvent.setParams({"category" : category});
        
        cmpEvent.fire();
    }
})