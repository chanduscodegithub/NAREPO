({      
    showToast : function(msg) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "message": msg
        });
        toastEvent.fire();
    },
    
    globalCloseModal : function(component) {
        var consultantLookUp = component.find("ConsultantLookUp");
        var consultantmodal = component.find("consultantmodal");
        $A.util.addClass(consultantLookUp,'display');
        $A.util.addClass(consultantmodal,'display');
        $A.util.removeClass(consultantLookUp,'slds-modal slds-fade-in-open slds-modal--large');
        $A.util.removeClass(consultantmodal,'slds-backdrop slds-backdrop--open');
    },
    
    modalGenericClose : function(component) {
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
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
    
    getBGHMemberContacts : function(component, event) {
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getBusinessGroupsonHealthOnAppletLoad");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "columnName" : 'BGHContact__r.LastName',
            "sortType" : 'Asc',
        });
        
        action.setCallback(this,function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                if(response.getReturnValue().contactBusinessGroupsonHealth != null && response.getReturnValue().contactBusinessGroupsonHealth.length > 0) {
                    component.set('v.businessMemberContacts', response.getReturnValue().contactBusinessGroupsonHealth);
                }else{
                    component.set('v.businessMemberContactsEmptyList', true);
                }    
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                if(!component.get('v.isDesktop')){
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                    
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){               
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('BGH_Applet'),'ipadBottomIos');
                    }else{
                        $A.util.addClass(component.find('BGH_Applet'),'ipadbottom');
                    }
                    
                    component.set('v.isExpand',true);            
                    $A.util.toggleClass(component.find('BGH_Applet'),'slds-is-open');
                }
                if(!component.get('v.isDesktop')) {
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                }
            } else {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                console.log("In getBusinessGroupsonHealth method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            //$A.util.removeClass(spinner, 'slds-show');
            //$A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
    getBGHMemberContactsButtonAccess : function(component, event) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.hasBGHMemberContactseditAccesToThisUser");
        if(action == undefined || action == null){
            return;
        }
        action.setParams({
            "accountId" : component.get('v.recordId')
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                
                var ResponseData = response.getReturnValue();
                if(ResponseData != null){                    
                    component.set("v.isEditAccess", ResponseData);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                this.getBGHMemberContacts(component,event);
            } else {
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                console.log("In getBGHMemberContactsButtonAccess method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    //      $A.util.removeClass(spinner, 'slds-show');
                    //      $A.util.addClass(spinner, 'slds-hide');
                    console.log("Unknown error");
                }
            }
            //  $A.util.removeClass(spinner, 'slds-show');
            //  $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
    sortBy : function(component, event, fieldName, sortFieldComp) {
        
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getBusinessGroupsonHealthOnAppletLoad");
        if(component.get("v."+sortFieldComp) ===  true) {
            action.setParams({
                "accountId" : component.get('v.recordId'),
                "columnName" : fieldName,
                "sortType" : 'Desc'
            });
            component.set("v."+sortFieldComp, false);
        } else {
            action.setParams({
                "accountId" : component.get('v.recordId'),
                "columnName" : fieldName,
                "sortType" : 'Asc'
            });
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                if(response.getReturnValue().contactBusinessGroupsonHealth != null) {
                    component.set('v.businessMemberContacts', response.getReturnValue().contactBusinessGroupsonHealth);
                }
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                if(!component.get('v.isDesktop')){
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                }
            } else {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                console.log("In sortBy method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    //    $A.util.removeClass(spinner, 'slds-show');
                    //    $A.util.addClass(spinner, 'slds-hide');
                    console.log("Unknown error");
                }
            }           
            //  $A.util.removeClass(spinner, 'slds-show');
            //  $A.util.addClass(spinner, 'slds-hide');
        });        
        $A.enqueueAction(action);
    },
    
    removeBGHRecordFromApplet : function(component, event, removeBghId) { 
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        if(!component.get('v.isDesktop')) {
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        var confirmCancelList = component.find('BusinessGroupHealth');
        for(var i in confirmCancelList) {
            $A.util.removeClass(confirmCancelList[i], 'slds-show');
            $A.util.addClass(confirmCancelList[i], 'slds-hide');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.deleteBGHRecordFromApplet");
        action.setParams({
            "accountBGHRecordId":removeBghId,
            "currentRecordId":component.get('v.recordId')
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {

                    console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                    if(response.getReturnValue().contactBusinessGroupsonHealth != null && response.getReturnValue().contactBusinessGroupsonHealth.length > 0) {
                        component.set('v.businessMemberContacts', response.getReturnValue().contactBusinessGroupsonHealth);
                    }else{
                        component.set('v.businessMemberContactsEmptyList', true);
                    }
                
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                if(!component.get('v.isDesktop')) {
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                }
            } else {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                console.log("In removeBGHRecordFromApplet method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
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
    
    saveUpdatedRoleBGH : function(component, event, bghContactRecordId, updatedRole){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get('c.updateBGHRole');
        action.setParams({
            'bghContactRecordId': bghContactRecordId,
            'updatedRole' : updatedRole,
            'currentRecordId' : component.get('v.recordId'),
            'isContact' : component.get('v.isContact')});
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                //console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                if(response.getReturnValue().contactBusinessGroupsonHealth != null) {
                    component.set('v.businessGroupsContact', response.getReturnValue().contactBusinessGroupsonHealth);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
            }else{
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                console.log("In saveUpdatedRoleBGH method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
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
    }
    
})