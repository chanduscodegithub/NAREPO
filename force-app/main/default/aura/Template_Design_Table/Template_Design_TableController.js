({
    doInit : function(component, event, helper) {
        //alert(JSON.stringify(component.get('v.accountSearchArray')));
        var objMapping = {'Account' : 'Company', 'Contact' : 'Contact', 'Opportunity' : 'Membership Activity'};

        component.set('v.columnHeader', objMapping[component.get('v.objNameToDisplay')]);
        
        if(component.get('v.selectedIds').length > 0 || component.get('v.selectedIds') != undefined){
            if(component.get('v.selectedIds').indexOf(component.get('v.accId')) > -1 ){
                var refAccount = component.find('refAccount');              
                var refAccountcheck = refAccount.set("v.value", true);
            }   
        }
    },

    selectALl : function(component, event, helper){
        debugger;
    	var refAccount = component.find('refAccount');     
        var refAccountcheck = refAccount.get("v.value");
        var params = event.getParam('arguments'); 
        var limit = '';
        if(component.get('v.NPSsearchCriteriaSection')){
           limit = $A.get("$Label.c.Service_Template_Download_Limit");
        }else{
           limit = $A.get("$Label.c.Sales_Template_Download_Limit");
        }
         limit = parseInt(limit);
        if(params){           
                refAccount.set("v.value", params.isChecked);                     
                var compEvent = component.getEvent("refAcctsPopUpChildEvent");
                if(component.get('v.selectedIds').length == limit && refAccountcheck == false && params.isChecked){
                    refAccount.set("v.value", false);
                    component.set('v.selectedrefAcct',true);
                    compEvent.setParams({"accId":component.get('v.accId'),
                                         'selectedrefAcct':component.get('v.selectedrefAcct'),
                                         'showError' : true});
                    compEvent.fire(); 
                }else{
                    if(refAccountcheck == false && params.isChecked){
                        component.set('v.selectedrefAcct',false);
                    }else{
                        component.set('v.selectedrefAcct',true);
                    }
                    if(!(refAccountcheck && params.isChecked)){
                        compEvent.setParams({"accId":component.get('v.accId'),'selectedrefAcct':component.get('v.selectedrefAcct')});
                		compEvent.fire();  
                    }                    
                }                           
        }
    },
    select: function(component, event, helper){
        debugger;
        var refAccount = component.find('refAccount');     
        var refAccountcheck = refAccount.get("v.value");
        var limit = '';
        if(component.get('v.NPSsearchCriteriaSection')){
           limit = $A.get("$Label.c.Service_Template_Download_Limit");
        }else{
           limit = $A.get("$Label.c.Sales_Template_Download_Limit");
        }
         limit = parseInt(limit);
        if((component.get('v.selectedIds').length == limit) && (refAccountcheck)){
            var refAccountcheck = refAccount.set("v.value", false);
            component.set('v.selectedrefAcct',true);
            
            var compEvent = component.getEvent("refAcctsPopUpChildEvent");
            compEvent.setParams({"accId":component.get('v.accId'),
                                 'selectedrefAcct':component.get('v.selectedrefAcct'),
                                 'showError' : true});
            compEvent.fire();
            
            
        }else{
            if(refAccountcheck){
                component.set('v.selectedrefAcct',false);
            }else{
                component.set('v.selectedrefAcct',true);
            }
            var compEvent = component.getEvent("refAcctsPopUpChildEvent");
            compEvent.setParams({"accId":component.get('v.accId'),'selectedrefAcct':component.get('v.selectedrefAcct')});
            compEvent.fire();
        }
    }
})