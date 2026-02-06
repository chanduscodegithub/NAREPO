({  
    getRelatedMA : function(component, event, page, columnName, sortType) {
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1;
        columnName = columnName || 'Opportunity.Account.Name';
        sortType = sortType || 'ASC';
        
        var consultantId = component.get('v.recordId');
        
        var actionToGetRelatedMA = component.get('c.queryRelatedMA');
        actionToGetRelatedMA.setParams({
            "contactId" : consultantId,
            "pageNumber": page,
            "columnName" : columnName,
            "sortType" : sortType});
        
        actionToGetRelatedMA.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                var contact_MA_List  = response.getReturnValue();
                if(contact_MA_List != null){
                    if(contact_MA_List.contactMARecords.length != 0){
                        component.set("v.contactMARecords", contact_MA_List.contactMARecords);
                        component.set("v.page", contact_MA_List.page);
                        component.set("v.total", contact_MA_List.total);
                        component.set("v.pages", Math.ceil(contact_MA_List.total/contact_MA_List.pageSize));
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
                                $A.util.addClass(component.find('contact_MA'),'ipadBottomIos');
                            }else{
                                $A.util.addClass(component.find('contact_MA'),'ipadbottom');
                            }
                            $A.util.addClass(component.find('contact_MA'),'slds-is-open'); 
                        }  
                    }else{
                        $A.util.addClass(component.find('contact_MA'),'slds-is-open'); 
                        component.set('v.isContactMAListEmpty', true);
                    }
                }else{
                    component.set("v.isContactMAListEmpty", true);                    
                }
                
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {    
                
            }
                else if (state === "ERROR") {
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        
        $A.enqueueAction(actionToGetRelatedMA);
        
    },
    
    sortBy : function(component, event, fieldName, page, sortFieldComp) {
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1;
        var consultantId = component.get('v.recordId');
        var actionToGetRelatedMA = component.get('c.queryRelatedMA');
        
        if(component.get("v."+sortFieldComp) ===  true){
            actionToGetRelatedMA.setParams({
                "contactId" : consultantId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC'});
            
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        }else{
            actionToGetRelatedMA.setParams({
                "contactId" : consultantId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC'});    
            
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        
        actionToGetRelatedMA.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                
                var contact_MA_List  = response.getReturnValue();
                if(contact_MA_List != null){
                    if(contact_MA_List.length != 0){
                        component.set("v.contactMARecords", contact_MA_List.contactMARecords);
                        component.set("v.page", contact_MA_List.page);
                        component.set("v.total", contact_MA_List.total);
                        component.set("v.pages", Math.ceil(contact_MA_List.total/contact_MA_List.pageSize));
                        
                        var device = $A.get("$Browser.formFactor");
                        if(device != "DESKTOP"){ 
                            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");      
                            $A.util.removeClass(component.find("sortEdit"),"hide");
                        }  
                        
                    }else{
                        component.set('v.isContactMAListEmpty', true);
                    }
                }else{
                    component.set("v.isContactMAListEmpty", true);                    
                }
                
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {    
                
            }
                else if (state === "ERROR") {
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        
        $A.enqueueAction(actionToGetRelatedMA);
    }
})