/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-17-2024
 * @last modified by  : Spoorthy
**/
({
    getMembershipByMktData : function(component) {
        console.log('Helper getMembershipByMktData');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var action = component.get("c.getMedicalMemByMarketSurest");
        action.setParams({
            AccountId : component.get('v.recordId')        
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var memByMktMapData = response.getReturnValue();
                var memByMktMap = memByMktMapData["RegionsData"];
                component.set('v.Northeast',memByMktMap["Northeast"]);
                component.set('v.Southeast',memByMktMap["Southeast"]);
                component.set('v.Central',memByMktMap["Central"]);
                component.set('v.West',memByMktMap["West"]);
                component.set('v.Other',memByMktMap["Other"]);
                component.set('v.Total',memByMktMap["Total"]);
                component.set('v.GL_Date',memByMktMapData["GL_Date"]);                
            }else if(state === "ERROR") {               
                var errors = response.getError(); 
                if(errors){
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i++) {  
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In getClientSurveyRecords method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }   
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');  
        });
        $A.enqueueAction(action);
    },
    getMedicalStateByMarket : function(component,event,currentRegion) { 
        var spinner2 = component.find("spinner2");
        $A.util.removeClass(spinner2, 'slds-hide');
        var action = component.get("c.getMedicalStateByMarketSurest");
        action.setParams({
            AccountId : component.get('v.recordId'),
            region:currentRegion
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var memByMktStateMap = response.getReturnValue();
                component.set('v.stateMap','');
                var stateMap = component.get('v.stateMap');
                for (var key in memByMktStateMap) {                 
                    stateMap.push({
                        'name':key,
                        'members':memByMktStateMap[key]
                    });
                } 
                component.set('v.stateMap',stateMap);               
                $A.util.addClass(component.find("state_spin"), 'slds-hide');
            }else if(state === "ERROR") {               
                var errors = response.getError(); 
                if(errors){
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i++) {  
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In getClientSurveyRecords method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }            
        });
        $A.enqueueAction(action);
    },
    getMedicalUnetByMarket : function(component,event,currentState) {        
        var action = component.get("c.getMedicalUnetsByMarketSurest");
        action.setParams({
            AccountId : component.get('v.recordId'),
            region:component.get("v.currentRegion"),
            state:currentState
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var memByMktUnetMap = response.getReturnValue();
                component.set('v.unetMap','');
                var unetMap = component.get('v.unetMap');
                for (var key in memByMktUnetMap) {                 
                    unetMap.push({
                        'name':key,
                        'members':memByMktUnetMap[key]
                    });
                } 
                component.set('v.unetMap',unetMap);
                $A.util.addClass(component.find("unet_spin"), 'slds-hide');
            }else if(state === "ERROR") {               
                var errors = response.getError(); 
                if(errors){
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i++) {  
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In getClientSurveyRecords method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }            
        });
        $A.enqueueAction(action);
    }
})