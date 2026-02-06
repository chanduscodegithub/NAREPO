({
     generateAMT_Template : function(component, event,accId,tempType,isPolicyAmtApplet,policyId){
        var startValue = 10;
        var templateName = 'AMT_Template';             
        component.set('v.processingBarStyle','width:'+startValue+'%;');
         var processingBar = component.find('processingBar');
        for(var i in processingBar){
            $A.util.removeClass(processingBar[i], 'slds-hide');
            $A.util.addClass(processingBar[i], 'slds-show');
        }
        console.log('generateTemplates');        
        var action = component.get('c.getTemplateInXML');	
        //alert('template Name '+component.find('objType').get('v.value'));
       
        action.setParams({
            "selectedIds" : accId,
            "templateName" : templateName,
            "teamType" : tempType,
            "isPolicyAmt" :isPolicyAmtApplet,
            "policyId" : policyId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                console.log('success******');
                var templateWrapper = response.getReturnValue();
                var processingBarValue = 20;
                var processValue = 20;
                var eachProcessValue = 20;
                var sobjectRecordWrapperClassList ;
                component.set('v.processingBarStyle','width:'+processingBarValue+'%;');                
                if(templateWrapper != null){                   
                    var xmlTempleteString = templateWrapper.xmlTempleteString;
                    var sobjectRecordWrapperClassList = templateWrapper.sobjectRecordWrapperClassList; 
                    console.log('sobjectRecordWrapperClassList--',sobjectRecordWrapperClassList);
                    console.log('policy list--',component.get("v.serviceAmtList"));
                    if(isPolicyAmtApplet){
                                                   if(sobjectRecordWrapperClassList.length==0){
                               var toastEvent = $A.get("e.force:showToast");
                               toastEvent.setParams({
                                   'type':'info',
                                   "message": "Something went wrong. Please contact admin."
                               });
                               toastEvent.fire();
                               return;
                            }
                        if(tempType == "External"){

                        	sobjectRecordWrapperClassList[0].parentSobject.Service_AMT__r = component.get("v.externalServiceAmtList");    
                        }
                        else{
                            console.log('inside else');
                            console.log('inside else 2-',sobjectRecordWrapperClassList)
                            sobjectRecordWrapperClassList[0].parentSobject.Service_AMT__r = component.get("v.serviceAmtList");                        	
                        }                        
                    }
                     console.log('outside else');
                    var parentObj = templateWrapper.parentObj;
                    var objectItagesMap = templateWrapper.objectItagesMap;
                    var CUSTOM_OBJECT_MAP = templateWrapper.CUSTOM_OBJECT_MAP;
                    var OBJECT_FILTER_RECORDS = templateWrapper.OBJECT_FILTER_RECORDS;
                    var roleRespMap = templateWrapper.roleRespMap;
                     var spltySCEDetails = templateWrapper.spltySCEDetails;
                    
                    eachProcessValue = 80/sobjectRecordWrapperClassList.length;
                    
                   // if(sobjectRecordWrapperClassList.length > 1){
                        xmlTempleteString = xmlTempleteString.substring(0,xmlTempleteString.indexOf('<w:styles>')+'<w:styles>'.length)+'<w:style w:styleId="PageBreak" w:type="paragraph"><w:name w:val="PageBreak" /><w:pPr><w:pageBreakBefore w:val="on" /></w:pPr></w:style>'+xmlTempleteString.substring(xmlTempleteString.indexOf('<w:styles>')+'<w:styles>'.length);
                    //}
                    
                    var xmlWsectTag = xmlTempleteString.substring(xmlTempleteString.indexOf('<wx:sect>'),(xmlTempleteString.indexOf('</wx:sect>')+'</wx:sect>'.length));                
                    console.log('xmlWsectTag '+xmlWsectTag);
                    
                    var sObjectRecordCound = 0;
                    var xmlBodyWithRecords = '';                     
                    for(var sobjIndex in sobjectRecordWrapperClassList){  
                        sObjectRecordCound++;                             
                        processValue += eachProcessValue/2;
                        component.set('v.processingBarStyle','width:'+processValue+'%;');
                        xmlBodyWithRecords += this.generateXmlFile(objectItagesMap,xmlWsectTag,parentObj,sobjectRecordWrapperClassList[sobjIndex],CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS,roleRespMap,spltySCEDetails);   
                        processValue += eachProcessValue/2;
                        component.set('v.processingBarStyle','width:'+processValue+'%;');
                        if(sObjectRecordCound > 0 && sObjectRecordCound < sobjectRecordWrapperClassList.length){
                            xmlBodyWithRecords += '<w:p><w:pPr><w:pStyle w:val="PageBreak" /></w:pPr></w:p>';
                        }
                    }                     
                    xmlTempleteString = xmlTempleteString.substring(0, xmlTempleteString.indexOf('<wx:sect>')+'<wx:sect>'.length)+xmlBodyWithRecords+xmlTempleteString.substring(xmlTempleteString.indexOf('</wx:sect>'));            
                    xmlTempleteString = xmlTempleteString.split('AMT_Service_Company_Type').join(tempType);
                    var tollFreeNo = roleRespMap['AMT_Template_Toll_Free_No'];
                    if(tollFreeNo !== null && tollFreeNo !== undefined){
                        xmlTempleteString = xmlTempleteString.split('AMT_Template_Toll_Free_No').join(tollFreeNo); 
                    }else{
                        xmlTempleteString = xmlTempleteString.split('AMT_Template_Toll_Free_No').join(''); 
                    } 
                    var accName = '';
                    var tempName = '';
                    if(sobjectRecordWrapperClassList[0].parentSobject != null && sobjectRecordWrapperClassList[0].parentSobject.Name != null){
                        tempName = sobjectRecordWrapperClassList[0].parentSobject.Name;
						accName = this.replaceXmlSpecialCharacters(tempName);                     
                    }                    
                    xmlTempleteString = xmlTempleteString.split('AMT_Service_Account_Name_Text').join(accName); 
                    console.log('End Account Template');
                    
                    var a = window.document.createElement('a');
                    a.href = window.URL.createObjectURL(new Blob([xmlTempleteString]));                    
                    //a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlTempleteString));
                    
                    templateName = 'AMT_'+tempType;
                    var today = new Date();                   
                    templateName = templateName+'_'+tempName;
                    templateName = templateName+'_'+$A.localizationService.formatDate(today, "MM/dd/YYYY");
                    //a.target = '_self';
                    a.download = templateName+'.doc';
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
    generateXmlFile : function(objectItagesMap,xmlWsectTag,parentObj,sobjectRecordWrapperClass,CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS,roleRespMap,spltySCEDetails) {        
        for(var objectName in objectItagesMap) {
            if (objectItagesMap.hasOwnProperty(objectName)) {   
                if(objectName != 'Policy_Information__r' &&  !(objectName == parentObj || objectName == 'Account')){                                                   
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
                    var totalRows =  this.returnChildRows(rowToReccurse,objectName,objectItagesMap[objectName],sobjectRecordWrapperClass.parentSobject,CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS,roleRespMap);
                   // if(objectName != null && objectName == 'Contacts'){
                     	totalRows += '<w:p><w:pPr><w:pStyle w:val="PageBreak" /></w:pPr></w:p>';   
                    //}                    
                    xmlWsectTag = xmlWsectTag.substring(0, stIdx)+totalRows+xmlWsectTag.substring(endIdx);                      
                }else{
                    if(objectName == 'AdvanceMemberShip'){
                        xmlWsectTag = this.setValuesToParentObject(objectItagesMap[objectName],xmlWsectTag,objectName,sobjectRecordWrapperClass.advanceMembShipObj,roleRespMap);
                    }else{
                        xmlWsectTag = this.setValuesToParentObject(objectItagesMap[objectName],xmlWsectTag,objectName,sobjectRecordWrapperClass.parentSobject,roleRespMap,spltySCEDetails);   
                    }  
                }
            }
        }
        return xmlWsectTag;
    },
    setValuesToParentObject : function(objectItagesSet,xmlWsectTag,parentObj,parentSobjectDetails,roleRespMap,spltySCEDetails){
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
                    var dateValue =  new Date(value);
                    value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()   
                }
                var replaceItagName = '%%'+parentObj+'.'+itag+'@@';
                if(replaceItagName === '%%Account.CM_SCE__r.UserRole.Name@@' && (value === null || value === undefined || value.length <= 0)){                                      
                    var index = xmlWsectTag.indexOf(replaceItagName);         
                    var startIndex = xmlWsectTag.lastIndexOf('<w:tr ',index);
                    var endIndex = xmlWsectTag.indexOf('</w:tr>',index);        
                                                    
                    if (startIndex == -1) {
                        startIndex = 0;
                    }                                  
                    
                    endIndex += '</w:tr>'.length;                    
                    var rowToDelete = xmlWsectTag.substring(startIndex, endIndex); 
                    xmlWsectTag = xmlWsectTag.split(rowToDelete).join('');
                }else if(replaceItagName === '%%Account.CM_SCE__r.UserRole.Name@@'){
                    value = 'Strategic Client Executive';
                    var resp = roleRespMap[value];
                    if(resp === null || resp === undefined){
                            resp = '';
                    }
                    xmlWsectTag = xmlWsectTag.split('Service_AMT_CMSCE_Responsibility').join(resp);
                }  
                
                if(replaceItagName === '%%Account.Specialty_SCE__c@@' && (value === null || value === undefined || value.length <= 0)){                                      
                    console.log('value if---',value);
                    var index = xmlWsectTag.indexOf(replaceItagName);         
                    var startIndex = xmlWsectTag.lastIndexOf('<w:tr ',index);
                    var endIndex = xmlWsectTag.indexOf('</w:tr>',index);        
                                                    
                    if (startIndex == -1) {
                        startIndex = 0;
                    }                                  
                    
                    endIndex += '</w:tr>'.length;                    
                    var rowToDelete = xmlWsectTag.substring(startIndex, endIndex); 
                    xmlWsectTag = xmlWsectTag.split(rowToDelete).join('');
                }else if(replaceItagName === '%%Account.Specialty_SCE__c@@'){
                     console.log('value else if---',value);
                    var role = 'Specialty Benefits, Strategic Client Executive';
                    var resp = roleRespMap[role];
                    var spltyPhone = spltySCEDetails['Phone'];
                    if(spltyPhone == undefined){
                       spltyPhone = ''; 
                    }
                     var spltyEmail = spltySCEDetails['Email'];
                    if(spltyEmail == undefined){
                       spltyEmail = ''; 
                    }
                    if(resp === null || resp === undefined){
                            resp = '';
                    }
                    
                    xmlWsectTag = xmlWsectTag.replace('Specialty_SCE',role);
                    xmlWsectTag = xmlWsectTag.split('Service_AMT_Specialty_SCE_Responsibility').join(resp);
                    xmlWsectTag = xmlWsectTag.replace('Specialty_SCE_Phone',spltyPhone);
                    xmlWsectTag = xmlWsectTag.replace('Specialty_SCE_Email',spltyEmail);
                    xmlWsectTag = xmlWsectTag.replace('%%Account.Specialty_SCE__c@@',spltySCEDetails['Name']);
                }                                                

                xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);                 
            }
        }        
        return xmlWsectTag;
    },
    returnChildRows : function(rowTemplet,objectName,replaceItags,parentSobjectDetails,CUSTOM_OBJECT_MAP,OBJECT_FILTER_RECORDS,roleRespMap) {
        var totalRows = '';                             
        var childReleationShipName = '';        
        debugger;
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
                        var dateValue =  new Date(value);                        
                        value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()   
                    } 
                    if(itag === 'Contact_Role__c'){
                        var resp = roleRespMap[value];
                        if(resp === null || resp === undefined){
                            resp = '';
                        }
                        eachRow = eachRow.split('Service_AMT_Contact_Responsibility').join(resp);
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
            if(objectName === 'Service_AMT__r'){
                rowTemplet = rowTemplet.split('Service_AMT_Contact_Responsibility').join('');
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
            value = value.replace(/\n/g,'<w:br/>');
            return value;
        }else{
            return '';
        }
    },
    generateAMTReferenceGuide_Template:function(component, event){
       console.log('generateAMTReferenceGuide_Template');
        console.log('ReferenceGuide list--',component.get("v.serviceAmtList"));
        var startValue = 10;
                    
        component.set('v.processingBarStyle','width:'+startValue+'%;');
         var processingBar = component.find('processingBar');
        for(var i in processingBar){
            $A.util.removeClass(processingBar[i], 'slds-hide');
            $A.util.addClass(processingBar[i], 'slds-show');
        }
        
        
         var action = component.get('c.getRefGuideTemplateInXML');	
        //alert('template Name '+component.find('objType').get('v.value'));
       console.log('=list--',component.get("v.serviceAmtList"))
        action.setParams({
            
            referenceGuideAmtList : component.get("v.serviceAmtList"),
            accId : component.get("v.accId")
           
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                  console.log('success******');
                var templateWrapper = response.getReturnValue();
                var processingBarValue = 20;
                var processValue = 20;
                var eachProcessValue = 20;
                var sobjectRecordWrapperClassList;
                component.set('v.processingBarStyle','width:'+processingBarValue+'%;');                
                if(templateWrapper != null){                   
                    var xmlTempleteString = templateWrapper.xmlString;
                    //var sobjectRecordWrapperClassList = templateWrapper.sobjectRecordWrapperClassList; 
                    //console.log('sobjectRecordWrapperClassList--',sobjectRecordWrapperClassList);
                    
                   // var parentObj = templateWrapper.parentObj;
                    var objectItagesMap = templateWrapper.objectItags;
                    var roleRespMap = templateWrapper.roleResp;
                    var acctCMSCEInfo = templateWrapper.cmsceInfo;
                    console.log('acctCMSCEInfo--',acctCMSCEInfo);
                    //var CUSTOM_OBJECT_MAP = templateWrapper.CUSTOM_OBJECT_MAP;
                    //var OBJECT_FILTER_RECORDS = templateWrapper.OBJECT_FILTER_RECORDS;
                    //var roleRespMap = templateWrapper.roleRespMap;
                    var recordsList = templateWrapper.sortedServiceAmtList;
                    //eachProcessValue = 80/recordsList.length;
                    console.log('templateWrapper---',templateWrapper);
                    console.log('recordsList--',recordsList)
                   // if(sobjectRecordWrapperClassList.length > 1){
                        xmlTempleteString = xmlTempleteString.substring(0,xmlTempleteString.indexOf('<w:styles>')+'<w:styles>'.length)+'<w:style w:styleId="PageBreak" w:type="paragraph"><w:name w:val="PageBreak" /><w:pPr><w:pageBreakBefore w:val="on" /></w:pPr></w:style>'+xmlTempleteString.substring(xmlTempleteString.indexOf('<w:styles>')+'<w:styles>'.length);
                    //}
                    
                    var xmlWsectTag = xmlTempleteString.substring(xmlTempleteString.indexOf('<wx:sect>'),(xmlTempleteString.indexOf('</wx:sect>')+'</wx:sect>'.length));                
                    //console.log('xmlWsectTag '+xmlWsectTag);
                    
                    var sObjectRecordCound = 0;
                    var xmlBodyWithRecords = '';                     
                    var xmlFile = this.generateXmlFileRG(objectItagesMap,xmlWsectTag,recordsList,roleRespMap,acctCMSCEInfo); 
                        
                     
                    if(xmlFile != null){
                        xmlBodyWithRecords += xmlFile;
                    xmlTempleteString = xmlTempleteString.substring(0, xmlTempleteString.indexOf('<wx:sect>')+'<wx:sect>'.length)+xmlBodyWithRecords+xmlTempleteString.substring(xmlTempleteString.indexOf('</wx:sect>'));            
                    //xmlTempleteString = xmlTempleteString.split('AMT_Service_Company_Type').join(tempType);
                   
                        var CompanyName = null;
                        if(recordsList.length <= 0  ){
                    		CompanyName = acctCMSCEInfo.Name;
                        }else{
                            CompanyName = recordsList[0]['Company__r']['Name'];
                        }
                   
                    
                    var a = window.document.createElement('a');
                    a.href = window.URL.createObjectURL(new Blob([xmlTempleteString]));                    
                    //a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlTempleteString));
                    
                    var templateName = 'AMTReferenceGuide'+'_'+CompanyName;
                    var today = new Date();                   
                    //templateName = templateName+'_'+tempName;
                    templateName = templateName+'_'+$A.localizationService.formatDate(today, "MM/dd/YYYY");
                    //a.target = '_self';
                    a.download = templateName+'.doc';
                    //a.name = templateName+'.xml';
                    
                    // Append anchor to body.
                    document.body.appendChild(a);
                    a.click();
                    
                    // Remove anchor from body
                    document.body.removeChild(a); 
                    
                    }
                    
                    
                }
                
                
                for(var i in processingBar){
                    $A.util.addClass(processingBar[i], 'slds-hide');
                    $A.util.removeClass(processingBar[i], 'slds-show');
                }
                
                var errorDailog = component.find('downLoadSuccess');
                for(var i in errorDailog){
                    $A.util.removeClass(errorDailog[i], 'slds-hide');
                    $A.util.addClass(errorDailog[i], 'slds-show');
                }                
            }else if (state === "INCOMPLETE") {                
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
    
    generateXmlFileRG : function(objectItagesMap,xmlWsectTag,sobjectRecordWrapperClass,roleRespMap,acctCMSCEInfo) {        
       console.log('xmlWsectTag--',xmlWsectTag);
        for(var objectName in objectItagesMap) {
            if (objectItagesMap.hasOwnProperty(objectName)) {   
                //if(objectName != 'Policy_Information__r' &&  !(objectName == parentObj || objectName == 'Account')){                                                   
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
                var eachRow = rowToReccurse;
                var replaceItags = objectItagesMap[objectName];
                var sObj = null;
                if(sobjectRecordWrapperClass.length <= 0  ){
                    sObj = acctCMSCEInfo;
                    console.log('inside null condition');
                    console.log('sObj---',sObj);
                    console.log(sObj.length);
                        if(sObj['CM_SCE__r'] != undefined){
                            console.log('inside second if of null condition');
                for(var itagIndex in replaceItags){              
                    var itag = replaceItags[itagIndex];
                    var splitItags = itag.split('.');
                    var value = '';
                    if(Array.isArray(splitItags)){
                        if(splitItags.length == 1){
                             if(itag == 'RoleDescription'){
                                    console.log('inside itag');
                                    value = roleRespMap['Strategic Client Executive'];
                                    console.log('value = ',value);
                             }else if(itag == 'First_Name__c'){
                                console.log('itag=',itag);
                                value = sObj['CM_SCE__r']['Name'];
                             }else if(itag == 'Contact_Role__c'){
                                console.log('itag=',itag);
                                value = 'Strategic Client Executive';
                             }else if(itag == 'Phone__c'){
                                console.log('itag=',itag);
                                value = sObj['CM_SCE__r']['Phone'];
                             }else if(itag == 'Email__c'){
                                console.log('itag=',itag);
                                value = sObj['CM_SCE__r']['Email'];
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
                        var dateValue =  new Date(value);                        
                        value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()   
                    } 
                    
                    eachRow = eachRow.split(replaceItagName).join(value); 
                    eachRow = eachRow.replace('<w:bottom w:val="single" w:sz="8" wx:bdrwidth="20" w:space="0" w:color="4F81BD"/>','<w:bottom w:val="nil"/>')
               		console.log('eachRow--->',eachRow);
                }
            }
                }else{
                    sObj = sobjectRecordWrapperClass[0];
                    console.log('inside list of records condition');
                    console.log('sObj---',sObj);
                if(sObj != null && sObj['Company__r']['CM_SCE__r']!= undefined){
                for(var itagIndex in replaceItags){              
                    var itag = replaceItags[itagIndex];
                    var splitItags = itag.split('.');
                    var value = '';
                    if(Array.isArray(splitItags)){
                        if(splitItags.length == 1){
                             if(itag == 'RoleDescription'){
                                    
                                    value = roleRespMap['Strategic Client Executive'];
                                    console.log('value = ',value);
                             }else if(itag == 'First_Name__c'){
                                console.log('itag=',itag);
                                 console.log('sObj value---',sObj['Company__r']['CM_SCE__r']);
                                value = sObj['Company__r']['CM_SCE__r']['Name'];
                             }else if(itag == 'Contact_Role__c'){
                                console.log('itag=',itag);
                                value = 'Strategic Client Executive';
                             }else if(itag == 'Phone__c'){
                                console.log('itag=',itag);
                                value = sObj['Company__r']['CM_SCE__r']['Phone'];
                             }else if(itag == 'Email__c'){
                                console.log('itag=',itag);
                                value =sObj['Company__r']['CM_SCE__r']['Email'];
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
                        var dateValue =  new Date(value);                        
                        value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()   
                    } 
                    
                    eachRow = eachRow.split(replaceItagName).join(value);                                     
                }
            }
                    
                    
                    
                }
                var returnxmlWsectTag = null;
                
				console.log('before if');               
                
                if(sobjectRecordWrapperClass.length > 0 || (sObj['CM_SCE__r'] != undefined && sobjectRecordWrapperClass.length <= 0)){
                console.log('inside if includes');
                    if(sobjectRecordWrapperClass.length > 0 && sobjectRecordWrapperClass[0]['Company__r']['CM_SCE__r']== undefined){
                       var firstRow = '';  
                    }else{
                		var firstRow = eachRow;
                    }
					
                    var totalchildRows =  this.returnChildRowsRG(rowToReccurse,objectName,objectItagesMap[objectName],sobjectRecordWrapperClass,roleRespMap,eachRow);
                   var totalRows = firstRow + totalchildRows;
               // var thickBlueLineAtEnd = '<w:tr wsp:rsidR="00A4147C" wsp:rsidRPr="00301A98" wsp:rsidTr="00A4147C"><w:tc><w:tcPr><w:tcW w:w="2655" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="C6D9F1"/><w:vAlign w:val="center"/></w:tcPr><w:p wsp:rsidR="00A4147C" wsp:rsidRPr="00301A98" wsp:rsidRDefault="00A4147C"><w:pPr><w:rPr><w:color w:val="4F81BD"/><w:sz w:val="20"/><w:sz-cs w:val="20"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="45" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="C6D9F1"/><w:vAlign w:val="center"/></w:tcPr><w:p wsp:rsidR="00A4147C" wsp:rsidRDefault="00A4147C"><w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:fareast="Times New Roman" w:h-ansi="Times New Roman" w:cs="Times New Roman"/><wx:font wx:val="Times New Roman"/><w:sz w:val="20"/><w:sz-cs w:val="20"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2850" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="C6D9F1"/><w:vAlign w:val="center"/></w:tcPr><w:p wsp:rsidR="00A4147C" wsp:rsidRDefault="00A4147C"><w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:fareast="Times New Roman" w:h-ansi="Times New Roman" w:cs="Times New Roman"/><wx:font wx:val="Times New Roman"/><w:sz w:val="20"/><w:sz-cs w:val="20"/></w:rPr></w:pPr></w:p></w:tc></w:tr>';
                         // totalRows = totalRows +   thickBlueLineAtEnd;
                
                                               
                    xmlWsectTag = xmlWsectTag.substring(0, stIdx)+totalRows+xmlWsectTag.substring(endIdx);                      
                	returnxmlWsectTag = xmlWsectTag;
                }
            }
        }
        return returnxmlWsectTag;
    },
    returnChildRowsRG : function(rowTemplet,objectName,replaceItags,parentSobjectDetails,roleRespMap,eachRow) {
        var totalRows = '';                             
        var childReleationShipName = '';
        console.log('inside child rows to recurse');
        console.log(objectName);
        console.log(replaceItags);
        console.log(parentSobjectDetails);
        var sObjectList = parentSobjectDetails;           
        console.log(rowTemplet);
        
        if(sObjectList != null){
            for(var sObjIndex in sObjectList){
                var sObj = sObjectList[sObjIndex];
                
                var eachRow = rowTemplet;
                for(var itagIndex in replaceItags){              
                    var itag = replaceItags[itagIndex];
                    var splitItags = itag.split('.');
                    var value = '';
                    if(Array.isArray(splitItags)){
                        if(splitItags.length == 1){
                             if(itag == 'RoleDescription'){
                                    console.log('inside itag');
                                    value = roleRespMap[sObj['Contact_Role__c']];
                                    console.log('value = ',value);
                             }else{
                             if(sObj[itag] != null){
                                console.log('itag=',itag);
                                value = sObj[itag];
                                }
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
                        var dateValue =  new Date(value);                        
                        value = (dateValue.getMonth() + 1) + '/' + dateValue.getDate() + '/' +  dateValue.getFullYear()   
                    } 
                    
                    eachRow = eachRow.split(replaceItagName).join(value); 
                    console.log(sObjIndex);
                    console.log(sObjectList.length);
                    if(sObjIndex == (sObjectList.length) - 1){
                        console.log('inside last row');
						eachRow = eachRow.replace('<w:bottom w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="002677"/>','<w:bottom w:val="nil"/>')
                       //console.log('last row---',eachRow);   
                    }
                } 
                totalRows += eachRow;                   
            }
        }
        return totalRows; 
    },

})