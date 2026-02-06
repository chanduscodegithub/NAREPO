({
	selectRecord : function(component, event, helper) {
		var compEvent = component.getEvent("nationalAccountSalesTeamUserModalEvent");
        compEvent.setParams({"cmAccountTeamHistoryData1":component.get('v.userData')});
        compEvent.fire();
	}
})