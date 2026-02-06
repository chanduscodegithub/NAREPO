({
    doInit : function(component, event, helper){
        component.set('v.maId', component.get('v.Child_Data'));
    },
    
    SaveUser : function(component, event, helper){
        
        var isEmptyValExists = false;
        var itagList = $A.get("$Label.c.AddAMTUsersMandatoryField");
        var itagListarray = itagList.split(',');
        console.log(itagListarray);
        
        for(var i=0;i<itagListarray.length;i++){
            var fieldComp = component.find(itagListarray[i]);
            if(fieldComp != undefined && fieldComp != null ){
                var fieldval = fieldComp.get('v.value');
                var fieldvalue = fieldval.trim();
                
                if(fieldvalue == undefined || fieldvalue == null || 
                   (fieldvalue != undefined && fieldvalue != null && fieldvalue == '')) {
                    $A.util.addClass(component.find(itagListarray[i]), "mandatoryFields");
                    $A.util.addClass(component.find(itagListarray[i]+'Div'), "slds-has-error");
                    $A.util.removeClass(component.find(itagListarray[i]+'Div1'), "slds-hide");
                    isEmptyValExists = true;
                } else {
                    $A.util.removeClass(component.find(itagListarray[i]), "mandatoryFields");
                    $A.util.removeClass(component.find(itagListarray[i]+'Div'), "slds-has-error");
                    $A.util.addClass(component.find(itagListarray[i]+'Div1'), "slds-hide");
                }
            } 
        }
        
        if(isEmptyValExists == false) {
            
            helper.SaveUser(component, event);
        }  
        
    }
    ,
    
    cancelNClose : function(cmp, event) {
        var cmpEvent = cmp.getEvent("modalCmpCloseEvent1");
        cmpEvent.setParams({
            "refresh" : cmp.get("v.refreshOnClosingModel"),
            "closeChildPopup" : true});
        cmpEvent.fire();
    },
    
    onChange : function(component, event) {
        
        var fieldItag = event.getSource().getLocalId();
        var fieldComp = component.find(fieldItag);
        if(fieldComp != undefined && fieldComp != null ){
            var fieldvalue = fieldComp.get('v.value');
            if(fieldvalue == undefined || fieldvalue == null || 
               (fieldvalue != undefined && fieldvalue != null && fieldvalue == '')) {
                $A.util.addClass(component.find(fieldItag), "mandatoryFields");
                $A.util.addClass(component.find(fieldItag+'Div'), "slds-has-error");
                $A.util.removeClass(component.find(fieldItag+'Div1'), "slds-hide");
            } else {
                $A.util.removeClass(component.find(fieldItag), "mandatoryFields");
                $A.util.removeClass(component.find(fieldItag+'Div'), "slds-has-error");
                $A.util.addClass(component.find(fieldItag+'Div1'), "slds-hide");
            }
        }
    },
    closeErrorModal : function(component,helper,event){
        //helper.handlehide(component, event);
    }
    
})