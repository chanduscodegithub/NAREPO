({
    getOpenAndClosedCases : function(component,event,tab) {
        var device = $A.get("$Browser.formFactor");				                   
        if(device != "DESKTOP"){           
            //helper.getMedicalMembership(component);
            $A.util.toggleClass(component.find('Service_Plan_Managed_By_CSI'),'slds-is-open');
        }
        var action = component.get("c.getOpenClosedCases");
        action.setParams({
            accountId : component.get('v.recordId')
        });
        action.setCallback(this,function(response){
            var resObj = response.getReturnValue();
            if(resObj != undefined && resObj != null){ 
                component.set('v.responseObj',response.getReturnValue());
                var openCases = response.getReturnValue().openCaseList;
                var closedCases = response.getReturnValue().closedCaseList;
               //************************************************************//
                if((openCases == null || openCases == undefined || openCases.length == 0) && tab == 'OpenServicePlan'){
                    component.set("v.isEmtOpenCases",true);
                }
                
                if((closedCases == null || closedCases == undefined || closedCases.length == 0) && tab == 'ClosedServicePlan'){
                    component.set("v.isEmtClosedCases",true);
                }
                if(tab == 'ClosedServicePlan'){ 
                    component.set("v.isEmtClosedCasesViewAll",false);
                    if(closedCases != null && closedCases != undefined && closedCases.length < 6){
                        component.set("v.isEmtClosedCasesViewAll",true);
                    }
                    component.set("v.closedCaseList", response.getReturnValue().closeCasePartialList);
                }
                if(tab == 'OpenServicePlan'){
                    component.set("v.isEmtOpenCasesViewAll",false);
                    if(openCases != null && openCases != undefined && openCases.length < 6){
                        component.set("v.isEmtOpenCasesViewAll",true);
                    }
                    component.set("v.openCaseList", response.getReturnValue().openCasePartialList);
                    
                }
                
            }
            
        });               
        $A.enqueueAction(action);	
    }
})