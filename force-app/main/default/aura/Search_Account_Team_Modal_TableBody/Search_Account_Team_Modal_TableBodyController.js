({
	SelectUserRecord : function(component, event, helper) {
		var cmpEvent = component.getEvent("addAccountTeamEvent");
        cmpEvent.setParams({"selectedUserData":component.get('v.UserSearchObject')});
        cmpEvent.fire();
	}
})