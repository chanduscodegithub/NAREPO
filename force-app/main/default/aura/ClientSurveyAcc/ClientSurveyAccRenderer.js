({
	afterRender: function (component,event, helper) {
    	this.superAfterRender();
        component.set("v.opportunityMap", {});
        //$A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        event.getData(component, event, null, null);     	 
	}
})