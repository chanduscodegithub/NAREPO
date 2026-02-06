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
         
        var isLoggedInUserRoleEnabled = component.get('v.isEditAccess');
        if(isLoggedInUserRoleEnabled == null || isLoggedInUserRoleEnabled == undefined) {
        	isLoggedInUserRoleEnabled = false;    
        }
        var action = component.get("c.getCompetitiveLandscapeMedicalCmRecords");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "accountType" : 'cm',
            "isEditAccess":isLoggedInUserRoleEnabled
        });
        action.setCallback(this,function(response){
            
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            
            var state = response.getState();
            if(state == "SUCCESS") {                
                if(response.getReturnValue() != null && response.getReturnValue().length > 0) {
                    if(isLoggedInUserRoleEnabled){
                        //$A.util.removeClass(component.find("editMedicalCarrier"), 'slds-hide');
                        $A.util.removeClass(component.find("saveMedicalCarrier"), 'slds-hide');                       
                        $A.util.addClass(component.find("cancelMedicalCarrier"), 'hide');
                        $A.util.removeClass(component.find("addMedicalCarrier"),"hide");
                        $A.util.addClass(component.find("saveMedicalCarrier"),"hide");
                        $A.util.removeClass(component.find("editMedicalCarrier"),"hide");
                    }
                    if(response.getReturnValue().length == 2){
                       component.set('v.compLandscapeMedicalEmptyList', true);
                    }
                    if(response.getReturnValue().length > 5){                        
                        $A.util.addClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                        $A.util.addClass(component.find("clientSurveyTbl"),'applet-scrollable-table-s');
                    	$A.util.addClass(component.find("clientSurveyTblBody"),'slds-custom-table');
                    }else{
                        $A.util.removeClass(component.find("clientSurveyTbl"),'applet-scrollable-table');
                        $A.util.removeClass(component.find("clientSurveyTbl"),'applet-scrollable-table-s');
                        $A.util.removeClass(component.find("clientSurveyTblBody"),'slds-custom-table');
                    }                    
                    var compLandscapeMedicalDataUpdated = response.getReturnValue();
                   
                    for(var i=0; i < compLandscapeMedicalDataUpdated.length; i++) { 
                       var a1 = 0;
                       a1 = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c)+parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c)+ parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                    	compLandscapeMedicalDataUpdated[i].TotalHorizontal = a1;
                        component.set('v.totalHorizontalChange',a1);
                    }
                    console.log('-=-=-=-=-data=-=-=-=-===',compLandscapeMedicalDataUpdated);
                    for(var i=0; i < compLandscapeMedicalDataUpdated.length; i++) {   
                        if(compLandscapeMedicalDataUpdated[i].CompetitorAccount__r !== undefined && compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name === 'Total'){
                           var a1 = 0;
                            console.log('loop=======',compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name);
                            
                            a1 = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c)+parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c)+ parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                            component.set('v.participatingNBFTAinput',compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c); 
                            component.set('v.participatingBFTAinput',compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c);
                            component.set('v.participatingPTAinput',compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c);
                            component.set('v.participatingU65Rinput',compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c);
                            component.set('v.participatingO65Rinput',compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                            component.set('v.participatingMembersinput',compLandscapeMedicalDataUpdated[i].MembershipEstimate__c);
                        	component.set('v.totalHorizontal',a1);
                        }
                    }
                    component.set('v.compLandscapeMedicalData', compLandscapeMedicalDataUpdated);
                   
                    var device = $A.get("$Browser.formFactor");
                    $A.util.removeClass(component.find("docked"),"slds-hide");                            
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
                    if(isLoggedInUserRoleEnabled) { 
                        $A.util.addClass(component.find("editMedicalCarrier"), 'slds-hide');
                        $A.util.addClass(component.find("saveMedicalCarrier"), 'slds-hide');
                        $A.util.addClass(component.find("cancelMedicalCarrier"), 'slds-hide');
                    }
                    component.set('v.compLandscapeMedicalEmptyList', true);
                    
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
                        for(var i=0; i < ErrorMessage.length; i++) {  
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
    deleteCompititiveLandscapeMedicalCm : function(component, event, compititorId) {
        
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
            "deletedCompititorsList" : component.get("v.compLandscapeMedicalData"),
            "accountType" : 'cm'
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                component.find("addMedicalCarrier").set("v.disabled",false);
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
                        for(var i=0; i < ErrorMessage.length; i++) { 
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In deleteCompititiveLandscapeMedicalCm method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
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
         
        var compLandscapeMedicalData = component.get("v.compLandscapeMedicalData");
        var upsertCompLandscapeMedicalData = [];      
        for(var i=0; i < compLandscapeMedicalData.length; i++) {
            var cId = compLandscapeMedicalData[i].Id;
            
            if(compLandscapeMedicalData[i].MembershipEstimate__c == null || compLandscapeMedicalData[i].MembershipEstimate__c == NaN){
                    compLandscapeMedicalData[i].MembershipEstimate__c = 0;
            }
            if(compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c == null || compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c == NaN){
                    compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c = 0;
            }
            if(compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c == null || compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c == NaN){
                    compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c = 0;
            }
            if(compLandscapeMedicalData[i].ParticipatingPartTimeActives__c == null || compLandscapeMedicalData[i].ParticipatingPartTimeActives__c == NaN){
                    compLandscapeMedicalData[i].ParticipatingPartTimeActives__c = 0;
            }
            if(compLandscapeMedicalData[i].ParticipatingU65Retirees__c == null || compLandscapeMedicalData[i].ParticipatingU65Retirees__c == NaN){
                    compLandscapeMedicalData[i].ParticipatingU65Retirees__c = 0;
            }
            if(compLandscapeMedicalData[i].ParticipatingO65Retirees__c == null || compLandscapeMedicalData[i].ParticipatingO65Retirees__c == NaN){
                    compLandscapeMedicalData[i].ParticipatingO65Retirees__c = 0;
            }
        
            if(cId.indexOf('new_') !== -1){
                
                 upsertCompLandscapeMedicalData.push({
                    'sobjectType':'Competitor__c', 
                    'Account__c':component.get('v.recordId'),
                    'CompetitorAccount__c':compLandscapeMedicalData[i].CompetitorAccount__c,
                    'CompetitorAccount__r':{'Id':compLandscapeMedicalData[i].CompetitorAccount__r.Id,'Name':compLandscapeMedicalData[i].CompetitorAccount__r.Name},
                    'Competitorclassification__c':'Medical',
                    'ParticipatingO65Retirees__c':compLandscapeMedicalData[i].ParticipatingO65Retirees__c,
                    'ParticipatingPartTimeActives__c':compLandscapeMedicalData[i].ParticipatingPartTimeActives__c,
                    'MembershipEstimate__c':compLandscapeMedicalData[i].MembershipEstimate__c,
                    'Type__c':'Account Competitor',
                    'ParticipatingNonBargainedFullTimeAc__c':compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c,
                    'ParticipatingBargainedFullTimeActive__c':compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c,
                    'ParticipatingU65Retirees__c':compLandscapeMedicalData[i].ParticipatingU65Retirees__c,                   
                    'ParticipatingActives__c':compLandscapeMedicalData[i].ParticipatingActives__c,
                    'Type_of_Products_Services_Provided__c' : 'Medical',
                     'Comments__c':compLandscapeMedicalData[i].Comments__c
                });
            }else{
                 upsertCompLandscapeMedicalData.push({
                    'sobjectType':'Competitor__c',
                    'Id': compLandscapeMedicalData[i].Id,
                    'CompetitorAccount__c':compLandscapeMedicalData[i].CompetitorAccount__c,
                    'CompetitorAccount__r':{'Id':compLandscapeMedicalData[i].CompetitorAccount__r.Id,'Name':compLandscapeMedicalData[i].CompetitorAccount__r.Name},
                    'ParticipatingO65Retirees__c':compLandscapeMedicalData[i].ParticipatingO65Retirees__c,
                    'ParticipatingPartTimeActives__c':compLandscapeMedicalData[i].ParticipatingPartTimeActives__c,
                    'MembershipEstimate__c':compLandscapeMedicalData[i].MembershipEstimate__c,                    
                    'ParticipatingNonBargainedFullTimeAc__c':compLandscapeMedicalData[i].ParticipatingNonBargainedFullTimeAc__c,
                    'ParticipatingBargainedFullTimeActive__c':compLandscapeMedicalData[i].ParticipatingBargainedFullTimeActive__c,
                    'ParticipatingU65Retirees__c':compLandscapeMedicalData[i].ParticipatingU65Retirees__c,
                    'Type_of_Products_Services_Provided__c' : 'Medical',
                     'Comments__c':compLandscapeMedicalData[i].Comments__c
                });
            }
        	
        }
        var removeCompititorIdList = component.get('v.removeCompititorIdList');
        action.setParams({
            "AccountId" : component.get('v.recordId'),
            "finalData" : upsertCompLandscapeMedicalData,           
            "accountType" : 'cm',
            "deleteCompList" : removeCompititorIdList
        });
        action.setCallback(this,function(response){
            
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            
            var state = response.getState();            
            if(state == "SUCCESS") { 
                component.set('v.isEditMode',false);
                component.set('v.removeCompititorIdList','');
                component.find("addMedicalCarrier").set("v.disabled",false);
                var device = $A.get("$Browser.formFactor");
                if(device != "DESKTOP"){ 
                    $A.util.removeClass(component.find("sortEdit"),"hide");
                    $A.util.addClass(component.find("saveCancel"),"hide");
                }
                var ResponseData = response.getReturnValue();
                if(ResponseData != null && ResponseData.isEditAccess != null){                    
                    component.set("v.isEditAccess", ResponseData.isEditAccess);
                }               
                if(response.getReturnValue() != null && response.getReturnValue().length > 0) {  
                    
                     var compLandscapeMedicalDataUpdated = response.getReturnValue();
                   
                    for(var i=0; i < compLandscapeMedicalDataUpdated.length; i++) { 
                       var a1 = 0;
                       a1 = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c)+parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c)+ parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                    	compLandscapeMedicalDataUpdated[i].TotalHorizontal = a1;
                        component.set('v.totalHorizontalChange',a1);
                    }
                    component.set('v.compLandscapeMedicalData', compLandscapeMedicalDataUpdated);
                    //$A.get('e.force:refreshView').fire();
                }else{
                    component.set('v.compLandscapeMedicalEmptyList', true);
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
                        for(var i=0; i < ErrorMessage.length; i++) { 
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
            "accountType" : 'cm',
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
                    component.set('v.compLandscapeMedicalData', ResponseData);                   
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
    modalClosing : function(component, event) {
        var modalComponent = component.get("v.dynamicComponentsByAuraId");
        modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
        modalComponent.modalClosing();
        component.set("v.dynamicComponentsByAuraId", {});
        component.set("v.dynamicComponentAuraId", '');
    },
    makeEditable : function(component, event) {
    	$A.util.addClass(component.find("editMedicalCarrier"),"hide");
        //component.find("addMedicalCarrier").set("v.disabled",true);        
        $A.util.removeClass(component.find("saveMedicalCarrier"),"hide");
        $A.util.removeClass(component.find("cancelMedicalCarrier"),"hide");
        var editTextAreas = component.find('editMode');
        var readModeAreas = component.find('readMode');
        for(var i=0; i < editTextAreas.length; i++) { 
			//$A.util.toggleClass(readModeAreas[i], 'show');
            //$A.util.toggleClass(editTextAreas[i], 'hide');            
            $A.util.removeClass(readModeAreas[i], 'show');
            $A.util.addClass(readModeAreas[i], 'hide');
            $A.util.removeClass(editTextAreas[i], 'hide');
            $A.util.addClass(editTextAreas[i], 'show');
        }
        
       /* var removeLinks = component.find("cancelLink");
        if (removeLinks != undefined) {
            if(Array.isArray(removeLinks)){
                for(var i=0; i < removeLinks.length; i++) { 
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
    checkEditAccesToThisUser : function(component, event) {
        var action = component.get("c.getLoggedInUerRoleInfo");
        if(action == null || action == undefined){
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
                                   
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){                                        
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('Competitive_Medical_CM'),'ipadBottomIos');                	 
                    }else{
                        $A.util.addClass(component.find('Competitive_Medical_CM'),'ipadbottom');
                    }                                      
                    this.getCompititiveLandscapeMedicalCm(component,event,false,'doinit');
                    component.set('v.isExpand',true);            
                    $A.util.toggleClass(component.find('Competitive_Medical_CM'),'slds-is-open');
                }
            }
        });
        $A.enqueueAction(action);
    },
    doCalculateTotal: function(component, event) {
        console.log("calculate");
        var compLandscapeMedicalDataUpdated = component.get("v.compLandscapeMedicalData");
        var a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0;
        
        for(var i=0; i < compLandscapeMedicalDataUpdated.length; i++){
            if(compLandscapeMedicalDataUpdated[i].MembershipEstimate__c == null || compLandscapeMedicalDataUpdated[i].MembershipEstimate__c == NaN){
                    compLandscapeMedicalDataUpdated[i].MembershipEstimate__c = 0;
            }
            if(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c == null || compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c == NaN){
                    compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c = 0;
            }
            if(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c == null || compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c == NaN){
                    compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c = 0;
            }
            if(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c == null || compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c == NaN){
                    compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c = 0;
            }
            if(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c == null || compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c == NaN){
                    compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c = 0;
            }
            if(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c == null || compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c == NaN){
                    compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c = 0;
            }
        }
        for(var i=0; i < compLandscapeMedicalDataUpdated.length; i++) { 
            
            if(compLandscapeMedicalDataUpdated[i].CompetitorAccount__r != undefined && compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name !== 'Total'){                    
                a7 = a7 + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c)+parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c)+ parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                a1 = a1 + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c);
                a2 = a2 + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c);
                a3 = a3 + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c);
                a4 = a4 + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c);
                a5 = a5 + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
                a6 = a6 + parseInt(compLandscapeMedicalDataUpdated[i].MembershipEstimate__c);
            }
            
        }
        for(var i=0; i < compLandscapeMedicalDataUpdated.length; i++) { 
            if(compLandscapeMedicalDataUpdated[i].CompetitorAccount__r !== undefined && compLandscapeMedicalDataUpdated[i].CompetitorAccount__r.Name === 'Total'){
                compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c = a1;
                compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c = a2;
                compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c = a3;
                compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c = a4;
                compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c = a5;
                compLandscapeMedicalDataUpdated[i].MembershipEstimate__c = a6;
                 compLandscapeMedicalDataUpdated[i].totalHorizontal = a7;
                
            }else{
                 compLandscapeMedicalDataUpdated[i].TotalHorizontal = parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingNonBargainedFullTimeAc__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingBargainedFullTimeActive__c)+parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingPartTimeActives__c) + parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingU65Retirees__c)+ parseInt(compLandscapeMedicalDataUpdated[i].ParticipatingO65Retirees__c);
               
            }
        }
        component.set('v.participatingNBFTAinput',a1);
        component.set('v.participatingBFTAinput',a2);
        component.set('v.participatingPTAinput',a3);
        component.set('v.participatingU65Rinput',a4);
        component.set('v.participatingO65Rinput',a5);
        component.set('v.participatingMembersinput',a6);
        component.set('v.totalHorizontal',a7);
        component.set('v.compLandscapeMedicalData',compLandscapeMedicalDataUpdated);
        console.log('totalHorizontal changed---====---',compLandscapeMedicalDataUpdated);
    },
    
    	
    scrollStoped: function(component, event) {    	
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            component.set("v.isScrollStop",true);       
    }
})