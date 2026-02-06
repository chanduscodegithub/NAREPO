({
	doInit : function(component, event, helper) {
        
    },
    amtTempInt:function(component, event, helper){
        var accId = component.get('v.accId');
        var tempType = "Internal";
        var isPolicyAmtApplet = component.get("v.isPolicyAMT");
        var policyId = component.get("v.policyId");
        console.log('policyId////////////',policyId);
       helper.generateAMT_Template(component, event, accId,tempType,isPolicyAmtApplet,policyId);
    },
    amtTempExt:function(component, event, helper){
        var accId = component.get('v.accId');
        var tempType = "External";
        var isPolicyAmtApplet = component.get("v.isPolicyAMT");
        var policyId = component.get("v.policyId");
        helper.generateAMT_Template(component, event, accId,tempType,isPolicyAmtApplet,policyId);
    },
    amtReferenceGuide:function(component, event, helper){
        console.log('amtReferenceGuide');
       
        helper.generateAMTReferenceGuide_Template(component, event);
    }
})