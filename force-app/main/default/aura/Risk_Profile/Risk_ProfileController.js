({
    doInit : function(component, event, helper) {     
        
        //alert('loca : '+$A.get("$Locale.timezone"));
        var device = $A.get("$Browser.formFactor");
        console.log('Risk Profile Called ');
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){
                    component.set('v.isGenericEventTriggered',true);
                    helper.getRoleAccess(component, event);
                }            
            }, 5000);              
        }else{            
            helper.getRoleAccess(component, event);                        
        }                      
    },
    
    UpdateReviewDate:function(component, event, helper) {          	        
        helper.updateReviewDate(component, event);
    },
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component);      
    },
    editRiskProfile: function(component, event, helper) {                        
        helper.editRiskProfileHelper(component, event);
    },
    
    saveRiskProfile: function(component, event, helper) {                
        var riskTypeMap = component.get("v.RiskTypeMap");                        
        var saveIdsList = component.get("v.saveIds");
        component.set('v.isEditEnabled',false);
        var Ids = {};
        for(var k = 0; k < saveIdsList.length; k = k+1){
            Ids[saveIdsList[k]] = saveIdsList[k];
        }   
        
        var riskProfileListInserList = [];
        var riskProfileAddRiskInsertList = [];
        var riskProfileList = component.get('v.riskProfileList');        
        var riskProfileAddRiskList = component.get('v.riskProfileAddRiskList');
        var isDataChange = false;        
        
        for(var i = 0; i < riskProfileList.length ; i=i+1){        
            if(!(riskProfileList[i].SCERiskTypeAddlRiskFactorType__c != null && riskProfileList[i].SCERiskTypeAddlRiskFactorType__c.length > 0)){
                var riskProfileSaveAlert = component.find('RiskProfileSaveAlert');
                component.set('v.alertMesage',$A.get("$Label.c.Risk_Profile_Invalid_Record"));
                for(var j = 0; j < riskProfileSaveAlert.length ; j=j+1){                
                    $A.util.addClass(riskProfileSaveAlert[j], 'slds-show');
                    $A.util.removeClass(riskProfileSaveAlert[j], 'slds-hide');
                }     	
                return;
            }
            if(riskProfileList[i].Id != null && riskProfileList[i].Id.length > 0){
                if(Ids != null && Ids[riskProfileList[i].Id] != null && riskProfileList[i].Id.length > 0){
                    riskProfileListInserList.push(riskProfileList[i]);   
                    isDataChange = true;
                }                
            }else{
                riskProfileListInserList.push(riskProfileList[i]);   
                isDataChange = true;
            }
            if(!helper.validatedate(component,event,riskProfileList[i].DateRiskClosed__c)){
                var riskProfileSaveAlert = component.find('RiskProfileSaveAlert');
                component.set('v.alertMesage','Invalid date format.  Please enter the Date Risk Closed in m/d/yyyy format.');
                for(var j = 0; j < riskProfileSaveAlert.length ; j=j+1){                
                    $A.util.addClass(riskProfileSaveAlert[j], 'slds-show');
                    $A.util.removeClass(riskProfileSaveAlert[j], 'slds-hide');
                }     	
                return;
            }
        }        
        
        for(var i = 0; i < riskProfileAddRiskList.length ; i=i+1){        
            if(riskProfileAddRiskList[i].Id != null && riskProfileAddRiskList[i].Id.length > 0){
                if(Ids != null && Ids[riskProfileAddRiskList[i].Id] != null && riskProfileAddRiskList[i].Id.length > 0){                    
                    riskProfileAddRiskInsertList.push(riskProfileAddRiskList[i]);   
                    isDataChange = true;
                }                
            }
        }
        
        riskProfileAddRiskList = riskProfileAddRiskInsertList;
        
        for(var i = 0; i < riskProfileAddRiskList.length ; i=i+1){        
            if(riskProfileAddRiskList[i].RiskFactorValue__c != null){                
                if(riskTypeMap[riskProfileAddRiskList[i].SCERiskTypeAddlRiskFactorType__c] != null){
                    if(riskTypeMap[riskProfileAddRiskList[i].SCERiskTypeAddlRiskFactorType__c].fieldType == 'Percentage'){
                        riskProfileAddRiskList[i].RiskFactorValue__c = riskProfileAddRiskList[i].RiskFactorValue__c * 100;
                        riskProfileAddRiskList[i].RiskFactorValue__c = riskProfileAddRiskList[i].RiskFactorValue__c+'%';
                    }
                }
                if(riskTypeMap[riskProfileAddRiskList[i].SCERiskTypeAddlRiskFactorType__c] != null){
                    if(riskTypeMap[riskProfileAddRiskList[i].SCERiskTypeAddlRiskFactorType__c].fieldType == 'Currency'){
                        riskProfileAddRiskList[i].RiskFactorValue__c = '$'+riskProfileAddRiskList[i].RiskFactorValue__c;
                    }
                }
                riskProfileAddRiskList[i].RiskFactorValue__c = riskProfileAddRiskList[i].RiskFactorValue__c.toString();
            }else{
                riskProfileAddRiskList[i].RiskFactorValue__c = '';
            }
        }
        
        helper.updateRiskProfileInController(component, event,riskProfileListInserList,riskProfileAddRiskList,component.get('v.riskProfileIdArr'));
        
    },
    cancelRiskProfile : function(component, event, helper) {        
        helper.cancelRiskProfile(component, event); 
    },
    
    addRiskProfile : function(component, event, helper){                        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Add New Risk','ModalBody':'Risk_Profile_Modal','ModalBodyData':{'accountId':component.get('v.recordId')}}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++){
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{
            component.set('v.scrollStyleForDevice','');
            $A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Add New Risk','ModalBody':'Risk_Profile_Modal','ModalBodyData':{'accountId':component.get('v.recordId')}}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }
        event.stopPropagation();
    },
    
    expandCollapse: function(component, event, helper) {        
        helper.ExpandCollapseFunc(component, event);
    },    
    riskProfileEventMethod : function(component, event, helper) {                
        
        if(event.getParam('isDelete')){
            component.set('v.riskProfileId',event.getParam('removeId'));
            component.set('v.NewRiskRecord',event.getParam('riskProfileObject').NewData);
            var deleteAcc = component.find('RiskProfile');
            for(var i = 0; i < deleteAcc.length ; i=i+1){
                $A.util.removeClass(deleteAcc[i], 'slds-hide');
                $A.util.addClass(deleteAcc[i], 'slds-show');
            }   
        }else if(event.getParam('calRiskScore')){             
            var riskScoreCount = 0;
            var riskProfileList = component.get("v.riskProfileList");
            var riskProfileAdditionRiskFactorList = component.get("v.riskProfileAddRiskList");
            if(riskProfileList != null){
                for(var i = 0; i < riskProfileList.length ; i = i+1){
                    
                    if(riskProfileList[i].RiskScore__c != null && riskProfileList[i].RiskScore__c != ''){
                        riskScoreCount = riskScoreCount+riskProfileList[i].RiskScore__c;    
                    }                
                }    
            }
            if(riskProfileAdditionRiskFactorList != null){
                for(var i = 0; i < riskProfileAdditionRiskFactorList.length ; i = i+1){
                    if(riskProfileAdditionRiskFactorList[i].RiskScore__c != null && riskProfileAdditionRiskFactorList[i].RiskScore__c != ''){
                        riskScoreCount = riskScoreCount+riskProfileAdditionRiskFactorList[i].RiskScore__c;
                    }                
                }    
            }                                        
            var saveIdsList = component.get("v.saveIds");
            var saveId = event.getParam('id')
            var isSaveIdFound = false;            
            for(var k = 0; k < saveIdsList.length; k = k+1){
                if(saveIdsList[k] == saveId){
                    isSaveIdFound = true;
                    break;
                }
            }  
            if(!isSaveIdFound){
                saveIdsList.push(saveId);
            }                      
            component.set("v.saveIds",saveIdsList);                        
            component.set("v.riskProfileAccount.OverallRiskScore__c",riskScoreCount);                        
        }else if(event.getParam('isFormatDate')){            
            var riskProfileSaveAlert = component.find('RiskProfileSaveAlert');
            component.set('v.alertMesage',$A.get("$Label.c.Risk_Profile_Invalid_Date"));            
            for(var i = 0; i < riskProfileSaveAlert.length ; i=i+1){                
                $A.util.addClass(riskProfileSaveAlert[i], 'slds-show');
                $A.util.removeClass(riskProfileSaveAlert[i], 'slds-hide');
            } 
        }       
    },
    
    removeRisk: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        component.set('v.RPRemoveIndex',divId);
        var deleteAcc = component.find('RiskProfile');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    
    confirmDelete: function(component, event, helper) {                        
        var deleteAcc = component.find('RiskProfile');
        var riskProfileArr = component.get("v.riskProfileList");
        var riskProfileIdArr = component.get('v.riskProfileIdArr');
        var newRiskArray = [];
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
        if(!component.get('v.isEditEnabled')){
            helper.deleteRiskProfile(component,event,component.get('v.riskProfileId'),false);
        }else{
            if(component.get('v.NewRiskRecord') != undefined && component.get('v.NewRiskRecord') != null && component.get('v.NewRiskRecord') != ''){
                if(!Array.isArray(riskProfileArr)){
                    component.set("v.riskProfileList",[]);
                }else{
                    for(var i=0; i<riskProfileArr.length; i++){
                        if(riskProfileArr[i].NewData != component.get('v.NewRiskRecord')){
                            newRiskArray.push(riskProfileArr[i]); 
                        }
                    }
                    component.set("v.riskProfileList",newRiskArray);
                }
            }else{
                for(var j=0; j<riskProfileArr.length; j++){
                    if(riskProfileArr[j].Id != component.get('v.riskProfileId')){
                        newRiskArray.push(riskProfileArr[j]); 
                    }
                }
                component.set("v.riskProfileList",newRiskArray);
                riskProfileIdArr.push(component.get('v.riskProfileId'));
                component.set('v.riskProfileIdArr',riskProfileIdArr);
            }
            if(component.get("v.riskProfileList") != undefined && component.get("v.riskProfileList") != null && component.get("v.riskProfileList").length == 0){
                component.set("v.noRecords",true); 
            }
        }  
    },
    
    confirmCancel: function(component, event, helper) {
        var deleteAcc = component.find('RiskProfile');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
        
        var childCmp = component.find("riskProfileAllData");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var j=0; j<childCmp.length; j++) {
                    childCmp[j].removeProcessingIcon();
                } 
            } else {
                childCmp.removeProcessingIcon();
            }
        }
    },
    addorCancelRiskEvent : function(component, event, helper) {                
        helper.modalGenericClose(component);
        
        if(event.getParam('clicked') == 'cancel'){
            var modalComponent = component.find('Risk_Modal');            
            if(modalComponent != null && modalComponent.length != null && modalComponent != 'undefined'){
                for(var i = 0; i < modalComponent.length ; i=i+1){                
                    $A.util.addClass(modalComponent[i], 'slds-hide');
                    $A.util.removeClass(modalComponent[i], 'slds-show');
                }    
            }else{
                $A.util.addClass(modalComponent, 'slds-hide');
                $A.util.removeClass(modalComponent, 'slds-show');
            }                        
        }else{
            var cmpTarget = component.find('Risk_Profile');
            $A.util.addClass(cmpTarget,'slds-is-open');
            var myLabel = component.find('utilityToggle').get("v.iconName"); 
            if(myLabel=="utility:chevronright"){
                component.find('utilityToggle').set("v.iconName","utility:chevrondown");
                helper.getRiskprofileDataFromController(component, event,event.getParam('riskProfileObjArray'),true,true);
            }else{
                helper.getRiskprofileDataFromController(component, event,event.getParam('riskProfileObjArray'),false,true);
            }            
        }
    },
    navSObject : function (component, event, helper){
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recId,
        });
        navEvt.fire();
    },
    closeSaveAlert : function (component, event, helper){
        var riskProfileSaveAlert = component.find('RiskProfileSaveAlert');        
        for(var i = 0; i < riskProfileSaveAlert.length ; i=i+1){            
            $A.util.removeClass(riskProfileSaveAlert[i], 'slds-show');
            $A.util.addClass(riskProfileSaveAlert[i], 'slds-hide');
        }     	
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i <ErrorMessage.length ; i=i+1){        
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    setGeneralValues: function(component, event, helper){
        
        if(component.get('v.isGenericEventTriggered')) return;
        
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){                
                if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['RiskProfileFullAccess'] != null){
                    component.set('v.isEditAccess',generalObj.userEditAccessMap['RiskProfileFullAccess']);
                }
                if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['RiskProfilePartialAccess'] != null){
                    component.set('v.isParitalAccess',generalObj.userEditAccessMap['RiskProfilePartialAccess']);
                }else{
                    helper.getRoleAccess(component, event);   
                }
            }else{
                helper.getRoleAccess(component, event);
            }  
        }else{            
            helper.getRoleAccess(component, event);
        }                  
    },
    scrollBottom: function(component, event, helper){	        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
            var isScrollStop = component.get("v.isScrollStop");
            component.set("v.isStop",component.get("v.isStop")+1);                    
            if(isScrollStop){                       
                
                var actionBar = component.find("action-bar-mobile");               	           
                $A.util.addClass(actionBar,"slds-hide");    
                
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	component.set("v.isStopped",true);
                                                                                              $A.util.removeClass(actionBar,"slds-hide");
                                                                                              component.set("v.isScrollStop",true);
                                                                                              clearInterval(myInterval);
                                                                                             }
                    }), 250
                ); 
                
            }
        } 
    }
})