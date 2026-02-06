({
    doinit2:function(component, event, helper){
        helper.defineSobject(component, event);
    },
    
    editRecords : function(component, event, helper) {
        debugger;
       
        component.set('v.isEditable',true);
        
          var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('addBtn').set("v.disabled", true);
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        //component.find('editBtn').set("v.disabled", true); 
       
        //helper.editFields(component, event);
    },
    
    cancel : function(component, event, helper) {
        component.set('v.isEditable',false);
          var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            component.find('editBtn').set("v.disabled", false);
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-show');
            $A.util.removeClass(component.find("saveCancel"), 'show');
        } else {
            component.find('addBtn').set("v.disabled", false);
            component.find('editBtn').set("v.disabled", false);
            $A.util.removeClass(component.find("saveBtn"), 'slds-show');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-show');
        }
        //helper.cancelChanges(component, event);
    },
    
    expandCollapse: function(component, event, helper) {
        
        if(component.get("v.isDeviceIconsToBeEnabled"))return;
       // console.log('hello')
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            //On Expansion of Applet, the data will be loaded.
            var sortIconsArray = ["sortLastNameAsc","sortFirstNameAsc","sortJobTitleAsc","sortStartDateAsc","sortEndDateAsc","sortSCECoachAsc"];
            for(var i=0;i<sortIconsArray.length;i++) {
                component.set("v."+sortIconsArray[i], true);                                
            }
            helper.getServiceAMTRecords(component, event);
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
            //if(isLoggedInUserRoleVal != null && isLoggedInUserRoleVal) {
            if(component.find('addBtn') != undefined && component.find('addBtn') != null) {
                component.find('addBtn').set("v.disabled", false); 
            }
            if(component.find('editBtn') != undefined && component.find('editBtn') != null) {
                component.find('editBtn').set("v.disabled", false); 
            }
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');    
            //}
        }
    }
})