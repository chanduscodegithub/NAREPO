({
    fetchTemplate : function(component, event){
        component.set('v.isSpinnertoLoad', true);
        var action = component.get('c.fetchDefaultTemplateContents');
        //action.setParams({"obj" : obj});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                //alert(response.getReturnValue().templateOptions);
                component.set('v.objType', response.getReturnValue().templateOptions);
                component.set('v.tempDetails', response.getReturnValue().templateDetails);
                component.set('v.isSpinnertoLoad', false);
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
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    
    getAllFields : function(component, event, templateName){
        component.set('v.isSpinnertoLoad', true);
        var object = component.get('v.objectName');
        var action = component.get('c.getObjRelatedFields');
        action.setParams({"objName" : object,
                          "templateName" : templateName});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                console.log(response.getReturnValue());
                component.set('v.objectData', response.getReturnValue());
                component.set('v.pickListLabels', response.getReturnValue().fieldLabels);
                component.set('v.templateList', response.getReturnValue().templateDetails);
                
                this.resetInputFields(component);
                
                var objMapping = {'Account' : 'Company Name', 'Contact' : 'Last Name', 'Opportunity' : 'Membership Activity Name'};
                var defaultField = objMapping[object];
                
                component.set('v.displayNameFilter1', defaultField);
                component.find('row1field').set('v.value', component.get('v.displayNameFilter1'));
                component.set('v.defaultCondition1', component.get('v.objectData').mapOfMetaData[defaultField][1].split('#')[1].split(','));
                component.set('v.row1condition', component.get('v.objectData').mapOfMetaData[defaultField][1].split('#')[1].split(','));   
                component.set('v.type1', component.get('v.objectData').mapOfMetaData[defaultField][1].split('#')[0]);
                component.find('rowcondition1').set('v.value', component.get('v.defaultCondition1'));
                
                component.find('row2field').set('v.value', component.get('v.objectData').fieldLabels[0]);
                component.find('row3field').set('v.value', component.get('v.objectData').fieldLabels[0]);
                component.find('row4field').set('v.value', component.get('v.objectData').fieldLabels[0]);
                component.find('row5field').set('v.value', component.get('v.objectData').fieldLabels[0]);
                
                component.set('v.isSpinnertoLoad', false);
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
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    
    getDefaultPLValues : function(component, apiName){
        var action = component.get('c.getPickListValues');
        action.setParams({'fieldApiName' : apiName,
                          'objName' : component.get('v.objectName')});
        action.setCallback(this, function(response){
            component.set('v.type2Values', response.getReturnValue());
            component.set('v.type3Values', response.getReturnValue());
            component.set('v.type4Values', response.getReturnValue());
            component.set('v.type5Values', response.getReturnValue());
        });
        $A.enqueueAction(action);  
    },
    
    getCustomMetaData : function(component){
        var action = component.get('c.getMetadata');
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                //console.log(response.getReturnValue());
                component.set('v.testAttribute', response.getReturnValue().fieldLabels);
                component.set('v.contact_consulatntPickListValues', response.getReturnValue().fieldLabels);
                component.set('v.metaData', response.getReturnValue());
                //console.log('Data fetched!');
                //console.log('testAttribute-->>'+component.get('v.testAttribute'));
                component.set('v.isSpinnertoLoad', false);
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
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    
    searchForRecords : function(component, event){
        component.set('v.isFirstConditionPresent', false);
        component.set('v.filterQueries', []);
        component.set('v.selectedRefAcctsIds', []); 
        var mapFields = component.get('v.filterQueries');
        
        if(component.find('input1') === undefined || component.find('input1') === null){
            component.set('v.isFirstConditionPresent', true);
            
            var fieldToFilter1 = component.find('row1field').get('v.value');
            var conditionToFilter1 = component.find('rowcondition1').get('v.value');
            mapFields.push({'fieldAPIName' : component.get('v.objectData').mapOfMetaData[fieldToFilter1][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter1][1].split('#')[0],
                            'fieldConditions' : conditionToFilter1+'#'+''}); 
        }
        else{
            var fieldToFilter1 = component.find('row1field').get('v.value');
            var conditionToFilter1 = component.find('rowcondition1').get('v.value');
            if(Array.isArray(component.find('input1'))){
                if(component.find('input1')[0].get('v.value') != undefined){
                    if(component.find('input1')[0].get('v.value') !=='' && component.find('input1')[0].get('v.value') !==null ){
                        component.set('v.isFirstConditionPresent', true);
                        var filterValues1 = component.find('input1')[0].get('v.value');
                        
                        mapFields.push({'fieldAPIName' : component.get('v.objectData').mapOfMetaData[fieldToFilter1][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter1][1].split('#')[0],
                                        'fieldConditions' : conditionToFilter1+'#'+filterValues1});     
                    }
                }
            }else{
                if(component.find('input1').get('v.value') !== undefined){
                    if(component.find('input1').get('v.value') !== '' && component.find('input1').get('v.value') !== null ){
                        component.set('v.isFirstConditionPresent', true);
                        var filterValues1 = component.find('input1').get('v.value');
                        
                        mapFields.push({'fieldAPIName' : component.get('v.objectData').mapOfMetaData[fieldToFilter1][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter1][1].split('#')[0],
                                        'fieldConditions' : conditionToFilter1+'#'+filterValues1});     
                    }
                }
            }
            
        }
        
        if(component.get('v.isFirstConditionPresent')){
            
            if(component.find('row2field').get('v.value').length !== 0){
                if(component.find('input2') === undefined || component.find('input2') === null){
                    
                    var fieldToFilter2 = component.find('row2field').get('v.value');
                    var conditionToFilter2 = component.find('rowcondition2').get('v.value');
                    
                    mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter2][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter2][1].split('#')[0],
                                    fieldConditions : conditionToFilter2+'#'+''});
                }
                else{
                    var fieldToFilter2 = component.find('row2field').get('v.value');
                    var conditionToFilter2 = component.find('rowcondition2').get('v.value');
                    if(Array.isArray(component.find('input2'))){
                        if(component.find('input2')[0].get('v.value') !== undefined){
                            if(component.find('input2')[0].get('v.value') !== '' &&  component.find('input2')[0].get('v.value')!==null){
                                var filterValues2 = component.find('input2')[0].get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter2][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter2][1].split('#')[0],
                                                fieldConditions : conditionToFilter2+'#'+filterValues2});   
                            }
                        }
                    }else{
                        if(component.find('input2').get('v.value') !== undefined){
                            if(component.find('input2').get('v.value')!=='' && component.find('input2').get('v.value')!==null){
                                var filterValues2 = component.find('input2').get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter2][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter2][1].split('#')[0],
                                                fieldConditions : conditionToFilter2+'#'+filterValues2});    
                            }
                        }
                    }
                }
            }
            
            if(component.find('row3field').get('v.value').length !== 0){
                if(component.find('input3') === undefined || component.find('input3') === null){
                    
                    var fieldToFilter3 = component.find('row3field').get('v.value');
                    var conditionToFilter3 = component.find('rowcondition3').get('v.value');
                    
                    mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter3][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter3][1].split('#')[0],
                                    fieldConditions : conditionToFilter3+'#'+''});
                }
                else{
                    var fieldToFilter3 = component.find('row3field').get('v.value');
                    var conditionToFilter3 = component.find('rowcondition3').get('v.value');
                    if(Array.isArray(component.find('input3'))){
                        if(component.find('input3')[0].get('v.value') !== undefined){
                            if(component.find('input3')[0].get('v.value') !=='' && component.find('input3')[0].get('v.value') !==null ){
                                var filterValues3 = component.find('input3')[0].get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter3][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter3][1].split('#')[0],
                                                fieldConditions : conditionToFilter3+'#'+filterValues3});    
                            }
                        }
                    }else{
                        if(component.find('input3').get('v.value') !== undefined){
                            if(component.find('input3').get('v.value') !=='' && component.find('input3').get('v.value') !==null){
                                var filterValues3 = component.find('input3').get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter3][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter3][1].split('#')[0],
                                                fieldConditions : conditionToFilter3+'#'+filterValues3});    
                            }
                        }
                    }
                }
            }
            
            if(component.find('row4field').get('v.value').length !== 0){
                if(component.find('input4') === undefined || component.find('input4') === null){
                    
                    var fieldToFilter4 = component.find('row4field').get('v.value');
                    var conditionToFilter4 = component.find('rowcondition4').get('v.value');
                    
                    mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter4][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter4][1].split('#')[0],
                                    fieldConditions : conditionToFilter4+'#'+''});
                }
                else{
                    var fieldToFilter4 = component.find('row4field').get('v.value');
                    var conditionToFilter4 = component.find('rowcondition4').get('v.value');
                    if(Array.isArray(component.find('input4'))){
                        if(component.find('input4')[0].get('v.value') !== undefined){
                            if(component.find('input4')[0].get('v.value') !=='' && component.find('input4')[0].get('v.value') !==null){
                                var filterValues4 = component.find('input4')[0].get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter4][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter4][1].split('#')[0],
                                                fieldConditions : conditionToFilter4+'#'+filterValues4});  
                            }
                        }
                    }else{
                        if(component.find('input4').get('v.value') !== undefined){
                            if(component.find('input4').get('v.value') !== '' && component.find('input4').get('v.value') !== null){
                                var filterValues4 = component.find('input4').get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter4][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter4][1].split('#')[0],
                                                fieldConditions : conditionToFilter4+'#'+filterValues4});    
                            }
                        }
                    }
                }
            }
            
            if(component.find('row4field').get('v.value').length !== 0){
                if(component.find('input5') === undefined || component.find('input5') === null){
                    
                    var fieldToFilter5 = component.find('row5field').get('v.value');
                    var conditionToFilter5 = component.find('rowcondition5').get('v.value');
                    
                    mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter5][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter5][1].split('#')[0],
                                    fieldConditions : conditionToFilter5+'#'+''});
                }
                else{
                    var fieldToFilter5 = component.find('row5field').get('v.value');
                    var conditionToFilter5 = component.find('rowcondition5').get('v.value');
                    if(Array.isArray(component.find('input5'))){
                        if(component.find('input5')[0].get('v.value') !== undefined){
                            if(component.find('input5')[0].get('v.value') !=='' && component.find('input5')[0].get('v.value') !==null){
                                var filterValues5 = component.find('input5')[0].get('v.value');    
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter5][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter5][1].split('#')[0],
                                                fieldConditions : conditionToFilter5+'#'+filterValues5});
                            }
                        }
                    }else{
                        if(component.find('input5').get('v.value') !== undefined){
                            if(component.find('input5').get('v.value') !=='' && component.find('input5').get('v.value') !==null){
                                var filterValues5 = component.find('input5').get('v.value');
                                
                                mapFields.push({fieldAPIName : component.get('v.objectData').mapOfMetaData[fieldToFilter5][0]+'#'+component.get('v.objectData').mapOfMetaData[fieldToFilter5][1].split('#')[0],
                                                fieldConditions : conditionToFilter5+'#'+filterValues5});
                            }
                        }
                    }
                }
            }
            
            component.set('v.isSearchBtnClicked', true);
            component.set('v.filterQueries', mapFields);
            this.searchForRefAcc(component, event);
        }
        else{
            //alert('First Condition is mandatory');
            component.set('v.dialogErrorMsg', 'First Condition is mandatory');
            var errorDailog = component.find('FilterSearch');
            for(var i in errorDailog){
                $A.util.removeClass(errorDailog[i], 'slds-hide');
                $A.util.addClass(errorDailog[i], 'slds-show');
            }
        }  
    },
    
    
    searchForRefAcc : function(component, event, page, columnName, sortType){
        page = page || 1;
        columnName = columnName || 'Name';
        sortType = sortType || 'ASC';
        
        var pageMin = component.get('v.pageMin') || 1;
        var pageMax = component.get('v.pageMax') || 1;
        component.set('v.isSpinnertoLoad', true);
        if(component.get('v.NPSsearchCriteriaSection')){
            var action = component.get("c.searchForNPSTemplate");
            var FilterMap = {};
            for(var i=1 ;i<=5; i++){
                var NPSOutput = component.find('NPS_Output_'+i).get('v.value');
                if(!$A.util.isEmpty(NPSOutput)){
                    var filter = '';
                    filter = component.find('NPS_Filter_'+i).get('v.value');
                    var inputVal = '';
                    if(Array.isArray(component.find('NPS_Input_'+i))){
                        inputVal = component.find('NPS_Input_'+i)[0].get('v.value');
                    }else{
                        inputVal = component.find('NPS_Input_'+i).get('v.value');
                    }
                    if($A.util.isEmpty(filter)){
                        if(component.get('v.NPSFieldsMap')[component.find('NPS_Output_'+i).get('v.value')].fieldType == 'STRING'){
                            filter = 'Begins With';
                        }
                        if(component.get('v.NPSFieldsMap')[component.find('NPS_Output_'+i).get('v.value')].fieldType == 'DATE'){
                            filter = 'Equals to';
                        }
                        if(component.get('v.NPSFieldsMap')[component.find('NPS_Output_'+i).get('v.value')].fieldType == 'PICKLIST'){
                            filter = 'Equals to';
                        }
                    }
                    FilterMap[component.get('v.NPSFieldsMap')[component.find('NPS_Output_'+i).get('v.value')].fieldAPIName] = [inputVal,filter];
                }
            }
            action.setParams({
                "filterMap" : FilterMap,
                "pageNumber": page,
                "pageMin" : pageMin,
                "pageMax" : pageMax,
                "columnName" : columnName,
                "sortType" : sortType
            });
        }else{
            var action = component.get("c.searchForRefAccounts");
            action.setParams({
                "mapFields" : JSON.stringify(component.get('v.filterQueries')),
                "pageNumber": page,
                "objectName": component.get('v.objectName'),
                "pageMin" : pageMin,
                "pageMax" : pageMax,
                "columnName" : columnName,
                "sortType" : sortType
            });
        }
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                
                var responseObj = response.getReturnValue();
                //console.log('responseObj.refsearchedAccount--->>'+JSON.stringify(responseObj.refsearchedAccount));
                
                if(responseObj.refsearchedAccount != null && responseObj.refsearchedAccount.length > 0){
                    component.set('v.isSearchedResultEmpty', false);
                    component.set("v.accountSearchList", responseObj.refsearchedAccount);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set("v.pageMin", responseObj.pageMin);
                    component.set("v.pageMax", responseObj.pageMax);
                    //component.set("v.selectedRefAcctsIds", []);
                    if (component.get('v.NPSSelectAllMap') != null && component.get('v.NPSSelectAllMap') != undefined && component.get('v.NPSSelectAllMap') != ''){
                        component.find('refAccount').set('v.value',component.get('v.NPSSelectAllMap')[component.get("v.page")]);
                    }
                    if(component.get('v.selectedRefAcctsIds').length > 0){
                        component.find('generateBtn').set('v.disabled', false);
                    }else{
                        component.find('generateBtn').set('v.disabled', true);
                    }
                    var page = component.get('v.page');
                    var accountSearchList = '';
                    if(page == 1){
                        component.set('v.serialNumber',0);
                    }else{
                        accountSearchList = component.get("v.accountSearchList").length;
                        var pageSize = component.get("v.pageMax");
                        if(accountSearchList != pageSize){
                            component.set('v.serialNumber',component.get('v.serialNumber')+pageSize);
                        }else{
                            component.set('v.serialNumber',page*accountSearchList-pageSize);
                        }
                    }
                }else{
                    component.set('v.isSearchedResultEmpty', true); 
                }
                
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad', false);
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
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        $A.enqueueAction(action);
    },
    
    sortBy : function(component, event, fieldName, page, sortFieldComp){
        component.set('v.isSpinnertoLoad', true);
        
        page = page || 1;
        
        if(component.get('v.NPSsearchCriteriaSection')){
            var action = component.get("c.searchForNPSTemplate");
            var FilterMap = {};
            FilterMap['Company_Name__r.Name'] = [component.find('CompanyFilter').get('v.value'),component.find('CompanyNameOutput').get('v.value')];
            FilterMap['Name'] = [component.find('NPSFilter').get('v.value'),component.find('NPSNameOutput').get('v.value')];
            if(component.get("v."+sortFieldComp) ===  true){
                action.setParams({
                    "filterMap" : FilterMap,
                    "pageNumber": page,
                    "columnName" : fieldName,
                    "sortType" : 'DESC'
                });
                component.set("v.sortOrder", 'DESC');
                component.set("v.sortField", fieldName);
                component.set("v."+sortFieldComp, false);
            }else{
                action.setParams({
                    "filterMap" : FilterMap,
                    "pageNumber": page,
                    "columnName" : fieldName,
                    "sortType" : 'ASC'
                });
                component.set("v.sortOrder", 'ASC');
                component.set("v.sortField", fieldName);
                component.set("v."+sortFieldComp, true);
            }
            
        }else{
            var action = component.get("c.searchForRefAccounts");
            if(component.get("v."+sortFieldComp) ===  true){
                action.setParams({
                    "mapFields" : JSON.stringify(component.get('v.filterQueries')),
                    "pageNumber": page,
                    "objectName": component.get('v.objectName'),
                    "columnName" : fieldName,
                    "sortType" : 'DESC'});
                
                component.set("v.sortOrder", 'DESC');
                component.set("v.sortField", fieldName);
                component.set("v."+sortFieldComp, false);
            }else{
                action.setParams({
                    "mapFields" : JSON.stringify(component.get('v.filterQueries')),
                    "pageNumber": page,
                    "objectName": component.get('v.objectName'),
                    "columnName" : fieldName,
                    "sortType" : 'ASC'});    
                
                component.set("v.sortOrder", 'ASC');
                component.set("v.sortField", fieldName);
                component.set("v."+sortFieldComp, true);
            }
        }
        
        
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                
                var responseObj = response.getReturnValue();
                //console.log('responseObj.refsearchedAccount--->>'+JSON.stringify(responseObj.refsearchedAccount));
                
                if(responseObj.refsearchedAccount != null && responseObj.refsearchedAccount.length > 0){
                    component.set('v.isSearchedResultEmpty', false);
                    component.set("v.accountSearchList", responseObj.refsearchedAccount);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set("v.pageMin", responseObj.pageMin);
                    component.set("v.pageMax", responseObj.pageMax);
                    var page = component.get('v.page');
                    var accountSearchList = '';
                    if(page == 1){
                        component.set('v.serialNumber',0);
                    }else{
                        accountSearchList = component.get("v.accountSearchList").length;
                        var pageSize = component.get("v.pageMax");
                        if(accountSearchList != pageSize){
                            component.set('v.serialNumber',component.get('v.serialNumber')+pageSize);
                        }else{
                            component.set('v.serialNumber',page*accountSearchList-pageSize);
                        }
                    }
                }else{
                    component.set('v.isSearchedResultEmpty', true); 
                }
                
                component.set('v.isSpinnertoLoad', false);
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad', false);
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
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad', false);
                }
        });
        $A.enqueueAction(action);
    },
    
    resetSearchCriteria : function(component, event, helper){
        var object = component.get('v.objectName');
        
        var objMapping = {'Account' : 'Company Name', 'Contact' : 'Last Name', 'Opportunity' : 'Membership Activity Name'};
        var defaultField = objMapping[object];
        
        component.set('v.displayNameFilter1', defaultField);
        component.find('row1field').set('v.value', component.get('v.displayNameFilter1'));
        component.set('v.defaultCondition1', component.get('v.objectData').mapOfMetaData[defaultField][1].split('#')[1].split(','));
        component.set('v.row1condition', component.get('v.objectData').mapOfMetaData[defaultField][1].split('#')[1].split(','));   
        component.set('v.type1', component.get('v.objectData').mapOfMetaData[defaultField][1].split('#')[0]);
        component.find('rowcondition1').set('v.value', component.get('v.defaultCondition1'));
        
        component.find('row2field').set('v.value', component.get('v.objectData').fieldLabels[0]);
        component.find('row3field').set('v.value', component.get('v.objectData').fieldLabels[0]);
        component.find('row4field').set('v.value', component.get('v.objectData').fieldLabels[0]);
        component.find('row5field').set('v.value', component.get('v.objectData').fieldLabels[0]);
        
        this.resetInputFields(component, event);
    },
    
    showMaxRecordPopupError : function(component, event){
        if(component.get('v.NPSsearchCriteriaSection') != undefined &&
        		component.get('v.NPSsearchCriteriaSection') != null && 
        			component.get('v.NPSsearchCriteriaSection')) {
            component.set('v.dialogErrorMsg', 'Please select maximum 100 Records for Template generation');
        } else {
            component.set('v.dialogErrorMsg', 'Please select maximum 20 Records for Template generation');
        }
        
        var errorDailog = component.find('FilterSearch');
        for(var i in errorDailog){
            $A.util.removeClass(errorDailog[i], 'slds-hide');
            $A.util.addClass(errorDailog[i], 'slds-show');
        }  
    },
    
    resetInputFields : function(component, event){
        
        component.set('v.type2', 'text');
        component.set('v.type3', 'text');
        component.set('v.type4', 'text');
        component.set('v.type5', 'text');
        
        component.set('v.row2condition', '');
        component.set('v.row3condition', '');
        component.set('v.row4condition', '');
        component.set('v.row5condition', '');
        
        component.find('rowcondition2').set('v.value', '');
        component.find('rowcondition3').set('v.value', '');
        component.find('rowcondition4').set('v.value', '');
        component.find('rowcondition5').set('v.value', '');
        
        if(component.find('input1') != undefined || component.find('input1') != null){
            if(Array.isArray(component.find('input1'))){
                component.find('input1')[0].set('v.value', '');
            }else{
                component.find('input1').set('v.value', '');
            }    
        }
        
        
        if(component.find('input2') != undefined || component.find('input2') != null){
            if(Array.isArray(component.find('input2'))){
                component.find('input2')[0].set('v.value', '');
            }else{
                component.find('input2').set('v.value', '');
            }    
        }
        
        
        if(component.find('input3') != undefined || component.find('input3') != null){
            if(Array.isArray(component.find('input3'))){
                component.find('input3')[0].set('v.value', '');
            }else{
                component.find('input3').set('v.value', '');
            }    
        }
        
        if(component.find('input4') != undefined || component.find('input4') != null){
            if(Array.isArray(component.find('input4'))){
                component.find('input4')[0].set('v.value', '');
            }else{
                component.find('input4').set('v.value', '');
            }
        }
        
        if(component.find('input5') != undefined || component.find('input5') != null){
            if(Array.isArray(component.find('input5'))){
                component.find('input5')[0].set('v.value', '');
            }else{
                component.find('input5').set('v.value', '');
            }    
        }
    },
    
    desktopModal : function(component, event, header, cmp) {
        
        var conditionJsonObj = {"search1":"row1field@input1",
                                "search2":"row2field@input2",
                                "search3":"row3field@input3",
                                "search4":"row4field@input4",
                                "search5":"row5field@input5"};
        
        var selectedItem = event.currentTarget;
        var selectedFieldAuraId = selectedItem.dataset.record;
        
        var selectedDropDown = conditionJsonObj[selectedFieldAuraId].split('@');
        var val = component.find(selectedDropDown[0]).get('v.value');
        
        var inputBoxValue = component.get('v.selectedInputBoxContents');
        var inputVar = component.find(selectedDropDown[1]);
        
        if(inputVar != undefined){
            if(Array.isArray(inputVar)){
                if(inputVar[0].get('v.value') != undefined){
                    inputBoxValue = inputVar[0].get('v.value');    
                }
            }else{
                if(inputVar.get('v.value') != undefined){
                    inputBoxValue = inputVar.get('v.value');    
                }
            }   
        }
        component.set('v.selectedInputBoxContents', inputBoxValue);
        
        header = header+val;
        var apiName = component.get('v.objectData').mapOfMetaData[val][0];
        component.set('v.selectedInputBox',selectedDropDown[1]);
        var childData = {};
        childData = {'apiName' : apiName,
                     'objName' : component.get('v.objectName'),
                     'inputBoxValue' : inputBoxValue};
        
        $A.createComponents([["c:Modal_Component_Small",{attribute:true, 'ModalBodyData':childData, 'Modalheader':header,'ModalBody':cmp}]],
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
    },
    
    panelModal : function(component, event,header,cmp) {
        
        component.set("v.scrollStyleForDevice","");
        
        var conditionJsonObj = {"search1":"row1field@input1",
                                "search2":"row2field@input2",
                                "search3":"row3field@input3",
                                "search4":"row4field@input4",
                                "search5":"row5field@input5"};
        
        var selectedItem = event.currentTarget;
        var selectedFieldAuraId = selectedItem.dataset.record;
        
        var selectedDropDown = conditionJsonObj[selectedFieldAuraId].split('@');
        
        var val = component.find(selectedDropDown[0]).get('v.value');
        header = header+val;
        var apiName = component.get('v.objectData').mapOfMetaData[val][0];
        component.set('v.selectedInputBox',selectedDropDown[1]);
        var childData = {};
        childData = {'apiName' : apiName,
                     'objName' : component.get('v.objectName')};
        
        $A.createComponents([["c:Panel_Component",{attribute:true, 'ModalBodyData':childData,'Modalheader':header,'ModalBody':cmp}]],
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
        
        
    },
    
    modalClosing : function(component, event) {
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
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
            $A.util.removeClass(component.find("sortEdit"),"hide");
        }
    },
    
    generateTemplates : function(component, event, selectedIds) {        
        var startValue = 10;        
        component.set('v.processingBarStyle','width:'+startValue+'%;');
        var processingBar = component.find('processingBar');
        for(var i in processingBar){
            $A.util.removeClass(processingBar[i], 'slds-hide');
            $A.util.addClass(processingBar[i], 'slds-show');
        }
        console.log('generateTemplates');        
        var action = component.get('c.getTemplateInXML');	
        //alert('template Name '+component.find('objType').get('v.value'));
        var templateName = component.find('objType').get('v.value');
        action.setParams({
            "selectedIds" : selectedIds,
            "templateName" : templateName,
            "templateObj" : component.get('v.templateList')
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                console.log('success******');
                var templateWrapper = response.getReturnValue();

                //----------------------------------------------------SAMARTH----------------------------------------------------
                console.log('templateWrapper before '+JSON.stringify(templateWrapper.sobjectRecordWrapperClassList[0].parentSobject));

                var tmInfo = templateWrapper.sobjectRecordWrapperClassList[0].parentSobject;
                if(tmInfo != null || tmInfo != undefined){
                    console.log('Entering not null tmInfo');
                    if(tmInfo['TopMarket1Records__c'] != null || tmInfo['TopMarket1Records__c'] != undefined){
                        tmInfo['TopMarket1Records__c'] = tmInfo['TopMarket1Records__c'].toLocaleString();
                    }
                    if(tmInfo['TopMarket2Records__c'] != null || tmInfo['TopMarket2Records__c'] != undefined){
                        tmInfo['TopMarket2Records__c'] = tmInfo['TopMarket2Records__c'].toLocaleString();
                    }
                    if(tmInfo['TopMarket3Records__c'] != null || tmInfo['TopMarket3Records__c'] != undefined){
                        tmInfo['TopMarket3Records__c'] = tmInfo['TopMarket3Records__c'].toLocaleString();
                    }
                    if(tmInfo['TopMarket4Records__c'] != null || tmInfo['TopMarket4Records__c'] != undefined){
                        tmInfo['TopMarket4Records__c'] = tmInfo['TopMarket4Records__c'].toLocaleString();
                    }
                    if(tmInfo['TopMarket5Records__c'] != null || tmInfo['TopMarket5Records__c'] != undefined){
                        tmInfo['TopMarket5Records__c'] = tmInfo['TopMarket5Records__c'].toLocaleString();
                    }
                    /* tmInfo['TopMarket1Records__c'] = tmInfo['TopMarket1Records__c'].toLocaleString();
                    tmInfo['TopMarket2Records__c'] = tmInfo['TopMarket2Records__c'].toLocaleString();
                    tmInfo['TopMarket3Records__c'] = tmInfo['TopMarket3Records__c'].toLocaleString();
                    tmInfo['TopMarket4Records__c'] = tmInfo['TopMarket4Records__c'].toLocaleString();
                    tmInfo['TopMarket5Records__c'] = tmInfo['TopMarket5Records__c'].toLocaleString(); */
                }

                var cwbiInfo = templateWrapper.sobjectRecordWrapperClassList[0].parentSobject.Company_Wide_BiC_Infromations__r;

                var typeSortOrder = {'Mid Year':0,'Full Year':1,'Projected':2};
                console.log('Sort Order Print '+JSON.stringify(typeSortOrder['Mid Year']));
                if(cwbiInfo != null || cwbiInfo != undefined){
                    
                    //cwbiInfo.sort((a,b) => (a.Year__c > b.Year__c) ? 1 : ((b.Year__c > a.Year__c) ? -1 : 0));

                    function compareYear( a, b ) {
                        if (a.Year__c === b.Year__c){
                            return typeSortOrder[a.Type__c] < typeSortOrder[b.Type__c] ? -1 : 1;
                        } 
                        else{
                            return a.Year__c < b.Year__c ? -1 : 1;
                        }
                      }

                    cwbiInfo.sort(compareYear);
                    console.log('cwbiInfo after sort '+JSON.stringify(cwbiInfo));

                    for(let i=0; i<cwbiInfo.length; i++){
                        if(cwbiInfo[i]['BiC_Source_Records__c'] != null || cwbiInfo[i]['BiC_Source_Records__c'] != undefined){
                            cwbiInfo[i]['BiC_Source_Records__c'] = cwbiInfo[i]['BiC_Source_Records__c'].toLocaleString();    
                        }
                        if(cwbiInfo[i]['Overall_BiC__c'] != null || cwbiInfo[i]['Overall_BiC__c'] != undefined){
                            cwbiInfo[i]['Overall_BiC__c'] = cwbiInfo[i]['Overall_BiC__c'].toFixed(2) + '%';    
                        }
                        if(cwbiInfo[i]['vs_Aetna__c'] != null || cwbiInfo[i]['vs_Aetna__c'] != undefined){
                            cwbiInfo[i]['vs_Aetna__c'] = cwbiInfo[i]['vs_Aetna__c'].toFixed(2) + '%';    
                        }
                        if(cwbiInfo[i]['vs_Anthem__c'] != null || cwbiInfo[i]['vs_Anthem__c'] != undefined){
                            cwbiInfo[i]['vs_Anthem__c'] = cwbiInfo[i]['vs_Anthem__c'].toFixed(2) + '%';    
                        }
                        if(cwbiInfo[i]['vs_Blues__c'] != null || cwbiInfo[i]['vs_Blues__c'] != undefined){
                            cwbiInfo[i]['vs_Blues__c'] = cwbiInfo[i]['vs_Blues__c'].toFixed(2) + '%';    
                        }
                        if(cwbiInfo[i]['vs_Blues_Alt__c'] != null || cwbiInfo[i]['vs_Blues_Alt__c'] != undefined){
                            cwbiInfo[i]['vs_Blues_Alt__c'] = cwbiInfo[i]['vs_Blues_Alt__c'].toFixed(2) + '%';    
                        }
                        if(cwbiInfo[i]['vs_Cigna__c'] != null || cwbiInfo[i]['vs_Cigna__c'] != undefined){
                            cwbiInfo[i]['vs_Cigna__c'] = cwbiInfo[i]['vs_Cigna__c'].toFixed(2) + '%';    
                        }
                        /* cwbiInfo[i]['BiC_Source_Records__c'] = cwbiInfo[i]['BiC_Source_Records__c'].toLocaleString();
                        cwbiInfo[i]['Overall_BiC__c'] = cwbiInfo[i]['Overall_BiC__c'].toFixed(2) + '%';
                        cwbiInfo[i]['vs_Aetna__c'] = cwbiInfo[i]['vs_Aetna__c'].toFixed(2) + '%';
                        cwbiInfo[i]['vs_Anthem__c'] = cwbiInfo[i]['vs_Anthem__c'].toFixed(2) + '%';
                        cwbiInfo[i]['vs_Blues__c'] = cwbiInfo[i]['vs_Blues__c'].toFixed(2) + '%';
                        cwbiInfo[i]['vs_Blues_Alt__c'] = cwbiInfo[i]['vs_Blues_Alt__c'].toFixed(2) + '%';
                        cwbiInfo[i]['vs_Cigna__c'] = cwbiInfo[i]['vs_Cigna__c'].toFixed(2) + '%'; */
                    }
                }
                //----------------------------------------------------SAMARTH----------------------------------------------------

                var processingBarValue = 20;
                var processValue = 20;
                var eachProcessValue = 20;
                component.set('v.processingBarStyle','width:'+processingBarValue+'%;');                
                if(templateWrapper != null){                   
                    var xmlTempleteString = templateWrapper.xmlTempleteString;
                    var sobjectRecordWrapperClassList = templateWrapper.sobjectRecordWrapperClassList;                   
                    var parentObj = templateWrapper.parentObj;
                    var objectItagesMap = templateWrapper.objectItagesMap;
                    var CUSTOM_OBJECT_MAP = templateWrapper.CUSTOM_OBJECT_MAP;
                    var OBJECT_FILTER_RECORDS = templateWrapper.OBJECT_FILTER_RECORDS;
                    
                    eachProcessValue = 80/sobjectRecordWrapperClassList.length;
                    
                    if(sobjectRecordWrapperClassList.length > 1){
                        xmlTempleteString = xmlTempleteString.substring(0,xmlTempleteString.indexOf('<w:styles>')+'<w:styles>'.length)+'<w:style w:styleId="PageBreak" w:type="paragraph"><w:name w:val="PageBreak" /><w:pPr><w:pageBreakBefore w:val="on" /></w:pPr></w:style>'+xmlTempleteString.substring(xmlTempleteString.indexOf('<w:styles>')+'<w:styles>'.length);
                    }
                    
                    var xmlWsectTag = xmlTempleteString.substring(xmlTempleteString.indexOf('<wx:sect>'),(xmlTempleteString.indexOf('</wx:sect>')+'</wx:sect>'.length));                
                    console.log('xmlWsectTag '+xmlWsectTag);
                    
                    var sObjectRecordCound = 0;
                    var xmlBodyWithRecords = '';                     
                    for(var sobjIndex in sobjectRecordWrapperClassList){  
                        sObjectRecordCound++;                             
                        processValue += eachProcessValue/2;
                        component.set('v.processingBarStyle','width:'+processValue+'%;');
                        xmlBodyWithRecords += this.generateXmlFile(objectItagesMap,xmlWsectTag,parentObj,sobjectRecordWrapperClassList[sobjIndex],CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS);   
                        processValue += eachProcessValue/2;
                        component.set('v.processingBarStyle','width:'+processValue+'%;');
                        if(sObjectRecordCound > 0 && sObjectRecordCound < sobjectRecordWrapperClassList.length){
                            xmlBodyWithRecords += '<w:p><w:pPr><w:pStyle w:val="PageBreak" /></w:pPr></w:p>';
                        }
                    }                     
                    xmlTempleteString = xmlTempleteString.substring(0, xmlTempleteString.indexOf('<wx:sect>')+'<wx:sect>'.length)+xmlBodyWithRecords+xmlTempleteString.substring(xmlTempleteString.indexOf('</wx:sect>'));            
                    console.log('End Account Template');
                    
                    var a = window.document.createElement('a');
                    a.href = window.URL.createObjectURL(new Blob([xmlTempleteString]));                    
                    //a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlTempleteString));
                    
                    templateName = templateName.replace("Template", "Data");
                    a.download = templateName+'.xml';
                    //a.name = templateName+'.xml';
                    
                    // Append anchor to body.
                    document.body.appendChild(a);
                    a.click();
                    
                    // Remove anchor from body
                    document.body.removeChild(a);   
                    
                }
                processingBarValue = 100;
                component.set('v.processingBarStyle','width: '+processingBarValue+'%;');
                
                component.set('v.dialogErrorMsg', 'File downloaded successfully!');
                
                for(var i in processingBar){
                    $A.util.addClass(processingBar[i], 'slds-hide');
                    $A.util.removeClass(processingBar[i], 'slds-show');
                }
                
                var errorDailog = component.find('downLoadSuccess');
                for(var i in errorDailog){
                    $A.util.removeClass(errorDailog[i], 'slds-hide');
                    $A.util.addClass(errorDailog[i], 'slds-show');
                } 
                component.get('v.selectedRefAcctsIds', []);
                this.searchForRecords(component, event);                
                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                            component.set('v.isSpinnertoLoad', false);
                            component.set('v.dialogErrorMsg', errors[0].message);
                            var errorDailog = component.find('FilterSearch');
                            for(var i in errorDailog){
                                $A.util.removeClass(errorDailog[i], 'slds-hide');
                                $A.util.addClass(errorDailog[i], 'slds-show');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    
    generateXmlFile : function(objectItagesMap,xmlWsectTag,parentObj,sobjectRecordWrapperClass,CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS) {        
        for(var objectName in objectItagesMap) {
            if (objectItagesMap.hasOwnProperty(objectName)) {   
                if(!(objectName == parentObj || objectName == 'AdvanceMemberShip' || objectName == 'Account')){                                                   
                    var itagSets = objectItagesMap[objectName];
                    
                    var startItag = '';
                    var endItag = '';
                    
                    var setCount = 0;                   
                    for(var itagStrIndex in itagSets){
                        setCount++;
                        if(setCount == 1){
                            startItag = itagSets[itagStrIndex];
                        }
                        if(setCount == itagSets.length){
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    
                    startItag = '%%'+objectName+'.'+startItag+'@@';
                    endItag = '%%'+objectName+'.'+endItag+'@@';
                    console.log('startItag'+startItag+' : endItag : '+endItag);
                    var startIndex = xmlWsectTag.lastIndexOf(startItag);
                    var endIndex = xmlWsectTag.indexOf(endItag);               
                    
                    var stIdx = xmlWsectTag.lastIndexOf('<w:tr ', startIndex);
                    
                    if (stIdx == -1) {
                        stIdx = 0;
                    } 
                    
                    var endIdx = xmlWsectTag.indexOf('</w:tr>', endIndex);
                    
                    endIdx += '</w:tr>'.length;                    
                    var rowToReccurse = xmlWsectTag.substring(stIdx, endIdx);                
                    var totalRows =  this.returnChildRows(rowToReccurse,objectName,objectItagesMap[objectName],sobjectRecordWrapperClass.parentSobject,CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS);
                    xmlWsectTag = xmlWsectTag.substring(0, stIdx)+totalRows+xmlWsectTag.substring(endIdx);                      
                }else{
                    if(objectName == 'AdvanceMemberShip'){
                        xmlWsectTag = this.setValuesToParentObject(objectItagesMap[objectName],xmlWsectTag,objectName,sobjectRecordWrapperClass.advanceMembShipObj);
                    }else{
                        xmlWsectTag = this.setValuesToParentObject(objectItagesMap[objectName],xmlWsectTag,objectName,sobjectRecordWrapperClass.parentSobject);   
                    }  
                }
            }
        }
        return xmlWsectTag;
    },
    
    setValuesToParentObject : function(objectItagesSet,xmlWsectTag,parentObj,parentSobjectDetails){
        if(parentSobjectDetails != null){
            for(var itagIndex in objectItagesSet){                
                var itag = objectItagesSet[itagIndex];
                var value = '';
                
                var splitItags = itag.split('.');
                
                if(splitItags != null){
                    if(splitItags.length == 1){
                        if(parentSobjectDetails[itag] != null){
                            value = parentSobjectDetails[itag];
                        }                            
                    }else if(splitItags.length == 2){
                        if(parentSobjectDetails[splitItags[0]] != null){
                            if(parentSobjectDetails[splitItags[0]][splitItags[1]] != null){
                                value = parentSobjectDetails[splitItags[0]][splitItags[1]];
                            }
                        }                            
                    }else if(splitItags.length == 3){
                        if(parentSobjectDetails[splitItags[0]] != null){
                            if(parentSobjectDetails[splitItags[0]][splitItags[1]] != null && parentSobjectDetails[splitItags[0]][splitItags[1]][splitItags[2]] != null){
                                value = parentSobjectDetails[splitItags[0]][splitItags[1]][splitItags[2]];
                            }
                        }                            
                    }                                            
                } 
                
                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);    
                if(value != null && value != undefined && value.length > 7 && this.isValidDate(value)){
                    //var dateVal =  new Date(value); 
                    //var dateValue = new Date(dateVal.getTime() - (dateVal.getTimezoneOffset() * 60000 ));
                    //value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()
                    value = $A.localizationService.formatDate(value, "M/d/yyyy");
                }                
                var replaceItagName = '%%'+parentObj+'.'+itag+'@@'; 
				if(parentObj == 'Account' && itag == 'Comments__c'){
                        value = value.replace(/\n/g,'<w:br/>');                      
                }               
                xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);                 
            }
        }        
        return xmlWsectTag;
    },
    
    returnChildRows : function(rowTemplet,objectName,replaceItags,parentSobjectDetails,CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS) {
        var totalRows = '';                             
        var childReleationShipName = '';        
        //debugger;
        if(CUSTOM_OBJECT_MAP.hasOwnProperty(objectName)){            
            childReleationShipName= CUSTOM_OBJECT_MAP[objectName];
        }else{                 
            childReleationShipName = objectName;
        }
        
        console.log('objectName ---> '+objectName);
        var sObjectList = parentSobjectDetails[childReleationShipName];           
        
        if(sObjectList != null){
            for(var sObjIndex in sObjectList){
                var sObj = sObjectList[sObjIndex];
                if(OBJECT_FILTER_RECORDS.hasOwnProperty(objectName)){
                    var filterConditions = OBJECT_FILTER_RECORDS[objectName]
                    var filterConditionsArray = filterConditions.split('::');
                    var fileterFieldName = filterConditionsArray[0];                    
                    var fileterValuesList = filterConditionsArray[1].split(';;');
                    
                    var fileterFieldNameItags = fileterFieldName.split('.');
                    var sObjFilterValue = null;
                    
                    if(Array.isArray(fileterFieldNameItags)){
                        if(fileterFieldNameItags.length == 1){
                            if(sObj[fileterFieldName] != null){
                                sObjFilterValue = sObj[fileterFieldName];   
                            }                            
                        }else if(fileterFieldNameItags.length == 2){
                            if(sObj[fileterFieldNameItags[0]] != null){
                                if(sObj[fileterFieldNameItags[0]][fileterFieldNameItags[1]] != null){
                                    sObjFilterValue = sObj[fileterFieldNameItags[0]][fileterFieldNameItags[1]];
                                }
                            }                            
                        }
                            else if(fileterFieldNameItags.length == 3){
                                if(sObj[fileterFieldNameItags[0]] != null){
                                    if(sObj[fileterFieldNameItags[0]][fileterFieldNameItags[1]] != null && sObj[fileterFieldNameItags[0]][fileterFieldNameItags[1]][fileterFieldNameItags[2]] != null){
                                        sObjFilterValue = sObj[fileterFieldNameItags[0]][fileterFieldNameItags[1]][fileterFieldNameItags[2]];
                                    }
                                }                            
                            }
                    }
                    
                    if(sObjFilterValue != null){
                        var isFound = false;
                        for(var val in fileterValuesList){
                            if(sObjFilterValue == fileterValuesList[val]){
                                isFound = true;
                                break;
                            }
                        }
                        if(!isFound)continue;
                    }else{
                        continue;
                    }                    
                }
                
                var eachRow = rowTemplet;
                for(var itagIndex in replaceItags){              
                    var itag = replaceItags[itagIndex];
                    var splitItags = itag.split('.');
                    var value = '';
                    if(Array.isArray(splitItags)){
                        if(splitItags.length == 1){
                            if(sObj[itag] != null){
                                value = sObj[itag];
                            }                            
                        }else if(splitItags.length == 2){
                            if(sObj[splitItags[0]] != null){
                                if(sObj[splitItags[0]][splitItags[1]] != null){
                                    value = sObj[splitItags[0]][splitItags[1]];
                                }
                            }                            
                        }
                            else if(splitItags.length == 3){
                                if(sObj[splitItags[0]] != null){
                                    if(sObj[splitItags[0]][splitItags[1]] != null && sObj[splitItags[0]][splitItags[1]][splitItags[2]] != null){
                                        value = sObj[splitItags[0]][splitItags[1]][splitItags[2]];
                                    }
                                }                            
                            }
                    }                                    
                    var replaceItagName = '%%'+objectName+'.'+itag+'@@';                       
                    value = value != null ?value:'';
                    value = value.toString();
                    value = this.replaceXmlSpecialCharacters(value);
                    if(value != null && value != undefined && value.length > 7 && this.isValidDate(value)){
                        //var dateVal =  new Date(value); 
                        //var dateValue = new Date(dateVal.getTime() - (dateVal.getTimezoneOffset() * 60000 ));                       
                        //value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()   
                        value = $A.localizationService.formatDate(value, "M/d/yyyy");
                    }					                  
                    eachRow = eachRow.split(replaceItagName).join(value);                                     
                } 
                totalRows += eachRow;                   
            }
        }else{
            for(var itagIndex in replaceItags){                                           
                var itag = replaceItags[itagIndex];
                var replaceItagName = '%%'+objectName+'.'+itag+'@@';  
                //System.debug('replaceItagName in Else : '+replaceItagName);
                rowTemplet = rowTemplet.split(replaceItagName).join('');
            }                           
            totalRows += rowTemplet;  
        }       
        return totalRows; 
    },
    isValidDate : function(dateString) {
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateString.match(regEx)) return false;  // Invalid format
        var d = new Date(dateString);
        if(!d.getTime() && d.getTime() !== 0) return false; // Invalid date        
        return d.toISOString().slice(0,10) === dateString;
    },
    replaceXmlSpecialCharacters : function(value) {
        if(value != null && value != undefined && value.length > 0){            
            value = value.replace(/&/g,'&amp;');
            value = value.replace(/>/g,'&gt;');
            value = value.replace(/</g,'&lt;');
            return value;
        }else{
            return '';
        }
    },
    
    getNPSActionFields : function(component, event){
        component.set('v.isSpinnertoLoad', true);
        var action = component.get('c.getNPSFields');
        action.setParams({objectFields:['Owner__r.Name','Contact_Consultant_Name__r.Name','Company_Name__r.Name']});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                component.set('v.NPSFields',response.getReturnValue().fieldAPINameList.sort());
                component.set('v.NPSFieldsMap',response.getReturnValue().NPSActionFieldsWrapMap);
                for(var i=1 ;i<=5; i++){
                    component.set('v.type'+i,'');
                    component.set('v.type'+i+'Values',[]);
                }
                component.set('v.type1','STRING');
                component.find('NPS_Output_1').set('v.value','Owner');
                component.set('v.isSpinnertoLoad', false);
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
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    
})