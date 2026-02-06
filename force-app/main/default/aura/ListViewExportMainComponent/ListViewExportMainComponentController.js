({
    getListViewData : function(component, event, helper) {
		helper.getListViewData(component, event, helper);
	},
	generateCSV : function(component, event, helper) {
        var sObjectType = component.get('v.sObjectTypeName');        
        var sObjectListViewName = component.get('v.sObjectListViewName');
        if(sObjectType == null || sObjectType == undefined || sObjectType == '' && sObjectType == 'None'){            
            component.set('v.hasError',true);
            component.set('v.alertMessage','Please Select the Sobject Type');            
            return;
        }
        if(sObjectListViewName == null || sObjectListViewName == undefined || sObjectListViewName == ''){            
            component.set('v.hasError',true);
            component.set('v.alertMessage','Please Select the Sobject List View Name'); 
            return;
        }
        if(component.get('v.hasError'))component.set('v.hasError',false);
        
        var listViewDataIdMap = component.get('v.listViewDataIdMap');
        var listViewId = listViewDataIdMap[sObjectType+'@@'+sObjectListViewName];
        helper.getRecords(component, event, helper,listViewId,sObjectType);
	},
    onSelectsObjectType : function(component, event, helper) {        
        var sObjectTypeMap = component.get("v.sObjectTypeMap");        
        var selected = component.find("sObjectTypeAuraId");
        var sObjectType = selected.get("v.value");		
        if(sObjectType != null && sObjectType == 'None'){
            component.set('v.sObjectListView',[]);
            return;
        }
        
        console.log('sObjectType'+sObjectType);        
        if(sObjectType != null && sObjectType.length > 0){
            component.set('v.sObjectListView',sObjectTypeMap[sObjectType]);
        }else{
            component.set('v.sObjectListView',[]);
        }
        component.set('v.sObjectTypeName',sObjectType);
	},
    onSelectSObjectListView : function(component, event, helper) {        
        var selected = component.find("sObjectListViewAuraId");
        var sObjectListViewName = selected.get("v.value");		        
        component.set('v.sObjectListViewName',sObjectListViewName);
    }    
})