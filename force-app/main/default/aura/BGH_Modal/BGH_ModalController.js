({
    doInit : function(component, event, helper) {
        var Child_Data = component.get('v.Child_Data');
        component.set('v.isContact', Child_Data.isContact);
        helper.getAccountBusinessGroupsData(component, event, Child_Data);
    },
    
    cancelBgPopup: function(component, event, helper) {
        var cmpEvent = component.getEvent("addBGroupEvent");
        cmpEvent.setParams({"clicked":true});
        cmpEvent.fire();
    },
    
    saveBgPopup : function(component, event, helper) {
        var cmpEvent = component.getEvent("addBGroupEvent");
        cmpEvent.setParams({"selectedBusinessGroup":component.get('v.selectedAddPopupBGHIds'),"clicked":false});
        cmpEvent.fire();
    },
    
    addSelectedBGH: function(component, event, helper) {
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var saveBGH = component.find('saveBGH');
        var selectedAddPopupBGHIds = component.get('v.selectedAddPopupBGHIds');
       
        var checkBoxCount = component.get('v.checkBoxCount');
        if(event.getParam('selectedBGH')){            
            selectedAddPopupBGHIds = selectedAddPopupBGHIds.filter(function(e) { return e !== event.getParam('BGHId') });
            checkBoxCount = checkBoxCount - 1;
        }else{
            selectedAddPopupBGHIds.push(event.getParam('BGHId'));
            checkBoxCount = checkBoxCount +1;
        }
        component.set('v.checkBoxCount',checkBoxCount);
        if(checkBoxCount == 0){            
        	saveBGH.set("v.disabled",true);                
        }else{                        
            saveBGH.set("v.disabled",false);
        }
        component.set('v.selectedAddPopupBGHIds',selectedAddPopupBGHIds);
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length; i = i+1){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
})