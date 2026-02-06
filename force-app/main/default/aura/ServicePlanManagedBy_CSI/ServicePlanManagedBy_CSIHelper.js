({
	getOpenAndClosedCases : function(component,event) {
	var device = $A.get("$Browser.formFactor");				                   
        if(device != "DESKTOP"){           
            //helper.getMedicalMembership(component);
            $A.util.addClass(component.find('Service_Plan_Managed_By_CSI'),'slds-is-open');
        }
        var action = component.get("c.getOpenClosedCases");
        action.setParams({
            accountId : component.get('v.recordId')
        });
        action.setCallback(this,function(response){
            var resObj = response.getReturnValue();
            if(resObj != undefined && resObj != null){                
                var openCases = response.getReturnValue().openCaseList;
                var closedCases = response.getReturnValue().closedCaseList;               
                component.set("v.isEmtOpenCases",false);
                component.set("v.isEmtClosedCases",false);
                if(openCases == null || openCases == undefined || openCases.length == 0 ){
                    component.set("v.isEmtOpenCases",true);
                }
                if(closedCases == null || closedCases == undefined || closedCases.length == 0 ){
					 component.set("v.isEmtClosedCases",true);
                }               
                component.set("v.openCaseList", openCases);
                component.set("v.closedCaseList", closedCases);
                component.set("v.recordTypeId",resObj.recordTypeId);
                component.set("v.isNewButtonEnable", resObj.profileAccess);
            }
            
        });               
        $A.enqueueAction(action);	
	}
})