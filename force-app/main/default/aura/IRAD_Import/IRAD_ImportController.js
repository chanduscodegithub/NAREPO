({
    doInit:function (component, event, helper) 
    {
        component.set('v.columns', [
            {label: 'Record No', fieldName: 'rowNumber', type: 'number'},
            {label: 'Failure Reason', fieldName: 'failureReason', type: 'text'},
        ]);


        var objectName = "IRAD__c";
        var accountId=component.get("v.recordId");
        var action = component.get('c.getAllFieldName');	
        action.setParams({
            "objectName": objectName,
            "accountId" : accountId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS"){ 
                var filedWrapper  = response.getReturnValue();
                
                component.set('v.fieldLabelMap',filedWrapper.fieldLabelMap);
                component.set('v.FieldSetMap',filedWrapper.FieldSetMap);
                component.set('v.ownerId',filedWrapper.impPlanData.OwnerId);
            	
               
                if(filedWrapper.recordsCount > 0){
                    component.set("v.recordsCount",'true');
                }
                
                if(filedWrapper.impPlanData != null && filedWrapper.impPlanData != ''){
                    if(filedWrapper.impPlanData.Account__c != null && filedWrapper.impPlanData.Account__c != ''){
                        component.set("v.isValidImport",'true');
                        component.set("v.companyId",filedWrapper.impPlanData.Account__c);                        
                    }
                }
                if(!component.get('v.isValidImport')){
           			 helper.showToast('Company is not associated to Implementation Plan. Before Importing Please associate Implement plan to company','Import Not valid');
 					 $A.get("e.force:closeQuickAction").fire(); 
                     return false;
            	}
            }
            else if (state === "INCOMPLETE") {   
                console.log("getAllFieldName call INCOMPLETE");
            }
                else if (state === "ERROR") {
                    console.log("getAllFieldName call Unknown error");   
                }   
        });        
        $A.enqueueAction(action);        
    },
    createRecord : function (component, event, helper) 
    {
        var windowHash = window.location.href;
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": "IRAD__c",
            "defaultFieldValues": {
                'Company__c' : component.get("v.recordId")
            }
            //"panelOnDestroyCallback": function(event) {
            // window.location.href = windowHash;
            //}
        });
        createRecordEvent.fire();
        event.stopPropagation();
    },
    pageChange: function(component, event, helper) 
    {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        component.set("v.page",page)
        helper.getIRADS(component,event,helper);
        
    },
    sortFields: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"Status__c":"sortStatus__cAsc","Type__c":"sortType__cAsc","Current_Due_Date__c":"sortCurrent_Due_Date__cAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];       
        component.set("v.page",1);
        helper.sortBy(component, event, fieldNameToBeSorted,sortFieldCompName);
        
    },
    
    handleFilesChange : function (cmp, event) {
        var files = event.getSource().get("v.files");
        
        alert(files.length + ' files !!');
        console.log(files);
    },
    
    handelEvent: function(component, event, helper) 
    {
        if(event.getParam('isDelete')){
            component.set('v.isDelete',true);
            component.set('v.iradRecord',event.getParam('iradRecord'));
            var IRADConfirm = component.find('IRADConfirm');
            for(var i=0; i< IRADConfirm.length; i++){
                $A.util.addClass(IRADConfirm[i], 'slds-show');
                $A.util.removeClass(IRADConfirm[i], 'slds-hide');
            }
        }else if(event.getParam('isSave')){
            helper.updateRemoveIRAD(component,event.getParam('iradRecord'),event.getParam('isDelete'));
        }else{
            helper.getIRADS(component, event, helper);
        }
    },
    confirmCancel: function(component, event, helper) {
        var IRADConfirm = component.find('IRADConfirm');
        for(var i=0; i< IRADConfirm.length; i++){
            $A.util.addClass(IRADConfirm[i], 'slds-hide');
            $A.util.removeClass(IRADConfirm[i], 'slds-show');
        }
    },
    
    confirmDelete: function(component, event, helper) {
        var IRADConfirm = component.find('IRADConfirm');
        for(var i=0; i< IRADConfirm.length; i++){
            $A.util.addClass(IRADConfirm[i], 'slds-hide');
            $A.util.removeClass(IRADConfirm[i], 'slds-show');
        }
        helper.updateRemoveIRAD(component,component.get('v.iradRecord'),component.get('v.isDelete'));
    },
    expandCollapse: function(component, event, helper) 
    {
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            component.set("v.page",1);
            helper.getIRADS(component,event,helper);
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }
    },
    importRecord : function(component, event, helper){
        event.stopPropagation();
        document.getElementById("my_file_input").value = "";
        document.getElementById('my_file_input').click();
    },
    clickSelectedfile : function(component, event, helper){
        event.stopPropagation();
    },
    exportRecord: function(component, event, helper){
       	 event.stopPropagation();
        var accountId=component.get("v.recordId");
         var generateAction = component.get('c.getTemplateInXML');
        generateAction.setParams({
            "accID" : accountId,
            "NPSId" : ''
        });
        component.set('v.ErrorMessage','');
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                helper.generateXmlFile(component,responseData.objectItags,responseData.xmlString,responseData.IRADFinalData,responseData.FieldSetMap);
            }
            else if (state === "INCOMPLETE") {   
                
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(generateAction); 
        
    },    
    selectedFile : function(component, event, helper){
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var accountId=component.get("v.recordId"); 
        var reader = new FileReader();
        var fileInput = component.find("my_file_input").getElement();
        var file = fileInput.files[0];
        
        if(file.name != '' && file.name != null){
            var fileArray = file.name.split('.');
        	var fileArrayLength = fileArray.length;
            if(fileArray[fileArrayLength-1] != 'xls' && fileArray[fileArrayLength-1] != 'xlsx'){
                helper.showToast('Please select a valid file','Invalid file');
 				$A.get("e.force:closeQuickAction").fire(); 
                return false;
            }
            
        }
        
        
        reader.onload = function(e) {
            var data = e.target.result;
            var cfb = XLSX.read(data, {type: 'binary'});
            // Loop Over Each Sheet
            cfb.SheetNames.forEach(function(sheetName) {
                var oJSIDRow = XLSX.utils.sheet_to_json(cfb.Sheets[sheetName], {range:5},{cellStubs:true});   
                var oJSIDRowObj = oJSIDRow[0];
                var projectId = Object.keys(oJSIDRowObj)[2];
                if(projectId != component.get("v.recordId")){
                    helper.showToast('IRAD file does not belongs to this Project','');
                    $A.get("e.force:closeQuickAction").fire(); 
                    return false;
                }
                var oJS = XLSX.utils.sheet_to_json(cfb.Sheets[sheetName], {range:8},{cellStubs:true});   
                var fieldLabelMap  = component.get('v.fieldLabelMap');
                var FieldSetMap  = component.get('v.FieldSetMap');
                var value,fieldValue;
                var iradJson = [];
                var failureRecords = [];
                var count = 1;
                
                Object.keys(oJS).forEach(function(key) {
                    value = oJS[key];
                    
                    
                    //item['Project__c'] =accountId;
                    //item['Company__c'] =component.get('v.companyId');
                    
                    /*Object.keys(value).forEach(function(key) {
                        if(key != 'undefined'){
                            //fieldValue = value[key];
                            if(FieldSetMap[fieldLabelMap[key]] != '' && FieldSetMap[fieldLabelMap[key]] != null){
                                if(FieldSetMap[fieldLabelMap[key]]['type'] != 'DATE'){
                                	item[fieldLabelMap[key]] = value[key];
                            	}else if(FieldSetMap[fieldLabelMap[key]]['type'] == 'DATE'){
                                if(value[key] != "" && value[key] != null){
                                    var dateArray = value[key].split('/');
                                    
                                    var updatedDate = '';
                                    var date,month = '';
                                    if(dateArray[1].length == 1){
                                        date = 0+dateArray[1];
                                    }else{
                                        date = dateArray[1];
                                    }
                                    if(dateArray[0].length == 1){
                                        month = 0+dateArray[0];
                                    }else{
                                        month = dateArray[0];
                                    }
                                    var year  =  dateArray[2];  
                                    var prefixYear = new Date().getFullYear().toString().substr(0,2);
                                    	updatedDate = prefixYear+year+'-'+month+'-'+date;
                                    item[fieldLabelMap[key]] = updatedDate;
                                }
                                
                            }
                            }else{
                                	item[fieldLabelMap[key]] = value[key];
                            }                                        
                        }       
                    });*/

                    
                    /*if(value['Record ID'] != '' && value['Record ID'] != null){
                        	var item = {};
                            var errorItem = {};
                        	var validRecord = false;
                        	var columnArray = $A.get('$Label.c.IRAD_Header_Column').split(',');
							columnArray.forEach(function(element) {
                                if(value[element] != null && value[element] != '' && value[element] != undefined){
                                                                       
                                    if(value['Status'] == 'Closed' && (value['Resolution Plan'] == '' || value['Resolution Plan'] == null || value['Resolution Plan'] == undefined)){
                                        errorItem.rowNumber = count;
                        				errorItem.failureReason = 'Resolution Plan is required when status is closed';
                        				
                                    }else{
                                        validRecord = true;
                                        item[fieldLabelMap[element]] = value[element]; 
                                    }                                                               	  
                                }else{
                                    	item[fieldLabelMap[element]] = ''; 
                                }
                            });   
                        		if(validRecord){
                                        iradJson.push(item);
                                }else{
                                    	failureRecords.push(errorItem);
                                }
                            	
                    }else{
                        var errorItem = {};
                        errorItem.rowNumber = count;
                        errorItem.failureReason = 'Record Id is not found to update the record';
                        failureRecords.push(errorItem);
                    }*/
                    
                     var errorItem = {};
                    var validRecord = false;
                    var item = {};
                    /*if(value['Record ID'] == '' || value['Record ID'] == null || value['Record ID'] == undefined){
                        errorItem.rowNumber = count;
                        errorItem.failureReason = 'Record Id is not found to update the record';
                        failureRecords.push(errorItem);
                    }
                    else */
                   if(value['Status'] == 'Closed' && (value['Resolution Plan'] == '' || value['Resolution Plan'] == null || value['Resolution Plan'] == undefined)){
                        errorItem.rowNumber = count;
                        errorItem.failureReason = 'Resolution Plan is required when status is closed';
                        errorItem.Id = value['Record ID'];
                        failureRecords.push(errorItem);
                    }else if(value['Description'] == '' || value['Description'] == null || value['Description'] == undefined){
                        errorItem.rowNumber = count;
                        errorItem.failureReason = 'Description required field is missing';
                        errorItem.Id = value['Record ID'];
                        failureRecords.push(errorItem);
                    }else if(value['Internal/External'] == '' || value['Internal/External'] == null || value['Internal/External'] == undefined){
                        errorItem.rowNumber = count;
                        errorItem.failureReason = 'Internal/External required field is missing';
                        errorItem.Id = value['Record ID'];
                        failureRecords.push(errorItem);
                    }else{
                        		validRecord = true;	
                    			Object.keys(value).forEach(function(key) {
                                    if(key != 'undefined'){
                                        //fieldValue = value[key];
                                        
                                        if(FieldSetMap[fieldLabelMap[key]] != '' && FieldSetMap[fieldLabelMap[key]] != null){
                                            if(FieldSetMap[fieldLabelMap[key]]['type'] != 'DATE'){
                                                if(key != 'Assigned to (Owner)'){
                                                    item[fieldLabelMap[key]] = value[key];
                                                }
                                                
                                            }else if(FieldSetMap[fieldLabelMap[key]]['type'] == 'DATE'){
                                                if(value[key] != "" && value[key] != null){
                                                   // var regExp = /^((0?[13578]|10|12)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1}))|(0?[2469]|11)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1})))$/;
                                                     //var regExp = /^\d{4}-\d{2}-\d{2}$/;
                                                    var regExp = /^\d{1,2}\/\d{1,2}\/\d{4}$/ ;
                                                    
                                                    if(new Date(value[key]).toLocaleDateString().match(regExp)){
                                                    var dateArray = new Date(value[key]).toLocaleDateString().split('/');
                                                    
                                                    var updatedDate = '';
                                                    var date,month = '';
                                                    if(dateArray[1].length == 1){
                                                        date = 0+dateArray[1];
                                                    }else{
                                                        date = dateArray[1];
                                                    }
                                                    if(dateArray[0].length == 1){
                                                        month = 0+dateArray[0];
                                                    }else{
                                                        month = dateArray[0];
                                                    }
                                                    var year  =  dateArray[2];  
                                                    var prefixYear = new Date().getFullYear().toString().substr(0,2);
                                                        updatedDate = year+'-'+month+'-'+date;
                                                        if(updatedDate != '' && updatedDate != undefined && updatedDate != null && updatedDate.length == 10){
                                                            item[fieldLabelMap[key]] = updatedDate;
                                                        }else{
                                                            validRecord = false;
                                                            errorItem.rowNumber = count;
                                                            errorItem.failureReason = 'Date format is not valid, Please change date field to MM/DD/YYYY format';
                                                            errorItem.Id = value['Record ID'];
                                                            failureRecords.push(errorItem);
                                                        }
                                                    
                                                    }else{
                                                            /*helper.showToast('Date format is not valid in input file, Please change date field to M/D/YY format','Invalid Date Format');
                                                            $A.get("e.force:closeQuickAction").fire(); 
                                                            return false;*/
                                                        validRecord = false;
                                                        errorItem.rowNumber = count;
                        								errorItem.failureReason = 'Date format is not valid, Please change date field to MM/DD/YYYY format';
                                                        errorItem.Id = value['Record ID'];
                                                        failureRecords.push(errorItem);
                                                    }
                                                }else{
                                                    item[fieldLabelMap[key]] = value[key];
                                                }
                                            
                                        }
                                        }else{
                                            if(key != 'Assigned to (Owner)'){
                                                item[fieldLabelMap[key]] = value[key];
                                            }
                                                
                                        }                                        
                                    }
                                                          
                                  });
                        
                                    if(value['Record ID'] == '' || value['Record ID'] == null || value['Record ID'] == undefined){
                                        item['OwnerId'] = component.get("v.ownerId");
                                        item['Project__c'] = component.get("v.recordId");                                        
                                    }
                    			
                        
                        if(validRecord){
                           
                            failureRecords = failureRecords.filter(element => element.Id != item.Id)

                            iradJson.push(item);  
                        }
                    }
                    
                    
                    count++;
                });
                component.set("v.failureRecords",failureRecords);
                if(failureRecords!= '' && failureRecords != undefined && failureRecords != null){
                       $A.util.removeClass(spinner, 'slds-show');
            		   $A.util.addClass(spinner, 'slds-hide');
                       component.set("v.isModalOpen", true);
                    	return false;
                }else{
                    helper.upsertIradRecords(component,event,iradJson,accountId,spinner);
                }
                
            });
        };
        reader.readAsBinaryString(file);    
    },
     openModel: function(component, event, helper) {
      // Set isModalOpen attribute to true
      component.set("v.isModalOpen", true);
         
   },
  
   closeModel: function(component, event, helper) {
      // Set isModalOpen attribute to false  
      component.set("v.isModalOpen", false);
       $A.get("e.force:closeQuickAction").fire();
   }
    
})