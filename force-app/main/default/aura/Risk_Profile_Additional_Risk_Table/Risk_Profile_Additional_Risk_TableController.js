({
    doInit : function(component, event, helper) {	            
        var RiskProfileObj = component.get("v.RiskProfileObj");                        
        var riskName = component.get("v.RiskProfileObj.SCERiskTypeAddlRiskFactorType__c");                
        var riskTypeMap = component.get("v.RiskTypeMap");
        var fieldType = riskTypeMap[riskName].fieldType;
        
        if(fieldType != null && fieldType == 'Picklist'){
            // Setting Risk Factor Values        
            var items = riskTypeMap[riskName].addRiskList;
            var riskFactorValue = component.get("v.RiskProfileObj.RiskFactorValue__c");
            var isDataNotFound = false;
            if(riskFactorValue != null && riskFactorValue.length > 0){
                isDataNotFound = true;
                for(var i=0;i < items.length ; i = i+1){
                    if(items[i] == riskFactorValue){
                        isDataNotFound = false;
                        break;
                    }
                }
            }
            if(isDataNotFound){
                component.set("v.isDataNotFound",isDataNotFound);
            } 
            component.set("v.RiskValues",items);
        }
        
        if(fieldType != null && fieldType == 'Currency'){            
            var riskFactorVal = component.get("v.RiskProfileObj.RiskFactorValue__c");
            if(riskFactorVal != null){
             	riskFactorVal = riskFactorVal.replace('$','');   
            }            
            component.set("v.RiskProfileObj.RiskFactorValue__c",riskFactorVal);
            component.set("v.isCurrency",true); 
            component.set("v.isPickList",false);
        }else if(fieldType != null && fieldType == 'Percentage'){            
            var riskFactorVal = component.get("v.RiskProfileObj.RiskFactorValue__c");            
            if(riskFactorVal != null){
             	riskFactorVal = riskFactorVal.replace('%','');                        
            }                        
            var riskScoreValue = '';
            if(component.get("v.RiskProfileObj.RiskScore__c") != null){
                riskScoreValue = component.get("v.RiskProfileObj.RiskScore__c");
            }            
            component.set("v.isPercentage",true);                                    
            component.set("v.isPickList",false);                        
            if(!isNaN(riskFactorVal)){
                riskFactorVal = riskFactorVal / 100;
            }            
            component.set("v.RiskProfileObj.RiskFactorValue__c",riskFactorVal);
            component.find('riskFactorNumOutFormat').set('v.format','0.00%');            
                        
            component.set('v.RiskProfileObj.RiskScore__c',riskScoreValue);
            var riskProfileEvent = component.getEvent("riskProfileEvent");
            riskProfileEvent.setParams({
                "calRiskScore" : true,
                "id" : RiskProfileObj.Id
            });
            riskProfileEvent.fire();      
            
        }else if(fieldType != null && fieldType == 'Number'){                    
            component.set("v.isPickList",false);
        }else if(fieldType != null && fieldType == 'Integer'){
            component.set("v.isPickList",false);
        }                
    },
   onSelectChangeRisk : function(component, event, helper) {	         
       
       component.set("v.isDataNotFound",false);
       component.set('v.showMessage',true);
       
       var selected = component.find("riskValuesId");
       var risk = selected.get("v.value");  
       var RiskProfileObj = component.get("v.RiskProfileObj");                                
       var riskTypeMap = component.get("v.RiskTypeMap")        
       var rawScore = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].addRiskPickListMap[risk] * riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].weightMultiplier;
       RiskProfileObj.RiskScore__c= rawScore;
       RiskProfileObj.RawScore__c = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].addRiskPickListMap[risk];
       RiskProfileObj.RiskFactorValue__c= risk;
       RiskProfileObj.WeightMultiplier__c  = riskTypeMap[RiskProfileObj.SCERiskTypeAddlRiskFactorType__c].weightMultiplier;       
       
       if(RiskProfileObj.RiskFactorValue__c == null){
            component.set('v.showMessage',false);    
        }else if(RiskProfileObj.RiskFactorasof__c != null && RiskProfileObj.RiskFactorasof__c.length > 0 && RiskProfileObj.Comments__c && RiskProfileObj.Comments__c.length > 0){
            component.set('v.showMessage',false);    
        }else{
            component.set('v.showMessage',true);
        }
       
       component.set("v.RiskProfileObj",RiskProfileObj);
       
       var riskProfileEvent = component.getEvent("riskProfileEvent");
       riskProfileEvent.setParams({
           "calRiskScore" : true,
           "id" : RiskProfileObj.Id
       });
       riskProfileEvent.fire();       
    },
    onSelectRiskValueChange : function(component, event, helper) {    	  		
        var riskName = component.get("v.RiskProfileObj.SCERiskTypeAddlRiskFactorType__c");        
        var riskTypeMap = component.get("v.RiskTypeMap");
        var RiskProfileObj = component.get("v.RiskProfileObj");                                
        var fieldType = riskTypeMap[riskName].fieldType;                                         
        if(isNaN(RiskProfileObj.RiskFactorValue__c)){
            RiskProfileObj.RiskFactorValue__c = '0.00';
        }        
        
        if(RiskProfileObj.RiskFactorValue__c == null){
            component.set('v.showMessage',false);    
        }else if(RiskProfileObj.RiskFactorasof__c != null && RiskProfileObj.RiskFactorasof__c.length > 0 && RiskProfileObj.Comments__c && RiskProfileObj.Comments__c.length > 0){
            component.set('v.showMessage',false);    
        }else{
            component.set('v.showMessage',true);
        }     
        if(RiskProfileObj.RiskFactorValue__c != null){
            if(fieldType != null && fieldType == 'Integer'){
                RiskProfileObj.RiskScore__c = RiskProfileObj.RiskFactorValue__c * riskTypeMap[riskName].rawScore * riskTypeMap[riskName].weightMultiplier;
                RiskProfileObj.WeightMultiplier__c  = riskTypeMap[riskName].weightMultiplier;
                RiskProfileObj.RawScore__c  = riskTypeMap[riskName].rawScore;                 
                if(RiskProfileObj.RiskScore__c <= 0){
                   RiskProfileObj.RiskScore__c = 0; 
                }
            }
            else if(fieldType != null && (fieldType == 'Number' || fieldType == 'Percentage' || fieldType == 'Currency')){
                if(fieldType == 'Percentage'){
                    RiskProfileObj.RiskFactorValue__c = RiskProfileObj.RiskFactorValue__c * 100;
                }                                
                var riskValObject = riskTypeMap[riskName].addRiskPickListMap;            
                for(var key in riskValObject) {
                    if (riskValObject.hasOwnProperty(key)) {                        
                        var eachValues = key.split(",");
                        if(eachValues[1] == 'MAXLIMIT' && parseFloat(RiskProfileObj.RiskFactorValue__c) >= parseFloat((eachValues[0]))){
                            RiskProfileObj.RiskScore__c = parseFloat(riskValObject[key]) * parseFloat(riskTypeMap[riskName].weightMultiplier);
                            RiskProfileObj.RawScore__c  = riskValObject[key];
                            RiskProfileObj.WeightMultiplier__c  = riskTypeMap[riskName].weightMultiplier;
                            break;
                        }
                        else if(eachValues[1] != 'MAXLIMIT' && eachValues[0] <= parseFloat(RiskProfileObj.RiskFactorValue__c) && parseFloat(RiskProfileObj.RiskFactorValue__c) <= parseFloat(eachValues[1])){
                            RiskProfileObj.RiskScore__c = parseFloat(riskValObject[key]) * parseFloat(riskTypeMap[riskName].weightMultiplier);
                            RiskProfileObj.RawScore__c  = riskValObject[key];
                            RiskProfileObj.WeightMultiplier__c  = riskTypeMap[riskName].weightMultiplier;
                            break;
                        }
                        
                        if(parseFloat(RiskProfileObj.RiskFactorValue__c) <= 0){
                            RiskProfileObj.RiskScore__c = 0;
                            RiskProfileObj.RawScore__c  = 0;
                            RiskProfileObj.WeightMultiplier__c  = riskTypeMap[riskName].weightMultiplier;
                            break;
                        }
                    }
                }	
                if(fieldType == 'Percentage'){
                    RiskProfileObj.RiskFactorValue__c = RiskProfileObj.RiskFactorValue__c / 100;
                }
            }    
        }else{            
            RiskProfileObj.RiskScore__c = 0.00;
            RiskProfileObj.RawScore__c = 0;            
        }
        
        component.set("v.RiskProfileObj",RiskProfileObj);        
        var riskProfileEvent = component.getEvent("riskProfileEvent");
        riskProfileEvent.setParams({
            "calRiskScore" : true,
            "id" : RiskProfileObj.Id
        });
        riskProfileEvent.fire();
    },
    onSelectRiskFactor : function(component, event, helper) {    	        
        var RiskProfileObj = component.get("v.RiskProfileObj");                                        
        var riskProfileEvent = component.getEvent("riskProfileEvent");        
        riskProfileEvent.setParams({
            "calRiskScore" : true,
            "id" : RiskProfileObj.Id
        });
        riskProfileEvent.fire();
    },
    onSelectComments : function(component, event, helper) {    	        
        var RiskProfileObj = component.get("v.RiskProfileObj");                                        
        var riskProfileEvent = component.getEvent("riskProfileEvent");        
        if(RiskProfileObj.RiskFactorValue__c == null){
            component.set('v.showMessage',false);    
        }else if(RiskProfileObj.RiskFactorasof__c != null && RiskProfileObj.RiskFactorasof__c.length > 0 && RiskProfileObj.Comments__c && RiskProfileObj.Comments__c.length > 0){
            component.set('v.showMessage',false);    
        }else{
            component.set('v.showMessage',true);
        }
        riskProfileEvent.setParams({
            "calRiskScore" : true,
            "id" : RiskProfileObj.Id
        });
        riskProfileEvent.fire();
    },
    checkDateValidation : function(component, event, helper) { 
        var RiskProfileObj = component.get("v.RiskProfileObj");                  
        var riskProfileEvent = component.getEvent("riskProfileEvent");
        if(RiskProfileObj.RiskFactorValue__c == null){
            component.set('v.showMessage',false);    
        }else if(RiskProfileObj.RiskFactorasof__c != null && RiskProfileObj.RiskFactorasof__c.length > 0 && RiskProfileObj.Comments__c && RiskProfileObj.Comments__c.length > 0){
            component.set('v.showMessage',false);    
        }else{
            component.set('v.showMessage',true);
        }      
        riskProfileEvent.setParams({
            "calRiskScore" : true,
            "id" : RiskProfileObj.Id
        });            
        riskProfileEvent.fire();           
    },
})