({
	select: function(component, event, helper){
        var refOpportunity = component.find('refopportunity');              
        var refOpportunitycheck = refOpportunity.get("v.value");
        console.log('test')
        if(refOpportunitycheck){
            component.set('v.selectedrefoppt',false);
        }else{
            component.set('v.selectedrefoppt',true);
        }
        
        var compEvent = component.getEvent("refoppPopUpChildEvent");
        compEvent.setParams({"oppId":component.get('v.oppId'),'selectedrefoppt':component.get('v.selectedrefoppt')});
        compEvent.fire();
        
    },
    doInit : function(component, event, helper){
       
    }
})