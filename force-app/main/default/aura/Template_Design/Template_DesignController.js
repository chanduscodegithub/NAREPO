({
    doInit : function(component, event, helper) {
        
        var device = $A.get("$Browser.formFactor");
        var NPSSelectAllMap = {};
        component.set('v.NPSSelectAllMap',NPSSelectAllMap);
        if(device != "DESKTOP"){
            component.set('v.isDesktop', false);
        }else{
            component.set('v.isDesktop', true);
        }
        
        /*component.find('input1').set('v.value', '');
        component.find('input2').set('v.value', '');
        component.find('input3').set('v.value', '');
        component.find('input4').set('v.value', '');
        component.find('input5').set('v.value', '');*/
        
        helper.fetchTemplate(component, event);
    },
    
    onObjChange : function(component, event, helper){
        //debugger;
        var obj = component.find('objType').get('v.value');
        var sectionId = component.find('searchCriteriaSection');
        var NPSsearchCriteriaSection = component.find('NPSsearchCriteriaSection');
        component.set('v.isSearchBtnClicked', false);
        var NPSSelectAllMap = {};
        component.set('v.NPSSelectAllMap',NPSSelectAllMap);
        if(obj != 'Select Template Design'){
            if(obj == 'NPS Action Template'){
                component.set('v.searchCriteriaSection',false);
                component.set('v.NPSsearchCriteriaSection',true);
                component.set('v.objectName', 'NPSAction');
                component.set('v.columnHeader', 'NPS Action Plan');
                helper.getNPSActionFields(component,event,helper);
            }else{
                var objMapping = {'Account' : 'Company', 'Contact' : 'Contact', 'Opportunity' : 'Membership Activity'};
                component.set('v.searchCriteriaSection',true);
                component.set('v.NPSsearchCriteriaSection',false);
                component.set('v.objectName', component.get('v.tempDetails')[obj]);
                component.set('v.columnHeader', objMapping[component.get('v.objectName')]);
                helper.resetInputFields(component, event);
                helper.getAllFields(component, event, obj);
            }    
        }
    },
    
    resetFieldValues : function(component, event, helper){
        component.set('v.isSearchBtnClicked', false);
        if(component.get('v.NPSsearchCriteriaSection')){
            for(var i=1 ;i<=5; i++){
                component.set('v.type'+i,'');
                component.set('v.type'+i+'Values',[]);
                component.find('NPS_Output_'+i).set('v.value','');
            }
            component.set('v.type1','STRING');
            component.find('NPS_Output_1').set('v.value','Owner');   
            component.set('v.type1Values',[]);
        }else{
            helper.resetSearchCriteria(component, event, helper);
        }
        
        
    },
    
    addSelectedRefAccounts : function(component, event, helper){
        //debugger;
        var selectedRefAcctsIds = component.get('v.selectedRefAcctsIds');
        var checkBoxCount = component.get('v.checkBoxCount');
        var saveRefAcc = component.find('saveRefAcc');
        if(event.getParam('selectedrefAcct')){            
            selectedRefAcctsIds = selectedRefAcctsIds.filter(function(e){ return e !== event.getParam('accId') });
            checkBoxCount = checkBoxCount - 1;
        }else{
            selectedRefAcctsIds.push(event.getParam('accId'));
            checkBoxCount = checkBoxCount +1;
        }
        component.set('v.checkBoxCount',checkBoxCount);
        
        component.set('v.selectedRefAcctsIds',selectedRefAcctsIds);
        
        /*if(component.get('v.checkBoxCount') > 0){
            component.find('generateBtn').set('v.disabled', false);
        }else{
            component.find('generateBtn').set('v.disabled', true);
        }*/
        
        if(component.get('v.selectedRefAcctsIds').length > 0){
            component.find('generateBtn').set('v.disabled', false);
        }else{
            component.find('generateBtn').set('v.disabled', true);
        }
        
        var showError = event.getParam('showError');
        if(showError){
            helper.showMaxRecordPopupError(component, event);  
        }
    },
    
    selectAll : function(component, event, helper){
        //debugger;
        var allCheckBox_Ids  = component.find('eachCheckBox');
        for(var i=0; i<allCheckBox_Ids.length; i++){           
            allCheckBox_Ids[i].selectEachCheck(component.find('refAccount').get('v.value'));             
        }
        var NPSSelectAllMap = component.get('v.NPSSelectAllMap');
        NPSSelectAllMap[component.get("v.page")] = component.find('refAccount').get('v.value');
        component.set('v.NPSSelectAllMap',NPSSelectAllMap);
        if(component.get('v.selectedRefAcctsIds').length > 0){
            component.find('generateBtn').set('v.disabled', false);
        }else{
            component.find('generateBtn').set('v.disabled', true);
        }
    },    
    
    generateTemplate : function(component, event, helper){ 
        if(component.get('v.NPSsearchCriteriaSection')){
            component.set('v.isNPSTemplateGenerate',true);
            var childComponent = component.find("NPSActionId");
            childComponent.NPSChildMethod(component.get('v.selectedRefAcctsIds'));
            return;
        }
        var selectedIds = component.get('v.selectedRefAcctsIds');
        component.set('v.isNPSTemplateGenerate',false);        
        helper.generateTemplates(component, event, selectedIds);           
    },
    
    searchForAccounts : function(component, event, helper){
        component.set("v.selectedRefAcctsIds", []);
        if(!$A.util.isEmpty(component.find('refAccount'))){
            component.find('refAccount').set('v.value',false);
        }
        helper.searchForRecords(component, event);
    },
    
    closeErrorMsg: function(component, event, helper) {
        var errorDailog = component.find('FilterSearch');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-show');
            $A.util.addClass(errorDailog[i], 'slds-hide');
        }
    },
    
    closeErrorMsg1: function(component, event, helper) {
        var errorDailog = component.find('downLoadSuccess');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-show');
            $A.util.addClass(errorDailog[i], 'slds-hide');
        }
    },
    
    openOptionsPopup : function(component, event, helper){
        
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            helper.desktopModal(component, event, 'Select the ', 'Modal_Component_Template_Content');
        }else{
            $A.util.addClass(component.find("sortEdit"),"hide");
            helper.panelModal(component, event, 'Select the ', 'Modal_Component_Template_Content');  
        }
        
        event.stopPropagation();
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        var selectedInput = component.find(component.get('v.selectedInputBox'));
        if(event.getParam("values") != undefined && selectedInput!==undefined){
            if(Array.isArray(selectedInput)){
                selectedInput[0].set('v.value', event.getParam("values"));
            }else{
                selectedInput.set('v.value', event.getParam("values"));   
            }    
        }else{
            if(component.get('v.selectedInputBoxContents')!==undefined && component.get('v.selectedInputBoxContents').length>0){
                if(Array.isArray(selectedInput) ){
                    selectedInput[0].set('v.value', component.get('v.selectedInputBoxContents'));
                }else{
                    selectedInput.set('v.value', component.get('v.selectedInputBoxContents'));   
                }   
            }
            
        }
        if(event.getParam("closeChildPopup")){
            helper.modalClosing(component);
        }else if(event.getParam("refresh")){
            component.set('v.selectedInputBox','');
            component.set('v.selectedInputBoxContents',[]);
            
        }
    },
    
    sortFields: function(component, event, helper) {
        /*var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("sortEdit"),"hide");
        }*/
        
        var selectedItem = event.currentTarget;
        var column = selectedItem.dataset.record;
        var obj = component.get('v.objectName');
        
        var columnMapping = null; 
        
        if(column === 'type'){
            columnMapping = {'Account': 'Type', 'Contact': 'Account.Type', 'Opportunity' : 'Account.Type','NPSAction':'Company_Name__r.Name'};   
        }else if(column == 'name'){
            columnMapping = {'Account': 'Name', 'Contact': 'LastName', 'Opportunity' : 'Name','NPSAction':'Name'};
        }
        
        var fieldItagsWithAuraAttrMap = {"name":"sortByNameAsc","type":"sortByTypeAsc"};
        var sortFieldCompName = fieldItagsWithAuraAttrMap[column];
        var fieldNameToBeSorted = columnMapping[obj];
        
        //alert('fieldNameToBeSorted-->>'+fieldNameToBeSorted);
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
    },
    
    onChangeRadio : function(component, event){
        var cmpTarget = component.find('customLogicDiv');
        var selectedRadio = event.getSource().getLocalId();
        if(selectedRadio === 'andRadio'){
            component.find('orRadio').set('v.value', false);
            component.find('customRadio').set('v.value', false);
            $A.util.removeClass(cmpTarget, 'slds-show');
        }
        if(selectedRadio === 'orRadio'){
            component.find('andRadio').set('v.value', false);
            component.find('customRadio').set('v.value', false);
            $A.util.removeClass(cmpTarget, 'slds-show');
        }
        else if(selectedRadio === 'customRadio'){
            component.find('orRadio').set('v.value', false);
            component.find('andRadio').set('v.value', false);
            $A.util.addClass(cmpTarget, 'slds-show');
        }
    },
    
    onFieldSelectChange : function(component, event, helper){
        
        var conditionJsonObj = {"row1field":"rowcondition1@row1condition@type1@type1Values@input1",
                                "row2field":"rowcondition2@row2condition@type2@type2Values@input2",
                                "row3field":"rowcondition3@row3condition@type3@type3Values@input3",
                                "row4field":"rowcondition4@row4condition@type4@type4Values@input4",
                                "row5field":"rowcondition5@row5condition@type5@type5Values@input5"};
        
        var selectedFieldAuraId = event.getSource().getLocalId();
        var selectedDropDown = conditionJsonObj[selectedFieldAuraId].split('@');
        
        var val = component.find(selectedFieldAuraId).get('v.value');
        val = val.trim();
        
        if(val.length != 0){
            var apiName = component.get('v.objectData').mapOfMetaData[val][0];
            var strArray = component.get('v.objectData').mapOfMetaData[val][1].split('#');
            var conditionsArray = strArray[1].split(',');
            component.set('v.'+selectedDropDown[1], conditionsArray);
            component.find(selectedDropDown[0]).set('v.value', conditionsArray[0]);
            component.set('v.'+selectedDropDown[2], strArray[0]);
            
            var action = component.get('c.getPickListValues');
            action.setParams({'fieldApiName' : apiName,
                              'objName' : component.get('v.objectName')});
            action.setCallback(this, function(response){
                component.set('v.'+selectedDropDown[3], response.getReturnValue());
                var filterVal = component.find(selectedDropDown[4]);
                if(filterVal !==undefined){
                    if(Array.isArray(filterVal)){
                        if(component.get('v.'+selectedDropDown[2]) == 'dropdown'){
                            filterVal[0].set('v.value', response.getReturnValue()[0]);    
                        }else{
                            filterVal[0].set('v.value','')
                        }
                    }else{
                        if(component.get('v.'+selectedDropDown[2]) == 'dropdown'){
                            filterVal.set('v.value', response.getReturnValue()[0]) ;   
                        }else{
                            filterVal.set('v.value','')
                        }
                    } 
                }
            });
            $A.enqueueAction(action);
        }
        else{
            component.set('v.'+selectedDropDown[1], []);
            component.find(selectedDropDown[0]).set('v.value', []);
            component.set('v.'+selectedDropDown[2], 'text');
            component.set('v.'+selectedDropDown[3], []);
            if(component.find(selectedDropDown[4]) != undefined || component.find(selectedDropDown[4]) != null){
                if(Array.isArray(component.find(selectedDropDown[4]))){
                    component.find(selectedDropDown[4])[0].set('v.value', '');
                }else{
                    component.find(selectedDropDown[4]).set('v.value', '');
                }    
            }
        }
    },
    
    enableGoBtn : function(component, event, helper) {
        
        if(event.getParams().keyCode == 13){
            component.set("v.selectedRefAcctsIds", []);
            if(!$A.util.isEmpty(component.find('refAccount'))){
                component.find('refAccount').set('v.value',false);
            }
            helper.searchForRecords(component, event);
        }
    },
    
    clearSearchFilterField : function(component, event, helper){
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        component.find('searchKeywordForConsultants').set('v.value','');
    },
    
    clearSearchField : function(component, event, helper){
        component.find('searchKeywordForConsultants').set('v.value','');
    },
    
    pageChange: function(component, event, helper) {
        component.find('refAccount').set('v.value',false);
        component.find('generateBtn').set('v.disabled', true);
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        
        helper.searchForRefAcc(component, event, page, component.get('v.sortField'),component.get('v.sortOrder'));
        
        /* var selectedIds = component.get('v.selectedRefAcctsIds');
        var allCheckBox_Ids  = component.find('eachCheckBox');
        for(var i=0; i<allCheckBox_Ids.length; i++){
            allCheckBox_Ids[i].selectEachCheck(true);             
        }*/
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    searchForNPSActionGoButton : function(component, event,helper){
        if(event.getParams().keyCode == 13){
            var inputVal = '';
            if(Array.isArray(component.find('NPS_Input_1'))){
                if($A.util.isEmpty(component.find('NPS_Input_1'))){
                    inputVal = '';
                }else{
                    inputVal = component.find('NPS_Input_1')[0].get('v.value');
                }
            }else{
                if($A.util.isEmpty(component.find('NPS_Input_1'))){
                    inputVal = '';
                }else{
                    inputVal = component.find('NPS_Input_1').get('v.value');
                }
                
            }
            if($A.util.isEmpty(inputVal)){
                var errorDailog = component.find('FilterSearch');
                for(var i in errorDailog){
                    $A.util.removeClass(errorDailog[i], 'slds-hide');
                    $A.util.addClass(errorDailog[i], 'slds-show');
                }
                component.set('v.dialogErrorMsg','First Filter Criteria Cannot be Empty');
            }else{
                component.set('v.isSearchBtnClicked', true);
                component.set("v.selectedRefAcctsIds", []);
                if(!$A.util.isEmpty(component.find('refAccount'))){
                    component.find('refAccount').set('v.value',false);
                }
                var NPSSelectAllMap = {};
                component.set('v.NPSSelectAllMap',NPSSelectAllMap);
                helper.searchForRefAcc(component, event);
            }
        }
    },
    searchForNPSAction : function(component, event,helper){
        var inputVal = '';
        if(Array.isArray(component.find('NPS_Input_1'))){
            if($A.util.isEmpty(component.find('NPS_Input_1'))){
                inputVal = '';
            }else{
                inputVal = component.find('NPS_Input_1')[0].get('v.value');
            }
        }else{
            if($A.util.isEmpty(component.find('NPS_Input_1'))){
                inputVal = '';
            }else{
                inputVal = component.find('NPS_Input_1').get('v.value');
            }
            
        }
        if($A.util.isEmpty(inputVal)){
            var errorDailog = component.find('FilterSearch');
            for(var i in errorDailog){
                $A.util.removeClass(errorDailog[i], 'slds-hide');
                $A.util.addClass(errorDailog[i], 'slds-show');
            }
            component.set('v.dialogErrorMsg','First Filter Criteria Cannot be Empty');
        }else{
            component.set('v.isSearchBtnClicked', true);
            component.set("v.selectedRefAcctsIds", []);
            if(!$A.util.isEmpty(component.find('refAccount'))){
                component.find('refAccount').set('v.value',false);
            }
            var NPSSelectAllMap = {};
            component.set('v.NPSSelectAllMap',NPSSelectAllMap);
            helper.searchForRefAcc(component, event);
        }
    },
    onNPSFieldChange: function(component, event,helper){
        var selectedFieldAuraId = event.getSource().getLocalId();       
        var val = component.find(selectedFieldAuraId).get('v.value');
        var NPSFieldsMap = component.get('v.NPSFieldsMap')[val];
        var splitOutputId = selectedFieldAuraId.split('_');
        var incVal = splitOutputId[2];
        if(NPSFieldsMap != null && NPSFieldsMap != undefined){
            component.set('v.type'+incVal,NPSFieldsMap.fieldType);
            component.set('v.type'+incVal+'Values',NPSFieldsMap.PickListOptions);
        }else{          
            component.set('v.type'+incVal,'');
            component.set('v.type'+incVal+'Values',[]);        
        } 
    }
})