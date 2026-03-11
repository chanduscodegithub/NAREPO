({
    handleNotifyChange: function(component, event, helper) {
        console.log("Inside 1nd Change");
      const unsaved = component.find("unsaved");
        unsaved.setUnsavedChanges(true, { label: 'Contact Form' });
        console.log("Inside2nd Change");
        window.onbeforeunload = function() {
            return "You have unsaved changes. Are you sure you want to leave?";
        };
    },

    handleNotifySave: function(component, event, helper) {
        console.log("Inside 1nd save");
        const unsaved = component.find("unsaved");
        unsaved.setUnsavedChanges(false);
        

        window.onbeforeunload = null;
    },

    handleSave: function(component, event, helper) {
        alert('Logic to save data triggered from Salesforce Dialog');
        helper.clearStatus(component);
    },

    handleDiscard: function(component, event, helper) {
        helper.clearStatus(component);
    }
})