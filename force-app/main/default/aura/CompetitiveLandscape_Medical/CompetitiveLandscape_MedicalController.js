({
    doInit : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
				                   
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);            
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
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){            
            component.set('v.isExpand',true);
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            if(component.get('v.isEditAccess')){
                component.find("addMedicalCarrier").set("v.disabled",false);
            }    
            if(!component.get('v.isEditMode')){
            helper.getCompititiveLandscapeMedicalCm(component,event,false,'');
                console.log('controller======',component.get("v.compLandscapeMedicalData"));
            }
            $A.util.toggleClass(cmpTarget,'slds-is-open');
            //component.set('v.isEditMode',false); //COMMENTED BY SAMARTH
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
        $A.util.addClass(component.find("saveMedicalCarrier"),"hide");
        //component.find("addMedicalCarrier").set("v.disabled",false); 
        $A.util.removeClass(component.find("editMedicalCarrier"),"hide");
        helper.saveCompititiveLandscapeMedicalCm(component,event);
        $A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i++) {        
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }
        
        var removeLinks = component.find("cancelLink");
        if (removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i++) { 
                    $A.util.removeClass(removeLinks[i],"hide");
                }
            }else{
                $A.util.removeClass(removeLinks,"hide");
            }
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
        $A.util.addClass(component.find("saveMedicalCarrier"),"hide");        
        component.find("addMedicalCarrier").set("v.disabled",false);  
        $A.util.removeClass(component.find("editMedicalCarrier"),"hide");
        $A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
        helper.getCompititiveLandscapeMedicalCm(component,event,false,'cancel');
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i++) { 
            $A.util.toggleClass(editTextAreas[i], 'readMode');
            $A.util.toggleClass(readModeAreas[i], 'editMode');
        }
        component.set('v.isEditMode',false);
        component.set('v.removeCompititorIdList','');
       /* var removeLinks = component.find("cancelLink");
        if(removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i++) { 
                    $A.util.removeClass(removeLinks[i],"hide");
                }
            }else{
                $A.util.removeClass(removeLinks,"hide");
            }
        }  */         
        // component.set("v.compLandscapeMedicalData",component.get("v.compLandscapeMedicalDataCopy"));
    },
    addMedicalCarrier : function(component, event, helper) {         
        var device = $A.get("$Browser.formFactor");
        var dataExist = component.get('v.compLandscapeMedicalData');
        if(component.get('v.isExpand') == false && (dataExist === undefined || dataExist.length === 0)){
			helper.checkDefaultCmCdRecord(component, event);            
        }
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Search Competitors','ModalBodyData':{'currentAccountId':component.get('v.recordId'),'selectedDataList':component.get('v.selectedDataList'),'isMedical':true},'ModalBody':'CompetitiveLandscape_Generic_AddPopUp'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
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
                                        for(var i=0; i < newCmp.length; i++) {
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
    openSortingPopup : function(component, event, helper){       
        $A.createComponents([["c:Panel_Component_Sorting",{attribute:true,'FieldsToSort':'Search for a Competitor','ModalBody':'CompetitiveLandscape_Generic_AddPopUp'}]],
                            function(newCmp, status){ 
                                if (component.isValid() && status === 'SUCCESS') {
                                    var dynamicComponentsByAuraId = {};
                                    for(var i=0; i < newCmp.length; i++) {
                                        var thisComponent = newCmp[i];
                                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                    }
                                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                    component.set("v.body", newCmp); 
                                } 
                            });        
    },
    removeMedicalCarrier : function(component, event, helper){
        console.log('inside remove');
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");                                       				        
        }
        //component.find("addMedicalCarrier").set("v.disabled",true);
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        component.set('v.removeCompititorId',recId);
        
        var spinnerVal = component.find('spinnerDelete');
        var proIndex = selectedItem.id;
        proIndex -= 2; 
        
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
        
        
        var deleteAcc = component.find('DeleteConfirmDailog');
        for(var i=0; i < deleteAcc.length; i++) { 
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }       
    },
    confirmDelete: function(component, event, helper) {
        console.log('inside confirm yes');        
        var deleteAcc = component.find('DeleteConfirmDailog');
        for(var i=0; i < deleteAcc.length; i++) { 
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
        var compititorId =  component.get('v.removeCompititorId');
        if(compititorId.indexOf('new_') !== -1){
            var compLandscapeMedicalData = component.get('v.compLandscapeMedicalData');           
            for(var i=0; i < compLandscapeMedicalData.length; i++) { 
                if(compLandscapeMedicalData[i].Id === compititorId){
                    compLandscapeMedicalData.splice(i,1);
                }
            }                         
            component.set('v.compLandscapeMedicalData',[]);
            component.set('v.compLandscapeMedicalData',compLandscapeMedicalData);            
            helper.doCalculateTotal(component, event);
            helper.makeEditable(component, event);
			component.set('v.isEditMode',true);  
        }else{
            if(component.get('v.isEditMode') === true){
                //helper.deleteCompititiveLandscapeMedicalCm(component,event,compititorId);
                var removeCompititorIdList = component.get('v.removeCompititorIdList');
                removeCompititorIdList.push(compititorId);
                var compLandscapeMedicalData = component.get('v.compLandscapeMedicalData');               
                for(var i=0; i < compLandscapeMedicalData.length; i++) { 
                    if(compLandscapeMedicalData[i].Id === compititorId){
                        compLandscapeMedicalData.splice(i,1);
                    }
                }               
                component.set('v.compLandscapeMedicalData',[]);
                component.set('v.compLandscapeMedicalData',compLandscapeMedicalData);
                helper.doCalculateTotal(component, event);
                helper.makeEditable(component, event);
				component.set('v.isEditMode',true);  
            }else{
                helper.deleteCompititiveLandscapeMedicalCm(component,event,compititorId);
                helper.getCompititiveLandscapeMedicalCm(component,event,false,'');
            }
        	
        }        
    },
    confirmCancel: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");                                       				        
        }
        console.log('inside confirm no');
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
        if(Array.isArray(spinnerVal)){
             for(var i=0; i<spinnerVal.length; i++){
                if(i == processIndex){
                    $A.util.addClass(spinnerVal[i], 'slds-hide');
                }        	
            }
        }else{
            $A.util.addClass(spinnerVal, 'slds-hide');
        }
       
        //component.find("addMedicalCarrier").set("v.disabled",false);
        var deleteAcc = component.find('DeleteConfirmDailog');
        for(var i=0; i < deleteAcc.length; i++) { 
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    addNewCompetitorAccount: function(component, event, helper) {
        console.log("inside addNewCompetitorAccount");
        var btnPressed = event.getParam("buttonPressed");
        if(btnPressed != 'cancel'){
            var device = $A.get("$Browser.formFactor");
        	if(device == "DESKTOP"){ 
                var cmpTarget = component.find("Competitive_Medical_CM");            
                var myLabel = component.find("utilityToggle").get("v.iconName");            
                if(myLabel=="utility:chevronright"){
                    component.set('v.isExpand',true);
                    component.find("utilityToggle").set("v.iconName","utility:chevrondown");               
                    $A.util.toggleClass(cmpTarget,'slds-is-open');
                }
            }
            var addCompRecords = event.getParam("accountData");
			var compLandscapeMedicalData = component.get('v.compLandscapeMedicalData');
            for(var i=0; i < addCompRecords.length; i++) {
                compLandscapeMedicalData.push({ 
                    'sobjectType':'Competitor__c',
                    'Id':'new_'+i,
                    'Account__c':component.get('v.recordId'),
                    'CompetitorAccount__c':addCompRecords[i].Id,
                    'CompetitorAccount__r':{'Id':addCompRecords[i].Id,'Name':addCompRecords[i].Name},
                    'Competitorclassification__c':'Medical',
                    'ParticipatingO65Retirees__c':0,
                    'ParticipatingPartTimeActives__c':0,
                    'MembershipEstimate__c':0,
                    'Type__c':'Account Competitor',
                    'ParticipatingNonBargainedFullTimeAc__c':0,
                    'ParticipatingBargainedFullTimeActive__c':0,
                    'ParticipatingU65Retirees__c':0,                   
                    'ParticipatingActives__c':0                                      
                });
            }
			component.set('v.compLandscapeMedicalData',compLandscapeMedicalData);
            helper.doCalculateTotal(component, event);
           
            helper.makeEditable(component, event);
            component.set('v.isEditMode',true);            
            //helper.getCompititiveLandscapeMedicalCm(component,event,true,'save');            
        }        
        helper.modalGenericClose(component);
        if(btnPressed != 'cancel'){
            //component.find("addMedicalCarrier").set("v.disabled",true);            
        }else{
            var device = $A.get("$Browser.formFactor");
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide"); 
            }
        }        
    },
    calculateTotal: function(component, event, helper) {
        console.log('inside calcuate total');
        helper.doCalculateTotal(component, event);
        
    },
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component);
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
        	$A.util.removeClass(component.find("action-bar-mobile"),"slds-hide"); 
        }
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0; i < ErrorMessage.length; i++) { 
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