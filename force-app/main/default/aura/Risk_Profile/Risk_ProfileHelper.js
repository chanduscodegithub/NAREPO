({	
    getRiskprofileMdtfromController : function(component,event) {              
        var action = component.get('c.getRiskProfileMetaDate');	
        action.setParams({
            "riskType" : 'Risk Tracked by SCE'
        });
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseResult = response.getReturnValue();    
                if(responseResult != null){                    
                    component.set("v.RiskTypeValues",responseResult.riskTypePickSet);
                    component.set("v.RiskTypeMap",responseResult.riskProfileMetaDataWrapperClass);                    
                }
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    getRiskprofileDataFromController : function(component,event,riskProfileObjectArr,isExpanded,isNewRiskAdded) {              
        
        if(!component.get("v.isDesktop")) {
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            
            if($A.get("$Browser.isIOS")){
                $A.util.removeClass(component.find('articleClass'),'cScroll-table');
            }
        }
        if(!isExpanded && isNewRiskAdded){
            this.addRiskProfileData(component,event,riskProfileObjectArr);
            return;
        }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        
        var action = component.get('c.getRiskProfileData');	
        action.setParams({
            "riskType" : 'Risk Tracked by SCE',
            "accountId" : component.get('v.recordId')
        });
        action.setCallback(this, function(response) {            
            
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }                
            
            var state = response.getState();		  
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if (state === "SUCCESS") { 
                component.set('v.riskProfileIdArr',[]);
                var responseResult = response.getReturnValue();    
                console.log('*******Risk Profile Response *******************');
                if(responseResult != null){
                    /*if(responseResult.noAccess){
                        component.set("v.noRecords",true);
                        return;
                    }*/
                    if(responseResult.totalSize != null && responseResult.totalSize > 0){
                        component.set("v.noRecords",false);                        
                        if(component.find("editRiskProfile") != null && component.find("UpdateReviewDate")){
                            component.find("editRiskProfile").set("v.disabled",false);
                            component.find("UpdateReviewDate").set("v.disabled",false);    
                        }                        
                    }else{
                        component.set("v.noRecords",true);
                        if(component.get("v.isParitalAccess")){
                            component.find("editRiskProfile").set("v.disabled",true);
                            component.find("UpdateReviewDate").set("v.disabled",true);
                        }
                    }
                    component.set("v.RiskTypeMap",responseResult.riskProfileMetaDataWrapperClass);                    
                    component.set("v.RiskTypeValues",responseResult.riskTypePickSet);                                        
                    component.set("v.RiskHelptTextSet",responseResult.riskHelptTextSet);                                                            
                    component.set("v.riskProfileAccount",responseResult.riskProfileAccount);
                    component.set("v.riskProfileAccount.OverallRiskScore__c",responseResult.riskProfileAccount.OverallRiskScore__c);
                    if(responseResult.riskProfileAccount.SCEReviewedDate__c != null && responseResult.riskProfileAccount.SCEReviewedDate__c.length > 0){                                                
                       /* var value = new Date(responseResult.riskProfileAccount.SCEReviewedDate__c);                        
                        var month = value.getMonth()+1;
                        var day = value.getDate();
                        if(month < 10){
                            month = month; 
                        }
                        if(day < 10){
                            day = day; 
                        }
                        value = month + "/" + day + "/" + value.getFullYear();*/
                        //responseResult.riskProfileAccount.SCEReviewedDate__c = value;
                        component.set("v.canUpdateReviewOnSave",true);  
                    }
                    component.set("v.riskProfileList",responseResult.riskProfileList);                    
                    component.set("v.riskProfileAddRiskList",responseResult.riskProfileAdditionRiskFactorList); 
                    if(isNewRiskAdded){
                        this.addRiskProfileData(component,event,riskProfileObjectArr);
                    }                   
                }
                if(!component.get("v.isDesktop")) {
                    $A.util.addClass(component.find('contact_History'),'slds-is-open');
                    
                    if($A.get("$Browser.isIOS")){
                        $A.util.addClass(component.find('articleClass'),'cScroll-table');
                    }
                    
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                    ) || false;  
                    
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('contact_History'),'ipadBottomIos');
                    }else{
                        $A.util.addClass(component.find('contact_History'),'ipadbottom');
                    }                      
                }                
            }
            else if (state === "INCOMPLETE") {                
                component.set('v.ErrorMessage',component.get('v.networkErrorMesage'));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length ; i=i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {                        
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    deleteRiskProfile : function(component,event,riskProfileId,isEditEnabled) {
        
        if(!component.get("v.isDesktop")) {
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            
            if($A.get("$Browser.isIOS")){
                $A.util.removeClass(component.find('articleClass'),'cScroll-table');
            }
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get('c.deleteRiskProfileObj');	
        action.setParams({
            "riskProfileId" : riskProfileId,
            "accountId" : component.get('v.recordId'),
            "isEditEnabled":isEditEnabled
        });
        action.setCallback(this, function(response) {
            
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                if($A.get("$Browser.isIOS")){
                    $A.util.addClass(component.find('articleClass'),'cScroll-table');
                }
            }                
            
            var state = response.getState();		            
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if (state === "SUCCESS") { 
                component.set('v.riskProfileIdArr',[]);
                var responseResult = response.getReturnValue();    
                if(responseResult != null){    
                    if(responseResult.totalSize != null && responseResult.totalSize > 0){
                        component.set("v.noRecords",false);                        
                        if(component.find("editRiskProfile") != null && component.find("UpdateReviewDate")){
                            component.find("editRiskProfile").set("v.disabled",false);
                            component.find("UpdateReviewDate").set("v.disabled",false);    
                        }                        
                    }else{
                        component.set("v.noRecords",true);
                        if(component.get("v.isParitalAccess")){
                            component.find("editRiskProfile").set("v.disabled",true);
                            component.find("UpdateReviewDate").set("v.disabled",true);
                        }
                    }
                    component.set("v.RiskTypeMap",responseResult.riskProfileMetaDataWrapperClass);                    
                    component.set("v.RiskTypeValues",responseResult.riskTypePickSet);                                        
                    component.set("v.riskProfileAccount",responseResult.riskProfileAccount);                    
                    component.set("v.riskProfileAccount.OverallRiskScore__c",responseResult.riskProfileAccount.OverallRiskScore__c);
                    component.set("v.riskProfileList",responseResult.riskProfileList);                    
                    component.set("v.riskProfileAddRiskList",responseResult.riskProfileAdditionRiskFactorList);                    
                    if(responseResult.riskProfileAccount.SCEReviewedDate__c != null && responseResult.riskProfileAccount.SCEReviewedDate__c.length > 0){                                                
                        /*var value = new Date(responseResult.riskProfileAccount.SCEReviewedDate__c);                        
                        var month = value.getMonth()+1;
                        var day = value.getDate();
                        if(month < 10){
                            month = month; 
                        }
                        if(day < 10){
                            day = day; 
                        }
                        value = month + "/" + day + "/" + value.getFullYear();
                        responseResult.riskProfileAccount.SCEReviewedDate__c = value;*/
                        component.set("v.canUpdateReviewOnSave",true);  
                    }
                }
            }
            else if (state === "INCOMPLETE") {                                
                component.set('v.ErrorMessage',component.get('v.networkErrorMesage'));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length ; i=i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {                        
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    updateRiskProfileInController : function(component,event,riskProfileListInserList,riskProfileAddRiskList,riskProfileIds) {
        
        if(!component.get("v.isDesktop")) {
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            if($A.get("$Browser.isIOS")){
                $A.util.removeClass(component.find('articleClass'),'cScroll-table');
            }
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get('c.saveAndUpdateRiskProfile');	  
        
        var today = new Date();
        action.setParams({
            "riskProfileList" : riskProfileListInserList,
            "riskProfileAddRiskList" : riskProfileAddRiskList,
            "accountId" : component.get('v.recordId'),
            "canUpdateReviewOnSave" : component.get('v.canUpdateReviewOnSave'),
            "today" : today,
            "riskProfileIds":riskProfileIds
        });
        action.setCallback(this, function(response) {
            
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                if($A.get("$Browser.isIOS")){
                    $A.util.addClass(component.find('articleClass'),'cScroll-table');
                }
            }                
            
            var state = response.getState();		            
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            
            component.set("v.saveIds",[]);
            
            if (state === "SUCCESS") {                
                
                if(!component.get('v.isDesktop')){  
                    $A.util.removeClass(component.find("sortEdit"),"hide");
                    $A.util.addClass(component.find("saveCancel"),"hide");
                }  
                component.set('v.riskProfileIdArr',[]);
                var editComponent =	component.find("riskProfileAllData");        
                component.find("addRiskProfile").set("v.disabled",false);        
                component.find("editRiskProfile").set("v.disabled",false);        
                $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                $A.util.addClass(component.find("saveCancelButton"),"hideShow");
                
                if(editComponent!= null && editComponent.length != null && editComponent != 'undefined'){            
                    for(var i = 0; i < editComponent.length ; i=i+1){                                   
                        $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                        var editModeAreas = editComponent[i].find('editMode');
                        var readModeAreas = editComponent[i].find('readMode');
                        for(var j = 0; j < readModeAreas.length ; j=j+1){
                            $A.util.addClass(editModeAreas[j], 'toggle');
                            $A.util.toggleClass(readModeAreas[j], 'editMode');
                        }
                    }        
                }else if(editComponent!= null && editComponent != 'undefined'){
                    $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                    var editModeAreas = editComponent.find('editMode');
                    var readModeAreas = editComponent.find('readMode');
                    for(var j = 0; j < readModeAreas.length ; j=j+1){
                        $A.util.addClass(editModeAreas[j], 'toggle');
                        $A.util.toggleClass(readModeAreas[j], 'editMode');
                    }
                } 
                
                if(component.get('v.isEditAccess')){
                    var editComponentAddRisk =component.find("riskprofileAdditionalRiskId");                
                    if(editComponentAddRisk!= null && editComponentAddRisk.length != null && editComponentAddRisk != 'undefined'){
                        for(var i = 0; i < editComponentAddRisk.length ; i=i+1){                        
                            $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                            var editModeAreas = editComponentAddRisk[i].find('editMode');
                            var readModeAreas = editComponentAddRisk[i].find('readMode');
                            for(var j = 0; j < readModeAreas.length ; j=j+1){
                                $A.util.addClass(editModeAreas[j], 'toggle');
                                $A.util.toggleClass(readModeAreas[j], 'editMode');
                            }
                        }
                    }else if(editComponentAddRisk!= null && editComponentAddRisk != 'undefined'){
                        $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                        var editModeAreas = editComponentAddRisk.find('editMode');
                        var readModeAreas = editComponentAddRisk.find('readMode');
                        for(var j = 0; j < readModeAreas.length ; j=j+1){
                            $A.util.addClass(editModeAreas[j], 'toggle');
                            $A.util.toggleClass(readModeAreas[j], 'editMode');
                        }
                    }    
                }
                var responseResult = response.getReturnValue();    
                if(responseResult != null){                              
                    component.set("v.RiskTypeMap",responseResult.riskProfileMetaDataWrapperClass);                    
                    component.set("v.RiskTypeValues",responseResult.riskTypePickSet);
                    component.set("v.riskProfileAccount",responseResult.riskProfileAccount);
                    component.set("v.riskProfileAccount.OverallRiskScore__c",responseResult.riskProfileAccount.OverallRiskScore__c);
                    component.set("v.riskProfileList",responseResult.riskProfileList);                    
                    component.set("v.riskProfileAddRiskList",responseResult.riskProfileAdditionRiskFactorList);                                        
                    if(responseResult.totalSize != null && responseResult.totalSize > 0){
                        component.set("v.noRecords",false);                        
                        if(component.find("editRiskProfile") != null && component.find("UpdateReviewDate")){
                            component.find("editRiskProfile").set("v.disabled",false);
                            component.find("UpdateReviewDate").set("v.disabled",false);    
                        }                        
                    }else{
                        component.set("v.noRecords",true);
                        if(component.get("v.isParitalAccess")){
                            component.find("editRiskProfile").set("v.disabled",true);
                            component.find("UpdateReviewDate").set("v.disabled",true);
                            
                        }
                    }
                    if(responseResult.riskProfileAccount.SCEReviewedDate__c != null && responseResult.riskProfileAccount.SCEReviewedDate__c.length > 0){                                                
                        /*var value = new Date(responseResult.riskProfileAccount.SCEReviewedDate__c);                        
                        var month = value.getMonth()+1;
                        var day = value.getDate();
                        if(month < 10){
                            month = month; 
                        }
                        if(day < 10){
                            day = day; 
                        }
                        value = month + "/" + day + "/" + value.getFullYear();
                        responseResult.riskProfileAccount.SCEReviewedDate__c = value;
                        component.set('v.riskProfileAccount.SCEReviewedDate__c',value);*/
                        component.set('v.riskProfileAccount.SCEReviewedDate__c',responseResult.riskProfileAccount.SCEReviewedDate__c)
                        component.set("v.canUpdateReviewOnSave",true);  
                    }
                    
                }
            }
            else if (state === "INCOMPLETE") {                                
                component.set('v.ErrorMessage',component.get('v.networkErrorMesage'));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length ; i=i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        $A.util.removeClass(spinner, 'slds-show');
                        $A.util.addClass(spinner, 'slds-hide');
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    updateReviewDate: function(component,event,riskProfileId) {
        
        if(!component.get("v.isDesktop")) {
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            if($A.get("$Browser.isIOS")){
                $A.util.removeClass(component.find('articleClass'),'cScroll-table');
            }
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        
        var today = new Date();
        var action = component.get('c.updateAccountReviewDate');	
        action.setParams({      
            "accountId" : component.get('v.recordId'),            
            "today" : today
        });
        action.setCallback(this, function(response) {            
            
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                if($A.get("$Browser.isIOS")){
                    $A.util.addClass(component.find('articleClass'),'cScroll-table');
                }
            }                
            
            var state = response.getState();		            
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if (state === "SUCCESS") {                
                var responseResult = response.getReturnValue();    
                if(responseResult != null){                                                  
                    component.set('v.riskProfileAccount.SCEReviewedDate__c',responseResult.riskProfileAccount.SCEReviewedDate__c);
                    if(responseResult.riskProfileAccount.SCEReviewedDate__c != null && responseResult.riskProfileAccount.SCEReviewedDate__c.length > 0){                                                
                        /*var value = new Date(responseResult.riskProfileAccount.SCEReviewedDate__c);                        
                        var month = value.getMonth()+1;
                        var day = value.getDate();
                        if(month < 10){
                            month = month; 
                        }
                        if(day < 10){
                            day = day; 
                        }
                        value = month + "/" + day + "/" + value.getFullYear();
                        responseResult.riskProfileAccount.SCEReviewedDate__c = value;*/
                        component.set('v.riskProfileAccount.SCEReviewedDate__c',responseResult.riskProfileAccount.SCEReviewedDate__c);
                        component.set("v.canUpdateReviewOnSave",true);  
                    }
                }
            }
            else if (state === "INCOMPLETE") {                                
                component.set('v.ErrorMessage',component.get('v.networkErrorMesage'));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length ; i=i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        $A.util.removeClass(spinner, 'slds-show');
                        $A.util.addClass(spinner, 'slds-hide');
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    getRoleAccess: function(component,event) {
        var action = component.get('c.isEditAccesToThisUser');
        if(action == undefined || action == null){
            return;
        }
        action.setCallback(this, function(response) {       
            var state = response.getState();           
            if (state === "SUCCESS") {          
                var responseResult = response.getReturnValue();
                if(responseResult != null){                              
                    component.set("v.isEditAccess",responseResult.isEditAccess);
                    component.set("v.isParitalAccess",responseResult.isParitalAccess);
                }
                if(!component.get("v.isDesktop")) {
                    this.getRiskprofileDataFromController(component, event,'',true,false);
                }
            }
            else if (state === "INCOMPLETE") {                
                component.set('v.ErrorMessage',component.get('v.networkErrorMesage'));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i in ErrorMessage){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i = 0; i < ErrorMessage.length ; i=i+1){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    modalGenericClose : function(component) {        
        
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;	-webkit-overflow-scrolling: auto !important ;}}");
        
        if(!component.get("v.isDesktop")) {
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }                
        
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
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
        }
    },
    validatedate : function(component,event,valDate) {
        if(valDate == null)return true;
        if(valDate == "")return true;
        var valDateArray = valDate.split('-');  
        if(valDateArray.length ==3){
            var month = '';
            if(valDateArray[1] < 10 && !valDateArray[1].startsWith('0')){
                
                month = '0'+valDateArray[1];
            }
            var day = '';
            if(valDateArray[2] < 10 && !valDateArray[2].startsWith('0')){
                day = '0'+valDateArray[2];
                if(month==""){
                    valDate = valDateArray[0]+'-'+valDateArray[1]+'-'+day;
                }
                else{
                    valDate = valDateArray[0]+'-'+month+'-'+day;
                }
                
            }else{
                if(month==""){
                    valDate = valDateArray[0]+'-'+valDateArray[1]+'-'+valDateArray[2];   
                }
                if(month!=""){
                    valDate = valDateArray[0]+'-'+month+'-'+valDateArray[2];   
                }
                
            }
            
        }
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!valDate.match(regEx)){
            console.log('Date is invalid');
            //component.find('oDate').set('v.value', 'Date is invalid');
            return false;
        }
        else{
            var d = new Date(valDate);
            //component.find('oDate').set('v.value', 'Date is Valid');
            console.log('Date is valid');
            return d.toISOString().slice(0,10) === valDate;
        }        
    },
    
    editRiskProfileHelper:function(component,event){
        var editComponent =	component.find("riskProfileAllData");                
        component.find("addRiskProfile").set("v.disabled",false);
        component.find("editRiskProfile").set("v.disabled",true);
        component.set('v.isEditEnabled',true);
        $A.util.removeClass(component.find("cancelRiskProfile"),"hideShow");                
        $A.util.removeClass(component.find("saveCancelButton"),"hideShow");                
        
        if(editComponent!= null && editComponent.length != null && editComponent != 'undefined'){
            for(var i = 0; i < editComponent.length ; i=i+1){
                $A.util.removeClass(component.find("cancelRiskProfile"),"hideShow");
                var editModeAreas = editComponent[i].find('editMode');
                var readModeAreas = editComponent[i].find('readMode');
                for(var j = 0; j < readModeAreas.length ; j=j+1){
                    $A.util.removeClass(editModeAreas[j], 'toggle');
                    $A.util.addClass(readModeAreas[j], 'toggle');
                }
            }
        }else if(editComponent!= null && editComponent != 'undefined'){
            $A.util.removeClass(component.find("cancelRiskProfile"),"hideShow");
            var editModeAreas = editComponent.find('editMode');
            var readModeAreas = editComponent.find('readMode');            
            for(var j = 0; j < readModeAreas.length ; j=j+1){
                $A.util.removeClass(editModeAreas[j], 'toggle');
                $A.util.addClass(readModeAreas[j], 'toggle');
            }
        }
        if(component.get('v.isEditAccess')){
            var editComponentAddRisk =component.find("riskprofileAdditionalRiskId");                
            if(editComponentAddRisk!= null && editComponentAddRisk.length != null && editComponentAddRisk != 'undefined'){                                   
                for(var i = 0; i < editComponentAddRisk.length ; i=i+1){            
                    $A.util.removeClass(component.find("cancelRiskProfile"),"hideShow");
                    var editModeAreas = editComponentAddRisk[i].find('editMode');
                    var readModeAreas = editComponentAddRisk[i].find('readMode');                    
                    for(var j = 0; j < readModeAreas.length ; j=j+1){
                        $A.util.removeClass(editModeAreas[j], 'toggle');
                        $A.util.addClass(readModeAreas[j], 'toggle');
                    }
                }
            }else if(editComponentAddRisk!= null && editComponentAddRisk != 'undefined'){
                $A.util.removeClass(component.find("cancelRiskProfile"),"hideShow");
                var editModeAreas = editComponentAddRisk.find('editMode');
                var readModeAreas = editComponentAddRisk.find('readMode');                
                for(var j = 0; j < readModeAreas.length ; j=j+1){
                    $A.util.removeClass(editModeAreas[j], 'toggle');
                    $A.util.addClass(readModeAreas[j], 'toggle');
                }
            } 
        }
        
        if(!component.get("v.isDesktop")) {
            $A.util.addClass(component.find("sortEdit"), 'hide');
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
        }
    },
    cancelRiskProfile:function(component,event){
        var editComponent =	component.find("riskProfileAllData");        
        component.find("addRiskProfile").set("v.disabled",false);        
        component.find("editRiskProfile").set("v.disabled",false);
        component.set('v.isEditEnabled',false);        
        $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
        $A.util.addClass(component.find("saveCancelButton"),"hideShow");
        
        if(editComponent!= null && editComponent.length != null && editComponent != 'undefined'){            
            for(var i = 0; i < editComponent.length ; i=i+1){                
                $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                var editModeAreas = editComponent[i].find('editMode');
                var readModeAreas = editComponent[i].find('readMode');
                for(var j = 0; j < readModeAreas.length ; j=j+1){
                    $A.util.addClass(editModeAreas[j], 'toggle');
                    $A.util.toggleClass(readModeAreas[j], 'editMode');
                }
            }        
        }else if(editComponent!= null && editComponent != 'undefined'){
            $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
            var editModeAreas = editComponent.find('editMode');
            var readModeAreas = editComponent.find('readMode');
            for(var j = 0; j < readModeAreas.length ; j=j+1){
                $A.util.addClass(editModeAreas[i], 'toggle');
                $A.util.toggleClass(readModeAreas[i], 'editMode');
            }
        }    
        
        if(component.get('v.isEditAccess')){
            var editComponentAddRisk =component.find("riskprofileAdditionalRiskId");        
            
            if(editComponentAddRisk!= null && editComponentAddRisk.length != null && editComponentAddRisk != 'undefined'){                    
                for(var i = 0; i < editComponentAddRisk.length ; i=i+1){
                    $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                    var editModeAreas = editComponentAddRisk[i].find('editMode');
                    var readModeAreas = editComponentAddRisk[i].find('readMode');
                    for(var j = 0; j < readModeAreas.length ; j=j+1){
                        $A.util.addClass(editModeAreas[j], 'toggle');
                        $A.util.toggleClass(readModeAreas[j], 'editMode');
                    }
                }
            }else if(editComponentAddRisk!= null && editComponentAddRisk != 'undefined'){
                $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                var editModeAreas = editComponentAddRisk.find('editMode');
                var readModeAreas = editComponentAddRisk.find('readMode');
                for(var j = 0; j < readModeAreas.length ; j=j+1){
                    $A.util.addClass(editModeAreas[j], 'toggle');
                    $A.util.toggleClass(readModeAreas[j], 'editMode');
                }
            }    
        }
        this.getRiskprofileDataFromController(component, event,'',true,false); 
        if(!component.get('v.isDesktop')){ 
            $A.util.removeClass(component.find("sortEdit"),"hide");
            $A.util.addClass(component.find("saveCancel"),"hide");
        }
    },
    ExpandCollapseFunc:function(component,event){
        if(!component.get('v.isDesktop')){
            return;
        }
        
        //var selectedItem = event.currentTarget;
        //var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find('Risk_Profile');
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = 'utilityToggle';
        var myLabel = component.find(iconElement).get("v.iconName"); 
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            this.getRiskprofileDataFromController(component, event,'',true,false);               
            if(component.get('v.isEditAccess') || component.get('v.isParitalAccess')){
                component.find("addRiskProfile").set("v.disabled",false);                
                component.find("editRiskProfile").set("v.disabled",false);                  
                $A.util.addClass(component.find("cancelRiskProfile"),"hideShow");
                $A.util.addClass(component.find("saveCancelButton"),"hideShow");
            }                        
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");                             
            if(component.find("addRiskProfile") != null){
                component.find("addRiskProfile").set("v.disabled",false);
            }                                    
        }
    },
    addRiskProfileData:function(component,event,riskProfileObjArray){
        var riskProfileArr = component.get("v.riskProfileList");
        component.set("v.noRecords",false);
        if(riskProfileObjArray == null && riskProfileObjArray == undefined && riskProfileObjArray == ''){
            return;
        }
        if(!Array.isArray(riskProfileObjArray)){
            riskProfileObjArray[0]['sobjectType'] = 'RiskProfile__c';
            riskProfileObjArray[0]['NewData'] = 'NewRiskData_0';
            riskProfileArr.push(riskProfileObjArray[0]);
        }else{
            for(var i=0; i<riskProfileObjArray.length; i++){
                riskProfileObjArray[i]['sobjectType'] = 'RiskProfile__c';
                riskProfileObjArray[i]['NewData'] = 'NewRiskData_'+i;
                riskProfileArr.push(riskProfileObjArray[i]);
            }
        }
        component.set("v.riskProfileList",riskProfileArr); 
        this.editRiskProfileHelper(component, event);
    }
})