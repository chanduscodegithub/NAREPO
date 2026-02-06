({
    doInit : function(component, event, helper) {
        //alert(JSON.stringify(component.get('v.accountSearchArray')));
        //console.log('doInit');
        if(component.get('v.selectedIds').length > 0 || component.get('v.selectedIds') != undefined){
            if(component.get('v.selectedIds').indexOf(component.get('v.accId')) > -1 ){
                var refAccount = component.find('refAccount'); 
                //ghanshyam c 1114
                var refAccountcheck = refAccount.set("v.value", true);
            }   
        }
    },
    
    select: function(component, event, helper){
        var refAccount = component.find('refAccount');              
        var refAccountcheck = refAccount.get("v.value");
        if(refAccountcheck){
            component.set('v.selectedrefAcct',false);
        }else{
            component.set('v.selectedrefAcct',true);
        }
        
        var compEvent = component.getEvent("refAcctsPopUpChildEvent");
        compEvent.setParams({"accId":component.get('v.accId'),'selectedrefAcct':component.get('v.selectedrefAcct')});
        compEvent.fire();
        
    }
})