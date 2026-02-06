({
	Select : function(component, event, helper) {
        console.log('in search pop up table',component.get('v.existingServiceRecords'));
        var cmpEvent = component.getEvent("service_amt_Popup_table_event");
        cmpEvent.setParams({'userObj' : component.get('v.userSearchArray'),
                            'isUser' : component.get('v.isUser'),
                            'existingServiceAmt' : component.get('v.existingServiceRecords'),
                            });
        console.log('cmpEvent--',cmpEvent);
        cmpEvent.fire();
	}
})