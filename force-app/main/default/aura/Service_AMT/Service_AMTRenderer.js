({
	afterRender: function (component, helper) {
    	this.superAfterRender();
        component.set("v.accId",component.get('v.recordId'));    	 
	}
})