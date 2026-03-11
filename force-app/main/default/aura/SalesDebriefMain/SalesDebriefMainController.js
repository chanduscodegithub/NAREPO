({
	 handleNotifyChange: function(component, event, helper) {
        console.log("Inside 1nd Change");
      const unsaved = component.find("unsaved");
        unsaved.setUnsavedChanges(true, { label: 'Sales Debrief' });
        window.onbeforeunload = function() {
            return "You have unsaved changes. Are you sure you want to leave?";
        };
    },
    
    handleNotifySave: function(component, event, helper) {
        const unsaved = component.find("unsaved");
        unsaved.setUnsavedChanges(false);
        

        window.onbeforeunload = null;
    },
    
    handleSave: function(component, event, helper) {
        //alert('Logic to save data triggered from Salesforce Dialog');
        var salesBrief = component.find('salesDebriefComp');
        salesBrief.handleSave();
        helper.clearStatus(component);
    },

    handleDiscard: function(component, event, helper) {
        helper.clearStatus(component);
    }
})