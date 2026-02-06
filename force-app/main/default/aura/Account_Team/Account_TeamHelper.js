({
    getAccTeamRole : function(component,event) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var AccountRoleAction = component.get('c.getAccountTeamRole');	
        AccountRoleAction.setParams({
            "accountId" : component.get('v.recordId'),
        });
        console.log('test');
        AccountRoleAction.setCallback(this, function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if (state === "SUCCESS") {    
                var AccountRole  = response.getReturnValue();
                if(AccountRole.isLoggedInUserRole != null){
                    if(AccountRole.recordIdObjectType != null){
                        if(AccountRole.recordIdObjectType === 'Opportunity'){
                            component.set('v.isOpportunity', true);   
                        }
                    }
                    component.set('v.isLoggedInUserrole',AccountRole.isLoggedInUserRole);
                    var page = component.get("v.page") || 1;
                    this.getAccountTeamMembers(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
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
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                            //console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(AccountRoleAction);
    },
    
    initializedoInitValues:function(component,loginUserRole){
        if(loginUserRole != null){
            component.set('v.isLoggedInUserrole',loginUserRole);
        } 
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
    
    getAccountTeamMembers : function(component,page,event,columnName,sortType) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        /* var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');*/
        var device = $A.get("$Browser.formFactor");
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        page = page || 1;
        var cdAccountAction = component.get('c.getAccountTeamMemberRecords');	
        cdAccountAction.setParams({
            "accountId" : component.get('v.recordId'),
            "pageNumber": page,
            "columnName" : columnName,
            "sortType" : sortType,
        });
        cdAccountAction.setCallback(this, function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            console.log(state);
            if (state === "SUCCESS") {    
                var accountTeamMemberList  = response.getReturnValue();
                if(accountTeamMemberList != null || accountTeamMemberList.length>0){
                    if(accountTeamMemberList.accountTeamMembers == null || accountTeamMemberList.accountTeamMembers.length == 0){
                        component.set("v.isAccountTeamListEmpty",true);
                        if(device != "DESKTOP"){ 
                            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
                        } 
                    }else{
                        component.set("v.isAccountTeamListEmpty",false);
                    }
                    component.set("v.AccountTeamData",accountTeamMemberList.accountTeamMembers);
                    component.set("v.page", accountTeamMemberList.page);
                    component.set("v.total", accountTeamMemberList.total);
                    component.set("v.pages", Math.ceil(accountTeamMemberList.total/accountTeamMemberList.pageSize));
                    if(device != "DESKTOP"){ 
                    var iOS = parseFloat(
                            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                        ) || false;
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){                
                        $A.util.addClass(component.find('Account_Team'),'ipadBottomIos');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                    }else{
                        $A.util.addClass(component.find('Account_Team'),'ipadbottom');
                    }
                    component.set('v.isExpand',true);            
                    $A.util.addClass(component.find('Account_Team'),'slds-is-open');
                    $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                    } 
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
            /* $A.util.removeClass(spinner, 'slds-show');
             $A.util.addClass(spinner, 'slds-hide');*/
            
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });        
        $A.enqueueAction(cdAccountAction);
    },
  
    sortBy : function(component, event, fieldName,page,sortFieldComp) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var device = $A.get("$Browser.formFactor");
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        page = page || 1;
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var cdAccountAction = component.get("c.getAccountTeamMemberRecords");
        //alert(sortFieldComp);
        if(component.get("v."+sortFieldComp) ===  true) {
            cdAccountAction.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC',
            });
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        } else {
            cdAccountAction.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC'
            });
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        
        cdAccountAction.setCallback(this,function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if (state === "SUCCESS") {    
                var accountTeamMemberList  = response.getReturnValue();
                if(accountTeamMemberList != null || accountTeamMemberList.length >0){
                    if(accountTeamMemberList.accountTeamMembers == null || accountTeamMemberList.accountTeamMembers.length == 0){
                        component.set("v.isAccountTeamListEmpty",true);
                        if(device != "DESKTOP"){ 
                            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
                        } 
                    }else{
                        component.set("v.isAccountTeamListEmpty",false);
                    }
                    component.set("v.AccountTeamData",accountTeamMemberList.accountTeamMembers);
                    component.set("v.page", accountTeamMemberList.page);
                    component.set("v.total", accountTeamMemberList.total);
                    component.set("v.pages", Math.ceil(accountTeamMemberList.total/accountTeamMemberList.pageSize));
                    if(device != "DESKTOP"){ 
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                    } 
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
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });        
        $A.enqueueAction(cdAccountAction);
    },
    
    insertRemoveAccountTeamMembers : function(component,event,userId,operation) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var device = $A.get("$Browser.formFactor");
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var accountTeamInsertDeleteAction = null;	
        if(operation == 'Insert'){
            this.modalGenericClose(component);
            accountTeamInsertDeleteAction = component.get('c.createAccountTeamMember');
        }else if(operation == 'Delete'){
            accountTeamInsertDeleteAction = component.get('c.removeAccountTeamMember');
        }
        
        accountTeamInsertDeleteAction.setParams({
            "accountId" : component.get('v.recordId'),
            "userID": userId,
            "pageNumber":component.get("v.page")
        });
        accountTeamInsertDeleteAction.setCallback(this, function(response) {
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            console.log(state);
            if (state === "SUCCESS") {    
                var accountTeamMemberList  = response.getReturnValue();
                console.log(accountTeamMemberList);
                if(accountTeamMemberList != null || accountTeamMemberList.length>0){
                    if(accountTeamMemberList.accountTeamMembers == null || accountTeamMemberList.accountTeamMembers.length == 0){
                        component.set("v.isAccountTeamListEmpty",true);
                    }else{
                        component.set("v.isAccountTeamListEmpty",false);
                    }
                    component.set("v.AccountTeamData",accountTeamMemberList.accountTeamMembers);
                    component.set("v.page", accountTeamMemberList.page);
                    component.set("v.total", accountTeamMemberList.total);
                    component.set("v.pages", Math.ceil(accountTeamMemberList.total/accountTeamMemberList.pageSize));
                    if(device != "DESKTOP"){ 
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                    } 
                }else{
                    if(device != "DESKTOP"){ 
                        $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
                    } 
                    component.set("v.isAccountTeamListEmpty",true);
                }
                //this.showToast(component, event, 'Success!','The record has been updated successfully.');
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
            /*$A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');*/
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });        
        $A.enqueueAction(accountTeamInsertDeleteAction);
    },
    
    showToast : function(component, event, title,messg) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            //"title": title,
            'mode': 'sticky',
            "message": messg
        });
        toastEvent.fire();
    }
})