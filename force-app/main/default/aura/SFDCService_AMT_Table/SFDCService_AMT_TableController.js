({
    doInit : function(component, event,helper){
        debugger;
        // alert('hello')
        if(component.get('v.sobjectusedAccount')){
           /* var userHirearchy = component.get('v.serviceAMTObj.UserHierarchy__c');
            if(userHirearchy != null){
                userHirearchy=userHirearchy.trim();
                component.get('v.serviceAMTObj.UserHierarchy__c',userHirearchy);

            }*/
            var PoliciesList = component.get('v.PoliciesList');
            var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
            var ischeckboxchecked = component.get('v.serviceAMTObj.All_Policy__c');
            //console.log('ischeckboxchecked before set'+ischeckboxchecked);
			component.set('v.isCheckBoxChecked',ischeckboxchecked);
             //console.log('ischeckboxchecked'+ischeckboxchecked);
            var PoliciesListNames = [];
            if(PoliciesList != null && PoliciesList != undefined){
                for(var i = 0 ; i < PoliciesList.length ; i++){
                    PoliciesListNames.push(PoliciesList[i].Name);
                }
                if(PoliciesListNames != null && PoliciesListNames.length != 0){
                    component.set('v.PoliciesListNames',PoliciesListNames);
                }
                
            }  
           /* var PoliciesListNames = component.get('v.PoliciesListNames');
            component.find("multipleSelect").set("v.options", policyCarriersValuesArray);
            /*var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
            var policyCarriersValuesArray = [];
            if(PoliciesListNames != undefined && PoliciesListNames != null ){
                for(var j=0; j<PoliciesListNames.length; j++) {
                    var policyCarrierToBeAdded = '';
                    if(selectedvalues != undefined && selectedvalues != null && selectedvalues.includes(PoliciesListNames[j])) {
                        policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j], selected:"true"}; 
                    } else {
                        policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j]};
                    }
                    policyCarriersValuesArray.push(policyCarrierToBeAdded);
                }
            }
            component.find("multipleSelect").set("v.options", policyCarriersValuesArray);*/
            
         /*   var policyCarriersValuesArray = [];
            for(var j=0; j<PoliciesListNames.length; j++) {
               	var policyCarrierToBeAdded = '';
                if(selectedvalues.includes(PoliciesListNames[j])) {
                	policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j], selected:"true"}; 
                } else {
                    policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j]};
                }
                policyCarriersValuesArray.push(policyCarrierToBeAdded);
            }
            component.find("multipleSelect").set("v.options", policyCarriersValuesArray);*/
            
            
            /*var policyCarriersValuesArray = [];
            var policyCarrierNamesArray = [];
            
            var policyCarriersList = component.get('v.serviceAMTObj.PoliciesList');
            
            var selAssMedCarriersValuesFromSF = component.get('v.serviceAMTObj.PolicyInfoSelected');
            if(policyCarriersList != null && policyCarriersList != undefined && policyCarriersList.length > 0) {
                for(var i=0;i<policyCarriersList.length;i++) {
                    if(!policyCarrierNamesArray.includes(policyCarriersList[i].Policy_Information__r.Name)) {
                        policyCarrierNamesArray.push(policyCarriersList[i].Policy_Information__r.Name);
                        var policyCarrierToBeAdded = '';
                        if(selAssMedCarriersValuesFromSF != undefined && selAssMedCarriersValuesFromSF != null &&
                           selAssMedCarriersValuesFromSF.length > 0 && selAssMedCarriersValuesFromSF.includes(policyCarriersList[i].Policy_Information__r.Name)) {
                            policyCarrierToBeAdded = { text:policyCarriersList[i].Policy_Information__r.Name, value:policyCarriersList[i].Policy_Information__r.Name, selected:"true"};                                                                     
                        } else {
                            policyCarrierToBeAdded = { text:policyCarriersList[i].Policy_Information__r.Name, value:policyCarriersList[i].Policy_Information__r.Name};                      
                        }
                        policyCarriersValuesArray.push(policyCarrierToBeAdded);
                    }
                }
            }
            component.find("multipleSelect").set("v.PoliciesList", policyCarriersValuesArray);*/
            
        }      
        
        
    },
    doInit2 : function(component, event,helper){
        var startdate= component.find("editableField1").get("v.value");       
        component.set('v.serviceAMTObj.Case_Management_Start_Date__c',startdate);
        var enddate=component.find("editableField2").get("v.value"); 
        component.set('v.serviceAMTObj.Case_Management_End_Date__c',enddate);
        
    },
    onSelectRoleChangeFunction : function(component, event){
        debugger;
       // console.log('onSelectRoleChange');
        var selected = component.find("Role");                
        var roleValue = selected.get("v.value"); 
            component.set('v.serviceAMTObj.Contact_Role__c', roleValue);
      
    },
    onSelectPolicyInformation : function(component, event){
        debugger;
        //console.log('onSelectRoleChange');
        
        var selected = component.find("multipleSelect");                
        var policyName = selected.get("v.value");  
        var policyCarriersList = component.get('v.PoliciesList'); 
        //console.log('PoliciesList >>> '+policyCarriersList);
        if(policyName == undefined){
            component.set('v.serviceAMTObj.Policy_Information_MultiChecKlist__c ', null);    
            return;
        }else{
            component.set('v.serviceAMTObj.Policy_Information_MultiChecKlist__c ', policyName); 
           
        }
        
        /*  var policyCarriersValuesArray = [];
        var policyCarrierNamesArray = [];
        
        var policyCarriersList = component.get('v.serviceAMTObj.PolicyId');
        
        var selAssMedCarriersValuesFromSF = component.get('v.serviceAMTObj.PolicyInfoSelected');
        if(policyCarriersList != null && policyCarriersList != undefined && policyCarriersList.length > 0) {
            for(var i=0;i<policyCarriersList.length;i++) {
                if(!policyCarrierNamesArray.includes(policyCarriersList[i].Policy_Information__r.Name)) {
                    policyCarrierNamesArray.push(policyCarriersList[i].Policy_Information__r.Name);
                    var policyCarrierToBeAdded = '';
                    if(selAssMedCarriersValuesFromSF != undefined && selAssMedCarriersValuesFromSF != null &&
                       selAssMedCarriersValuesFromSF.length > 0 && selAssMedCarriersValuesFromSF.includes(policyCarriersList[i].Policy_Information__r.Name)) {
                        policyCarrierToBeAdded = { text:policyCarriersList[i].Policy_Information__r.Name, value:policyCarriersList[i].Policy_Information__r.Id, selected:"true"};                                                                     
                    } else {
                        policyCarrierToBeAdded = { text:policyCarriersList[i].Policy_Information__r.Name, value:policyCarriersList[i].Policy_Information__r.Id};                      
                    }
                    policyCarriersValuesArray.push(policyCarrierToBeAdded);
                }
            }
        }
        component.find("multipleSelect").set("v.PoliciesList", policyCarriersValuesArray);*/
        
        /* for(var i = 0 ; i < policyCarriersList.length ; i++){
            if(policyCarriersList[i].includes(policyName)){
                component.set('v.serviceAMTObj.Policy_Information__c', policyCarriersList[i].Id);         
                break;
            }
        }  */    
    },
    
    removeProcessingOnCancel : function(component, event, helper) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    confirmDelete : function(component, event){
        var cmpEvent = component.getEvent("service_amt_Popup_table_event");
        cmpEvent.setParams({'idToDelete' : component.get('v.serviceAMTObjId'),
                            'isDelete' : true});
        cmpEvent.fire();
    },
    editRecords : function(component, event, helper) {
        component.set('v.isEditable', true);
        $A.util.addClass(component.find('outputText'), 'slds-hide');
        $A.util.removeClass(component.find('multipleSelect'), 'slds-hide');       
        
        var PoliciesListNames = component.get('v.PoliciesListNames');
        var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
        var policyCarriersValuesArray = [];
        if(PoliciesListNames != undefined && PoliciesListNames != null ){
            for(var j=0; j<PoliciesListNames.length; j++) {
                var policyCarrierToBeAdded = '';
                if(selectedvalues != undefined && selectedvalues != null && selectedvalues.includes(PoliciesListNames[j])) {
                    policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j], selected:"true"}; 
                } else {
                    policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j]};
                }
                policyCarriersValuesArray.push(policyCarrierToBeAdded);
            }
        }
        component.find("multipleSelect").set("v.options", policyCarriersValuesArray);
    },
    cancelRecords : function(component, event, helper) {
        component.set('v.isEditable', false);  
    },
    /*cancelRecords : function(component, event, helper) {
        component.set('v.isEditable', false);       
        var editAuraparams = event.getParam('arguments');
        if(editAuraparams != null && editAuraparams.cancelEdit != null && 
           editAuraparams.cancelEdit != undefined && editAuraparams.cancelEdit == true) {
           component.set('v.isEditable', false);
            //helper.disableFields(component, event);
        } 
        else {
            
            $A.util.addClass(component.find('outputText'), 'slds-hide');
            $A.util.removeClass(component.find('multipleSelect'), 'slds-hide');
            $A.util.removeClass(component.find('opcheckBox'), 'slds-show');
            $A.util.addClass(component.find('opcheckBox'), 'slds-hide');
            $A.util.removeClass(component.find('checkBox'), 'slds-hide');
            
            var PoliciesListNames = component.get('v.PoliciesListNames');
            var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
            var policyCarriersValuesArray = [];
            if(PoliciesListNames != undefined && PoliciesListNames != null ){
                for(var j=0; j<PoliciesListNames.length; j++) {
                    var policyCarrierToBeAdded = '';
                    if(selectedvalues != undefined && selectedvalues != null && selectedvalues.includes(PoliciesListNames[j])) {
                        policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j], selected:"true"}; 
                    } else {
                        policyCarrierToBeAdded = {text:PoliciesListNames[j], value:PoliciesListNames[j]};
                    }
                    policyCarriersValuesArray.push(policyCarrierToBeAdded);
                }
            }
            component.find("multipleSelect").set("v.options", policyCarriersValuesArray);
            //component.set('v.isEditable', true);
           helper.enableFields(component, event);
        }
    },*/
    
    setDataToParent : function(component, event, helper) {
        helper.setDataToParentController(component, event);    
    },
    onSelectPolicyChange : function(component,event){
        
    },
    onChangeOfCheckBox:function(component,event,helper){
        var isCheckBoxChecked = component.get('v.isCheckBoxChecked');
        if(!isCheckBoxChecked){
            var PoliciesList = component.get('v.PoliciesListNames');
            var selectedall='';
            component.set('v.serviceAMTObj.Policy_Information_MultiChecKlist__c',selectedall);
            component.find("multipleSelect").set("v.disabled", true);
            alert('Inside onchange if');
            component.set('v.isCheckBoxChecked',true);
            
        }else{
            alert('Inside onchange else');
           
            component.find("multipleSelect").set("v.disabled", false);
            component.set('v.serviceAMTObj.Policy_Information_MultiChecKlist__c','');
            component.set('v.isCheckBoxChecked',false);
        }
        
    },
    confirmCancel:function(component,event,helper){
        var deleteAcc = component.find('confirmDeleteRecord');
        for(var i in deleteAcc){
            $A.util.addClass(deleteAcc[i], 'slds-hide');
            $A.util.removeClass(deleteAcc[i], 'slds-show');
    }
    }
})