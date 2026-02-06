({
    checkboxSelect: function(component, event, helper) 
    {
        var recordId = component.get('v.opprtuntyPrdctAndRnwlStatusRcrd.recordId');
        var salesIncentivesExportTableEvent = component.getEvent("salesIncentivesExportTableEvent");
        salesIncentivesExportTableEvent.setParams({ "checkBoxValue": event.getSource().get("v.value"),"recordID":recordId});
        salesIncentivesExportTableEvent.fire();
    },
    
})