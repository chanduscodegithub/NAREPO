/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-23-2024
 * @last modified by  : Spoorthy
**/
({
    getLoggedInUserRole : function(component){
        
        var accountId = component.get('v.recordId');
        var action  = component.get('c.getLoggedInUserRoles');
         if(action == undefined || action == null){
            return;
        }

        action.setParams({"accountId" : accountId});
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
            	component.set('v.isLoggedInUserValid', response.getReturnValue());   
                
                var device = $A.get("$Browser.formFactor");
                
                if(device != "DESKTOP"){ 
                    this.getExecutiveRecords(component, 'doinit');          
                }
                
            }else if (state === "INCOMPLETE") {  
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
				}
            
        });
        
        $A.enqueueAction(action);  
        
    },
    
    getExecutiveRecords : function(component, method){
        component.set('v.isSpinnertoLoad', true);
        var accountId = component.get('v.recordId');
        var action = component.get('c.getSeniorUHGExecutivesRecords');
        action.setParams({"accountId" : accountId});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                var resp = response.getReturnValue();
                
                component.set("v.seniorUhgExecutives", resp);
                
                var textCounters = component.find('textCounter');
                for(var i in textCounters){
                    textCounters[i].doCalculation();
                }
                
                component.set('v.isSpinnertoLoad', false);
                var device = $A.get("$Browser.formFactor");
                
                if(method == 'cancel'){
                    if(device != "DESKTOP"){ 
                        $A.util.removeClass(component.find("sortEdit"),"hide");
                    }
                }else if(method == 'doinit'){
                    if(device != "DESKTOP"){ 
                        var iOS = parseFloat(
                            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                        ) || false; 
                        
                        if($A.get("$Browser.isIOS")){
                            $A.util.addClass(component.find('articleClass'),'cScroll-table');
                        }
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");  
                        $A.util.removeClass(component.find("sortEdit"),"hide");
                        
                        if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){
                            $A.util.addClass(component.find('saveCancel'),'iosBottom');
                            $A.util.addClass(component.find('sortEdit'),'iosBottom');
                            $A.util.addClass(component.find('contact_History'),'ipadBottomIos');
                        }else{
                            $A.util.addClass(component.find('contact_History'),'ipadbottom');
                        } 
                        $A.util.addClass(component.find('contact_History'),'slds-is-open');
                    }   
                }
                
            }else if (state === "INCOMPLETE") { 
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
            
        });
        $A.enqueueAction(action);  
    },
    
    saveExecutiveRecords : function(component){
        component.set('v.isSpinnertoLoad', true);
        
        var accountId = component.get('v.recordId');
        var seniorUHGRecordsToUpdate = component.get('v.seniorUhgExecutives');
        
        seniorUHGRecordsToUpdate.sobjectType='SeniorUHGExecutivesEngaged__c';
        
        var action = component.get('c.saveSeniorUHGExecutivesRecords');
        action.setParams({"seniorUHGRecord" : seniorUHGRecordsToUpdate,"accountId":component.get('v.recordId')});
        
        action.setCallback(this, function(response){
            
            var state = response.getState();
            
            if(state === "SUCCESS"){
                var resp = response.getReturnValue();
                
                var Enterprise_Executive_Sponsor = component.find('Enterprise_Executive_Sponsor');
                Enterprise_Executive_Sponsor.clearField();
                
                var Optum_Executive_Sponsor = component.find('Optum_Executive_Sponsor');
                Optum_Executive_Sponsor.clearField();

                var Surest_Executive_Sponsor = component.find('Surest_Executive_Sponsor');
                Surest_Executive_Sponsor.clearField();
                
                var UHC_Executive_Sponsor = component.find('UHC_Executive_Sponsor');
                UHC_Executive_Sponsor.clearField();
                
                component.set("v.seniorUhgExecutives", resp);
                
                component.set('v.isSpinnertoLoad', false);
                
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.removeClass(component.find("sortEdit"),"hide");
                }
                if($A.get("$Browser.isIOS")){
                    $A.util.addClass(component.find('articleClass'),'cScroll-table');
                }
                
            }else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        $A.enqueueAction(action);
    },
    
    showToast : function(msg) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "message": msg
        });
        toastEvent.fire();
    },
    
    resetFields : function(component){
    	var fieldsToClear = component.find('otherTitle');
        for(var j = 0; j < fieldsToClear.length; j++){
            fieldsToClear[j].set("v.value", "");
        }
        
        var nameFieldsToClear = component.find('otherTitleName');
        for(var k = 0; k < nameFieldsToClear.length; k++){
            nameFieldsToClear[k].set("v.value", "");
        }
        
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
	}
})