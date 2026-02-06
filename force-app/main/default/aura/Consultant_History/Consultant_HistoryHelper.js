({
    toggleHelper : function(component,event) {
        var toggleText = component.find("tooltip");
        $A.util.toggleClass(toggleText, "toggle");
    },
    getConsultantHistoryDataFromController : function(component,page,event) {
        
        if(!component.get("v.isDesktop")) {            
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        component.set('v.lastFieldNameToBeSorted','LastName__c');
        component.set('v.isLastFieldNameSortedAsc',true);
        var sortType = 'DESC';
        if(component.get('v.isLastFieldNameSortedAsc')){
            sortType = 'ASC';
        }
        
        page = page || 1;
        var consultantHistoryAction = component.get('c.getConsultantHistoryData');	
        consultantHistoryAction.setParams({
            "accountId" : component.get('v.recordId'),
            "pageNumber": page,
            "columnName" : component.get('v.lastFieldNameToBeSorted'),
            "sortType" : sortType,
            "isPopUp" : false
        });
        consultantHistoryAction.setCallback(this, function(response) {
            var state = response.getState();            			
			$A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }
            
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();                
                if(consultantHistoryResponseData != null && consultantHistoryResponseData.consultantList != null && consultantHistoryResponseData.consultantList.length > 0){                    
                    component.set('v.isConsultantNoData',false);
                    component.set("v.consultingHistoryList", consultantHistoryResponseData.consultantList);                    
                }else{
                    component.set('v.isConsultantNoData',true);
                }  
            }
            
            if(!component.get('v.isDesktop')){       
                
                if($A.get("$Browser.isIOS")){
                    $A.util.addClass(component.find('articleClass'),'cScroll-table');
                }
                
                var iOS = parseFloat(
                    ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                    .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                ) || false;  
                
                if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){
                    $A.util.addClass(component.find('sortEdit'),'iosBottom');
                    $A.util.addClass(component.find('contact_History'),'ipadBottomIos');
                }else{
                    $A.util.addClass(component.find('contact_History'),'ipadbottom');
                }
                $A.util.addClass(component.find('contact_History'),'slds-is-open');
            }
            
            else if (state === "INCOMPLETE") {                
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
                            component.set('v.isConsultantNoData',true);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(consultantHistoryAction);
    },
    sortBy : function(component, event, fieldName,page,sortFieldComp) {
        
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
        page = page || 1;        
        var action = component.get("c.getConsultantHistoryData");     
        component.set('v.lastFieldNameToBeSorted',fieldName);
        
        if(component.get("v."+sortFieldComp) ===  true) { 
            component.set('v.isLastFieldNameSortedAsc',true);
            action.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC',
                "isPopUp" : false
            });
            component.set("v."+sortFieldComp, false);
        } else {
            component.set('v.isLastFieldNameSortedAsc',false);
            action.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC',
				"isPopUp" : false                
            });
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response) {
            
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
                var consultantHistoryResponseData = response.getReturnValue();                
                if(consultantHistoryResponseData != null && consultantHistoryResponseData.consultantList != null && consultantHistoryResponseData.consultantList.length > 0){                    
                    component.set('v.isConsultantNoData',false);
                    component.set("v.consultingHistoryList", consultantHistoryResponseData.consultantList);                    
                }else{
                     component.set('v.isConsultantNoData',true);
                }               
            }
            else if (state === "INCOMPLETE") {                
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
                            component.set('v.isConsultantNoData',true);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    checkEditAccesToThisUser : function(component,event) {        

        var consultantHistoryAction = component.get('c.isEditAccesToThisUser');	
        if(consultantHistoryAction == undefined || consultantHistoryAction == null){
			return;
		}

        consultantHistoryAction.setCallback(this, function(response) {            
            var state = response.getState();
            if (state === "SUCCESS") {    
                var isEditAccess = response.getReturnValue();
                if(isEditAccess != null){                    
                    component.set("v.isEditAccess", isEditAccess);
                }      
                if(!component.get("v.isDesktop")) {            
                    this.getConsultantHistoryDataFromController(component,1,event);
                }
            }
            else if (state === "INCOMPLETE") {                
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
        $A.enqueueAction(consultantHistoryAction);
    },
    createOrDeleteConsultantRecordInController : function(component, event,objId,operation) {        
        
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
        
        //debugger;
        var consultantHistoryAction = null;
        var sortType = 'DESC';
        if(component.get('v.isLastFieldNameSortedAsc')){
            sortType = 'Asc';
        }
        
        if(operation == 'DELETE'){
            consultantHistoryAction = component.get('c.deleteConsultantHistory');	
            consultantHistoryAction.setParams({
                "accountId" : component.get('v.recordId'),
                "objId" : objId,
                "pageNumber" : 1,
                "isPopUp" : false,
                "columnName" : component.get('v.lastFieldNameToBeSorted'),
                "sortType" : sortType
            });
        }else if(operation == 'CREATE'){
            this.modalGenericClose(component);
            consultantHistoryAction = component.get('c.createConsultantHistoryFromAccount');	
            consultantHistoryAction.setParams({
                "accountId" : component.get('v.recordId'),
                "objId" : objId,
                "pageNumber" : 1,
                "isPopUp" : false,
                "columnName" : 'LastName__c',
                "sortType" : 'Asc',                
            });
        }
        consultantHistoryAction.setCallback(this, function(response) {
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');

            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                if($A.get("$Browser.isIOS")){
                    $A.util.addClass(component.find('articleClass'),'cScroll-table');
                }
            }
            
            var state = response.getState();
            if (state === "SUCCESS") {    
                var consultantHistoryResponseData = response.getReturnValue();
                if(consultantHistoryResponseData != null && consultantHistoryResponseData.consultantList != null && consultantHistoryResponseData.consultantList.length > 0){                    
                    component.set('v.isConsultantNoData',false);
                    component.set("v.consultingHistoryList", consultantHistoryResponseData.consultantList);
                }else{
                    component.set('v.isConsultantNoData',true);
                }         
            }
            else if (state === "INCOMPLETE") {                
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
        $A.enqueueAction(consultantHistoryAction);
    },
    modalGenericClose : function(component) {
        
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;	-webkit-overflow-scrolling: auto !important ;}}");
        
        if(!component.get("v.isDesktop")) {         
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
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
        }
    },
})