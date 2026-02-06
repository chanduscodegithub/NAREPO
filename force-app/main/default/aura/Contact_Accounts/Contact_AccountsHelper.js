({
    getRelatedAccounts : function(component, event, page, columnName, sortType) {
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1;
        columnName = columnName || 'Account.Name';
        sortType = sortType || 'ASC';
        
        var consultantId = component.get('v.recordId');
        var actionToGetRelatedAccounts = component.get('c.queryRelatedAccounts');
        actionToGetRelatedAccounts.setParams({
            "contactId" : consultantId,
            "pageNumber": page,
            "columnName" : columnName,
            "sortType" : sortType});
        
        actionToGetRelatedAccounts.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                console.log(JSON.stringify(response.getReturnValue()));
                
                var contactAccountList  = response.getReturnValue();
                if(contactAccountList != null){
                    if(contactAccountList.contactAccountRecords.length != 0){
                        component.set("v.contactAccountsRecords", contactAccountList.contactAccountRecords);
                        component.set("v.page", contactAccountList.page);
                        component.set("v.total", contactAccountList.total);
                        component.set("v.pages", Math.ceil(contactAccountList.total/contactAccountList.pageSize));
                        var device = $A.get("$Browser.formFactor");
                        if(device != "DESKTOP"){ 
                            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");   
                            $A.util.removeClass(component.find("sortEdit"),"hide");
                            
                            var iOS = parseFloat(
                                ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                                .replace('undefined', '3_2').replace('_', '.').replace('_', '')
                            ) || false;  
                            
                            if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){                
                                $A.util.addClass(component.find('sortEdit'),'iosBottom');
                                $A.util.addClass(component.find('contact_Account_Table'),'ipadBottomIos');
                            }else{
                                $A.util.addClass(component.find('contact_Account_Table'),'ipadbottom');
                            }
                            $A.util.addClass(component.find('contact_Account_Table'),'slds-is-open'); 
                        }  
                    }else{
                        $A.util.addClass(component.find('contact_Account_Table'),'slds-is-open'); 
                        component.set('v.isContactAccountsListEmpty', true);
                    }
                }else{
                    component.set("v.isContactAccountsListEmpty", true);                    
                }
                
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") { 
                component.set('v.isSpinnertoLoad', false);
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length; i = i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
                
            }
                else if (state === "ERROR") {
                    component.set('v.isSpinnertoLoad', false);
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
        
        $A.enqueueAction(actionToGetRelatedAccounts);
        
    },
    
    sortBy : function(component, event, fieldName, page, sortFieldComp) {
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1;
        var consultantId = component.get('v.recordId');
        var actionToGetRelatedAccounts = component.get('c.queryRelatedAccounts');
        
        if(component.get("v."+sortFieldComp) ===  true){
            actionToGetRelatedAccounts.setParams({
                "contactId" : consultantId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC'});
            
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        }else{
            actionToGetRelatedAccounts.setParams({
                "contactId" : consultantId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC'});    
            
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        
        actionToGetRelatedAccounts.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                console.log(JSON.stringify(response.getReturnValue()));
                
                var contactAccountList  = response.getReturnValue();
                if(contactAccountList != null){
                    if(contactAccountList.length != 0){
                        component.set("v.contactAccountsRecords", contactAccountList.contactAccountRecords);
                        component.set("v.page", contactAccountList.page);
                        component.set("v.total", contactAccountList.total);
                        component.set("v.pages", Math.ceil(contactAccountList.total/contactAccountList.pageSize));
                        
                        var device = $A.get("$Browser.formFactor");
                        if(device != "DESKTOP"){ 
                            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");      
                            $A.util.removeClass(component.find("sortEdit"),"hide");
                        }  
                        
                    }else{
                        component.set('v.isContactAccountsListEmpty', true);
                    }
                }else{
                    component.set("v.isContactAccountsListEmpty", true);                    
                }
                
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") { 
                component.set('v.isSpinnertoLoad', false);
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length; i = i+1){
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
                
            }
                else if (state === "ERROR") {
                    component.set('v.isSpinnertoLoad', false);
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
        
        $A.enqueueAction(actionToGetRelatedAccounts);
    }
})