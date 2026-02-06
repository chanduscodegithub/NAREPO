({
    init : function(component, event, helper) {
        var accountId = component.get("v.accountId");
        if (accountId) {
            helper.getAccountData(component, event, helper);
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
        }else{
            component.set("v.listOfSearchRecords", null ); 
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
        }
    },
    keyPressController : function(component, event, helper) {
        // get the search Input keyword 
        var getInputkeyWord = component.get("v.SearchKeyWord").trim();
        
        // check if getInputKeyWord size id more then 0 then open the lookup result List and 
        // call the helper 
        // else close the lookup result List part.   
        if(getInputkeyWord == null || getInputkeyWord == undefined || getInputkeyWord.length > 0){
            
            //component.set('v.dataAvailable', true);
            
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            var openUL = component.find("searchDropDown");
            $A.util.addClass(openUL, 'slds-show');
            $A.util.removeClass(openUL, 'slds-hide');
            helper.searchHelper(component, event, getInputkeyWord);
            
        }
        else{
            //component.set('v.dataAvailable', false);
            component.set("v.listOfSearchRecords", null ); 
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
        }
        
    },
    removeCustomLookUp:function(component,event,heplper){
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
    },
    // function for clear the Record Selaction 
    clear :function(component,event,helper){
        
        var pillTarget = component.find("lookup-pill");
        var lookUpTarget = component.find("lookupField"); 
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
       
        component.set("v.SearchKeyWord", "");
        component.set("v.listOfSearchRecords", null );

        var compEvent = component.getEvent("oSelectedAccountEvent");
        compEvent.setParams({"accountByEvent" : null });  
        compEvent.fire();
    },
    
    closeDropDown : function(component, event, helper){
        component.set("v.listOfSearchRecords", null ); 
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    
    // This function call when the end User Select any record from the result list.   
    handleComponentEvent : function(component, event, helper) {
        
        // get the selected Account record from the COMPONETN event 	 
        var selectedAccountGetFromEvent = event.getParam("accountByEvent");
        if(selectedAccountGetFromEvent != null){
            component.set("v.selectedRecord" , selectedAccountGetFromEvent);
            component.set("v.SearchKeyWord" , selectedAccountGetFromEvent.Name);
            
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
            var openUL = component.find("searchDropDown");
            $A.util.addClass(openUL, 'slds-hide');
            $A.util.removeClass(openUL, 'slds-show');
        }else{
            component.set("v.listOfSearchRecords", null ); 
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
        }
    },
    // automatically call when the component is done waiting for a response to a server request.  
    hideSpinner : function (component, event, helper) {
        component.set("v.spinner", false);   
    },
    
    // automatically call when the component is waiting for a response to a server request.
    showSpinner : function (component, event, helper) {
        component.set("v.spinner", true); 
    },

    focusIn : function(component, event, helper){
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-open');    
            $A.util.removeClass(forclose, 'slds-is-close');
    },
    
    focusOut : function(component, event, helper){
        var dataAvail = component.get('v.dataAvailable');
        if(!dataAvail){
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');    
            
        }
        
    }
    
})