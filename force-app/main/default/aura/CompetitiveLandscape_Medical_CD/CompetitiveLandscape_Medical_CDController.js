({
    doInit : function(component, event, helper) {        
        var device = $A.get("$Browser.formFactor");
                      
        if(device == "DESKTOP"){
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);                
                    helper.checkEditAccesToThisUser(component, event);
                }            
            }, 5000);  
        }else{
            helper.checkEditAccesToThisUser(component, event);
        }        
    },
 	expandCollapse: function(component, event, helper) {
        var device = $A.get("$Browser.isAndroid");
        if(device){
            $A.util.addClass(component.find("clientSurveyTbl"),'inputRadioSize');
        }
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("saveCancel"),"hide");                                  				        
        }         
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.set('v.isExpand',true);
            component.find(iconElement).set("v.iconName","utility:chevrondown");
        	if(component.get('v.isEditAccess')){
                component.find("addMedicalCarrier").set("v.disabled",true);
            }
            component.set("v.radioButtonVal",true);
            if(!component.get('v.isEditMode')){
            helper.getCompititiveLandscapeMedicalCm(component,event,false,'');
            }
            //helper.getCompititiveLandscapeMedicalCm(component,event,component.get('v.isEditMode'),'');//SAMARTH
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            //component.set('v.removeCompititorIdList',[]); //SAMARTH
            component.set('v.isExpand',false);
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    },
     saveMedicalCarrier: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor"); 
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("saveCancel"),"hide");                                  				        
        }
        var validateMedicalDataUpdated = component.get("v.compLandscapeMedicalDataCD");
        var isDataModified = component.get("v.isDataModified");
         var isParticipantLess = component.get("v.isParticipantLess");
         var isPrimarySecondarySelected = component.get("v.isPrimarySecondarySelected");
         var primarySelected = false;
         var secondarySelected = false;
		 for(var i=0; i < validateMedicalDataUpdated.length; i=i+1) {             
             if(validateMedicalDataUpdated[i].PrimaryIncumbent__c){
                 primarySelected = true;
             }
             if(validateMedicalDataUpdated[i].SecondaryIncumbent__c){
                 secondarySelected = true;
             }
         }
         if(isParticipantLess){
         	 var msg = component.get('v.participatingMembersValMsg');
             component.set('v.currentErrMsg',msg);
             component.set('v.currentPopUpName','Alert');
             helper.showPrompt(component, event);
         }else if((isPrimarySecondarySelected && isDataModified == false) || (primarySelected && secondarySelected && isDataModified == false)){
             //component.find("saveMedicalCarrier").set("v.disabled",true);
             $A.util.addClass(component.find("saveMedicalCarrier"),"hide");
             //component.find("addMedicalCarrier").set("v.disabled",false); 
             component.find("editMedicalCarrier").set("v.disabled",false);
             helper.saveCompititiveLandscapeMedicalCm(component,event);
             $A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
             component.set("v.radioButtonVal",true);
             var editTextAreas = component.find('editMode');
             var readModeAreas = component.find('readMode');
             if(editTextAreas !== undefined){ 
                 for(var i=0; i < editTextAreas.length; i=i+1) {       
                     $A.util.toggleClass(editTextAreas[i], 'readMode');
                     $A.util.toggleClass(readModeAreas[i], 'editMode');
                 } 
             }
             var removeLinks = component.find("cancelLink");           
             if (removeLinks != undefined) {
                 if(Array.isArray(removeLinks)){
                     for(var i=0; i < removeLinks.length; i=i+1) { 
                         $A.util.removeClass(removeLinks[i],"hide");
                     }
                 }else{
                     $A.util.removeClass(removeLinks,"hide");
                 }
             }
         }else{
             var msg = component.get('v.noPrimarySelectionMsg');
             component.set('v.currentErrMsg',msg);
             component.set('v.currentPopUpName',component.get('v.reminderPopUpNameValue'));
             helper.showPrompt(component, event);
         }                
    },
    editMedicalCarrier: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");           
        }
        helper.makeEditable(component, event);
        component.set('v.isEditMode',true); 
        if(device != "DESKTOP"){             
            $A.util.removeClass(component.find("saveCancel"),"hide");
        } 
    },
    cancelMedicalCarrier : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor"); 
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("saveCancel"),"hide");                                  				        
        }
        //component.find("saveMedicalCarrier").set("v.disabled",true);
        $A.util.removeClass(component.find("saveMedicalCarrier"),"hide");
        //component.find("addMedicalCarrier").set("v.disabled",false);  
        component.find("editMedicalCarrier").set("v.disabled",false);
        component.set("v.radioButtonVal",true);
        $A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
        helper.getCompititiveLandscapeMedicalCm(component,event,false,'cancel');
    	var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        if(editTextAreas !== undefined){
            for(var i=0; i < editTextAreas.length; i=i+1) { 
                $A.util.toggleClass(editTextAreas[i], 'readMode');
                $A.util.toggleClass(readModeAreas[i], 'editMode');
            }   
        }       
        
        var inputValues = component.find('inputValues');
        if(inputValues !== undefined){        
            for(var i=0; i < inputValues.length; i=i+1) { 
                if(inputValues[i].get("v.value") == ''){
                    inputValues[i].set("v.value",0);   
                }            
            }
        }
        component.set('v.isEditMode',false);
        component.set('v.removeCompititorIdList','');
        /*var removeLinks = component.find("cancelLink");
        if (removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i=i+1) { 
                    $A.util.removeClass(removeLinks[i],"hide");
                }
            }else{
                    $A.util.removeClass(removeLinks,"hide");
            }
        }*/
       // component.set("v.compLandscapeMedicalData",component.get("v.compLandscapeMedicalDataCopy"));
    },
    addMedicalCarrier : function(component, event, helper) {         
        var device = $A.get("$Browser.formFactor");
 		var dataExist = component.get('v.compLandscapeMedicalDataCD');
        if(component.get('v.isExpand') == false && (dataExist === undefined || dataExist.length === 0)){
			helper.checkDefaultCmCdRecord(component, event);            
        }        
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Search Competitors','ModalBodyData':{'currentAccountId':component.get('v.recordId'),'selectedDataList':component.get('v.selectedDataList'),'isMedical':true},'ModalBody':'CompetitiveLandscape_Generic_AddPopUp'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i=i+1) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{
             component.set("v.scrollStyleForDevice","");
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Search Competitors','ModalBodyData':{'currentAccountId':component.get('v.recordId'),'selectedDataList':component.get('v.selectedDataList'),'isMedical':true},'ModalBody':'CompetitiveLandscape_Generic_AddPopUp'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i=i+1) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }        
    },
     removeMedicalCarrier : function(component, event, helper){
        console.log('inside remove');
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");                                       				        
        }
        //component.find("addMedicalCarrier").set("v.disabled",true);
        var selectedItem = event.currentTarget;
        
        var spinnerVal = component.find('spinnerDelete');
        var proIndex = selectedItem.id;
       	proIndex -= 1; 
        
        component.set("v.processIndex",proIndex);
        if(Array.isArray(spinnerVal)){
            for(var i=0; i<spinnerVal.length; i++){
                if(i == proIndex){
                    $A.util.removeClass(spinnerVal[i], 'slds-hide');   
                }        	
            } 
        }else{
            $A.util.removeClass(spinnerVal, 'slds-hide');
        }
        
        var deleteIconVal = component.find('cancelLink');
        if(Array.isArray(deleteIconVal)){
            for(var i=0; i<deleteIconVal.length; i++){
                if(i == proIndex){
                    $A.util.addClass(deleteIconVal[i], 'slds-hide');
                }
            }
        }else{
            $A.util.addClass(deleteIconVal, 'slds-hide');
        }
         
        var recId = selectedItem.dataset.record;
    	component.set('v.removeCompititorId',recId);
        var deleteAcc = component.find('DeleteConfirmDailog');
        for(var i=0; i < deleteAcc.length; i=i+1) {
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }       
    },
    confirmDelete: function(component, event, helper) {
        console.log('inside confirm yes');       
        var deleteAcc = component.find('DeleteConfirmDailog');
        for(var i=0; i < deleteAcc.length; i=i+1) {
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }  
        var compititorId =  component.get('v.removeCompititorId');
        if(compititorId.indexOf('new_') !== -1){
            var compLandscapeMedicalData = component.get('v.compLandscapeMedicalDataCD');
            for(var i=0; i < compLandscapeMedicalData.length; i++) { 
                if(compLandscapeMedicalData[i].Id === compititorId){
                    compLandscapeMedicalData.splice(i,1);
                }
            } 
            component.set('v.compLandscapeMedicalDataCD',compLandscapeMedicalData);
            helper.doCalculateTotal(component, event, true);
            var dataEmptyCheck = component.get('v.compLandscapeMedicalDataCD')
            if(dataEmptyCheck.length === 1){
                for(var i=0; i < dataEmptyCheck.length; i=i+1) { 
                    if(dataEmptyCheck[i].CompetitorAccount__r !== undefined && dataEmptyCheck[i].CompetitorAccount__r.Name == 'Total'){
                        component.set('v.compLandscapeMedicalEmptyList', true);
						component.set('v.isDataModified',false);
						component.set('v.isPrimarySecondarySelected',true);                        
                         //$A.util.addClass(component.find("saveMedicalCarrier"),"hide");                       
                         //$A.util.addClass(component.find("editMedicalCarrier"), 'hide');                         
                         //$A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
                    }
                }                
            }            
        }else{        	
            if(component.get('v.isEditMode') === true){ 
                //helper.deleteCompititiveLandscapeMedicalCm(component,event,compititorId,false);
                var removeCompititorIdList = component.get('v.removeCompititorIdList');
                removeCompititorIdList.push(compititorId);
                var compLandscapeMedicalData = component.get('v.compLandscapeMedicalDataCD');
                for(var i=0; i < compLandscapeMedicalData.length; i++) { 
                    if(compLandscapeMedicalData[i].Id === compititorId){
                        compLandscapeMedicalData.splice(i,1);
                    }
                }
                component.set('v.compLandscapeMedicalDataCD',compLandscapeMedicalData);
                helper.doCalculateTotal(component, event, true);
                var dataEmptyCheck = component.get('v.compLandscapeMedicalDataCD')
                if(dataEmptyCheck.length === 1){
                    for(var i=0; i < dataEmptyCheck.length; i=i+1) { 
                        if(dataEmptyCheck[i].CompetitorAccount__r !== undefined && dataEmptyCheck[i].CompetitorAccount__r.Name === 'Total'){
                            component.set('v.compLandscapeMedicalEmptyList', true);
                            component.set('v.isDataModified',false);
                            component.set('v.isPrimarySecondarySelected',true);
                             //$A.util.addClass(component.find("saveMedicalCarrier"),"hide");                       
                             //$A.util.addClass(component.find("editMedicalCarrier"), 'hide');                         
                             //$A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
                        }
                    }                
                }        
            }else{
                helper.deleteCompititiveLandscapeMedicalCm(component,event,compititorId,true);                
            }
        }       
    },
    confirmCancel: function(component, event, helper) {
        console.log('inside confirm no');
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");                                       				        
        }
        var processIndex = component.get("v.processIndex");                       
        var deleteIconVal = component.find('cancelLink');
		if(Array.isArray(deleteIconVal)){        
            for(var i=0; i<deleteIconVal.length; i++){
                if(i == processIndex){
                    $A.util.removeClass(deleteIconVal[i], 'slds-hide');
                }
            }
        }else{
            $A.util.removeClass(deleteIconVal, 'slds-hide');
        }
        
        var spinnerVal = component.find('spinnerDelete');
        if(Array.isArray(deleteIconVal)){
            for(var i=0; i<spinnerVal.length; i++){
                if(i == processIndex){
                    $A.util.addClass(spinnerVal[i], 'slds-hide');
                }        	
            }
        }else{
            $A.util.addClass(spinnerVal, 'slds-hide');
        }
        
        var deleteIconVal = component.find('cancelLink');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinnerDelete');
        $A.util.addClass(spinnerVal, 'slds-hide');
        
        //component.find("addMedicalCarrier").set("v.disabled",false);
        var deleteAcc = component.find('DeleteConfirmDailog');
        for(var i=0; i < deleteAcc.length; i=i+1) {
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    confirmCancelForPrompt: function(component, event, helper) {       
        var reminderPopUp = component.find('reminderPopUp');
        for(var i=0; i < reminderPopUp.length; i=i+1) {
            $A.util.removeClass(reminderPopUp[i], 'slds-show');
            $A.util.addClass(reminderPopUp[i], 'slds-hide');
        }
    },
	calculateTotal: function(component, event, helper) {
        console.log("calculate");
        helper.doCalculateTotal(component, event);
    },    
    addNewCompetitorAccount: function(component, event, helper) {
        console.log("inside addNewCompetitorAccount");
        var btnPressed = event.getParam("buttonPressed");
        if(btnPressed != 'cancel'){
            var device = $A.get("$Browser.formFactor");
            if(device == "DESKTOP"){
                var cmpTarget = component.find("Competitive_Medical_CD");            
                var myLabel = component.find("utilityToggle").get("v.iconName");            
                if(myLabel=="utility:chevronright"){
                    component.find("utilityToggle").set("v.iconName","utility:chevrondown");               
                    $A.util.toggleClass(cmpTarget,'slds-is-open');
                }
            }
            var addCompRecords = event.getParam("accountData");
			var compLandscapeMedicalDataCD = component.get('v.compLandscapeMedicalDataCD');
            for(var i=0; i < addCompRecords.length; i++) {
                compLandscapeMedicalDataCD.push({
                    'sobjectType':'Competitor__c',
                    "Id":"new_"+i,
                    "Account__c":component.get('v.recordId'),
                    "CompetitorAccount__c":addCompRecords[i].Id,
                    "CompetitorAccount__r":{"Id":addCompRecords[i].Id,"Name":addCompRecords[i].Name},
                    "Competitorclassification__c":"Medical",
                    "ParticipatingO65Retirees__c":0,
                    "ParticipatingPartTimeActives__c":0,
                    "MembershipEstimate__c":0,
                    "Type__c":"Account Competitor",
                    "ParticipatingNonBargainedFullTimeAc__c":0,
                    "ParticipatingBargainedFullTimeActive__c":0,
                    "ParticipatingU65Retirees__c":0,
                    "MembersinOtherMedicalProducts__c":0,                  
                    "ParticipatingActives__c":0,
                    "PrimaryIncumbent__c":false,
                    "SecondaryIncumbent__c":false
                });
            }
			component.set('v.compLandscapeMedicalDataCD',compLandscapeMedicalDataCD);
            component.set('v.compLandscapeMedicalEmptyList', false);
            helper.doCalculateTotal(component, event, true);
            helper.makeEditable(component, event);
            if(compLandscapeMedicalDataCD.length > 5){                        
                //$A.util.removeClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                $A.util.addClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                $A.util.addClass(component.find("clientSurveyTbl"),'applet-scrollable-table-s');
                $A.util.addClass(component.find("clientSurveyTblBody"),'slds-custom-table');
            }
            //helper.getCompititiveLandscapeMedicalCm(component,event,true,'save');
        }        
        helper.modalGenericClose(component);
        component.set('v.isEditMode',true); 
        if(btnPressed != 'cancel'){
        	//component.find("addMedicalCarrier").set("v.disabled",true);
        }else{
            var device = $A.get("$Browser.formFactor");
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide"); 
            }
        }
    },
    modelCloseComponentEvent : function(component, event,helper) {
      helper.modalGenericClose(component);
      var device = $A.get("$Browser.formFactor");
      if(device != "DESKTOP"){ 
      	 $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide"); 
      }
    },
    prevRadioVal : function(component, event,helper) {
    	var prevVal = event.getSource().get("v.value");
        component.set('v.prevRadioVal',prevVal);
    },
    onRadioPrimary : function(component, event,helper) {
        console.log("Inside onRadioPrimary");
        var index = parseInt(event.getSource().get("v.text"));
        var prevVal = component.get('v.prevRadioVal');        
        component.set('v.isPrimarySecondarySelected',false);  
        var primaryRadioUpdatedUI = component.find("primaryRadio");  
        if(Array.isArray(primaryRadioUpdatedUI)){
            for(var i=0; i < primaryRadioUpdatedUI.length; i=i+1) {
                if(primaryRadioUpdatedUI[i].get("v.text") != undefined){
                    var ind = primaryRadioUpdatedUI[i].get("v.text");
                    if(ind != index){
                        primaryRadioUpdatedUI[i].set("v.value",false);
                    }else if(prevVal){
                        primaryRadioUpdatedUI[i].set("v.value",false);
                    }else{
                        primaryRadioUpdatedUI[i].set("v.value",true);
                    }
                }          
            } 
        }else{
            if(primaryRadioUpdatedUI.get("v.text") != undefined){
                var ind = primaryRadioUpdatedUI.get("v.text");
                if(ind != index){
                    primaryRadioUpdatedUI.set("v.value",false);
                }else if(prevVal){
                    primaryRadioUpdatedUI.set("v.value",false);
                }else{
                    primaryRadioUpdatedUI.set("v.value",true);
                }
            }   
        }   	
        var primaryRadioUpdated = component.get("v.compLandscapeMedicalDataCD");
        for(var i=0; i < primaryRadioUpdated.length; i=i+1) {
            if(i != index){
                primaryRadioUpdated[i].PrimaryIncumbent__c = false;
            }          
        }
    },
    onRadioSecondary : function(component, event,helper) {
		event.preventDefault();        
        var index = parseInt(event.getSource().get("v.text"));
        var secondaryRadioUpdatedUI = component.find("secondaryRadio");
        var prevVal = component.get('v.prevRadioVal');
        component.set('v.isPrimarySecondarySelected',false);
        if(Array.isArray(secondaryRadioUpdatedUI)){
            for(var i=0; i < secondaryRadioUpdatedUI.length; i=i+1){
                if(secondaryRadioUpdatedUI[i].get("v.text") != undefined){
                    var ind = secondaryRadioUpdatedUI[i].get("v.text");
                    if(ind != index){
                        secondaryRadioUpdatedUI[i].set("v.value",false);
                    }else if(prevVal){
                        secondaryRadioUpdatedUI[i].set("v.value",false);
                    }else{
                        secondaryRadioUpdatedUI[i].set("v.value",true);
                    }
                }          
            }
        }else{
            if(secondaryRadioUpdatedUI.get("v.text") != undefined){
                var ind = secondaryRadioUpdatedUI.get("v.text");
                if(ind != index){
                    secondaryRadioUpdatedUI.set("v.value",false);
                }else if(prevVal){
                    secondaryRadioUpdatedUI.set("v.value",false);
                }else{
                    secondaryRadioUpdatedUI.set("v.value",true);
                }
            }   
        } 
        var secondaryRadioUpdated = component.get("v.compLandscapeMedicalDataCD");
        for(var i=0; i < secondaryRadioUpdated.length; i=i+1) {
            if(i != index){
                secondaryRadioUpdated[i].SecondaryIncumbent__c = false;
            }
        }      
    },
    confirmPrompt: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor"); 
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("saveCancel"),"hide");                                  				        
        }
        var promptYes = component.find('reminderPopUp');
        component.set('v.isDataModified',false);
        component.set('v.isPrimarySecondarySelected',true);        
        for(var i=0; i < promptYes.length; i=i+1) {
            $A.util.removeClass(promptYes[i], 'slds-show');
            $A.util.addClass(promptYes[i], 'slds-hide');
        }
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0; i < ErrorMessage.length; i=i+1) {
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    setGeneralValues: function(component, event, helper){			
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null){
                if(generalObj.HasEditAccess != null){
                    component.set('v.isEditAccess',generalObj.HasEditAccess);
                }else{
                    helper.checkEditAccesToThisUser(component, event);
                }
            }else{
                helper.checkEditAccesToThisUser(component, event);
            }  
        }else{            
            helper.checkEditAccesToThisUser(component, event);
        }              
    },
    scrollBottom: function(component, event, helper){	        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
        	var isScrollStop = component.get("v.isScrollStop");
        	component.set("v.isStop",component.get("v.isStop")+1);                    
        	if(isScrollStop){                       
            
            var actionBar = component.find("action-bar-mobile");               	           
            $A.util.addClass(actionBar,"slds-hide");    
                        
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                                              
            }
        } 
    }
})