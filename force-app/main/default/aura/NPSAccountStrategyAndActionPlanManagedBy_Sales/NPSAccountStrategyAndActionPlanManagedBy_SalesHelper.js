({
    getOpenAndClosedCases : function(component,event,tab) {
        debugger;
        var device = $A.get("$Browser.formFactor");				                   
        //if(device = "DESKTOP"){           
        //helper.getMedicalMembership(component);
        //$A.util.toggleClass(component.find('NPS_Account_Strategy_and_Action_Plan_Managed_By_Sales'),'slds-is-open');
        //}
        var action = component.get("c.getOpenClosedCases");
        action.setParams({
            accountId : component.get('v.recordId'),
            columnName : "",
            sortType : "ASC"
        });
        action.setCallback(this,function(response){
            var resObj = response.getReturnValue();
            if(resObj != undefined && resObj != null){ 
                component.set('v.responseObj',response.getReturnValue());
                component.set("v.ownerId", resObj.loginUser);
                component.set("v.isNewButtonEnable", resObj.profileAccess);
                var openCases = response.getReturnValue().openCaseList;
                //************************************************************//
                if(openCases == null || openCases == undefined || openCases.length == 0){
                    component.set("v.isEmtOpenCases",true);
                }
                
                component.set("v.isEmtOpenCasesViewAll",false);
                if(openCases != null && openCases != undefined && openCases.length < 6){
                    component.set("v.isEmtOpenCasesViewAll",true);
                }
                var actionPlans = response.getReturnValue().openCasePartialList;
                for(var i=0;i<actionPlans.length;i++){
                    var tasks = actionPlans[i].Tasks;           
                    //var countOpen = 0,countClose=0;
                    var count = 0;
                    if(tasks != null && tasks != undefined){
                        count = tasks.length;                                                          
                    }
                    actionPlans[i].activities = count;
                    ///actionPlans[i].closeActivities = countClose;                    
                }               
                component.set("v.openCaseList", response.getReturnValue().openCasePartialList); 
                var spinner1 = component.find("spinner");
                $A.util.addClass(spinner1, 'slds-hide');
                
                var spinner2 = component.find("spinner1");
                $A.util.addClass(spinner2, 'slds-hide');
                var appletIcon = component.find("appletIcon");
                $A.util.removeClass(appletIcon, 'slds-hide');
            }            
        });               
        $A.enqueueAction(action);	
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
    sortBy : function(component, event, columnName, page, sortFieldComp){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getOpenClosedCases");
        
        if(component.get("v."+sortFieldComp) ===  true){
            action.setParams({"accountId" : component.get('v.recordId'),                             
                              "columnName" : columnName,
                              "sortType" : 'DESC'    
                             });          
            component.set("v."+sortFieldComp, false);
        }else{
            action.setParams({"accountId" : component.get('v.recordId'),                             
                              "columnName" : columnName,
                              "sortType" : 'ASC'    
                             });          
            component.set("v."+sortFieldComp, true);
        }
        
       action.setCallback(this,function(response){
            var resObj = response.getReturnValue();
            if(resObj != undefined && resObj != null){ 
                component.set('v.responseObj',response.getReturnValue());
                component.set("v.ownerId", resObj.loginUser);
                component.set("v.isNewButtonEnable", resObj.profileAccess);
                var openCases = response.getReturnValue().openCaseList;
                //************************************************************//
                if(openCases == null || openCases == undefined || openCases.length == 0){
                    component.set("v.isEmtOpenCases",true);
                }
                
                component.set("v.isEmtOpenCasesViewAll",false);
                if(openCases != null && openCases != undefined && openCases.length < 6){
                    component.set("v.isEmtOpenCasesViewAll",true);
                }
                var actionPlans = response.getReturnValue().openCasePartialList;
                for(var i=0;i<actionPlans.length;i++){
                    var tasks = actionPlans[i].Tasks;           
                    //var countOpen = 0,countClose=0;
                    var count = 0;
                    if(tasks != null && tasks != undefined){
                        count = tasks.length;                                                          
                    }
                    actionPlans[i].activities = count;
                    ///actionPlans[i].closeActivities = countClose;                    
                }               
                component.set("v.openCaseList", response.getReturnValue().openCasePartialList);
                var spinner1 = component.find("spinner");
                $A.util.addClass(spinner1, 'slds-hide');
                
                var spinner2 = component.find("spinner1");
                $A.util.addClass(spinner2, 'slds-hide');
                var appletIcon = component.find("appletIcon");
                $A.util.removeClass(appletIcon, 'slds-hide');
            }            
        });               
        $A.enqueueAction(action);
        
    }
})