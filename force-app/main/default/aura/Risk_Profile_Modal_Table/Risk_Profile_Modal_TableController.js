({
    doInit : function(component, event, helper) {          
        var riskProfileSelectValues = component.get("v.riskProfileSelectValues");
        component.set("v.riskProfileSelectValues",riskProfileSelectValues);
        setTimeout(function(){
            component.find("RiskTypes").focus();
        }, 600);
    },    
    focusField : function(component, event, helper) {  
        setTimeout(function(){ 
            component.find("RiskTypes").focus();
        }, 600);
    },    
    onSelectChange : function(component, event, helper) {
        try{
            var riskProfileSelectValues = component.get("v.riskProfileSelectValues");        
            var selected = component.find("RiskTypes");
            var riskName = selected.get("v.value");        
            var riskTypeMap = component.get("v.RiskTypeMap");        
            component.set("v.AddlInfo","");        
            riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'] = '';
            var selected = component.find("Impacts");
            var Impacts = selected.get("v.value");  
            if(Impacts == null || Impacts == 'undefined'){
                Impacts = "";
            }        
            if(riskName != null && riskName.length > 0){
                riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'] = riskName;
                component.set("v.ImpactValues",riskTypeMap[riskName].impact);    
                component.set("v.AddlInfo",riskTypeMap[riskName].addInfo);       
                var riskScore = riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].impactValueMap[Impacts] * riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].riskScore;
                riskProfileSelectValues['RISK_SCORE'] = riskScore;
                riskProfileSelectValues['RAW_SCORE'] = riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].riskScore;        
                riskProfileSelectValues['WEIGHT_MULTIPLIER'] = riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].impactValueMap[Impacts];
            }                
            component.set("v.riskProfileSelectValues",riskProfileSelectValues);
            
        }catch(err){
            alert(err);
        }
    },
    onSelectChangeImpact : function(component, event, helper) {        
        try{
            var selected = component.find("Impacts");
            var Impacts = selected.get("v.value");  
            var riskProfileSelectValues = component.get("v.riskProfileSelectValues");
            riskProfileSelectValues['IMPACTS'] = Impacts;        
            
            if(riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'] != null && riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'] != '' && riskProfileSelectValues['RISK_TRACED_BY_THE_SCE'].length > 0){
                var riskTypeMap = component.get("v.RiskTypeMap");
                var riskProfileSelectValues = component.get("v.riskProfileSelectValues");                
                var riskScore = riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].impactValueMap[Impacts] * riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].riskScore;
                riskProfileSelectValues['RISK_SCORE'] = riskScore;        
                riskProfileSelectValues['RAW_SCORE'] = riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].riskScore;        
                riskProfileSelectValues['WEIGHT_MULTIPLIER'] = riskTypeMap[riskProfileSelectValues['RISK_TRACED_BY_THE_SCE']].impactValueMap[Impacts];        
                
                component.set("v.riskProfileSelectValues",riskProfileSelectValues);    
            }
        }catch(err){
            alert(err);
        }        
        
    },
    onSelectAddlInfo : function(component, event, helper) {
        try{
            var selected = component.find("AddlInfos");
            var addInfo = selected.get("v.value");  
            var riskProfileSelectValues = component.get("v.riskProfileSelectValues");
            riskProfileSelectValues['ADDITIONAL_INFORMATION'] = addInfo; 
            component.set("v.riskProfileSelectValues",riskProfileSelectValues);
        }catch(err){
            alert(err);
        }
    },
    
    removePopupRisk: function(component, event, helper) {                
        try{
            var riskProfileSelectValues = component.get("v.riskProfileSelectValues");        
            var riskProfilePopUpEvent = component.getEvent("riskProfilePopUpEvent");
            riskProfilePopUpEvent.setParams({
                "removeIndex" : riskProfileSelectValues['INDEX']
            });
            riskProfilePopUpEvent.fire();
        }catch(err){
            alert(err);
        }
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
        try{
            var selected = component.find("commentsAuraId");
            var comments = selected.get("v.value");
            var riskProfileSelectValues = component.get("v.riskProfileSelectValues");
            riskProfileSelectValues['COMMENTS'] = comments;
            component.set("v.riskProfileSelectValues",riskProfileSelectValues);
        }catch(err){
            
        }
    }
})