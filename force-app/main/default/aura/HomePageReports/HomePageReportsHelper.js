({
    getReportsData : function(component, event) {
        debugger;
        $A.util.removeClass(component.find("tableSpinner"), "slds-hide");
        var selectedVPCRRVPVal = component.find("VPCRRVPsDropDown").get("v.value");
        
        var action = component.get('c.getAccountReportData');
        action.setParams({"OnLoad" : true,
                          "OnFilter" : false,
                          "cmvcpfilter": '',
                          "ownerfilter": ''                         
                         });      
        action.setCallback(this, $A.getCallback(function (response){
            var state = response.getState();
            if (state === "SUCCESS") {              
                var responseObj = response.getReturnValue();                
                //component.set('v.loggedInUserRoleName', responseObj.loggedInUserRoleName);
                var allCMVPCRRVPsList = responseObj.cmVPCRRVP_PickList;
                var allCMVPCRRVPsArray = [];
                allCMVPCRRVPsArray.push({label:'All VPCR\'s/RVP\'s', value:'All RVP\'s/VPCR\'s'});
                if(allCMVPCRRVPsList != undefined && allCMVPCRRVPsList != null && allCMVPCRRVPsList.length > 0) {
                    for(var i=0;i<allCMVPCRRVPsList.length;i++) {
                        allCMVPCRRVPsArray.push({label:allCMVPCRRVPsList[i], value:allCMVPCRRVPsList[i]});
                    }
                }
                component.find('VPCRRVPsDropDown').set("v.options", allCMVPCRRVPsArray);
                
                var allSCEsList = responseObj.cmSCE_PickList;
                var allSCEsArray = [];
                allSCEsArray.push({label:'All SCE\'s', value:'All SCE\'s'});
                if(allSCEsList != undefined && allSCEsList != null && allSCEsList.length > 0) {                    
                    for(var i=0;i<allSCEsList.length;i++) {
                        allSCEsArray.push({label:allSCEsList[i], value:allSCEsList[i]});
                    }
                }
                component.set("v.allSCEsDefaultArray", allSCEsArray);
                component.find('SCEsDropDown').set("v.options", allSCEsArray);
                
                if(responseObj.cmVPCRRVP_SCE_Map != undefined && responseObj.cmVPCRRVP_SCE_Map != null) {
                    component.set('v.vpcrSceOwnerMap', responseObj.cmVPCRRVP_SCE_Map);
                }
                
                if(responseObj.resultMapByFirm != undefined && responseObj.resultMapByFirm != null) {
                    component.set('v.ReportByFirmMaster',responseObj.resultMapByFirm);                    
                    this.groupData(component, event,responseObj.resultMapByFirm,'','','firm');
                }
                
                if(responseObj.resultMapByBL != undefined && responseObj.resultMapByBL != null) {
                    component.set('v.ReportByBLMaster',responseObj.resultMapByBL);                    
                    this.groupData(component, event,responseObj.resultMapByBL,'','','bl');                                     
                }else{
                    component.set("v.WorkItemsEmptyList",true);                                       
                }
                $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
                $A.util.removeClass(component.find("dataProcessing1"), "slds-hide");
                $A.util.addClass(component.find("tableSpinner"), "slds-hide");                
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);                
            }           
        }));
        $A.enqueueAction(action);
    },
    
    getFilteredData :function(component, event, columnName, sortFieldComp) {
        
        $A.util.removeClass(component.find("tableSpinner"), "slds-hide"); 
        var toBeExecuted = true;
        var selectedVPCRRVPVal = component.find("VPCRRVPsDropDown").get("v.value");
        var selectedSCEVal = component.find("SCEsDropDown").get("v.value");
        
        var vpcrRvpFilter = '';
        var sceFilter = '';
        
        if(selectedVPCRRVPVal != undefined && selectedVPCRRVPVal != null && selectedVPCRRVPVal != '') { 
            if(selectedVPCRRVPVal.indexOf('All') >= 0) {
                vpcrRvpFilter = 'All';
            } else {
                vpcrRvpFilter = selectedVPCRRVPVal;
            }
        }
        
        if(selectedSCEVal != undefined && selectedSCEVal != null && selectedSCEVal != '') { 
            if(selectedSCEVal.indexOf('All') >= 0) {
                sceFilter = 'All';
            } else {
                sceFilter = selectedSCEVal;
            }
        }
        setTimeout(function(){
            $A.util.removeClass(component.find("dataProcessing"), "slds-hide");
            $A.util.removeClass(component.find("dataProcessing1"), "slds-hide");
            $A.util.addClass(component.find("tableSpinner"), "slds-hide");
        },500); 
        this.groupData(component, event,component.get('v.ReportByFirmMaster')[0],vpcrRvpFilter,sceFilter,'firm');
        this.groupData(component, event,component.get('v.ReportByBLMaster')[0],vpcrRvpFilter,sceFilter,'bl');           
    },
    
    updateSCEDropDownList : function(component, event) {
        debugger;
        var selVPCRVal = component.find('VPCRRVPsDropDown').get('v.value');
        if(selVPCRVal != undefined && selVPCRVal != null) {
            if(selVPCRVal == 'All RVP\'s/VPCR\'s') {
                var allSCEsList = component.get('v.allSCEsDefaultArray');
                allSCEsList = (allSCEsList != undefined && allSCEsList != null) ? allSCEsList : [];
                component.find('SCEsDropDown').set("v.options", allSCEsList);
            } else {
                if(component.get('v.vpcrSceOwnerMap') != undefined && component.get('v.vpcrSceOwnerMap') != null) {
                    var sceOwnersArray = [];
                    var sceValues = component.get('v.vpcrSceOwnerMap.'+selVPCRVal);                    
                    if(sceValues != undefined && sceValues != null && sceValues.length > 0) {
                        sceValues.sort();
                        sceOwnersArray.push({label:'All SCE\'s', value:'All SCE\'s'});
                        for(var i=0;i<sceValues.length;i++) {
                            sceOwnersArray.push({label:sceValues[i], value:sceValues[i]});
                        }
                        component.find('SCEsDropDown').set("v.options", sceOwnersArray);
                    }            
                }
            }
        }
    },
    groupData : function(component, event,data,rvp,sce,group) {
        debugger;        
        var gropuByFirmData = [];
        //var data = component.get('v.ReportByFirmMaster')[0];
        var totalNoOfClients = 0;
        for (var obj in data){             
            if (obj != null && data.hasOwnProperty(obj)) {
                var surestMembers =0;
                var medicalMembers = 0,dentalMembers = 0,visionMembers = 0,optumLine = 0,noOfClients = 0,perOfClients = 0;
                var groupObj = data[obj];
                var isDataExist = false;
                for(var i=0;i<groupObj.length;i++){
                    if((rvp == '' && sce == '') || (rvp == 'All' && sce == 'All') || (groupObj[i].CMVPCRRVP__r != null && groupObj[i].CM_SCE__r != null && rvp == groupObj[i].CMVPCRRVP__r.Name && sce == groupObj[i].CM_SCE__r.Name) || (rvp == 'All' && groupObj[i].CM_SCE__r != null && sce == groupObj[i].CM_SCE__r.Name) || (sce == 'All' && groupObj[i].CMVPCRRVP__r != null && rvp == groupObj[i].CMVPCRRVP__r.Name)){                                                            
                        if(groupObj[i].UHC_Medical_Members__c != null){
                            medicalMembers = medicalMembers + parseInt(groupObj[i].UHC_Medical_Members__c);
                        }
                        if(groupObj[i].UHC_Dental_Members__c != null){
                            dentalMembers = dentalMembers + parseInt(groupObj[i].UHC_Dental_Members__c);
                        }
                        if(groupObj[i].UHC_Vision_Members__c != null){
                            visionMembers = visionMembers + parseInt(groupObj[i].UHC_Vision_Members__c);
                        }
                        if(groupObj[i].Optum_Rx_Members__c != null){
                            optumLine = optumLine + parseInt(groupObj[i].Optum_Rx_Members__c);
                        } 
                         if(groupObj[i].Surest_Members__c != null){
                            surestMembers = surestMembers + parseInt(groupObj[i].Surest_Members__c);
                        } 
                        isDataExist = true;
                        if(groupObj[i].RecordType.Name !== 'Client Subsidiary'){
                            noOfClients = noOfClients + 1;
                            totalNoOfClients = totalNoOfClients + 1;
                        }                       
                    }
                    else{
                        console.log(groupObj[i].Id);
                    }
                }                             
                if(isDataExist){
                    if(obj === 'null'){
                        gropuByFirmData.push({'FirmName':'UnKnown','medicalMembers':medicalMembers,'surestMembers':surestMembers,'dentalMembers':dentalMembers,'visionMembers':visionMembers,'optumLine':optumLine,'noOfClients':noOfClients,'percentOfClients':''});  
                    }else{
                        gropuByFirmData.push({'FirmName':obj,'medicalMembers':medicalMembers,'surestMembers':surestMembers,'dentalMembers':dentalMembers,'visionMembers':visionMembers,'optumLine':optumLine,'noOfClients':noOfClients,'percentOfClients':''});   
                    }
                    
                }                
            }           
        }
        var totMedicalMembers = 0,totDentalMembers = 0,totVisionMembers = 0,totOptumLine = 0,totSurestMembers =0;
        if(gropuByFirmData.length > 0){
            for(var i=0;i<gropuByFirmData.length;i++){
                var percentage = 0;
                if(totalNoOfClients > 0){
                    percentage = parseInt((gropuByFirmData[i].noOfClients/totalNoOfClients) * 100) + '%';
                }                
                gropuByFirmData[i].percentOfClients = percentage;
                totMedicalMembers = totMedicalMembers + gropuByFirmData[i].medicalMembers;
                totSurestMembers = totSurestMembers + gropuByFirmData[i].surestMembers;
                totDentalMembers = totDentalMembers + gropuByFirmData[i].dentalMembers;
                totVisionMembers = totVisionMembers + gropuByFirmData[i].visionMembers;
                totOptumLine = totOptumLine + gropuByFirmData[i].optumLine;
            }
            var percentOfClients = '100%';
            if(totalNoOfClients <= 0){
                percentOfClients = '0%';
            }
            gropuByFirmData.push({'FirmName':'Grand Total','medicalMembers':totMedicalMembers,'surestMembers':totSurestMembers,'dentalMembers':totDentalMembers,'visionMembers':totVisionMembers,'optumLine':totOptumLine,'noOfClients':totalNoOfClients,'percentOfClients':percentOfClients});         	            
            if(group === 'firm'){
                component.set('v.ReportByFirmEmpty',false);
            }else{
                component.set('v.WorkItemsEmptyList',false);
            }  
        }else{
            if(group === 'firm'){
                component.set('v.ReportByFirmEmpty',true);
            }else{
                component.set('v.WorkItemsEmptyList',true);
            }            
        }
        if(group === 'firm'){
            component.set('v.ReportByFirm',gropuByFirmData);
        }else{
            component.set('v.WorkItemsDataArray',gropuByFirmData);
        }        
        
    }
    
})