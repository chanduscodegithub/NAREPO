({
    doInit : function(component, event, helper) {
        
        var riskName = component.get("v.RiskProfileObj.SCERiskTypeAddlRiskFactorType__c");        
        try{            
        	var riskTypeMap = component.get("v.RiskTypeMap");
            if(riskName != null && riskName.length > 0 && riskTypeMap[riskName] != null){                
                // Setting addition information
                var addInfoItems = riskTypeMap[riskName].addInfo;                        
                var riskaddInfo = component.get("v.RiskProfileObj.AdditionalInformation1__c");                
                var isAddInfoNotFound = false; 
                console.log('isAddInfoNotFound');
                if(riskaddInfo != null && riskaddInfo.length > 0){
                    isAddInfoNotFound = true;
                    for(var i=0;i < addInfoItems.length ; i = i+1){
                        if(addInfoItems[i] == riskaddInfo){
                    		isAddInfoNotFound = false;
                            break;
                        }
                    }
                }
                if(isAddInfoNotFound){
                    component.set("v.isAddInfoNotFound",isAddInfoNotFound);
                }           
                
                component.set("v.AddlInfo",addInfoItems);          
                
                
                // Setting Impact Values
                var imactItems =riskTypeMap[riskName].impact;                
                var riskImpack = component.get("v.RiskProfileObj.Impact__c");                
                var isImactNotFound = false;                
                if(riskImpack != null && riskImpack.length > 0){
                    isImactNotFound = true;
                    for(var i=0;i < imactItems.length ; i = i+1){
                        if(imactItems[i] == riskImpack){
                    		isImactNotFound = false;
                            break;
                        }
                    }
                }
                if(isImactNotFound){
                    component.set("v.isImactNotFound",isImactNotFound);
                }                
                component.set("v.ImpactValues",imactItems);                  
            }else{
                
                component.set("v.isRiskTypeNotFound",true);
                var riskImpack = component.get("v.RiskProfileObj.Impact__c");
                var riskaddInfo = component.get("v.RiskProfileObj.AdditionalInformation1__c");
                if(riskImpack != null && riskImpack.length > 0){
                	component.set("v.isImactNotFound",true);
                }
                if(riskaddInfo != null && riskaddInfo.length > 0){
                 	component.set("v.isAddInfoNotFound",true);
                }                
            }            
        }catch(err){
            
        }  
        var RiskHelptTextSet = component.get('v.RiskHelptTextSet');
        for(var j = 0 ; j < RiskHelptTextSet.length > 0 ; j++){
            if(RiskHelptTextSet[j].riskName == riskName){
                component.set('v.riskHelpText',RiskHelptTextSet[j].helpText);
                break;
            }
        }
    },    
    onSelectChange : function(component, event, helper) {                
        try{  
            component.set("v.isRiskTypeNotFound",false);
            component.set("v.isImactNotFound",false);
            component.set("v.isAddInfoNotFound",false);
            
            var RiskProfileObj = component.get("v.RiskProfileObj");        
            var riskTypeMap = component.get("v.RiskTypeMap");        
            var selected = component.find("RiskTypes");                
            var riskName = selected.get("v.value");          
            component.set("v.AddlInfo","");
            component.set("v.ImpactValues","");
            RiskProfileObj.SCERiskTypeAddlRiskFactorType__c = '';
            RiskProfileObj.AdditionalInformation1__c = '';        
            RiskProfileObj.RiskScore__c= 0;
            RiskProfileObj.Impact__c = ''; 
            
            if(riskName != null && riskName.length > 0 && riskTypeMap[riskName] != null){
                RiskProfileObj.SCERiskTypeAddlRiskFactorType__c  = riskName;
                component.set("v.ImpactValues",riskTypeMap[riskName].impact);
                component.set("v.AddlInfo",riskTypeMap[riskName].addInfo);            
                var rawScore = riskTypeMap[riskName].impactValueMap[RiskProfileObj.Impact__c] * riskTypeMap[riskName].riskScore;
                RiskProfileObj.RiskScore__c= rawScore;
                RiskProfileObj.RawScore__c = riskTypeMap[riskName].riskScore;
                RiskProfileObj.WeightMultiplier__c  = riskTypeMap[riskName].impactValueMap[RiskProfileObj.Impact__c];
            }                    
            if(RiskProfileObj.DateRiskClosed__c  != null && RiskProfileObj.DateRiskClosed__c.length > 0){   
                RiskProfileObj.RiskScore__c= 0;
            }       
            component.set("v.RiskProfileObj",RiskProfileObj);
            var riskProfileEvent = component.getEvent("riskProfileEvent");
            riskProfileEvent.setParams({
                "calRiskScore" : true,
                "id" : RiskProfileObj.Id
            });
            riskProfileEvent.fire();
        }catch(err){
            
        }
        var RiskHelptTextSet = component.get('v.RiskHelptTextSet');
        for(var j = 0 ; j < RiskHelptTextSet.length > 0 ; j++){
            if(RiskHelptTextSet[j].riskName == riskName){
                component.set('v.riskHelpText',RiskHelptTextSet[j].helpText);
                break;
            }
        }
    },
    onSelectChangeImpact : function(component, event, helper) {
        try{
            component.set("v.isImactNotFound",false);
            var selected = component.find("Impacts");
            var Impacts = selected.get("v.value");  
            var RiskProfileObj = component.get("v.RiskProfileObj");                
            RiskProfileObj.Impact__c = Impacts;
            
            if(Impacts == null || Impacts == 'undefined'){
                Impacts= '';
            }                
            var riskTypeMap = component.get("v.RiskTypeMap")
            if(RiskProfileObj.SCERiskTypeAddlRiskFactorType__c != null && RiskProfileObj.SCERiskTypeAddlRiskFactorType__c.length > 0 && riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c] != null){
                var rawScore = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].impactValueMap[Impacts] * riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].riskScore;
                RiskProfileObj.RiskScore__c= rawScore;
                RiskProfileObj.RawScore__c = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].riskScore;
                RiskProfileObj.WeightMultiplier__c  = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].impactValueMap[Impacts];
                
                if(RiskProfileObj.DateRiskClosed__c  != null && RiskProfileObj.DateRiskClosed__c.length > 0){   
                    RiskProfileObj.RiskScore__c= 0;
                }           
            }        
            component.set("v.RiskProfileObj",RiskProfileObj); 
            
            console.log('risk object id '+RiskProfileObj.Id);
            
            var riskProfileEvent = component.getEvent("riskProfileEvent");
            riskProfileEvent.setParams({
                "calRiskScore" : true,
                "id" : RiskProfileObj.Id
            });
            riskProfileEvent.fire();
        }catch(err){
            console.log(err);
        }
    },
    onSelectAddlInfo : function(component, event, helper) {
        try{
            component.set("v.isAddInfoNotFound",false);
            
            var selected = component.find("AddlInfos");
            var addInfo = selected.get("v.value");  
            var RiskProfileObj = component.get("v.RiskProfileObj");                
            RiskProfileObj.AdditionalInformation1__c = addInfo;
            component.set("v.RiskProfileObj",RiskProfileObj);         
            
            var riskProfileEvent = component.getEvent("riskProfileEvent");
            riskProfileEvent.setParams({
                "calRiskScore" : true,
                "id" : RiskProfileObj.Id
            });
            riskProfileEvent.fire();
        }catch(err){
            
        }
    },
    
    removePopupRisk: function(component, event, helper) {                
     /*   var riskProfileSelectValues = component.get("v.riskProfileSelectValues");        
         var riskProfilePopUpEvent = component.getEvent("riskProfilePopUpEvent");
        riskProfilePopUpEvent.setParams({
            "removeIndex" : riskProfileSelectValues['INDEX']
        });
        riskProfilePopUpEvent.fire(); */
    },
    
    cancelPopupRiskProfile: function(component, event, helper) {
        var cmpEvent = component.getEvent("addorCancelRiskEvent");
        cmpEvent.setParams({"clicked":"cancel"});
        cmpEvent.fire();
    },
    savePopupRiskProfile: function(component, event, helper) {
        var cmpEvent = component.getEvent("addorCancelRiskEvent");
        cmpEvent.setParams({"selectedRiskProfile":component.get("v.RiskProfilePopup")});
        cmpEvent.fire();
    },
    AddAdditionalRisk:  function(component, event, helper) {
        var addAdditionalRisk = component.get("v.RiskProfilePopup");
        addAdditionalRisk.push({
            'RiskType':'',
            'Impact':'',
            'AdditionalInformation':'',
            'Comments':''
        });
        component.set("v.RiskProfilePopup",addAdditionalRisk);
    },
    commentsfield : function(component, event, helper) {
    /*    var selected = component.find("commentsAuraId");
        var comments = selected.get("v.value");
        var = component.get("v.riskProfileSelectValues");
        riskProfileSelectValues['COMMENTS'] = comments;
        component.set("v.riskProfileSelectValues",riskProfileSelectValues); */
    },
    removeRisk : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
    	var cmpEvent = component.getEvent("riskProfileEvent");
        cmpEvent.setParams({"removeId":component.get('v.RiskProfileObj.Id'),"riskProfileObject":component.get('v.RiskProfileObj'),"isDelete":true});
        cmpEvent.fire();
	},
    navSObject : function(component, event, helper) {
        var sObectEvent = $A.get("e.force:navigateToSObject");
        sObectEvent .setParams({
            "recordId": component.get('v.RiskProfileObj.Id'),
            "slideDevName": "detail",
            "isredirect":true
        });
        sObectEvent.fire(); 
    },
    onDateChange : function(component, event, helper) {    
        console.log('Date change');
        try{
            var RiskProfileObj = component.get("v.RiskProfileObj");          
            if(RiskProfileObj.DateRiskClosed__c != null && RiskProfileObj.DateRiskClosed__c.length > 0){
                console.log('validate Date '+helper.isValidDate(RiskProfileObj.DateRiskClosed__c));
            }
            
            var riskTypeMap = component.get("v.RiskTypeMap")            
            if(RiskProfileObj.DateRiskClosed__c  != null && RiskProfileObj.DateRiskClosed__c.length > 0){   
                RiskProfileObj.RiskScore__c= 0;
            }else{             
                if(RiskProfileObj.Impact__c == null || RiskProfileObj.Impact__c == 'undefined'){
                    RiskProfileObj.Impact__c = '';
                }
                if(riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c] != null){
                    var rawScore = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].impactValueMap[RiskProfileObj.Impact__c] * riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].riskScore;
                    RiskProfileObj.RiskScore__c= rawScore;
                    RiskProfileObj.RawScore__c = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].riskScore;
                    RiskProfileObj.WeightMultiplier__c  = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].impactValueMap[RiskProfileObj.Impact__c];   
                }             
            }       
            component.set("v.RiskProfileObj",RiskProfileObj);
            var riskProfileEvent = component.getEvent("riskProfileEvent");
            riskProfileEvent.setParams({
                "calRiskScore" : true,
                "id" : RiskProfileObj.Id
            });
            riskProfileEvent.fire();
        }catch(err){
            
        }
    },
    onSelectComments : function(component, event, helper) {    	        
        var RiskProfileObj = component.get("v.RiskProfileObj");                                        
        var riskProfileEvent = component.getEvent("riskProfileEvent");        
        riskProfileEvent.setParams({
            "calRiskScore" : true,
            "id" : RiskProfileObj.Id
        });
        riskProfileEvent.fire();
    },
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
})