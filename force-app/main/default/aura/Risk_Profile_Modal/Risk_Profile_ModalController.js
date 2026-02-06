({
    doInit : function(component, event, helper) {        
        var RiskProfilePopup = [{"RiskType":"","Impact":"","AdditionalInformation":"","Comments":""}];
        component.set("v.RiskProfilePopup",RiskProfilePopup);
        helper.getRiskprofileMdtfromController(component, event);                
        var riskProfileList = component.get('v.riskProfileList')
        
        var riskProfileSelectValues = {};        
        riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'] = '';
        riskProfileSelectValues['IMPACTS'] = '';
        riskProfileSelectValues['INDEX'] = component.get("v.rowCount");
        riskProfileSelectValues['ADDITIONAL_INFORMATION'] = '';           
        riskProfileSelectValues['COMMENTS'] = '';
        riskProfileSelectValues['RISK_SCORE'] = '';
        riskProfileSelectValues['RAW_SCORE'] = '';
        riskProfileSelectValues['WEIGHT_MULTIPLIER'] = '';
        riskProfileList.push(riskProfileSelectValues);
        var count = component.get("v.rowCount");
		count = count+1;        
        component.set("v.rowCount",count);                
        component.set('v.riskProfileList',riskProfileList)        
    },    
    onSelectChange : function(component, event, helper) {
        var selected = component.find("RiskTypes");
        if (selected.length != undefined) {
            for(var i = 0; i < selected.length ; i=i+1){            
                selected[i].get("v.value");
            }
        } else {
            selected.get("v.value");
        }
    },
    onSelectChangeImpact : function(component, event, helper) {
        var selected = component.find("Impacts");
        if (selected.length != undefined) {
            for(var i = 0; i < selected.length ; i=i+1){
                selected[i].get("v.value");
            }
        } else {
            selected.get("v.value");
        }
    },
    onSelectAddlInfo : function(component, event, helper) {
        var selected = component.find("AddlInfos");
        if (selected.length != undefined) {
            for(var i = 0; i < selected.length ; i=i+1){
                selected[i].get("v.value");
            }
        } else {
            selected.get("v.value");
        }    },
    
    removePopupRisk: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        divId = parseInt(divId)
        var consultingHistoryArray = [];
        component.get("v.RiskProfilePopup").map(function(obj, index){
            if(divId !== index){
                consultingHistoryArray.push(obj);
            }
        });        
        component.set("v.RiskProfilePopup",consultingHistoryArray);
    },
    
    cancelPopupRiskProfile: function(component, event, helper) {
        var cmpEvent = component.getEvent("addorCancelRiskEvent");
        cmpEvent.setParams({"clicked":"cancel"});
        cmpEvent.fire();
    },
    savePopupRiskProfile: function(component, event, helper) {                
        var showAlert = component.find('RiskProfile'); 
        component.set('v.riskProfileObjArray',[]);
        var riskProfileObjArray = component.get('v.riskProfileObjArray');
        
        var riskProfileSaveData = component.find('riskProfileAuraId');        
        var riskProfileList = [];
        var isValidData = true;                
		var AccountFirm__c = component.get('v.Child_Data').accountId;
        var RiskProfileType__c = 'Risk Tracked by SCE';        
        var indexValue = 0;
        
        if(riskProfileSaveData != null && riskProfileSaveData.length > 0){                        
			for(var i = 0; i < riskProfileSaveData.length ; i=i+1){                
                if(riskProfileSaveData[i] != null && riskProfileSaveData[i].get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'] != null && riskProfileSaveData[i].get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'].length > 0){                                        
                    indexValue = indexValue+1;
                    var AdditionalInformation1__c = riskProfileSaveData[i].get('v.riskProfileSelectValues')['ADDITIONAL_INFORMATION'];
                    var Impact__c = riskProfileSaveData[i].get('v.riskProfileSelectValues')['IMPACTS'];
                    var SCERiskTypeAddlRiskFactorType__c = riskProfileSaveData[i].get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'];
                    var Comments__c = riskProfileSaveData[i].get('v.riskProfileSelectValues')['COMMENTS'];                    
                    var RiskScore__c  = riskProfileSaveData[i].get('v.riskProfileSelectValues')['RISK_SCORE'];
                    var WeightMultiplier__c = riskProfileSaveData[i].get('v.riskProfileSelectValues')['WEIGHT_MULTIPLIER'];                                                            
                    var RawScore__c = riskProfileSaveData[i].get('v.riskProfileSelectValues')['RAW_SCORE']; 
                    component.set("v.riskProfileObj","");                    
                	var riskProfileObject = component.get("v.riskProfileObj");
                    var jsonStr = {'sobjectType':'RiskProfile__c','SCERiskTypeAddlRiskFactorType__c':SCERiskTypeAddlRiskFactorType__c,'AdditionalInformation1__c':AdditionalInformation1__c,'Impact__c':Impact__c,'Comments__c':Comments__c,'RiskScore__c':RiskScore__c ,'WeightMultiplier__c':WeightMultiplier__c,'AccountFirm__c':AccountFirm__c,'RiskProfileType__c':RiskProfileType__c,'RawScore__c':RawScore__c};                    
                	component.set("v.riskProfileObj",jsonStr);                    
                    riskProfileObjArray.push(component.get("v.riskProfileObj"));
                }else{
                    isValidData = false;
                    component.set('v.indexValue',indexValue);
                    for(var j = 0; j < showAlert.length ; j=j+1){                    
                        $A.util.removeClass(showAlert[j], 'slds-hide');
                        $A.util.addClass(showAlert[j], 'slds-show');
                    }
                    break;
                } 				
            }   
        }else{            
            if(riskProfileSaveData.get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'] != null && riskProfileSaveData.get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'].length > 0){                
                	var AdditionalInformation1__c = riskProfileSaveData.get('v.riskProfileSelectValues')['ADDITIONAL_INFORMATION'];
                    var Impact__c = riskProfileSaveData.get('v.riskProfileSelectValues')['IMPACTS'];
                    var SCERiskTypeAddlRiskFactorType__c = riskProfileSaveData.get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'];
                    var Comments__c = riskProfileSaveData.get('v.riskProfileSelectValues')['COMMENTS'];
                    var RiskScore__c = riskProfileSaveData.get('v.riskProfileSelectValues')['RISK_SCORE'];                    
                    var WeightMultiplier__c = riskProfileSaveData.get('v.riskProfileSelectValues')['WEIGHT_MULTIPLIER'];                                        
                	var RawScore__c = riskProfileSaveData.get('v.riskProfileSelectValues')['RAW_SCORE']; 
                
                	component.set("v.riskProfileObj","");
                	var riskProfileObject = component.get("v.riskProfileObj");
                	var jsonStr = {'sobjectType':'RiskProfile__c','SCERiskTypeAddlRiskFactorType__c':SCERiskTypeAddlRiskFactorType__c,'AdditionalInformation1__c':AdditionalInformation1__c,'Impact__c':Impact__c,'Comments__c':Comments__c,'RiskScore__c':RiskScore__c ,'WeightMultiplier__c':WeightMultiplier__c,'AccountFirm__c':AccountFirm__c,'RiskProfileType__c':RiskProfileType__c,'RawScore__c':RawScore__c};                	
                	component.set("v.riskProfileObj",jsonStr);                	
                	riskProfileObjArray.push(component.get("v.riskProfileObj"));
            }else{
                isValidData = false;
                component.set('v.indexValue',0);
                for(var i = 0; i < showAlert.length ; i=i+1){                
                    $A.util.removeClass(showAlert[i], 'slds-hide');
                    $A.util.addClass(showAlert[i], 'slds-show');
                }
            }  
        }  
        component.set('v.indexValue',indexValue);
        if(isValidData){                                    
            helper.saveRiskProfileData(component, event,riskProfileObjArray);
        }        
    },
    AddAdditionalRisk:  function(component, event, helper) {
        var showAlert = component.find('RiskProfile');        
        var riskProfileSaveData = component.find('riskProfileAuraId');                   
        var isValidData = true;                
        var indexValue = 0;            
        if(riskProfileSaveData != null && riskProfileSaveData.length > 0){
            for(var i = 0; i < riskProfileSaveData.length ; i=i+1){               
                if(!(riskProfileSaveData[i].get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'] != null && riskProfileSaveData[i].get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'].length > 0)){
                    component.set("v.alertMesage","Please select the Risk Type");
                    isValidData = false; 
                    for(var j = 0; j < showAlert.length ; j=j+1){                    
                        $A.util.removeClass(showAlert[j], 'slds-hide');
                        $A.util.addClass(showAlert[j], 'slds-show');
                    }
                    break;
                }else{
                    indexValue = indexValue + 1;                    
                }              
            }   
        }else{            
            if(!(riskProfileSaveData.get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'] != null && riskProfileSaveData.get('v.riskProfileSelectValues')['RISK_TRACED_BY_THE_SCE'].length > 0)){
                component.set("v.alertMesage","Please select the Risk Type");
                isValidData = false;
                for(var j = 0; j < showAlert.length ; j=j+1){                    
                    $A.util.removeClass(showAlert[j], 'slds-hide');
                    $A.util.addClass(showAlert[j], 'slds-show');
                }     
            }  
        }          
        component.set('v.indexValue',indexValue);
        if(isValidData){         
            var riskProfileList = component.get('v.riskProfileList')        
            var riskProfileSelectValues = {};        
            riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'] = '';
            riskProfileSelectValues['IMPACTS'] = '';
            riskProfileSelectValues['INDEX'] = component.get("v.rowCount");
            riskProfileSelectValues['ADDITIONAL_INFORMATION'] = '';           
            riskProfileSelectValues['COMMENTS'] = '';
            riskProfileSelectValues['RISK_SCORE'] = '';
            riskProfileSelectValues['RAW_SCORE'] = '';
            riskProfileSelectValues['WEIGHT_MULTIPLIER'] = '';
            riskProfileList.push(riskProfileSelectValues);
            var count = component.get("v.rowCount");
            count = count+1;            
            component.set("v.rowCount",count);                        
            component.set('v.riskProfileList',riskProfileList);            
        }
    },
    closeAlert: function(component, event, helper) {        
        var showAlert = component.find('RiskProfile');
        for(var j = 0; j < showAlert.length ; j=j+1){                    
            $A.util.removeClass(showAlert[j], 'slds-show');
            $A.util.addClass(showAlert[j], 'slds-hide');
        }       
        component.set("v.alertMesage","A Risk Type must be selected in order to save the record.");
        try{
            var riskProfileAuraId = component.find('riskProfileAuraId');                        
            if(riskProfileAuraId != null && riskProfileAuraId.length != 'undefiend' && riskProfileAuraId.length > 0){            
                riskProfileAuraId[component.get('v.indexValue')].selectOptionFocus();   
            }else{            
                riskProfileAuraId.selectOptionFocus();   
            }        
        }catch(err){
            
        }
    },
    removeRisk: function(component, event, helper) {                
        var deleteAcc = component.find('RiskProfileRemove');
        for(var j = 0; j < deleteAcc.length ; j=j+1){                    
            $A.util.removeClass(deleteAcc[j], 'slds-hide');
            $A.util.addClass(deleteAcc[j], 'slds-show');
        }
    },
    riskProfilePopUpEventMethod: function(component, event, helper) {                        
        var removeRiskId = event.getParam('removeIndex');
        var riskProfileList = [];                          
        var riskProfileAddedData = component.find('riskProfileAuraId');
        var indexValue = component.get('v.indexValue');        
        
        if(riskProfileAddedData != null && riskProfileAddedData.length > 0){
            for(var i = 0; i < riskProfileAddedData.length ; i=i+1){                                                 
                if(riskProfileAddedData.length == 1){                    
                    component.set("v.alertMesage","Atleast one Risk Type Record Should exist");
                    var showAlert = component.find('RiskProfile');  
                    for(var j = 0; j < showAlert.length ; j=j+1){                    
                        $A.util.removeClass(showAlert[j], 'slds-hide');
                        $A.util.addClass(showAlert[j], 'slds-show');
                    }                    
                    riskProfileList.push(riskProfileAddedData[i].get('v.riskProfileSelectValues'));
                }else if(riskProfileAddedData[i].get('v.riskProfileSelectValues')['INDEX'] != removeRiskId){
                    riskProfileList.push(riskProfileAddedData[i].get('v.riskProfileSelectValues'));
                }                
            }              
        }else{                           
            component.set("v.alertMesage","Atleast one Risk Type Record Should exist");
            var showAlert = component.find('RiskProfile');        
            for(var j = 0; j < showAlert.length ; j=j+1){                            
                $A.util.removeClass(showAlert[j], 'slds-hide');
                $A.util.addClass(showAlert[j], 'slds-show');
            }
            riskProfileList.push(riskProfileAddedData.get('v.riskProfileSelectValues'));
        }                     
        component.set('v.riskProfileList',riskProfileList)
    },    
    confirmCancel: function(component, event, helper) {  
        var showAlert = component.find('RiskProfile');
        for(var j = 0; j < showAlert.length ; j=j+1){                            
            $A.util.removeClass(showAlert[j], 'slds-show');
            $A.util.addClass(showAlert[j], 'slds-hide');
        }		
    },
     closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var j = 0; j < ErrorMessage.length ; j=j+1){                            
            $A.util.removeClass(ErrorMessage[j], 'slds-show');
            $A.util.addClass(ErrorMessage[j], 'slds-hide');
        }
    }

})