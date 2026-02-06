({
	doInit:function(component, event, helper){
        //helper.defineSobject(component, event);        
            var PoliciesList = component.get('v.PoliciesList');
            var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
            var ischeckboxchecked = component.get('v.serviceAMTObj.All_Policy__c');
            //console.log('ischeckboxchecked before set'+ischeckboxchecked);
			component.set('v.isCheckBoxChecked',ischeckboxchecked);
             //console.log('ischeckboxchecked'+ischeckboxchecked);
            var PoliciesListNames = [];
            if(PoliciesList != null && PoliciesList != undefined){
                for(var i = 0 ; i < PoliciesList.length ; i++){
                    PoliciesListNames.push(PoliciesList[i].Name);
                }
                if(PoliciesListNames != null && PoliciesListNames.length != 0){
                    component.set('v.PoliciesListNames',PoliciesListNames);
                }                
            }      
    },
    expandCollapse: function(component, event, helper) {        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){            
            component.set('v.isExpand',true);
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            if(component.get('v.isEditAccess')){
                component.find("addMedicalCarrier").set("v.disabled",false);
            }            
            helper.getServiceAMTRecords(component, event);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.set('v.isExpand',false);
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    },
    editMedicalCarrier: function(component, event, helper) {        
        $A.util.addClass(component.find("editMedicalCarrier"),"hide");
        //component.find("addMedicalCarrier").set("v.disabled",true);        
        $A.util.removeClass(component.find("saveMedicalCarrier"),"hide");
        $A.util.removeClass(component.find("cancelMedicalCarrier"),"hide");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i++) { 
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }
        
        var removeLinks = component.find("cancelLink");
        if (removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i++) { 
                    $A.util.addClass(removeLinks[i],"hide");
                }
            }else{
                    $A.util.addClass(removeLinks,"hide");
            }
        }               
    },
    cancelMedicalCarrier : function(component, event, helper) {      
        $A.util.addClass(component.find("saveMedicalCarrier"),"hide");        
        component.find("addMedicalCarrier").set("v.disabled",false);  
        $A.util.removeClass(component.find("editMedicalCarrier"),"hide");
        $A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
        helper.getServiceAMTRecords(component, event);
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i++) { 
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }              
        // component.set("v.compLandscapeMedicalData",component.get("v.compLandscapeMedicalDataCopy"));
    }
})