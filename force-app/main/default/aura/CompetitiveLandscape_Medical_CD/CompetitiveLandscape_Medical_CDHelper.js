({
	 getCompititiveLandscapeMedicalCm : function(component, event,isEdit,method) {
         if($A.get("$Browser.isIOS")){
             $A.util.removeClass(component.find('articleClass'),'cScroll-table');
         }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        console.log('helper');
        var isLoggedInUserRoleVal = component.get('v.isEditAccess');
        if(isLoggedInUserRoleVal == null || isLoggedInUserRoleVal == undefined) {
        	isLoggedInUserRoleVal = false;    
        }
        var action = component.get("c.getCompetitiveLandscapeMedicalCmRecords");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "accountType" : 'cd',
            "isEditAccess":isLoggedInUserRoleVal
        });
        action.setCallback(this,function(response){
            
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            
            var state = response.getState();
            if(state == "SUCCESS") {                
                var ResponseData = response.getReturnValue();
                if(ResponseData != null && ResponseData.isEditAccess != null){                    
                    component.set("v.isEditAccess", ResponseData.isEditAccess);
                }
                
                if(response.getReturnValue() != null && response.getReturnValue().length > 0) {
					if(isLoggedInUserRoleVal && response.getReturnValue().length == 1) { 
                        $A.util.addClass(component.find("editMedicalCarrier"), 'hide');
                        $A.util.addClass(component.find("saveMedicalCarrier"), 'hide');
                        $A.util.addClass(component.find("cancelMedicalCarrier"), 'hide');
						component.find("addMedicalCarrier").set("v.disabled",false);                        
                    }else if(isLoggedInUserRoleVal){
                        $A.util.removeClass(component.find("editMedicalCarrier"), 'hide');
                        $A.util.addClass(component.find("saveMedicalCarrier"), 'hide');
                        $A.util.addClass(component.find("cancelMedicalCarrier"), 'hide');
                        component.find("addMedicalCarrier").set("v.disabled",false);
                        //component.find("saveMedicalCarrier").set("v.disabled",true);
                        component.find("editMedicalCarrier").set("v.disabled",false);
                        
                    }                
                    if(response.getReturnValue().length == 1){
                        var dataEmptyCheck = response.getReturnValue();
                        for(var i=0; i < dataEmptyCheck.length; i=i+1) { 
                            if(dataEmptyCheck[i].CompetitorAccount__r !== undefined && dataEmptyCheck[i].CompetitorAccount__r.Name === 'Total'){
                        		component.set('v.compLandscapeMedicalEmptyList', true);
                            }
                        }
                    }else{
                        component.set('v.compLandscapeMedicalEmptyList', false);
                    }
                    if(response.getReturnValue().length > 5){                        
                        //$A.util.removeClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                        $A.util.addClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                        $A.util.addClass(component.find("clientSurveyTbl"),'applet-scrollable-table-s');
                    	$A.util.addClass(component.find("clientSurveyTblBody"),'slds-custom-table');
                    }else{
                        $A.util.removeClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                        $A.util.removeClass(component.find("clientSurveyTbl"),'applet-scrollable-table-s');
                        $A.util.removeClass(component.find("clientSurveyTblBody"),'slds-custom-table');
                    } 
                    var compLandscapeMedicalDataUpdated = response.getReturnValue();
                    for(var i=0; i < compLandscapeMedicalDataUpdated.length; i=i+1) { 
                        if(compLandscapeMedicalDataUpdated[i].CompetitorAccount__r !== undefined && compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name === 'Total'){
                            component.set('v.participatingMembersinputCD',compLandscapeMedicalDataUpdated[i].MembershipEstimate__c); 
                            component.set('v.participatingActivesinputCD',compLandscapeMedicalDataUpdated[i].ParticipatingActives__c);
                            component.set('v.participatingU65RinputCD',compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c);
                            component.set('v.participatingO65RinputCD',compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                            component.set('v.participatingBFTAinputCD',compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c);
                            component.set('v.participatingNBFTAinputCD',compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c);
                            component.set('v.participatingPTAinputCD',compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c);
                        }else if(compLandscapeMedicalDataUpdated[i].Comments__c == null){
                                 compLandscapeMedicalDataUpdated[i].Comments__c = '';                            
                        }
                    }
                    component.set('v.compLandscapeMedicalDataCD', response.getReturnValue());
                    var device = $A.get("$Browser.formFactor");
                    if(isEdit){
                        this.makeEditable(component, event);                        
                         if(device != "DESKTOP"){
                            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                            $A.util.addClass(component.find("sortEdit"),"hide");
                            $A.util.removeClass(component.find("saveCancel"),"hide");
                         } 
                    }else if(method == 'doinit'){
                        if(device != "DESKTOP"){ 
                        	$A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                        }
                    }else if(method == 'cancel'){
                        if(device != "DESKTOP"){ 
                            $A.util.removeClass(component.find("sortEdit"),"hide");
                            $A.util.addClass(component.find("saveCancel"),"hide");
                        }  
                    }else{                       
                        if(device != "DESKTOP"){ 
                            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");                            
                        }
                    }                     
                }else{
                    component.set('v.compLandscapeMedicalEmptyList', true);
                }
            }else if(state === "ERROR") {
                if(component.get('v.isEditAccess')){
                     component.find("addMedicalCarrier").set("v.disabled",false);
                }               
                var errors = response.getError(); 
                if(errors){
                   if(errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i=i+1) { 
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In getCompititiveLandscapeMedicalCm method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    checkDefaultCmCdRecord : function(component, event) {
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        
        console.log('inside checkDefaultCmCdRecord');
        var isLoggedInUserRoleEnabled = component.get('v.isEditAccess');
        if(isLoggedInUserRoleEnabled == null || isLoggedInUserRoleEnabled == undefined) {
        	isLoggedInUserRoleEnabled = false;    
        }
        var action = component.get("c.checkDefaultCmCdRecords");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "accountType" : 'cd',
            "isEditAccess":isLoggedInUserRoleEnabled
        });
        action.setCallback(this,function(response){
            
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            
            var state = response.getState();            
            if(state == "SUCCESS") {                    
                var ResponseData = response.getReturnValue();              
                if(ResponseData != null && ResponseData.length > 0) {                                      
                    component.set('v.compLandscapeMedicalDataCD', ResponseData);                   
                }
                if(ResponseData != null && ResponseData.isEditAccess != null){                    
                    component.set("v.isEditAccess", ResponseData.isEditAccess);
                }                                            
            }else if(state === "ERROR") {
                var errors = response.getError(); 
                if(errors){
                   if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i++) { 
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In saveCompititiveLandscapeMedicalCm method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
        });
        $A.enqueueAction(action);
    },
    deleteCompititiveLandscapeMedicalCm : function(component, event, compititorId, getData) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var action = component.get("c.deleteCompititorsFromApplet");
        action.setParams({
            "compititorRecordId" : compititorId,
            "currentAccountId" : component.get('v.recordId'),
            "deletedCompititorsList" : component.get("v.compLandscapeMedicalDataCD"),
            "accountType" : 'cd'
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            
            var state = response.getState();
            if(state == "SUCCESS") {
                component.find("addMedicalCarrier").set("v.disabled",false);
                if(getData){
                 	this.getCompititiveLandscapeMedicalCm(component,event,false,'');   
                }                
                //var ResponseData = response.getReturnValue();
               /* if(ResponseData != null && ResponseData.isEditAccess != null){                    
                    component.set("v.isEditAccess", ResponseData.isEditAccess);
                }
                
                if(response.getReturnValue() != null && response.getReturnValue().length > 0) {
                    component.set('v.compLandscapeMedicalData', response.getReturnValue());
                }else{
                    component.set('v.compLandscapeMedicalEmptyList', true);
                }*/
            }else if(state === "ERROR") {
                if(component.get('v.isEditAccess')){
                	component.find("addMedicalCarrier").set("v.disabled",false);
                }
                var errors = response.getError(); 
                if(errors){
                   if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i=i+1) { 
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In deleteCompititiveLandscapeMedicalCm method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            if(getData === false){
            	$A.util.addClass(spinner1, 'slds-hide');
            	$A.util.addClass(spinner2, 'slds-hide');
            }
            $A.util.removeClass(appletIcon, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
     saveCompititiveLandscapeMedicalCm : function(component, event) {
         if($A.get("$Browser.isIOS")){
             $A.util.removeClass(component.find('articleClass'),'cScroll-table');
         }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var action = component.get("c.saveCompititiveLandscapeMedicalRecords");
        var compLandscapeMedicalData = component.get("v.compLandscapeMedicalDataCD");
        var upsertCompLandscapeMedicalData = [];      
        for(var i=0; i < compLandscapeMedicalData.length; i++) {
            var cId = compLandscapeMedicalData[i].Id;
            if(cId.indexOf('new_') !== -1){
                 upsertCompLandscapeMedicalData.push({
                    'sobjectType':'Competitor__c', 
                    'Account__c':component.get('v.recordId'),
                    'CompetitorAccount__c':compLandscapeMedicalData[i].CompetitorAccount__c,                   
                    "sobjectType":"Competitor__c",                                                               
                    "Competitorclassification__c":"Medical",
                    "ParticipatingO65Retirees__c":compLandscapeMedicalData[i].ParticipatingO65Retirees__c,
                    "ParticipatingPartTimeActives__c":compLandscapeMedicalData[i].ParticipatingPartTimeActives__c,
                    "MembershipEstimate__c":compLandscapeMedicalData[i].MembershipEstimate__c,
                    "Type__c":"Account Competitor",
                    "Comments__c":compLandscapeMedicalData[i].Comments__c,
                    "ParticipatingNonBargainedFullTimeAc__c":compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c,
                    "ParticipatingBargainedFullTimeActive__c":compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c,
                    "ParticipatingU65Retirees__c":compLandscapeMedicalData[i].ParticipatingU65Retirees__c,
                    "MembersinOtherMedicalProducts__c":compLandscapeMedicalData[i].MembersinOtherMedicalProducts__c,                  
                    "ParticipatingActives__c":compLandscapeMedicalData[i].ParticipatingActives__c,
                    "PrimaryIncumbent__c":compLandscapeMedicalData[i].PrimaryIncumbent__c,
                    "SecondaryIncumbent__c":compLandscapeMedicalData[i].SecondaryIncumbent__c,
                    "Type_of_Products_Services_Provided__c" : "Medical"
                });
            }else{
                 upsertCompLandscapeMedicalData.push({                  
                    "sobjectType":"Competitor__c",
                    "Id":compLandscapeMedicalData[i].Id,
                    "Comments__c":compLandscapeMedicalData[i].Comments__c,
                    "CompetitorAccount__c":compLandscapeMedicalData[i].CompetitorAccount__c,
                    "ParticipatingO65Retirees__c":compLandscapeMedicalData[i].ParticipatingO65Retirees__c,
                    "ParticipatingPartTimeActives__c":compLandscapeMedicalData[i].ParticipatingPartTimeActives__c,
                    "MembershipEstimate__c":compLandscapeMedicalData[i].MembershipEstimate__c,          
                    "ParticipatingNonBargainedFullTimeAc__c":compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c,
                    "ParticipatingBargainedFullTimeActive__c":compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c,
                    "ParticipatingU65Retirees__c":compLandscapeMedicalData[i].ParticipatingU65Retirees__c,
                    "MembersinOtherMedicalProducts__c":compLandscapeMedicalData[i].MembersinOtherMedicalProducts__c,                  
                    "ParticipatingActives__c":compLandscapeMedicalData[i].ParticipatingActives__c,
                    "PrimaryIncumbent__c":compLandscapeMedicalData[i].PrimaryIncumbent__c,
                    "SecondaryIncumbent__c":compLandscapeMedicalData[i].SecondaryIncumbent__c,
                    "Type_of_Products_Services_Provided__c" : "Medical"
                });
            }
        	
        }
        var removeCompititorIdList = component.get('v.removeCompititorIdList');
        action.setParams({
            "AccountId" : component.get('v.recordId'),
            "finalData" : upsertCompLandscapeMedicalData,
            "accountType" : 'cd',
            "deleteCompList" : removeCompititorIdList
        });
        action.setCallback(this,function(response){
            
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            $A.util.removeClass(component.find("editMedicalCarrier"),"hide");
            var state = response.getState();
            if(state == "SUCCESS") {
				component.set('v.isEditMode',false);                
                component.find("addMedicalCarrier").set("v.disabled",false);
                var ResponseData = response.getReturnValue();
                if(ResponseData != null && ResponseData.isEditAccess != null){                    
                    component.set("v.isEditAccess", ResponseData.isEditAccess);
                }
                
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.removeClass(component.find("sortEdit"),"hide");                 
                } 
                
                if(response.getReturnValue() != null && response.getReturnValue().length > 0) {                                      
                    component.set('v.compLandscapeMedicalDataCD', response.getReturnValue());
					var compLandscapeMedicalDataUpdated = response.getReturnValue();
                    for(var i=0; i < compLandscapeMedicalDataUpdated.length; i=i+1) { 
                        if(compLandscapeMedicalDataUpdated[i].Name != "Total" && compLandscapeMedicalDataUpdated[i].Comments__c == null){
                        	compLandscapeMedicalDataUpdated[i].Comments__c = '';   
                        }
                    }                   
                    //$A.get('e.force:refreshView').fire();
                }
                if(response.getReturnValue().length === 1){
                    var dataEmptyCheck = response.getReturnValue();
                    for(var i=0; i < dataEmptyCheck.length; i=i+1) { 
                        if(dataEmptyCheck[i].CompetitorAccount__r !== undefined && dataEmptyCheck[i].CompetitorAccount__r.Name === 'Total'){
                            component.set('v.compLandscapeMedicalEmptyList', true);
                            $A.util.addClass(component.find("saveMedicalCarrier"),"hide");                       
                            $A.util.addClass(component.find("editMedicalCarrier"), 'hide');                         
                            $A.util.addClass(component.find("cancelMedicalCarrier"),"hide");
                        }
                    }                   
                }                
            }else if(state === "ERROR") {
                if(component.get('v.isEditAccess')){
                	component.find("addMedicalCarrier").set("v.disabled",false);
                }
                var errors = response.getError(); 
                if(errors){
                   if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i=i+1) { 
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In saveCompititiveLandscapeMedicalCm method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    modalClosing : function(component, event) {
        var modalComponent = component.get("v.dynamicComponentsByAuraId");
        modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
        modalComponent.modalClosing();
        component.set("v.dynamicComponentsByAuraId", {});
        component.set("v.dynamicComponentAuraId", '');
    },
    makeEditable : function(component, event) {
    	//component.find("editMedicalCarrier").set("v.disabled",true);
    	$A.util.addClass(component.find("editMedicalCarrier"), 'hide');
        //component.find("addMedicalCarrier").set("v.disabled",true);        
        //component.find("saveMedicalCarrier").set("v.disabled",false);
        $A.util.removeClass(component.find("saveMedicalCarrier"), 'hide');
        component.set("v.radioButtonVal",false);
        $A.util.removeClass(component.find("cancelMedicalCarrier"),"hide");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i=i+1) { 
            $A.util.removeClass(readModeAreas[i], 'show');
            $A.util.addClass(readModeAreas[i], 'hide');
            $A.util.removeClass(editTextAreas[i], 'hide');
            $A.util.addClass(editTextAreas[i], 'show');
        }
        
        /*var removeLinks = component.find("cancelLink");
        if (removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i=i+1) { 
                    $A.util.addClass(removeLinks[i],"hide");
                }
            }else{
                    $A.util.addClass(removeLinks,"hide");
            }
        }*/
	},    
    modalGenericClose : function(component) {
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;	-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []); 
        }
    },
    showPrompt : function(component, event) {
    	var reminderPopUp = component.find('reminderPopUp');
        for(var i=0; i < reminderPopUp.length; i=i+1) { 
            $A.util.removeClass(reminderPopUp[i], 'slds-hide');
            $A.util.addClass(reminderPopUp[i], 'slds-show');
        }   
    },
    doCalculateTotal: function(component, event, fromDelete) {
        console.log("calculate");
        var compLandscapeMedicalDataUpdated = component.get("v.compLandscapeMedicalDataCD");
        var a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0;
		var isLess = false;
        var currentField;
        if(fromDelete !== undefined && fromDelete === true){
            currentField = '';
        }else{
            currentField = event.getSource().getLocalId();
        }        
        for(var i=0; i < compLandscapeMedicalDataUpdated.length; i=i+1) {
            if(compLandscapeMedicalDataUpdated[i].CompetitorAccount__r !== undefined && compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name !== 'Total'){
                var participatingMembers = 0;
                var participatingCategory = 0;
                if(compLandscapeMedicalDataUpdated[i].MembershipEstimate__c != null){
                    compLandscapeMedicalDataUpdated[i].MembershipEstimate__c = parseInt(compLandscapeMedicalDataUpdated[i].MembershipEstimate__c);
                    if(compLandscapeMedicalDataUpdated[i].MembershipEstimate__c < 0){
                        compLandscapeMedicalDataUpdated[i].MembershipEstimate__c = -compLandscapeMedicalDataUpdated[i].MembershipEstimate__c;
                    }
                    a1 = a1 + compLandscapeMedicalDataUpdated[i].MembershipEstimate__c;
                    participatingMembers = parseInt(compLandscapeMedicalDataUpdated[i].MembershipEstimate__c);
                    if(currentField === 'input_Participating_Members'){
                    	component.set('v.isDataModified',true);
                    }
                }else{
                    compLandscapeMedicalDataUpdated[i].MembershipEstimate__c = 0;
                    if(currentField === 'input_Participating_Members'){
                    	component.set('v.isDataModified',true);
                    }
                }
                if(compLandscapeMedicalDataUpdated[i].ParticipatingActives__c != null){
                    compLandscapeMedicalDataUpdated[i].ParticipatingActives__c = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingActives__c);
                    if(compLandscapeMedicalDataUpdated[i].ParticipatingActives__c < 0){
                        compLandscapeMedicalDataUpdated[i].ParticipatingActives__c = -compLandscapeMedicalDataUpdated[i].ParticipatingActives__c;
                    }
                    a2 = a2 + compLandscapeMedicalDataUpdated[i].ParticipatingActives__c;
                    participatingCategory = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingActives__c);
                }else{
                    compLandscapeMedicalDataUpdated[i].ParticipatingActives__c = 0;
                }
            	if(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c != null){
                    compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c);
                    if(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c < 0){
                        compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c = -compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c;
                    }
                    a3 = a3 + compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c;
                    participatingCategory = participatingCategory + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c);
                }else{
                    compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c = 0;
                }
                if(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c != null){
                    compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                    if(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c < 0){
                        compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c = -compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c;
                    }
                    a4 = a4 + compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c;
                    participatingCategory = participatingCategory + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                }else{
                    compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c = 0;
                }
                if(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c != null){
                    compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c);
                    if(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c < 0){
                        compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c = -compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c;
                    }
                    a5 = a5 + compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c;
                }else{
                    compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c = 0;
                }
                if(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c != null){
                    compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c);
                    if(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c < 0){
                        compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c = -compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c;
                    }
                    a6 = a6 + compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c;
                }else{
                    compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c = 0;
                }
                if(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c != null){
                    compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c);
                    if(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c < 0){
                        compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c = -compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c;
                    }
                    a7 = a7 + compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c;
                }else{
                    compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c = 0;
                }
                if(participatingMembers < participatingCategory){
                   isLess = true;
                }                
            }
        }
        if(isLess){
            var msg = component.get('v.participatingMembersValMsg');
            component.set('v.currentPopUpName','Alert');
            component.set('v.currentErrMsg',msg);
            component.set('v.isParticipantLess',true);
            this.showPrompt(component, event);
            var device = $A.get("$Browser.formFactor"); 
            if(device != "DESKTOP"){ 
                $A.util.addClass(component.find("saveCancel"),"hide");                                  				        
            }
        }else{
            component.set('v.isParticipantLess',false);
        }        
        for(var i=0; i < compLandscapeMedicalDataUpdated.length; i=i+1) {
            if(compLandscapeMedicalDataUpdated[i].CompetitorAccount__r !== undefined && compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name === 'Total'){
                compLandscapeMedicalDataUpdated[i].MembershipEstimate__c = a1;
                compLandscapeMedicalDataUpdated[i].ParticipatingActives__c = a2;
            	compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c = a3;
                compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c = a4;
                compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c = a5;
                compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c = a6;
                compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c = a7;
            }
        }
    	component.set('v.participatingMembersinputCD',a1);
        component.set('v.participatingActivesinputCD',a2);
        component.set('v.participatingU65RinputCD',a3);
        component.set('v.participatingO65RinputCD',a4);
        component.set('v.participatingBFTAinputCD',a5);
        component.set('v.participatingNBFTAinputCD',a6);
        component.set('v.participatingPTAinputCD',a7);
    },
    checkEditAccesToThisUser : function(component, event) {
        var action = component.get("c.getLoggedInUerRoleInfo");
        if(action == undefined || action == null){
            return;
        }
        action.setParams({           
            "accountId" : component.get('v.recordId')
        });
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS") {
                component.set('v.isEditAccess', response.getReturnValue());
                var device = $A.get("$Browser.formFactor");
               	if(device != "DESKTOP"){
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                    ) || false;
                    
                    component.set('v.isEditAccess', response.getReturnValue());
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){              
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('Competitive_Medical_CD'),'ipadBottomIos');
                    }else{
                        $A.util.addClass(component.find('Competitive_Medical_CD'),'ipadbottom');
                    }
                
                    this.getCompititiveLandscapeMedicalCm(component,event,false,'doinit');              
                    $A.util.toggleClass(component.find('Competitive_Medical_CD'),'slds-is-open');
                }
            }
        });
        $A.enqueueAction(action);    
    }
})