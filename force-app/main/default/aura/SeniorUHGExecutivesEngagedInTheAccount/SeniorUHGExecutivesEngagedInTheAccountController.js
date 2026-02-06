/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-23-2024
 * @last modified by  : Spoorthy
**/
({
    doInit : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    helper.getLoggedInUserRole(component, event, helper);
                }            
            }, 5000);           
        }else{
            component.set('v.isSpinnertoLoad', true);
            helper.getLoggedInUserRole(component, event, helper);
        }   
    },
    
    scrollBottom: function(component, event, helper){	        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
        	var isScrollStop = component.get("v.isScrollStop");
        	component.set("v.isStop",component.get("v.isStop")+1);                    
        	if(isScrollStop){                       
            
            var actionBar = component.find("action-bar-mobile");               	           
            $A.util.addClass(actionBar,"slds-hide");    
                        
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                                              
            }
        } 
    },
    
    setGeneralValues: function(component, event, helper){			
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                /*if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['SeniorUHG'] != null){
                    component.set('v.isLoggedInUserValid',generalObj.userEditAccessMap['SeniorUHG']);

                }*/
                if(generalObj.HasEditAccess != null){                                        
                    component.set('v.isLoggedInUserValid',generalObj.HasEditAccess);                    
                }
                else{
                    helper.getLoggedInUserRole(component, event, helper);
                }
            }else{
               helper.getLoggedInUserRole(component, event, helper);
            }  
        }else{            
            helper.getLoggedInUserRole(component, event, helper);
        }              
    },	
    
    closeCustomLookUp: function(component, event, helper) {
        var Enterprise_Executive_Sponsor = component.find('Enterprise_Executive_Sponsor');
        Enterprise_Executive_Sponsor.removeCustomLookUpMethod();
        var Optum_Executive_Sponsor = component.find('Optum_Executive_Sponsor');
        Optum_Executive_Sponsor.removeCustomLookUpMethod();
        var Surest_Executive_Sponsor = component.find('Surest_Executive_Sponsor');
        Surest_Executive_Sponsor.removeCustomLookUpMethod();
        var UHC_Executive_Sponsor = component.find('UHC_Executive_Sponsor');
        UHC_Executive_Sponsor.removeCustomLookUpMethod();
    },
    
    closeSearchPopup : function(component, event, helper) {
        var Enterprise_Executive_Sponsor = component.find('Enterprise_Executive_Sponsor');
        Enterprise_Executive_Sponsor.closeSearchPopupMethod();
        
    },
    
    getTypedValue: function(component, event, helper) {

    },
    
    expandCollapse: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            
            helper.getExecutiveRecords(component);
            
            
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            
            if(component.get('v.isLoggedInUserValid') == true){
                component.find("editExecutive").set("v.disabled", false);
                
                $A.util.addClass(component.find("saveExecutive"),"hideShow");
                $A.util.addClass(component.find("cancelExecutive"),"hideShow");    
            }
            
            if(component.get('v.enableEditMode') == true){
                $A.util.addClass(component.find("saveExecutive"),"hideShow");
                $A.util.addClass(component.find("cancelExecutive"),"hideShow");
                var editTextAreas = component.find('editMode');
                var readModeAreas = component.find('readMode');
                for(var i in editTextAreas){
                    $A.util.toggleClass(editTextAreas[i], 'readMode');
                    $A.util.toggleClass(readModeAreas[i], 'editMode');
                }
            }
            
            component.set('v.enableEditMode', false);
            helper.resetFields(component);
        }
        
        
    },
    
    saveExecutive: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){
            $A.util.addClass(component.find("saveCancel"),"hide");
        }
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        component.find("editExecutive").set("v.disabled",false);
        
        $A.util.addClass(component.find("saveExecutive"),"hideShow");
        $A.util.addClass(component.find("cancelExecutive"),"hideShow");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i in editTextAreas){
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }
        
        component.set('v.enableEditMode', false);
        
        if(JSON.stringify(component.get('v.seniorUhgExecutives')) != "{}") {
            //console.log('going to save!!');
            helper.saveExecutiveRecords(component);   
            //console.log('going to fetch!!');
            //helper.getExecutiveRecords(component);
        }
        
        var Enterprise_Executive_Sponsor = component.find('Enterprise_Executive_Sponsor');
        Enterprise_Executive_Sponsor.closeSearchList();
        
        var Optum_Executive_Sponsor = component.find('Optum_Executive_Sponsor');
        Optum_Executive_Sponsor.closeSearchList();
        
        var Surest_Executive_Sponsor = component.find('Surest_Executive_Sponsor');
        Surest_Executive_Sponsor.closeSearchList();
        
        var UHC_Executive_Sponsor = component.find('UHC_Executive_Sponsor');
        UHC_Executive_Sponsor.closeSearchList();

    },
    
    editExecutive: function(component, event, helper) {
        $A.util.addClass(component.find("sortEdit"),"hide");         
        component.find("editExecutive").set("v.disabled",true);
        
        $A.util.removeClass(component.find("saveExecutive"),"hideShow");
        $A.util.removeClass(component.find("cancelExecutive"),"hideShow");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i in editTextAreas){
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }
        
        component.set('v.enableEditMode', true);
        $A.util.removeClass(component.find("saveCancel"),"hide"); 
    },
    
    cancelExecutive : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){
            $A.util.addClass(component.find("saveCancel"),"hide");
        }
        
        helper.getExecutiveRecords(component, 'cancel');
        
        var fieldsToClear = component.find('otherTitle');
        for(var j = 0; j < fieldsToClear.length; j++){
            fieldsToClear[j].set("v.value", "");
        }
        
        var nameFieldsToClear = component.find('otherTitleName');
        for(var k = 0; k < nameFieldsToClear.length; k++){
            nameFieldsToClear[k].set("v.value", "");
        }

        component.find("editExecutive").set("v.disabled",false);
        
        $A.util.addClass(component.find("saveExecutive"),"hideShow");
        $A.util.addClass(component.find("cancelExecutive"),"hideShow");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i in editTextAreas){
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }

		component.set('v.enableEditMode', false);
        
        var Enterprise_Executive_Sponsor = component.find('Enterprise_Executive_Sponsor');
        Enterprise_Executive_Sponsor.clearField();
        
        var Optum_Executive_Sponsor = component.find('Optum_Executive_Sponsor');
        Optum_Executive_Sponsor.clearField();

        var Surest_Executive_Sponsor = component.find('Surest_Executive_Sponsor');
        Surest_Executive_Sponsor.clearField();
        
        var UHC_Executive_Sponsor = component.find('UHC_Executive_Sponsor');
        UHC_Executive_Sponsor.clearField();
        
        var Enterprise_Executive_Sponsor = component.find('Enterprise_Executive_Sponsor');
        Enterprise_Executive_Sponsor.closeSearchList();
        
        var Optum_Executive_Sponsor = component.find('Optum_Executive_Sponsor');
        Optum_Executive_Sponsor.closeSearchList();

        var Surest_Executive_Sponsor = component.find('Surest_Executive_Sponsor');
        Surest_Executive_Sponsor.closeSearchList();
        
        var UHC_Executive_Sponsor = component.find('UHC_Executive_Sponsor');
        UHC_Executive_Sponsor.closeSearchList();
       
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
})