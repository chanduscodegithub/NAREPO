({
    doInit : function(component, event,helper){
        //debugger;
        // alert('hello')
        //console.log('isEditEnable in table '+component.get('v.isEditEnable'));
        if(component.get('v.sobjectusedAccount')){
           /* var userHirearchy = component.get('v.serviceAMTObj.UserHierarchy__c');
            if(userHirearchy != null){
                userHirearchy=userHirearchy.trim();
                component.get('v.serviceAMTObj.UserHierarchy__c',userHirearchy);

            }*/
         	var currentRole = component.get(' v.serviceAMTObj.Contact_Role__c');
           
            /*Removed if Condition to display checkbox for all role as per Case No :00003464 *****SHRUTI******/
            //if((currentRole == 'Client Manager') || (currentRole == 'Client Management Consultant') || (currentRole == 'Service Account Manager')){
           		//component.set('v.isPrimaryRoles',true); 
        	//}
            
            var PoliciesList = component.get('v.PoliciesList');
            var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
            var ischeckboxchecked = component.get('v.serviceAMTObj.All_Policy__c');
            
            console.log('backcolor=====',component.get('v.serviceAMTObj.backGroundColor'));
            
            
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
             var PoliciesListNames = component.get('v.PoliciesListNames');
            //component.find("multipleSelect").set("v.options", policyCarriersValuesArray);
            var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
            var policyCarriersValuesArray = [];
            var selectedPickListValues = [];
            if(PoliciesListNames != undefined && PoliciesListNames != null ){
                for(var j=0; j<PoliciesListNames.length; j++) {
                    var policyCarrierToBeAdded = '';
                    //console.log(selectedvalues);
                    if(selectedvalues != undefined && selectedvalues != null && selectedvalues.includes(PoliciesListNames[j])) {
                   		//console.log('inside selected if');
                        policyCarrierToBeAdded = {'text':PoliciesListNames[j], 'value':PoliciesListNames[j],'selected':"true"};
                    }else{
                    policyCarrierToBeAdded = {'text':PoliciesListNames[j], 'value':PoliciesListNames[j]}; 
                    }
                    console.log('policyCarrierToBeAdded---',policyCarrierToBeAdded);
                     
                    policyCarriersValuesArray.push(policyCarrierToBeAdded);
                }                
            }
            
            if(selectedvalues != undefined && selectedvalues != null){
               var selectedValuesArray = selectedvalues.split(';');
               for(var j=0; j<selectedValuesArray.length; j++) {                   
                   var policyCarrierToBeAdded = '';
                   if(!PoliciesListNames.includes(selectedValuesArray[j])){
                      policyCarrierToBeAdded = {'text':selectedValuesArray[j], 'value':selectedValuesArray[j],'selected':"true"};  
                      policyCarriersValuesArray.push(policyCarrierToBeAdded);
                   }
                  
               }
            }
            
            
            component.set("v.multiSelectOptions",policyCarriersValuesArray);
            component.set("v.multiSelectOptionsSelected",selectedPickListValues);
           
   
           
           // component.find("multipleSelect").set("v.options", policyCarriersValuesArray);
            
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
        //debugger;
       // console.log('onSelectRoleChange');
        var selected = component.find("Role");                
        var roleValue = selected.get("v.value"); 
            component.set('v.serviceAMTObj.Contact_Role__c', roleValue);
      
    },
   
    removeProcessingOnCancel : function(component, event, helper) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    confirmDelete : function(component, event){
        var cmpEvent = component.getEvent("service_amt_Popup_table_event");
        console.log('delete Id---'+component.get('v.serviceAMTObjId'));
        cmpEvent.setParams({'idToDelete' : component.get('v.serviceAMTObjId'),
                            'isDelete' : true});
        cmpEvent.fire();
    },
    editRecords : function(component, event, helper) {
        component.set('v.isEditable', true);
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
    },
    selectRole:function(component,event,helper){
        console.log('Inside selectRole method Shruti');
        $A.util.removeClass(component.find("role_Popup"), 'slds-hide');
         var rolePLValues = component.get('v.contactRolePLValues');
            component.set('v.roleSearchResult',rolePLValues);       
    },
    cancelRole:function(component,event,helper){
        $A.util.addClass(component.find("role_Popup"), 'slds-hide');    	
    },
    selectedRole:function(component,event,helper){
        var selectedItem = event.currentTarget;
        var currentRole = selectedItem.dataset.record;         
        component.set('v.serviceAMTObj.Contact_Role__c',currentRole);
        
       // var currentRole = component.get(' v.serviceAMTObj.Contact_Role__c');
           component.set('v.isPrimaryRoles',true);
           /* Removed if Condition to display checkbox for all role when role is changed as per Case No :00003464 *****SHRUTI*******/
           /* if((currentRole == 'Client Manager') || (currentRole == 'Client Management Consultant') || (currentRole == 'Service Account Manager')){
           		component.set('v.isPrimaryRoles',true); 
            }else{
                //component.set('v.isPrimaryRoles',false);
            }*/
        
        $A.util.addClass(component.find("role_Popup"), 'slds-hide');    	
    },
    
    onEditPolicyInformation : function(component, event){
        var PoliciesListNames = component.get('v.PoliciesListNames');
         var selectedvalues = component.get('v.serviceAMTObj.Policy_Information_MultiChecKlist__c');
       var isSelectedValue = false;
         var selected = component.find("multipleSelect");
        //console.log('onEditPolicyInformation-----',selected);
        var policyName = selected.get("v.value");  
        if(PoliciesListNames != undefined && PoliciesListNames != null ){ 
        for(var j=0; j<PoliciesListNames.length; j++) {
               	var policyCarrierToBeAdded = '';
                if(selectedvalues.includes(PoliciesListNames[j])) {
                	isSelectedValue = true;
                } 
            }
        }
        return isSelectedValue;
    },
    roleSearchField : function (component, event, helper) {
         var enteredSearchText = component.find('searchKeywordForUsers').get('v.value');
        // var roleSearchInput = component.find('userroleinput');
       // var enteredSearchText = roleSearchInput.get("v.value");
        console.log('enteredSearchText--',enteredSearchText);
         var rolePLValues = component.get('v.contactRolePLValues');
            component.set('v.roleSearchResult',rolePLValues);
         
         helper.searchRoleInList(component, event, helper,enteredSearchText);
         
        
    },
    
    /*onPrimaryChecked : function(component, event, helper){
         var checkCmp = component.find("checkbox");
        console.log('checkCmp---1=',checkCmp);
		 var resultCmp = checkCmp.get("v.value");
        console.log('resultCmp--',resultCmp);
        
        if(resultCmp == true){
        
         var service_AMT_Record_List = component.get('v.serviceAMTList');
            console.log('service_AMT_Record_List==',service_AMT_Record_List);
        var isprimaryexists = 0;
        if(service_AMT_Record_List.length > 0){
        for(var i=0;i<service_AMT_Record_List.length;i++){
            console.log('inside for loop');
            var primaryvalue = service_AMT_Record_List[i].Primary__c;
            
            console.log('primaryvalue=',primaryvalue);
            if(primaryvalue){
                console.log('Inside if---->'+primaryvalue);
                if(service_AMT_Record_List[i].Contact_Role__c == component.get('v.serviceAMTObj.Contact_Role__c') ){
            	isprimaryexists = isprimaryexists + 1;
                }
            }
        }
        }
        
            console.log('isprimaryexists==',isprimaryexists);
        if(isprimaryexists > 1){
            console.log('inside exists');
            checkCmp.set("v.value",false);
           
            var promptMsgList = component.find('promptMessageForDateFields');
       		for (var i = 0; i < promptMsgList.length; i++) {
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
        	}
        
          component.set('v.promptMessageText', 'The Primary Indicator has already been selected for this role. In order to make this AMT member primary, please first uncheck the other AMT member that is currently flagged as a main for this role.');  
        
            
        }
        else{
            component.set('v.serviceAMTObj.Primary__c',true); 
            console.log('Value of v.serviceAMTObj.Primary__c--->'+component.get('v.serviceAMTObj.Primary__c'));
        }
        
        }
      
    },*/
    
    makePrimaryUncheck: function(component, event, helper){
         var checkCmp = component.find("checkbox");
        //console.log('checkCmp---2=',checkCmp);
         checkCmp.set("v.value",false);
        //console.log(checkCmp.get("v.value"));
    },
    
     confirmCancelForPrompt : function(component, event, helper) {
        
        
        component.set("v.promptMessageText", '');
        var confirmCancelForPromptList = component.find('promptMessageForDateFields');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    handleMultiPickList: function(component,event,helper){
        console.log('inside handleMultiPickList')
       
        var loop = true;
        var i = 0;
        var pickListValues = '';
        var value = event.getParams();
        console.log('value recived is '+value);
        while(loop) {
            if(value[i] != undefined) {
                
                
                if(!pickListValues.includes(value[i].otherProductRecord)){
                   pickListValues = pickListValues.concat(value[i].otherProductRecord,';'); 
                }
                i++;
            } else {
                loop = false;
            }
        }  
        if(pickListValues != ''){
           pickListValues = pickListValues.replace(/;\s*$/, ""); 
        }
       console.log('pickListValues----',pickListValues); 
        
        component.set('v.serviceAMTObj.Policy_Information_MultiChecKlist__c ', pickListValues); 
    },
    
     enableGoBtn : function(component, event, helper) {
        
        var searchKeyText = component.find('searchKeywordForUsers').get('v.value');
       
       
        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0)  {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
            
        } else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
     },
     onClear: function(component, event, helper){
      
        component.find('goBtn').set("v.disabled",true);
         component.find('clrBtn').set("v.disabled",true);
         component.set('v.isRoleSearchEmpty',false);
        component.find('searchKeywordForUsers').set('v.value','');
         var rolePLValues = component.get('v.contactRolePLValues');
            component.set('v.roleSearchResult',rolePLValues);
       
     }
    
})