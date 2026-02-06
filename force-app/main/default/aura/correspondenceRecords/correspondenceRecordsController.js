({
	doInitAction : function(component, event, helper) {
		console.log('Create Campaign Records ');
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        helper.insertRecords(component, event, helper);
	},
    
    closePopUp : function(component, event, helper) {
        component.set('v.displayMsg','');
        component.set('v.showMsg',false);
        $A.get("e.force:closeQuickAction").fire(); 
    }
})