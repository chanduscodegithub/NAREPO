({
    doInit:function(component, event, helper) {
        var officeLocation = component.get('v.contactOfTypeConsultantObj.MailingCity') != null && component.get('v.contactOfTypeConsultantObj.MailingCity').length > 0 ? component.get('v.contactOfTypeConsultantObj.MailingCity'):'';
        officeLocation = component.get('v.contactOfTypeConsultantObj.MailingStateCode') != null && component.get('v.contactOfTypeConsultantObj.MailingStateCode').length > 0 ? officeLocation+','+component.get('v.contactOfTypeConsultantObj.MailingStateCode'):'';
		console.log('loggededdd');
        component.set('v.officeLocation',officeLocation);		
	},
	Select : function(component, event, helper) {
		var cmpEvent = component.getEvent("searchConsultantModalTableEvent");
        cmpEvent.setParams({"contactOfTypeConsultantObjId":component.get('v.contactOfTypeConsultantObj.Id')});
        cmpEvent.fire();
	}
})