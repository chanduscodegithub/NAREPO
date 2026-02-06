({
    doInit : function(component, event, helper) {        
        var getInputText = component.get("v.inputKeyWord"); 
            var count = getInputText.length;
            var charLeft = 255 - count;
            component.set("v.count",charLeft);            
        
    },
    
    doCalculation : function(component, event){
        var getInputText = component.get("v.inputKeyWord"); 
        console.log('getInputText-->>'+getInputText);
        var count = getInputText.length;
        var charLeft = 255 - count;
        component.set("v.count",charLeft);
    },
    
    removeCustomLookUp: function(component, event, helper) {
        var compEvent = component.getEvent("removeCustomLookUpSeniorUHGEevnt");
        compEvent.fire();
    },
    
    inputTextCounter : function(component, event, helper) {
        var getInputText = component.get("v.inputKeyWord");
        var count = getInputText.length;
        var charLeft = 255 - count;
        component.set("v.count",charLeft);
    },
    
    clearFields : function(component, event, helper){
        var fieldsToClear = component.find('textAreaCounter');
        for(var j = 0; j < fieldsToClear; j++){
            fieldsToClear[j].set("v.value", "");
        }
    }
})