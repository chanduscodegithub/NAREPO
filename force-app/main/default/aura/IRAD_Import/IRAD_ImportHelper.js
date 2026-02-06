({
    getIRADS : function(component, event, helper) 
    {
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var accountId=component.get("v.recordId");
        
        
        var page=component.get("v.page");
        page = page || 1;
        console.log("accountId==>"+accountId);
        if(accountId==undefined || accountId==null)
        {
            console.log("Inside if loop");
            accountId='001g000001jcddWAAQ';
        }
        
        var getIRADRecordsAction = component.get("c.getIRADRecords");
        getIRADRecordsAction.setParams({
            "accountId": accountId,
            "pageNumber":page,
            "columnName":component.get("v.sortField"),
            "sortType":component.get("v.sortOrder"),
            
        });
        getIRADRecordsAction.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                
                console.log(response.getReturnValue());
                var iradResult  = response.getReturnValue();
                if(iradResult!= null)
                {
                    if(iradResult.iradList == null || iradResult.iradList.length == 0)
                    {
                        component.set("v.isIRADListEmpty",true); 
                    }
                    else
                    {
                        component.set("v.isIRADListEmpty",false); 
                    }
                    component.set("v.iradRecordList",iradResult.iradList);
                    component.set("v.page", iradResult.page);
                    component.set("v.total", iradResult.total);
                    component.set("v.pages", Math.ceil(iradResult.total/iradResult.pageSize));
                    component.set("v.pcLstMap",iradResult.pckLstMap);
                    
                    if(iradResult.total > 0){
                        component.set("v.recordsCount",'true');
                    }else{
                        component.set("v.recordsCount",'false');
                    }
                    
                    //component.set("v.Status__cPicklistOption",iradResult.pckLstMap['Status__c']);
                    
                    var pickLstFldNameLst=['Status__c','Type__c','Internal_External__c','Priority__c','Category__c','Applicable_To__c']; 
                    
                    for(var i=0;i<pickLstFldNameLst.length;i++)
                    {
                        var attrName=pickLstFldNameLst[i]+'PicklistOption';
                        component.set("v."+attrName,iradResult.pckLstMap[pickLstFldNameLst[i]]);
                    }
                    
                    
                }
                
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(getIRADRecordsAction);
    },
    
    
    sortBy : function(component, event, fieldName,sortFieldComp) 
    {
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var accountId=component.get("v.recordId");
        
        
        var page=component.get("v.page");
        page = page || 1;
        console.log("accountId==>"+accountId);
        if(accountId==undefined || accountId==null)
        {
            console.log("Inside if loop");
            accountId='001g000001jcddWAAQ';
        }
        
        
        var getIRADRecordsAction = component.get("c.getIRADRecords");
        
        if(component.get("v."+sortFieldComp) ===  true) {
            getIRADRecordsAction.setParams({
                "accountId" : accountId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC',
                
            });
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, false);
        } else {
            getIRADRecordsAction.setParams({
                "accountId" : accountId,
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC',
                
            });
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", fieldName);
            component.set("v."+sortFieldComp, true);
        }
        getIRADRecordsAction.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                
                console.log(response.getReturnValue());
                var iradResult  = response.getReturnValue();
                if(iradResult!= null)
                {
                    if(iradResult.iradList == null || iradResult.iradList.length == 0)
                    {
                        component.set("v.isIRADListEmpty",true); 
                    }
                    else
                    {
                        component.set("v.isIRADListEmpty",false); 
                    }
                    component.set("v.iradRecordList",iradResult.iradList);
                    component.set("v.page", iradResult.page);
                    component.set("v.total", iradResult.total);
                    component.set("v.pages", Math.ceil(iradResult.total/iradResult.pageSize));
                    component.set("v.pcLstMap",iradResult.pckLstMap);
                }
                
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(getIRADRecordsAction);
        
    },
    
    updateRemoveIRAD:function(component,iradRecord,isDelete)
    {
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var accountId=component.get("v.recordId");
        
        
        var page=component.get("v.page");
        page = page || 1;
        console.log("accountId==>"+accountId);
        if(accountId==undefined || accountId==null)
        {
            console.log("Inside if loop");
            accountId='001g000001jcddWAAQ';
        }
        
        var updateDeleteIRAdRecordAction = component.get("c.updateDeleteIRAdRecord");
        
        
        updateDeleteIRAdRecordAction.setParams({
            "accountId": accountId,
            "iradRec":iradRecord,
            "isDelete":isDelete,
            "pageNumber":page,
            "columnName":component.get("v.sortField"),
            "sortType":component.get("v.sortOrder"),
            
        });
        updateDeleteIRAdRecordAction.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                
                console.log(response.getReturnValue());
                var iradResult  = response.getReturnValue();
                if(iradResult!= null)
                {
                    if(iradResult.iradList == null || iradResult.iradList.length == 0)
                    {
                        component.set("v.isIRADListEmpty",true); 
                    }
                    else
                    {
                        component.set("v.isIRADListEmpty",false); 
                    }
                    component.set("v.iradRecordList",iradResult.iradList);
                    component.set("v.page", iradResult.page);
                    component.set("v.total", iradResult.total);
                    component.set("v.pages", Math.ceil(iradResult.total/iradResult.pageSize));
                    component.set("v.pcLstMap",iradResult.pckLstMap);
                    
                    if(iradResult.total > 0){
                        component.set("v.recordsCount",'true');
                    }else{
                        component.set("v.recordsCount",'false');
                    }
                    
                    //component.set("v.Status__cPicklistOption",iradResult.pckLstMap['Status__c']);
                    
                    var pickLstFldNameLst=['Status__c','Type__c','Internal_External__c','Priority__c','Category__c','Applicable_To__c']; 
                    
                    for(var i=0;i<pickLstFldNameLst.length;i++)
                    {
                        var attrName=pickLstFldNameLst[i]+'PicklistOption';
                        component.set("v."+attrName,iradResult.pckLstMap[pickLstFldNameLst[i]]);
                    }
                    
                    
                }
                
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(updateDeleteIRAdRecordAction);
        
    },
    upsertIradRecords : function(component,event,iradJson,accountId,spinner){
        console.log('iradJson---->'+JSON.stringify(iradJson));
        var action = component.get('c.upsertIradRecords');	
        action.setParams({
            "iradJson": iradJson,
            "accountId": accountId,
            "pageNumber":1,
            "columnName":component.get("v.sortField"),
            "sortType":component.get("v.sortOrder"),
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            var reponseMessage = '';
            if (state === "SUCCESS") {    
                //console.log("Import SUCCESS");
                var iradResult  = response.getReturnValue();
                if(iradResult.recordStatus == 'Success'){
                    reponseMessage = 'Record Imported Successfully';
                    if(component.get('v.failureRecords').length == 0){
                        this.showToast(reponseMessage,'Success');
                        $A.get("e.force:closeQuickAction").fire();
                    }else{
                       // component.set("v.isModalOpen", true);
                    }
                    
                    
                    if(iradResult!= null)
                    {
                        if(iradResult.iradList == null || iradResult.iradList.length == 0)
                        {
                            component.set("v.isIRADListEmpty",true); 
                        }
                        else
                        {
                            component.set("v.isIRADListEmpty",false); 
                        }
                        component.set("v.iradRecordList",iradResult.iradList);
                        component.set("v.page", iradResult.page);
                        component.set("v.total", iradResult.total);
                        component.set("v.pages", Math.ceil(iradResult.total/iradResult.pageSize));
                        component.set("v.pcLstMap",iradResult.pckLstMap);
                        
                        if(iradResult.total > 0){
                            component.set("v.recordsCount",'true');
                        }else{
                            component.set("v.recordsCount",'false');
                        }
                        
                        //component.set("v.Status__cPicklistOption",iradResult.pckLstMap['Status__c']);
                        
                        var pickLstFldNameLst=['Status__c','Type__c','Internal_External__c','Priority__c','Category__c','Applicable_To__c']; 
                        
                        for(var i=0;i<pickLstFldNameLst.length;i++)
                        {
                            var attrName=pickLstFldNameLst[i]+'PicklistOption';
                            component.set("v."+attrName,iradResult.pckLstMap[pickLstFldNameLst[i]]);
                        }
                        
                        
                    }
                }else{
                    reponseMessage = 'Record Imported Failure';
                    this.showToast(reponseMessage,'Failure');
                }
            }
            else if (state === "INCOMPLETE") {   
                console.log("Import INCOMPLETE");
            }
                else if (state === "ERROR") {
                    console.log("Import Unknown error"); 
                    reponseMessage = 'Record Imported Failure';
                    this.showToast(reponseMessage,'Failure');
                } 
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
           // $A.get("e.force:closeQuickAction").fire();
            
        });        
        $A.enqueueAction(action);
        event.stopPropagation();
        
    },
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    
    
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,IRADFinalData,FieldSetMap) { 
      
        for(var objectName in objectItagesMap) {
            if (objectItagesMap.hasOwnProperty(objectName)) {                                                 
                var itagSets = objectItagesMap[objectName];
                
                var startItag = '';
                var endItag = '';
                var setCount = 0;
                for(var itagStrIndex in itagSets){
                    setCount = setCount+1;
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
                
                var stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0">', startIndex);
                var endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                endHeaderIdx +='</Row>'.length; 
                var rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);
                var xmlTempleteString =  this.returnChildRows(rowToReccurse,xmlWsectTag,IRADFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap);
                var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
                var JsonData = this.xmlToJson(xmlDOM);
                var today = new Date();
                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                hiddenElement.target = '_self'; // 
                hiddenElement.download = 'IRAD'+today+'.xls';  // CSV file Name* you can change it.[only name not .csv] 
                document.body.appendChild(hiddenElement); // Required for FireFox browser
                hiddenElement.click();
            }
        }
    },
    returnChildRows:function(rowToReccurse,xmlWsectTag,IRADFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        for(var i in IRADFinalData){
            var eachRow = rowToReccurse;
            count = count+1;
            var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
            eachRow = eachRow.split(replaceItagName).join(count);
            for(var k in objectItagesMap[objectName]){
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value;
                var FieldSetVal=FieldSetMap[key];
                /*if(FieldSetVal.type=='Date')
                {
                    
                }
                else
                {*/
                    value= IRADFinalData[i][key];
               // }
                
                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);
                if(value != '' && FieldSetMap[key] != undefined && FieldSetMap[key] != null ){
                   if(FieldSetMap[key].type == 'DATE'){
                        var formattedDateArray = value.split('-');
                       	var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                        var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                        var year =  formattedDateArray[0].substring(2);
                       
                        value = month+'/'+date+'/'+year;
                   }
                   
                }
                eachRow = eachRow.split(replaceItagName).join(value);
            }
            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx)+totalRows+xmlWsectTag.substring(endHeaderIdx);
        xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(count+9);
        return xmlWsectTag;
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
    xmlToJson:function(xml) {
        
        // Create the return object
        var obj = {};
        
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        
        // do children
        // If just one text node inside
        if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
            obj = xml.childNodes[0].nodeValue;
        }
        else if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    },
    
    formatDate:function(date) {

            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            


            
            return [month, day,year].join('/');
        }
    })