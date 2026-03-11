({
	clearStatus : function(component) {
        const unsaved = component.find("unsaved");
        unsaved.setUnsavedChanges(false);
        window.onbeforeunload = null;
    }
})