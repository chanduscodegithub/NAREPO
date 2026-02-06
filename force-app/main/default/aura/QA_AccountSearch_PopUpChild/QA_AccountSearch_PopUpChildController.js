({
	selectRecord : function(component, event, helper) {
		var compEvent = component.getEvent("QA_AccountSearchPopUpEvent");
        compEvent.setParams({"AccountData":component.get('v.accountData')});
        compEvent.fire();
	}
})