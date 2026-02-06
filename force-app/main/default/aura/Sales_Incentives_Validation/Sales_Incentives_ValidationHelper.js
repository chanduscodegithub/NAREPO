({
    /*getUserInfo : function(component, event) { 
            
            var action = component.get("c.getLoggedInUerRoleInfo");
            action.setCallback(this,function(response) {
                var state = response.getState();
                if(state === "SUCCESS") {
                    component.set("v.isLoggedInUserAnAdmin", response.getReturnValue());
                    
                }
                else if( state === "ERROR") {
                    
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
            $A.enqueueAction(action);
        },*/
    
    
    
    getRenewalStatus1 : function(component, event) {
        
        var tableLoadingSpinner = component.find("tableLoadingSpinner");
        $A.util.removeClass(tableLoadingSpinner, 'slds-hide');
        $A.util.addClass(tableLoadingSpinner, 'slds-show');
        
        var renewalStatusList=component.get('v.renewalStatusList');
        
        //var dt=renewalStatusList[0].Year__c;
        //var year=new Date(dt).getFullYear();
        
        var action = component.get("c.getRenewalStatus");
        action.setParams({
            //accountId : component.get('v.recordId')           
            accountId:component.get('v.accountId'),
            //year:year
            year:component.get('v.salesCycle'),
            isLoggedInUserAnAdmin:component.get('v.isLoggedInUserAnAdmin') 
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            if(response.getState() === "SUCCESS") {
                
                var salesIncentivesObj = response.getReturnValue();
                //component.set("v.renewalStatusList", salesIncentivesObj.renewalStatusList);
                component.set("v.picklistFieldsMapData", salesIncentivesObj.picklistFieldsMap);
                component.set("v.accountId", salesIncentivesObj.accountId);
                console.log("WILL SALES INCENTIVES BE SPLIT ----------- "+salesIncentivesObj.picklistFieldsMap);
                if(salesIncentivesObj.renewalStatusList.length==0)
                {
                    component.set("v.isRenewalStatusListEmpty", true);
                }
                else
                {
                    component.set("v.isRenewalStatusListEmpty", false);
                }
                
                /*var sortOrder=['Medical','Pharmacy','Dental','Vision','Financial Protection'
                                   ,'Stop Loss','Financial Accounts','Group Retiree (URS)'];*/
                var renewalStatusProductTypesDisplayOrder=$A.get("$Label.c.RenewalStatus_ProductTypes_DisplayOrder");
                var sortOrder=renewalStatusProductTypesDisplayOrder.split(',');
                
                /*var sortedRenewalStatusList=this.sortRecords(salesIncentivesObj.renewalStatusList
                                                                 ,'Name',sortOrder);*/
                var sortedRenewalStatusList=this.sortRecords(salesIncentivesObj.renewalStatusList
                                                             ,'Product_Line__c',sortOrder);
                
                component.set("v.renewalStatusList", sortedRenewalStatusList);
                
            } else if( response .getState() === "ERROR") {
                
                alert('Error :'+response.getError()[0].message);
            }
            $A.util.removeClass(tableLoadingSpinner, 'slds-show');
            $A.util.addClass(tableLoadingSpinner, 'slds-hide');
            
            
            
        });
        $A.enqueueAction(action);
    },
    updateRenewalStatusRecords : function (component, event, renewalStatusListTobeUpdated){
        var tableLoadingSpinner = component.find("tableLoadingSpinner");
        $A.util.removeClass(tableLoadingSpinner, 'slds-hide');
        $A.util.addClass(tableLoadingSpinner, 'slds-show')
        
        // var dt=renewalStatusListTobeUpdated[0].Year__c;
        //var year=new Date(dt).getFullYear();
        
        var action = component.get("c.updateRenewalStatusRecords");
        action.setParams({
            renewalStatusRecordsTobeUpdated : renewalStatusListTobeUpdated,
            accountId:component.get('v.accountId'),
            //accountId:'001g00000220DApAAM',
            //year:year
            year:component.get('v.salesCycle'),
            isLoggedInUserAnAdmin:component.get('v.isLoggedInUserAnAdmin') 
            
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            if(state === "SUCCESS") {
                
                var salesIncentivesChildComp = component.find('renewalStatusAuraId');        
                
                if(Array.isArray(salesIncentivesChildComp)) {
                    for(var i=0;i<salesIncentivesChildComp.length;i++) {
                        salesIncentivesChildComp[i].set('v.isEdit', false);
                    } 
                }
                else
                {
                    salesIncentivesChildComp.set('v.isEdit', false);
                }
                
                var salesIncentivesObj = response.getReturnValue();
                //component.set("v.renewalStatusList", salesIncentivesObj.renewalStatusList);
                component.set("v.picklistFieldsMapData", salesIncentivesObj.picklistFieldsMap);
                component.set("v.accountId", salesIncentivesObj.accountId);
                
                if(salesIncentivesObj.renewalStatusList.length==0)
                {
                    component.set("v.isRenewalStatusListEmpty", true);
                }
                else
                {
                    component.set("v.isRenewalStatusListEmpty", false);
                }
                
                /*var sortOrder=['Medical','Pharmacy','Dental','Vision','Financial Protection'
                                   ,'Stop Loss','Financial Accounts','Retiree'];*/
                var renewalStatusProductTypesDisplayOrder=$A.get("$Label.c.RenewalStatus_ProductTypes_DisplayOrder");
                var sortOrder=renewalStatusProductTypesDisplayOrder.split(',');
                
                /*var sortedRenewalStatusList=this.sortRecords(salesIncentivesObj.renewalStatusList
                                                                 ,'Name',sortOrder);*/
                var sortedRenewalStatusList=this.sortRecords(salesIncentivesObj.renewalStatusList
                                                             ,'Product_Line__c',sortOrder);
                
                component.set("v.renewalStatusList", sortedRenewalStatusList);
                component.set("v.rsDataBeforeSave",renewalStatusListTobeUpdated); //SAMARTH - for getting data before save
                
            } else if( state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            $A.util.removeClass(tableLoadingSpinner, 'slds-show');
            $A.util.addClass(tableLoadingSpinner, 'slds-hide');
            
            component.find('editBtn').set("v.disabled", false);
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
            component.find('printBtn').set("v.disabled", false);
            component.set("v.enableSelectAllCheckBox",false);
            component.set("v.selectAllCheckBoxValue",false);
            
        });
        $A.enqueueAction(action);
    },
    
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    
    
    sortRecords: function (renewalStatusListTobeSorted,sortBy,sortOrder)
    {
        var sortedrenewalStatusList=[];
        var renewalStatusRecordsMap={};
        for(var i in renewalStatusListTobeSorted)
        {
            renewalStatusRecordsMap[renewalStatusListTobeSorted[i][sortBy]]=renewalStatusListTobeSorted[i];
        } 
        for(var i in sortOrder)
        {
            if(renewalStatusRecordsMap.hasOwnProperty(sortOrder[i]))
            {
                sortedrenewalStatusList.push(renewalStatusRecordsMap[sortOrder[i]]);
            }
            
            
        }
        return sortedrenewalStatusList;        
    },
    
    
    exportRecord: function(component, event, helper){
        //event.stopPropagation();
        var tableLoadingSpinner = component.find("tableLoadingSpinner");
        $A.util.removeClass(tableLoadingSpinner, 'slds-hide');
        $A.util.addClass(tableLoadingSpinner, 'slds-show');
        
        var generateAction = component.get('c.getTemplateInXML');
        generateAction.setParams({
            "accntId" : component.get("v.accountId"),
            "salesCycle" : component.get("v.salesCycle")
        });
        
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                var renewalStatusRecordCount=responseData.renewalStatusFinalData.length;
                if(renewalStatusRecordCount== 0)
                {
                    $A.util.removeClass(tableLoadingSpinner, 'slds-show');
                    $A.util.addClass(tableLoadingSpinner, 'slds-hide');
                    helper.showToast('No records to print',' ');
                }
                else
                {
                    helper.generateXmlFile(component,responseData.objectItags,responseData.xmlString,responseData.renewalStatusFinalData,responseData.FieldSetMap);
                }
            }
            else if (state === "INCOMPLETE") {   
                console.log('Incomplete');
            }
                else if (state === "ERROR") {                    
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + errors[0].message);
                            $A.util.removeClass(spinner, 'slds-show');
                            $A.util.addClass(spinner, 'slds-hide');
                            helper.showToast('No RenewalStatus records found',' ');
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(generateAction); 
        
    },
    
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,renewalStatusFinalData,FieldSetMap) { 
        var tableLoadingSpinner = component.find("tableLoadingSpinner");
        var HeaderData = renewalStatusFinalData[0];
        var accountName = HeaderData["Company__r"]["Name"];
        var salesCycle = HeaderData["Sales_Cycle__c"];
        var salesCycleSplitByCommaStr=salesCycle.split(',')[1].trim(); 
        var salesCycleDateFormatted=this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
        var salesCycleValue=salesCycle.split(',')[0]+', '+salesCycleDateFormatted;
        
        var salesCycleToYear=new Date(salesCycleSplitByCommaStr).getFullYear();
        var salesCycleForSheetName=salesCycle.split(',')[0]+','+salesCycleToYear;
        
        
        var xmlTempleteString ='';
        var rowCount = 3;
        for(var objectName in objectItagesMap) 
        {
            if (objectItagesMap.hasOwnProperty(objectName)) 
            {
                if(objectName=='Header')
                {
                    for(var k in objectItagesMap[objectName])
                    {
                        
                        
                        var key = objectItagesMap[objectName][k].split('.')[1];
                        var objectName1=objectItagesMap[objectName][k].split('.')[0];
                        var replaceItagName = '%%'+objectName+'.'+objectName1+'.'+key+'@@';
                        var value='';
                        
                        if(key.indexOf('__r')!== -1)
                        {
                            var relatedObj = HeaderData[key];;
                            if(relatedObj!=null)
                            {
                                value= relatedObj.Name;
                                
                            }
                            
                        }
                        
                        
                        /*else if(key == 'EffectiveDate__c'){
                                value = this.convertDateFormat(HeaderData[objectName][key]);
                            }*/
                        else {
                            value= HeaderData[key];
                        }
                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);
                        
                        
                        
                        xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                    }
                    
                } else {
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
                    var renewalStatusProductTypesDisplayOrder=$A.get("$Label.c.RenewalStatus_ProductTypes_DisplayOrder");
                    var sortOrder=renewalStatusProductTypesDisplayOrder.split(',');
                    /*renewalStatusFinalData=this.sortRecords(renewalStatusFinalData
                                                                 ,'Name',sortOrder);*/
                    renewalStatusFinalData=this.sortRecords(renewalStatusFinalData
                                                            ,'Product_Line__c',sortOrder);
                    
                    xmlTempleteString =  this.returnChildRows(component,rowToReccurse,xmlWsectTag,renewalStatusFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap,rowCount);
                }
                
            }
        }
        var sheetName='RenewalStatus '+salesCycleForSheetName;
        xmlTempleteString=xmlTempleteString.split("##sheetName@@").join(sheetName);
        var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
        var JsonData = this.xmlToJson(xmlDOM);
        var today = this.formatDate('');
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
        //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
        hiddenElement.target = '_self'; // 
        hiddenElement.download = 'Renewal Status '+salesCycleValue+' '+accountName+' '+today+'.xls'; 
        document.body.appendChild(hiddenElement); // Required for FireFox browser
        $A.util.removeClass(tableLoadingSpinner, 'slds-show');
        $A.util.addClass(tableLoadingSpinner, 'slds-hide');
        
        
        hiddenElement.click();
        this.showToast('Renewal Status records exported successfully ','');
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
    
    returnChildRows:function(component,rowToReccurse,xmlWsectTag,renewalStatusFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap,rowCount){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        for(var i in renewalStatusFinalData){
            var eachRow = rowToReccurse;
            count = count+1;
            rowCount = rowCount+1;
            /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
                eachRow = eachRow.split(replaceItagName).join(count);*/
            for(var k in objectItagesMap[objectName]){
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value='';
                var FieldSetVal=FieldSetMap[key];
                if(key.indexOf('__r')!== -1)
                {
                    var relatedObj = renewalStatusFinalData[i][key];
                    if(relatedObj!=null)
                    {
                        value= relatedObj.Name;
                        
                    }
                    
                }
                if(key=='Product_Confirmed__c'){
                    if(this.isPrdctTypeEnabledForPrdctDtl(renewalStatusFinalData[i]['Product_Line__c'])){
                        value= renewalStatusFinalData[i][key];
                    }
                }
                else if(key=='Will_sales_incentives_be_split__c'){
                    if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes' &&
                       this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']) &&
                      renewalStatusFinalData[i]['Submit_For_Sales_Incentives__c']==true){
                        value= renewalStatusFinalData[i][key];
                    }
                }
                else if(key=='Sales_person_1__r'){
                    if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==undefined
                       || renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='' ||
                       renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==null){
                        value='';
                    }
                    else if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes' &&
                       this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']) &&
                      renewalStatusFinalData[i]['Submit_For_Sales_Incentives__c']==true &&
                      (renewalStatusFinalData[i]['Will_sales_incentives_be_split__c']=='Yes' || 
                      renewalStatusFinalData[i]['Will_sales_incentives_be_split__c']=='No')){
							//data has already set
                    }
                    else{
                        value='';
                    }
                }
                else if(key=='Sales_Person_1_split_percentage__c'){
                    if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes' &&
                       this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']) &&
                      renewalStatusFinalData[i]['Submit_For_Sales_Incentives__c']==true &&
                      (renewalStatusFinalData[i]['Will_sales_incentives_be_split__c']=='Yes' || 
                      renewalStatusFinalData[i]['Will_sales_incentives_be_split__c']=='No')){
							value= renewalStatusFinalData[i][key];
                    }
                }
                else if(key=='Sales_Person_2__r'){
                    if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==undefined
                       || renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='' ||
                       renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==null){
                        value='';
                    }
                    else if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes' &&
                       this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']) &&
                      renewalStatusFinalData[i]['Submit_For_Sales_Incentives__c']==true &&
                      renewalStatusFinalData[i]['Will_sales_incentives_be_split__c']=='Yes'){
							//data has already set
                    }
                    else{
                        value='';
                    }
                }
                else if(key=='Sales_Person_2_Split_percentage__c'){
                    if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes' &&
                       this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']) &&
                      renewalStatusFinalData[i]['Submit_For_Sales_Incentives__c']==true &&
                      renewalStatusFinalData[i]['Will_sales_incentives_be_split__c']=='Yes'){
							value= renewalStatusFinalData[i][key];
                    }
                    
                }
                else if(key=='Date_Submitted_For_Incentives__c'){
                    if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes' &&
                       this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']) &&
                      renewalStatusFinalData[i]['Submit_For_Sales_Incentives__c']==true){
							value= renewalStatusFinalData[i][key];
                    }
                    
                }
                else{
                    value= renewalStatusFinalData[i][key];
                }
                
                
                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);
                if(value != '' && FieldSetMap[key] != undefined && FieldSetMap[key] != null ){
                    if(FieldSetMap[key].type == 'DATETIME'){
                        
                        /*var formattedDateArray = value.split('T')[0];
                            var time = value.split('T')[1].slice(0,8);
                            if(formattedDateArray.includes('-')){
                                var formattedDate = formattedDateArray.split('-');
                                var date =  formattedDate[2].startsWith(0) ? formattedDate[2].substring(1) : formattedDate[2]
                                var month = formattedDate[1].startsWith(0) ? formattedDate[1].substring(1) : formattedDate[1]
                                var year =  formattedDate[0].substring(2);
                                //var year =  formattedDateArray[0];
                                value = month+'/'+date+'/'+year;
                            }
                            //var year =  formattedDateArray[0];
                            value = value+' '+time;*/
                        var loggedInUserInfoObj=component.get("v.loggedInUserInfoObj");
                        //var dtTm = new Date(value).toLocaleString("en-US", {timeZone: component.get("v.loggedInUserTimeZone")});
                        var dtTm = new Date(value).toLocaleString("en-US", {timeZone: loggedInUserInfoObj.loggedInUserTimeZone});
                        dtTm = new Date(dtTm);
                        value=dtTm.toLocaleString();
                        
                        value=this.formatDateTime(value);
                        
                        
                    }else if(FieldSetMap[key].type == 'DATE'){
                        value = this.convertateFormat(value);
                    }
                        else if(FieldSetMap[key].type == 'BOOLEAN'){
                            //value = renewalStatusFinalData[i][key] == true ? 'Yes' : 'No';
                            value = renewalStatusFinalData[i][key] == true ? 'Yes' : '';
                            if(key=='Submit_For_Sales_Incentives__c')
                            {
                                if((renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==undefined
                                       || renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='' ||
                                  renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==null)
                                  &&
                                   (renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']==undefined 
                                   || renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']==''
                                   || renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']==null)){
                                    value='';
                                }
                                else if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==undefined
                                       || renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='' ||
                                        renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']==null){
                                 
                                   if(this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c'])  ){
                                    value='NA';
                                   }
                                    else{
                                       value=''; 
                                    }
                                }
                                else if(renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='Yes'){
                                    if(this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c'])){
                                        //data has already set
                                    }
                                    else{
                                        value='';
                                    }
                                    
                                }
                                else if((renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']!=undefined &&
                                    renewalStatusFinalData[i]['Eligible_for_Sales_Incentives__c']=='No')&&
                                   (renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']!=undefined && this.isRenewalConfirmed(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c'])  ) )
                                {
                                    value='NA';
                                }
                                if(renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']!=undefined && renewalStatusFinalData[i]['Renewal_Confirmed_Members_Sale__c']=='No-Full Cancel')
                                {
                                    value='NA';
                                }
                                
                            }
                            
                        }
                    
                    
                    
                }
                
                eachRow = eachRow.split(replaceItagName).join(value); 
            }
            
            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx)+totalRows+xmlWsectTag.substring(endHeaderIdx);
        xmlWsectTag = xmlWsectTag.split('##rownumber@@').join(rowCount);
        return xmlWsectTag;
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
    formatDate:function(inputDate) {
        
        if(inputDate=='' || inputDate==undefined)
        {
            var dateToFormat = new Date();
        }
        else
        {
            var dateToFormat=new Date(inputDate); 
        }
        var dd = dateToFormat.getDate();
        var mm = dateToFormat.getMonth() + 1; //January is 0!
        var yyyy = dateToFormat.getFullYear();
        
        if (dd < 10) {
            dd = '0' + dd;
        }
        
        if (mm < 10) {
            mm = '0' + mm;
        }
        
        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = yyyy+''+mm+''+dd;
        return dateToFormat;
    },
    
    formatDateWithHyphenSeparate:function(inputDate) {
        
        if(inputDate=='' || inputDate==undefined)
        {
            var dateToFormat = new Date();
        }
        else
        {
            var dateToFormat=new Date(inputDate); 
        }
        var dd = dateToFormat.getDate();
        var mm = dateToFormat.getMonth() + 1; //January is 0!
        var yyyy = dateToFormat.getFullYear();
        
        if (dd < 10) {
            dd = '0' + dd;
        }
        
        if (mm < 10) {
            mm = '0' + mm;
        }
        
        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = yyyy+'-'+mm+'-'+dd;
        return dateToFormat;
    },
    
    
    convertDate : function(date){
        if(date != null && date != undefined && date != ''){
            var dateArray = date.split('T');
            var timeArray = dateArray[1].split('.000Z');
            return dateArray[0] + ' ' + timeArray[0];
        } else {
            return '';
        }
    },
    convertDateFormat : function(date){
        if(date != null && date != undefined && date != ''){
            var formattedDateArray = date.split('-');
            var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
            var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
            var year =  formattedDateArray[0];
            date = month+'/'+date+'/'+year;
            return date;
        }else{
            return '';
        }
    },
    
    
    selectAll1: function(component, event, helper){
        
        var selectAllCheckBoxValue=component.find('selectAll').get('v.value');
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");  
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var existingReadyToSendCheckedRecordsMap=component.get("v.existingReadyToSendCheckedRecordsMap");
        var renewalStatusList=component.get("v.renewalStatusList");
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        
        
        var firstRecordIndex;
        if(firstRecordFromWhichDataFlows!=undefined){
            for(var k in renewalStatusList){
                if(renewalStatusList[k].Id == firstRecordFromWhichDataFlows.Id) {
                    //firstRecordFromWhichDataFlows= renewalStatusList[k];
                    firstRecordIndex=k;
                    break;  
                }  
            }
        }
        
        if(selectAllCheckBoxValue==true)
        {
            if(firstRecordFromWhichDataFlows!=undefined
               && firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c==true)
            {
                if(selectAllReadyToSendRecordsMap!=undefined)
                {
                    for(var i in renewalStatusList)
                    {
                        if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined)
                        {
                            var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                            /*if(Array.isArray(salesIncentivesChildComp)) {
                                salesIncentivesChildComp=salesIncentivesChildComp[i];
                            }
                            else
                            {
                                salesIncentivesChildComp=salesIncentivesChildComp;
                                
                            }*/
                            renewalStatusList[i].Submit_For_Sales_Incentives__c=true;
                            renewalStatusList[i].Will_sales_incentives_be_split__c=firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined && firstRecordFromWhichDataFlows.Sales_person_1__c!='' 
                               && firstRecordFromWhichDataFlows.Sales_person_1__c!=null)
                            {
                                this.setSalesPerson1(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                                renewalStatusList[i].Sales_person_1__c=firstRecordFromWhichDataFlows.Sales_person_1__c;
                            }
                            
                            if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined && firstRecordFromWhichDataFlows.Sales_Person_2__c!='' 
                               && firstRecordFromWhichDataFlows.Sales_Person_2__c!=null)
                            {
                                this.setSalesPerson2(salesIncentivesChildComp,i);
                                
                                salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                                renewalStatusList[i].Sales_Person_2__c=firstRecordFromWhichDataFlows.Sales_Person_2__c;
                            }
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                        
                        
                    }
                    
                }
                
            }
            else if(firstRecordFromWhichDataFlows!=undefined
                    && firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c!=true)
            {
                if(firstRecordFromWhichDataFlows.Eligible_for_Sales_Incentives__c=='Yes' && firstRecordFromWhichDataFlows.Renewal_Confirmed_Members_Sale__c!=undefined &&
                   this.isRenewalConfirmed(firstRecordFromWhichDataFlows.Renewal_Confirmed_Members_Sale__c) ){
                    firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=true;
                }
                for(var i in renewalStatusList)
                {
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined)
                    {
                        renewalStatusList[i].Submit_For_Sales_Incentives__c=true;
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                    }
                }
            }
            component.set("v.selectAllCheckBoxValue",true);
        }
        if(selectAllCheckBoxValue==false)
        {
            if(firstRecordFromWhichDataFlows!=undefined)
            {
                if(firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c==true
                   && firstRecordFromWhichDataFlows.Date_sent_to_ISI_Site__c==undefined
                   && (this.isMapEmpty(selectAllReadyToSendRecordsMap)==true))
                {
                    //should not uncheck the first record
                    firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=false;
                    firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c='';
                    if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        //this.clearSalesPerson1(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_person_1__c='';
                    if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        //this.clearSalesPerson2(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_Person_2__c='';
                    eachYearRenewalStatusRecordsTobeUpdatedMap[firstRecordFromWhichDataFlows.Id]=firstRecordFromWhichDataFlows;
                }
                else if(selectAllReadyToSendRecordsMap!=undefined && this.isMapEmpty(selectAllReadyToSendRecordsMap)==false)
                {
                    firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=false;
                    firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c='';
                    if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        //this.clearSalesPerson1(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_person_1__c='';
                    if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        //this.clearSalesPerson2(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_Person_2__c='';
                    eachYearRenewalStatusRecordsTobeUpdatedMap[firstRecordFromWhichDataFlows.Id]=firstRecordFromWhichDataFlows;
                    
                }
                var selectAllReadyToSendRecordsMapNew={};
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined)
                    {
                        renewalStatusList[i].Submit_For_Sales_Incentives__c=false;
                        renewalStatusList[i].Will_sales_incentives_be_split__c='';
                        renewalStatusList[i].Sales_Person_1_split_percentage__c='';
                        renewalStatusList[i].Sales_Person_2_Split_percentage__c='';
                        if(renewalStatusList[i].Sales_person_1__c!=undefined
                           && renewalStatusList[i].Sales_person_1__c!='')
                        {
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                        }
                        renewalStatusList[i].Sales_person_1__c='';
                        if(renewalStatusList[i].Sales_Person_2__c!=undefined
                           && renewalStatusList[i].Sales_Person_2__c!='')
                        {
                            this.clearSalesPerson2(salesIncentivesChildComp,i);
                        }
                        renewalStatusList[i].Sales_Person_2__c='';
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                    }
                    
                    if(renewalStatusList[i].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined &&
                       this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c!=true
                       && renewalStatusList[i].Id!=firstRecordFromWhichDataFlows.Id)
                    {
                        selectAllReadyToSendRecordsMapNew[renewalStatusList[i].Id]= false;
                        
                    }
                }
                component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMapNew);
            }
            component.set("v.selectAllCheckBoxValue",false);
        }
        component.set("v.renewalStatusList",renewalStatusList);
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
    },
    
    firstRecordDataChangeHelper1:function (component, event, helper) 
    {
        
        var editedRecordId = event.getParam('editedRecordId');
        var editedColumnName = event.getParam('editedColumnName');
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");  
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var existingReadyToSendCheckedRecordsMap=component.get("v.existingReadyToSendCheckedRecordsMap");
        var renewalStatusList=component.get("v.renewalStatusList");
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        //var editedFirstRecordFromWhichDataFlows=renewalStatusList.filter(element => element.Id == firstRecordFromWhichDataFlows.Id)[0];
        var editedFirstRecordFromWhichDataFlows={};
        var firstRecordIndex;
        if(!this.isMapEmpty(firstRecordFromWhichDataFlows)){
            for(var k in renewalStatusList){
                if(renewalStatusList[k].Id == firstRecordFromWhichDataFlows.Id) {
                    editedFirstRecordFromWhichDataFlows= renewalStatusList[k];
                    firstRecordIndex=k;
                    break;  
                }  
            }
        }
        if(editedColumnName=='Will_sales_incentives_be_split__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                            renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(renewalStatusList[i].Sales_person_1__c!=undefined
                               && renewalStatusList[i].Sales_person_1__c!='')
                            {
                                this.clearSalesPerson1(salesIncentivesChildComp,i);
                            }
                            if(renewalStatusList[i].Sales_Person_2__c!=undefined
                               && renewalStatusList[i].Sales_Person_2__c!='')
                            {
                                this.clearSalesPerson2(salesIncentivesChildComp,i);
                            }
                            if(editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c == 'Yes' || editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c == 'No')
                            {
                                this.setSalesPerson1(salesIncentivesChildComp,i);
                                //salesIncentivesChildComp[i].set("v.selectedRecordName" ,editedFirstRecordFromWhichDataFlows.Company__r.Owner.Name);
                                salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                            }
                            salesIncentivesChildComp[i].set("v.SearchKeyWord",'');
                            salesIncentivesChildComp[i].set("v.SearchKeyWord2",'');
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        } 
                    }
                }
            }
        }
        if(editedColumnName=='Sales_Person_1_split_percentage__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c != '')
                            {
                                
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
                            }
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c  > 100){
                                
                                $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            }
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
            }
        }
        if(editedColumnName=='Sales_Person_2_Split_percentage__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c != '')
                            {
                                
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
                            }
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c  > 100){
                                
                                $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                            }
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
            }
        }
        if(editedColumnName=='Sales_person_1__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                            this.setSalesPerson1(salesIncentivesChildComp,i);
                            salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"),'slds-has-error');
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
            }
        }
        
        
        if(editedColumnName=='clear_Sales_Person_1')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                            
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                            salesIncentivesChildComp[i].set("v.SearchKeyWord",null);
                            
                        }
                    }
                }
            }
        }
        
        if(editedColumnName=='clear_Sales_Person_2')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                            this.clearSalesPerson2(salesIncentivesChildComp,i); 
                            salesIncentivesChildComp[i].set("v.SearchKeyWord2",null);
                            
                        }
                    }
                }
            }
        }
        
        if(editedColumnName=='Sales_Person_2__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                            this.setSalesPerson2(salesIncentivesChildComp,i);
                            salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"),'slds-has-error');
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
            }
        }
        if(editedColumnName=='submitForSalesIncentives'){
            
            for(var i in renewalStatusList){
                var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                
                if(renewalStatusList[i].Id==editedRecordId && !this.isMapEmpty(editedFirstRecordFromWhichDataFlows)){
                    renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                    renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                    renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                    renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                    renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                    component.set("v.renewalStatusList",renewalStatusList);
                    if(editedFirstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && editedFirstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        this.setSalesPerson1(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                    }
                    if(editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        this.setSalesPerson2(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                    }
                    eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                }
            }
            
        }
        if(editedColumnName=='keyPressSalesPerson1')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"), 'slds-has-error');
                            
                        }
                    }
                }
            }
        }
        if(editedColumnName=='keyPressSalesPerson2')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"), 'slds-has-error');
                            
                            
                        }
                    }
                }
            }
        }
        
        if(editedColumnName=='Renewal_Confirmed_Members_Sale__c'){
            var firstRecordFromWhichDataFlows=undefined;
            for(var eachRecIndx in renewalStatusList){
                if(renewalStatusList[eachRecIndx].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined &&
                   this.isRenewalConfirmed(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c)
                  ){
                    
                    if(firstRecordFromWhichDataFlows==undefined && renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined)
                    {
                        firstRecordFromWhichDataFlows={};
                        firstRecordFromWhichDataFlows=renewalStatusList[eachRecIndx];
                    }
                }
            }
            if(firstRecordFromWhichDataFlows!=undefined)
            {
                if(selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id]!=undefined)
                {
                    delete selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id];
                }
                
            }
            
            component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
            
            
        } 
        
        component.set("v.renewalStatusList",renewalStatusList);
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
    },
    
    clearSalesPerson1:function(salesIncentivesChildComp,i)
    {
        $A.util.addClass(salesIncentivesChildComp[i].find("lookup-pill"), 'slds-hide');
        $A.util.removeClass(salesIncentivesChildComp[i].find("lookup-pill"), 'slds-show');
        
        $A.util.addClass(salesIncentivesChildComp[i].find("lookupField"), 'slds-show');
        $A.util.removeClass(salesIncentivesChildComp[i].find("lookupField"), 'slds-hide');
        
        $A.util.addClass(salesIncentivesChildComp[i].find("removeSearch"), 'slds-show');
        $A.util.removeClass(salesIncentivesChildComp[i].find("removeSearch"), 'slds-hide');
        
        
        
        
        $A.util.addClass(salesIncentivesChildComp[i].find("userLookUpField1"), 'slds-show');
        $A.util.removeClass(salesIncentivesChildComp[i].find("userLookUpField1"), 'slds-hide');
        
        salesIncentivesChildComp[i].set("v.SearchKeyWord",null);
    },
    
    clearSalesPerson2:function(salesIncentivesChildComp,i)
    {
        $A.util.addClass(salesIncentivesChildComp[i].find("lookup-pill2"), 'slds-hide');
        $A.util.removeClass(salesIncentivesChildComp[i].find("lookup-pill2"), 'slds-show');
        
        $A.util.addClass(salesIncentivesChildComp[i].find("lookupField2"), 'slds-show');
        $A.util.removeClass(salesIncentivesChildComp[i].find("lookupField2"), 'slds-hide');
        
        $A.util.addClass(salesIncentivesChildComp[i].find("removeSearchIcn"), 'slds-show');
        $A.util.removeClass(salesIncentivesChildComp[i].find("removeSearchIcn"), 'slds-hide');
        
        
        
        
        $A.util.addClass(salesIncentivesChildComp[i].find("userLookUpField2"), 'slds-show');
        $A.util.removeClass(salesIncentivesChildComp[i].find("userLookUpField2"), 'slds-hide');
        
        salesIncentivesChildComp[i].set("v.SearchKeyWord2",null);
    },
    setSalesPerson1:function(salesIncentivesChildComp,i){
        
        var removeHighlight = salesIncentivesChildComp[i].find("Sales_Person_1_User__c");
        $A.util.removeClass(removeHighlight,'slds-has-error');
        
        var forclose = salesIncentivesChildComp[i].find("lookup-pill");
        $A.util.removeClass(salesIncentivesChildComp[i].find("lookup-pill"), 'slds-hide');
        $A.util.addClass(salesIncentivesChildComp[i].find("lookup-pill"), 'slds-show');
        
        
        var forclose = salesIncentivesChildComp[i].find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
        
        var lookUpTarget = salesIncentivesChildComp[i].find("lookupField");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show');
        
        var lookUpTarget = salesIncentivesChildComp[i].find("removeSearch");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show');
        
        var userLookUpField1 = salesIncentivesChildComp[i].find("userLookUpField1");
        $A.util.addClass(userLookUpField1, 'slds-hide');
        $A.util.removeClass(userLookUpField1, 'slds-show');
    },
    setSalesPerson2:function(salesIncentivesChildComp,i){
        
        var removeHighlight2 = salesIncentivesChildComp[i].find("Sales_Person_2__c");
        $A.util.removeClass(removeHighlight2,'slds-has-error');
        
        var forclose = salesIncentivesChildComp[i].find("lookup-pill2");
        $A.util.removeClass(salesIncentivesChildComp[i].find("lookup-pill2"), 'slds-hide');
        $A.util.addClass(salesIncentivesChildComp[i].find("lookup-pill2"), 'slds-show');
        
        
        var forclose = salesIncentivesChildComp[i].find("searchRes2");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
        
        var lookUpTarget = salesIncentivesChildComp[i].find("lookupField2");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show');
        
        var lookUpTarget = salesIncentivesChildComp[i].find("removeSearch2");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show');
        
        var userLookUpField1 = salesIncentivesChildComp[i].find("userLookUpField2");
        $A.util.addClass(userLookUpField1, 'slds-hide');
        $A.util.removeClass(userLookUpField1, 'slds-show');
        
        var removeSearchIcn = salesIncentivesChildComp[i].find("removeSearchIcn");
        $A.util.addClass(removeSearchIcn, 'slds-hide');
    },
    
    isMapEmpty:function(map1)
    {
        var isMapEmpty=true;
        if(map1!=undefined)
        {
            for ( var key in map1 ) {
                isMapEmpty=false;
            }
        }
        
        return isMapEmpty;
    },
    
    
    
    selectAll: function(component, event, helper){
        
        var selectAllCheckBoxValue=component.find('selectAll').get('v.value');
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");  
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var renewalStatusList=component.get("v.renewalStatusList");
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        var isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk=false;
        var existingReadyToSendCheckedRecordsMap=component.get("v.existingReadyToSendCheckedRecordsMap");
        var firstRecordFromWhichDataFlowsBeforeRecordEdit=component.get("v.firstRecordFromWhichDataFlowsBeforeRecordEdit");
        
        //if(selectAllCheckBoxValue && this.isMapEmpty(firstRecordFromWhichDataFlows)
        if(selectAllCheckBoxValue)
        {
            firstRecordFromWhichDataFlows={};
            selectAllReadyToSendRecordsMap={};
            for(var eachRecIndx in renewalStatusList)
            {
                if(renewalStatusList[eachRecIndx].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined &&
                   this.isRenewalConfirmed(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c) 
                  )
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(this.isMapEmpty(firstRecordFromWhichDataFlows) && renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined)
                    {
                        firstRecordFromWhichDataFlows={};
                        firstRecordFromWhichDataFlows=renewalStatusList[eachRecIndx];
                        if(renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c==true)
                        {
                            // isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk=true;
                            
                        }
                    }
                    
                    else if(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined && this.isRenewalConfirmed(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c) 
                            && renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c!=true)
                    {
                        selectAllReadyToSendRecordsMap[renewalStatusList[eachRecIndx].Id]= false;
                        
                    }
                        else if(!this.isMapEmpty(existingReadyToSendCheckedRecordsMap))
                        {
                            if(renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c==true
                               && (renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined || renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==null
                                   || renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c=='')
                               && existingReadyToSendCheckedRecordsMap[renewalStatusList[eachRecIndx].Id]==undefined)
                            {
                                selectAllReadyToSendRecordsMap[renewalStatusList[eachRecIndx].Id]= false;
                                /*if(renewalStatusList[eachRecIndx].Will_sales_incentives_be_split__c!=undefined){
                                    renewalStatusList[eachRecIndx].Will_sales_incentives_be_split__c='';}
                                if(renewalStatusList[eachRecIndx].Sales_Person_1_split_percentage__c!=undefined){
                                    renewalStatusList[eachRecIndx].Sales_Person_1_split_percentage__c='';}
                                if(renewalStatusList[eachRecIndx].Sales_Person_2_Split_percentage__c!=undefined){
                                    renewalStatusList[eachRecIndx].Sales_Person_2_Split_percentage__c='';}
                                if(renewalStatusList[eachRecIndx].Sales_person_1__c!=undefined
                                   && renewalStatusList[eachRecIndx].Sales_person_1__c!='')
                                {
                                    this.clearSalesPerson1(salesIncentivesChildComp,eachRecIndx);
                                }
                                renewalStatusList[eachRecIndx].Sales_person_1__c='';
                                if(renewalStatusList[eachRecIndx].Sales_Person_2__c!=undefined
                                   && renewalStatusList[eachRecIndx].Sales_Person_2__c!='')
                                {
                                    this.clearSalesPerson2(salesIncentivesChildComp,eachRecIndx);
                                }
                                renewalStatusList[eachRecIndx].Sales_Person_2__c=''; */
                                
                            }
                            
                        }
                            else if(renewalStatusList[eachRecIndx].Submit_For_Sales_Incentives__c==true
                                    && (renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined || renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==null
                                        || renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c=='')){
                                selectAllReadyToSendRecordsMap[renewalStatusList[eachRecIndx].Id]= false;
                                /*if(renewalStatusList[eachRecIndx].Will_sales_incentives_be_split__c!=undefined){
                                    renewalStatusList[eachRecIndx].Will_sales_incentives_be_split__c='';}
                                if(renewalStatusList[eachRecIndx].Sales_Person_1_split_percentage__c!=undefined){
                                    renewalStatusList[eachRecIndx].Sales_Person_1_split_percentage__c='';}
                                if(renewalStatusList[eachRecIndx].Sales_Person_2_Split_percentage__c!=undefined){
                                    renewalStatusList[eachRecIndx].Sales_Person_2_Split_percentage__c='';}
                                if(renewalStatusList[eachRecIndx].Sales_person_1__c!=undefined
                                   && renewalStatusList[eachRecIndx].Sales_person_1__c!='')
                                {
                                    this.clearSalesPerson1(salesIncentivesChildComp,eachRecIndx);
                                }
                                renewalStatusList[eachRecIndx].Sales_person_1__c='';
                                if(renewalStatusList[eachRecIndx].Sales_Person_2__c!=undefined
                                   && renewalStatusList[eachRecIndx].Sales_Person_2__c!='')
                                {
                                    this.clearSalesPerson2(salesIncentivesChildComp,eachRecIndx);
                                }
                                renewalStatusList[eachRecIndx].Sales_Person_2__c='';*/
                                
                            }
                }    
            }
            if(!this.isMapEmpty(firstRecordFromWhichDataFlows))
            {
                if(selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id]!=undefined)
                {
                    delete selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id];
                }
                
            }
            
            component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
            //component.set("v.isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk",isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk);
            //component.set("v.renewalStatusList",renewalStatusList);
        }
        
        
        
        if(selectAllCheckBoxValue==true)
        {
            if(!this.isMapEmpty(firstRecordFromWhichDataFlows) && !this.isMapEmpty(selectAllReadyToSendRecordsMap)
               && firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c==true)
            {
                
                var firstRecordIndex;
                for(var k in renewalStatusList){
                    if(renewalStatusList[k].Id == firstRecordFromWhichDataFlows.Id){
                        //firstRecordFromWhichDataFlows= renewalStatusList[k];
                        firstRecordIndex=k;
                        break;  
                    }  
                }
                
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined)
                    {
                        
                        /*if(Array.isArray(salesIncentivesChildComp)) {
                                salesIncentivesChildComp=salesIncentivesChildComp[i];
                            }
                            else
                            {
                                salesIncentivesChildComp=salesIncentivesChildComp;
                                
                            }*/
                        	$A.util.removeClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                        	if(renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                        	{
                            	this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);

                        	}
                        		
                            renewalStatusList[i].Submit_For_Sales_Incentives__c=true;
                        
                        	var currentDateTime= new Date().toISOString();
                            renewalStatusList[i].Date_Submitted_For_Incentives__c=currentDateTime;
                        
                            renewalStatusList[i].Will_sales_incentives_be_split__c=firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined && firstRecordFromWhichDataFlows.Sales_person_1__c!='' 
                               && firstRecordFromWhichDataFlows.Sales_person_1__c!=null)
                            {
                                this.setSalesPerson1(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                                renewalStatusList[i].Sales_person_1__c=firstRecordFromWhichDataFlows.Sales_person_1__c;
                            }
                            
                            if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined && firstRecordFromWhichDataFlows.Sales_Person_2__c!='' 
                               && firstRecordFromWhichDataFlows.Sales_Person_2__c!=null)
                            {
                                this.setSalesPerson2(salesIncentivesChildComp,i);
                                
                                salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                                renewalStatusList[i].Sales_Person_2__c=firstRecordFromWhichDataFlows.Sales_Person_2__c;
                            }
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }                 
                    }    
            }
            if(!this.isMapEmpty(firstRecordFromWhichDataFlows)
               && firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c!=true)
            {
                
                firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=true;
                
                var currentDateTime= new Date().toISOString();
                firstRecordFromWhichDataFlows.Date_Submitted_For_Incentives__c=currentDateTime;
                
                if(!this.isMapEmpty(selectAllReadyToSendRecordsMap)){
                    for(var i in renewalStatusList)
                    {
                        var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                        
                        
                        if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined)
                        {
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                            if(renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                            {
                                this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);
                                
                            }
                            renewalStatusList[i].Submit_For_Sales_Incentives__c=true;
                            
                            var currentDateTime= new Date().toISOString();
                            renewalStatusList[i].Date_Submitted_For_Incentives__c=currentDateTime;
                            
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
                eachYearRenewalStatusRecordsTobeUpdatedMap[firstRecordFromWhichDataFlows.Id]=firstRecordFromWhichDataFlows;
                component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
            }
            component.set("v.selectAllCheckBoxValue",true);
        }
        if(selectAllCheckBoxValue==false)
        {
            
            if(!this.isMapEmpty(firstRecordFromWhichDataFlows) &&  firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c==true
               //&& component.get("v.isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk")==false
               && this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                if(this.isMapEmpty(firstRecordFromWhichDataFlowsBeforeRecordEdit)
                   || (!this.isMapEmpty(firstRecordFromWhichDataFlowsBeforeRecordEdit)
                       && firstRecordFromWhichDataFlowsBeforeRecordEdit.Id!=firstRecordFromWhichDataFlows.Id)){
                    //should not uncheck the first record
                    firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=false;
                    
                    firstRecordFromWhichDataFlows.Date_Submitted_For_Incentives__c='';
                    
                    firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c='';
                    if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        //this.clearSalesPerson1(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_person_1__c='';
                    if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        //this.clearSalesPerson2(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_Person_2__c='';
                    eachYearRenewalStatusRecordsTobeUpdatedMap[firstRecordFromWhichDataFlows.Id]=firstRecordFromWhichDataFlows;
                    component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
                    component.set("v.firstRecordFromWhichDataFlows",{});
                }
                else if(!this.isMapEmpty(firstRecordFromWhichDataFlowsBeforeRecordEdit)
                        && firstRecordFromWhichDataFlowsBeforeRecordEdit.Id==firstRecordFromWhichDataFlows.Id
                        && component.get("v.isFrstRcrdSbmtFrSlsIncntvChckdBfrSndAllChk")==false){
                    //should not uncheck the first record
                    firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=false;
                    firstRecordFromWhichDataFlows.Date_Submitted_For_Incentives__c='';
                    
                    firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c='';
                    if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        //this.clearSalesPerson1(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_person_1__c='';
                    if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        //this.clearSalesPerson2(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_Person_2__c='';
                    eachYearRenewalStatusRecordsTobeUpdatedMap[firstRecordFromWhichDataFlows.Id]=firstRecordFromWhichDataFlows;
                    component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
                    component.set("v.firstRecordFromWhichDataFlows",{});
                }
                
            }
            else if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                if(!this.isMapEmpty(firstRecordFromWhichDataFlows)){
                    firstRecordFromWhichDataFlows.Submit_For_Sales_Incentives__c=false;
                    firstRecordFromWhichDataFlows.Date_Submitted_For_Incentives__c='';
                    
                    firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c='';
                    firstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c='';
                    if(firstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        //this.clearSalesPerson1(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_person_1__c='';
                    if(firstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && firstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        //this.clearSalesPerson2(salesIncentivesChildComp,i);
                    }
                    firstRecordFromWhichDataFlows.Sales_Person_2__c='';
                    eachYearRenewalStatusRecordsTobeUpdatedMap[firstRecordFromWhichDataFlows.Id]=firstRecordFromWhichDataFlows;
                } 
                
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined)
                    {
                        renewalStatusList[i].Submit_For_Sales_Incentives__c=false;
                        renewalStatusList[i].Date_Submitted_For_Incentives__c='';
                        
                        renewalStatusList[i].Will_sales_incentives_be_split__c='';
                        renewalStatusList[i].Sales_Person_1_split_percentage__c='';
                        renewalStatusList[i].Sales_Person_2_Split_percentage__c='';
                        if(renewalStatusList[i].Sales_person_1__c!=undefined
                           && renewalStatusList[i].Sales_person_1__c!='')
                        {
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                        }
                        renewalStatusList[i].Sales_person_1__c='';
                        if(renewalStatusList[i].Sales_Person_2__c!=undefined
                           && renewalStatusList[i].Sales_Person_2__c!='')
                        {
                            this.clearSalesPerson2(salesIncentivesChildComp,i);
                        }
                        renewalStatusList[i].Sales_Person_2__c='';
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                    }
                    
                }
                component.set("v.selectAllReadyToSendRecordsMap",{});
                component.set("v.firstRecordFromWhichDataFlows",{});
            }
            
            
            component.set("v.selectAllCheckBoxValue",false);
        }
        component.set("v.renewalStatusList",renewalStatusList);
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
    },
    
    firstRecordDataChangeHelper2:function (component, event, helper) 
    {
        
        var editedRecordId = event.getParam('editedRecordId');
        var editedColumnName = event.getParam('editedColumnName');
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");  
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var existingReadyToSendCheckedRecordsMap=component.get("v.existingReadyToSendCheckedRecordsMap");
        var renewalStatusList=component.get("v.renewalStatusList");
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        //var editedFirstRecordFromWhichDataFlows=renewalStatusList.filter(element => element.Id == firstRecordFromWhichDataFlows.Id)[0];
        var editedFirstRecordFromWhichDataFlows={};
        var firstRecordIndex;
        if(!this.isMapEmpty(firstRecordFromWhichDataFlows)){
            for(var k in renewalStatusList){
                if(renewalStatusList[k].Id == firstRecordFromWhichDataFlows.Id) {
                    editedFirstRecordFromWhichDataFlows= renewalStatusList[k];
                    firstRecordIndex=k;
                    break;  
                }  
            }
        }
        if(editedColumnName=='Will_sales_incentives_be_split__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c)
                        {
                            this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);
                            //component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                        renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                        renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                        renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                        renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                        component.set("v.renewalStatusList",renewalStatusList);
                        if(renewalStatusList[i].Sales_person_1__c!=undefined
                           && renewalStatusList[i].Sales_person_1__c!='')
                        {
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                        }
                        if(renewalStatusList[i].Sales_Person_2__c!=undefined
                           && renewalStatusList[i].Sales_Person_2__c!='')
                        {
                            this.clearSalesPerson2(salesIncentivesChildComp,i);
                        }
                        if(editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c == 'Yes' || editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c == 'No')
                        {
                            this.setSalesPerson1(salesIncentivesChildComp,i);
                            //salesIncentivesChildComp[i].set("v.selectedRecordName" ,editedFirstRecordFromWhichDataFlows.Company__r.Owner.Name);
                            salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                        }
                        salesIncentivesChildComp[i].set("v.SearchKeyWord",'');
                        salesIncentivesChildComp[i].set("v.SearchKeyWord2",'');
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        
                    }
                }
            }
        }
        if(editedColumnName=='Sales_Person_1_split_percentage__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c)
                        {
                            this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                               && editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                            {
                                renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                                this.setSalesPerson2(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                            }
                            if(editedFirstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                               && editedFirstRecordFromWhichDataFlows.Sales_person_1__c!='')
                            {
                                renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                                this.setSalesPerson1(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                            }
                            
                            component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                        renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                        if(editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c != '')
                        {
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
                        }
                        if(editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c  > 100){
                            
                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                        }
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        
                    }
                }
            }
        }
        if(editedColumnName=='Sales_Person_2_Split_percentage__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c)
                        {
                            this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);
                            renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                               && editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                            {
                                renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                                this.setSalesPerson2(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                            }
                            if(editedFirstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                               && editedFirstRecordFromWhichDataFlows.Sales_person_1__c!='')
                            {
                                renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                                this.setSalesPerson1(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                            }
                            component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                        renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                        if(editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c != '')
                        {
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
                        }
                        if(editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c  > 100){
                            
                            $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                        }
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        
                    }
                }
            }
        }
        if(editedColumnName=='Sales_person_1__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c)
                        {
                            this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);
                            renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                               && editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                            {
                                renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                                this.setSalesPerson2(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                            }
                            component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                        this.setSalesPerson1(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                        $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"),'slds-has-error');
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        
                    }
                }
            }
        }
        
        
        if(editedColumnName=='clear_Sales_Person_1')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            
                            renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                            
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                            salesIncentivesChildComp[i].set("v.SearchKeyWord",null);
                            
                        }
                    }
                }
            }
        }
        
        if(editedColumnName=='clear_Sales_Person_2')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                            this.clearSalesPerson2(salesIncentivesChildComp,i); 
                            salesIncentivesChildComp[i].set("v.SearchKeyWord2",null);
                        }   
                        
                    }
                }
            }
        }
        
        if(editedColumnName=='Sales_Person_2__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c)
                        {
                            this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);
                            renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            component.set("v.renewalStatusList",renewalStatusList);
                            if(editedFirstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                               && editedFirstRecordFromWhichDataFlows.Sales_person_1__c!='')
                            {
                                renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                                this.setSalesPerson1(salesIncentivesChildComp,i);
                                salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                            }
                            component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                        this.setSalesPerson2(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                        $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"),'slds-has-error');
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        
                    }
                }
            }
        }
        if(editedColumnName=='submitForSalesIncentives'){
            
            for(var i in renewalStatusList){
                var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                
                if(renewalStatusList[i].Id==editedRecordId && !this.isMapEmpty(editedFirstRecordFromWhichDataFlows)){
                    renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                    renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                    renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                    renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                    renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                    component.set("v.renewalStatusList",renewalStatusList);
                    if(editedFirstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && editedFirstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        this.setSalesPerson1(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                    }
                    if(editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        this.setSalesPerson2(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                    }
                    eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                }
            }
            
        }
        if(editedColumnName=='keyPressSalesPerson1')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"), 'slds-has-error');
                        }  
                        
                    }
                }
            }
        }
        if(editedColumnName=='keyPressSalesPerson2')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c=='' || (firstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c=='' && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c && selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]==false ) ||
                           (renewalStatusList[i].Will_sales_incentives_be_split__c!='' && 
                            renewalStatusList[i].Will_sales_incentives_be_split__c==editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c))
                        {
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"), 'slds-has-error');
                            
                        }  
                        
                    }
                }
            }
        }
        
        if(editedColumnName=='Renewal_Confirmed_Members_Sale__c'){
            var firstRecordFromWhichDataFlows=undefined;
            for(var eachRecIndx in renewalStatusList){
                if(renewalStatusList[eachRecIndx].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined &&
                   this.isRenewalConfirmed(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c) 
                  ){
                    
                    if(firstRecordFromWhichDataFlows==undefined && renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined)
                    {
                        firstRecordFromWhichDataFlows={};
                        firstRecordFromWhichDataFlows=renewalStatusList[eachRecIndx];
                    }
                }
            }
            if(firstRecordFromWhichDataFlows!=undefined)
            {
                if(selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id]!=undefined)
                {
                    delete selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id];
                }
                
            }
            
            component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
            
            
        } 
        
        component.set("v.renewalStatusList",renewalStatusList);
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
    },
    
    clearManuallyEditedRecord:function (renewalStatusList,i,salesIncentivesChildComp){
        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined){
            renewalStatusList[i].Will_sales_incentives_be_split__c='';
            
        }
        $A.util.removeClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
        if(renewalStatusList[i].Sales_Person_1_split_percentage__c!=undefined){
            renewalStatusList[i].Sales_Person_1_split_percentage__c='';
            
           	
        }
        $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
        if(renewalStatusList[i].Sales_Person_2_Split_percentage__c!=undefined){
            renewalStatusList[i].Sales_Person_2_Split_percentage__c='';
            
        }
        $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
        if(renewalStatusList[i].Sales_person_1__c!=undefined
           && renewalStatusList[i].Sales_person_1__c!='')
        {
            
            this.clearSalesPerson1(salesIncentivesChildComp,i);
        }
        $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"), 'slds-has-error');
        renewalStatusList[i].Sales_person_1__c='';
        if(renewalStatusList[i].Sales_Person_2__c!=undefined
           && renewalStatusList[i].Sales_Person_2__c!='')
        {
            
            this.clearSalesPerson2(salesIncentivesChildComp,i);

        }
        $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"), 'slds-has-error');
        renewalStatusList[i].Sales_Person_2__c=''; 
        
    },
    
    firstRecordDataChangeHelper:function(component, event, helper){
        
        var editedRecordId = event.getParam('editedRecordId');
        var editedColumnName = event.getParam('editedColumnName');
        var selectAllReadyToSendRecordsMap=component.get("v.selectAllReadyToSendRecordsMap");  
        var firstRecordFromWhichDataFlows=component.get("v.firstRecordFromWhichDataFlows");
        var existingReadyToSendCheckedRecordsMap=component.get("v.existingReadyToSendCheckedRecordsMap");
        var renewalStatusList=component.get("v.renewalStatusList");
        var eachYearRenewalStatusRecordsTobeUpdatedMap= component.get("v.eachYearRenewalStatusRecordsTobeUpdatedMap");
        //var editedFirstRecordFromWhichDataFlows=renewalStatusList.filter(element => element.Id == firstRecordFromWhichDataFlows.Id)[0];
        var editedFirstRecordFromWhichDataFlows={};
        var firstRecordIndex;
        if(!this.isMapEmpty(firstRecordFromWhichDataFlows)){
            for(var k in renewalStatusList){
                if(renewalStatusList[k].Id == firstRecordFromWhichDataFlows.Id) {
                    editedFirstRecordFromWhichDataFlows= renewalStatusList[k];
                    firstRecordIndex=k;
                    break;  
                }  
            }
        }
        if(editedColumnName=='Will_sales_incentives_be_split__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c)
                        {
                            this.clearManuallyEditedRecord(renewalStatusList,i,salesIncentivesChildComp);
                            //component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                        renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                        renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                       
                        component.set("v.renewalStatusList",renewalStatusList);
                        if(renewalStatusList[i].Sales_person_1__c!=undefined
                           && renewalStatusList[i].Sales_person_1__c!='')
                        {
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                        }
                        if(renewalStatusList[i].Sales_Person_2__c!=undefined
                           && renewalStatusList[i].Sales_Person_2__c!='')
                        {
                            this.clearSalesPerson2(salesIncentivesChildComp,i);
                        }
                        
                        renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                        renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                        
                        if(editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c == 'Yes' || editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c == 'No')
                        {
                            this.setSalesPerson1(salesIncentivesChildComp,i);
                            //salesIncentivesChildComp[i].set("v.selectedRecordName" ,editedFirstRecordFromWhichDataFlows.Company__r.Owner.Name);
                            salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                            $A.util.removeClass(salesIncentivesChildComp[i].find('Will_sales_incentives_be_split__c'), 'slds-has-error');
                        }
                        salesIncentivesChildComp[i].set("v.SearchKeyWord",'');
                        salesIncentivesChildComp[i].set("v.SearchKeyWord2",'');
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        
                    }
                }
            }
        }
        if(editedColumnName=='Sales_Person_1_split_percentage__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if((renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                           && (renewalStatusList[i].Will_sales_incentives_be_split__c!='No')){
                            
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c != '')
                            {
                                
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
                            }
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c  > 100){
                                
                                $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                            }
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
            }
        }
        if(editedColumnName=='Sales_Person_2_Split_percentage__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        
                        if((renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                           && (renewalStatusList[i].Will_sales_incentives_be_split__c!='No')){    
                            renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                            renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c != '')
                            {
                                
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_1_split_percentage__c'), 'slds-has-error');
                                $A.util.removeClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'),'slds-has-error');
                            }
                            if(editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c  > 100){
                                
                                $A.util.addClass(salesIncentivesChildComp[i].find('Sales_Person_2_Split_percentage__c'), 'slds-has-error');
                            }
                            eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        }
                    }
                }
            }
        }
        if(editedColumnName=='Sales_person_1__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        
                        	if(renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!=''
                               && renewalStatusList[i].Will_sales_incentives_be_split__c=='No'){

                                if(renewalStatusList[i].Sales_person_1__c!=undefined
                                   && renewalStatusList[i].Sales_person_1__c!='')
                                {
                                    this.clearSalesPerson1(salesIncentivesChildComp,i);
                                }
                            component.set("v.renewalStatusList",renewalStatusList);
                        }
                        
                        if((renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')){
                        renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                        this.setSalesPerson1(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                        $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"),'slds-has-error');
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        } 
                    }
                }
            }
        }
        
        
        if(editedColumnName=='clear_Sales_Person_1')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                        {
                            
                            
                            renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                            
                            this.clearSalesPerson1(salesIncentivesChildComp,i);
                            salesIncentivesChildComp[i].set("v.SearchKeyWord",null);
                            
                        }
                    }
                }
            }
        }
        
        if(editedColumnName=='clear_Sales_Person_2')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if((renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                           && (renewalStatusList[i].Will_sales_incentives_be_split__c!='No'))
                        {
                            
                            renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                            this.clearSalesPerson2(salesIncentivesChildComp,i); 
                            salesIncentivesChildComp[i].set("v.SearchKeyWord2",null);
                        }   
                        
                    }
                }
            }
        }
        
        if(editedColumnName=='Sales_Person_2__c')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        
                        if((renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                           && (renewalStatusList[i].Will_sales_incentives_be_split__c!='No')){ 
                        renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                        this.setSalesPerson2(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                        $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"),'slds-has-error');
                        eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                        } 
                    }
                }
            }
        }
        if(editedColumnName=='submitForSalesIncentives'){
            
            for(var i in renewalStatusList){
                var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                
                if(renewalStatusList[i].Id==editedRecordId && !this.isMapEmpty(editedFirstRecordFromWhichDataFlows)){
                    renewalStatusList[i].Will_sales_incentives_be_split__c=editedFirstRecordFromWhichDataFlows.Will_sales_incentives_be_split__c;
                    renewalStatusList[i].Sales_Person_1_split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_1_split_percentage__c;
                    renewalStatusList[i].Sales_Person_2_Split_percentage__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2_Split_percentage__c;
                    renewalStatusList[i].Sales_person_1__c=editedFirstRecordFromWhichDataFlows.Sales_person_1__c;
                    renewalStatusList[i].Sales_Person_2__c=editedFirstRecordFromWhichDataFlows.Sales_Person_2__c;
                    component.set("v.renewalStatusList",renewalStatusList);
                    if(editedFirstRecordFromWhichDataFlows.Sales_person_1__c!=undefined
                       && editedFirstRecordFromWhichDataFlows.Sales_person_1__c!='')
                    {
                        this.setSalesPerson1(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecordName" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecordName"));
                    }
                    if(editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!=undefined
                       && editedFirstRecordFromWhichDataFlows.Sales_Person_2__c!='')
                    {
                        this.setSalesPerson2(salesIncentivesChildComp,i);
                        salesIncentivesChildComp[i].set("v.selectedRecord2Name" ,salesIncentivesChildComp[firstRecordIndex].get("v.selectedRecord2Name"));
                    }
                    eachYearRenewalStatusRecordsTobeUpdatedMap[renewalStatusList[i].Id]=renewalStatusList[i];
                }
            }
            
        }
        if(editedColumnName=='keyPressSalesPerson1')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if(renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='') 
                        {
                            
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_1_User__c"), 'slds-has-error');
                        }  
                        
                    }
                }
            }
        }
        if(editedColumnName=='keyPressSalesPerson2')
        {
            if(!this.isMapEmpty(selectAllReadyToSendRecordsMap))
            {
                for(var i in renewalStatusList)
                {
                    var salesIncentivesChildComp = component.find('renewalStatusAuraId');
                    if(selectAllReadyToSendRecordsMap[renewalStatusList[i].Id]!=undefined && renewalStatusList[i].Renewal_Confirmed_Members_Sale__c!=undefined
                       && this.isRenewalConfirmed(renewalStatusList[i].Renewal_Confirmed_Members_Sale__c)
                       && renewalStatusList[i].Submit_For_Sales_Incentives__c==true)
                    {
                        if((renewalStatusList[i].Will_sales_incentives_be_split__c!=undefined && renewalStatusList[i].Will_sales_incentives_be_split__c!='')
                           && (renewalStatusList[i].Will_sales_incentives_be_split__c!='No'))
                        {
                            
                            $A.util.removeClass(salesIncentivesChildComp[i].find("Sales_Person_2__c"), 'slds-has-error');
                            
                        }  
                        
                    }
                }
            }
        }
        
        if(editedColumnName=='Renewal_Confirmed_Members_Sale__c'){
            var firstRecordFromWhichDataFlows=undefined;
            for(var eachRecIndx in renewalStatusList){
                if(renewalStatusList[eachRecIndx].Eligible_for_Sales_Incentives__c=='Yes' && renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c!=undefined &&
                   this.isRenewalConfirmed(renewalStatusList[eachRecIndx].Renewal_Confirmed_Members_Sale__c) 
                  ){
                    
                    if(firstRecordFromWhichDataFlows==undefined && renewalStatusList[eachRecIndx].Date_sent_to_ISI_Site__c==undefined)
                    {
                        firstRecordFromWhichDataFlows={};
                        firstRecordFromWhichDataFlows=renewalStatusList[eachRecIndx];
                    }
                }
            }
            if(firstRecordFromWhichDataFlows!=undefined)
            {
                if(selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id]!=undefined)
                {
                    delete selectAllReadyToSendRecordsMap[firstRecordFromWhichDataFlows.Id];
                }
                
            }
            
            component.set("v.firstRecordFromWhichDataFlows",firstRecordFromWhichDataFlows);
            component.set("v.selectAllReadyToSendRecordsMap",selectAllReadyToSendRecordsMap);
            
            
        } 
        
        component.set("v.renewalStatusList",renewalStatusList);
        component.set("v.eachYearRenewalStatusRecordsTobeUpdatedMap",eachYearRenewalStatusRecordsTobeUpdatedMap);
        
    },
    
    formatDateTime:function(inputDateTime){
        var returnFormattedDateTime=inputDateTime;
        if(inputDateTime!=undefined && inputDateTime!=null && inputDateTime!=''){
            var dateTimeValueFormatted;
            var dateTimeSeparatedArray;
            var timeSeparatedArray;	
            if(inputDateTime.indexOf(',')!=-1){
                dateTimeSeparatedArray=inputDateTime.split(',');
                //dateTimeValueFormatted=dateTimeSeparatedArray[0]+' '+dateTimeSeparatedArray[1];
                //returnFormattedDateTime=dateTimeValueFormatted;
                dateTimeValueFormatted=dateTimeSeparatedArray[0]+' ';
                if(dateTimeSeparatedArray[1].indexOf(':')!=-1){
                    timeSeparatedArray= dateTimeSeparatedArray[1].split(':');
                    
                    var hr=timeSeparatedArray[0];
                    var mnt=timeSeparatedArray[1];
                    var period=timeSeparatedArray[2].split(' ')[1];
                    
                    dateTimeValueFormatted=dateTimeValueFormatted+
                        hr+':'+mnt+' '+period;
                    
					returnFormattedDateTime=dateTimeValueFormatted;
                }
            }
        }
        return returnFormattedDateTime;
    },
    
    isPrdctTypeEnabledForPrdctDtl:function(prdctLine){
      	var isprdctTypeEnabledForPrdctDtl=false;
       	var pdtTypesEnabledForPrdctDtlStr = $A.get("$Label.c.PdtsConfirmed_PdtTypes_ToBeEnabled"); 
        var pdtTypesEnabledForPrdctDtlLst=[];
        if(pdtTypesEnabledForPrdctDtlStr!='' && pdtTypesEnabledForPrdctDtlStr!=undefined 
           && pdtTypesEnabledForPrdctDtlStr!=null){
            if(pdtTypesEnabledForPrdctDtlStr.indexOf(',') !== -1){
                pdtTypesEnabledForPrdctDtlLst=pdtTypesEnabledForPrdctDtlStr.split(',');
            }
            else{
                pdtTypesEnabledForPrdctDtlLst = pdtTypesEnabledForPrdctDtlStr;
            }  
        }
        
        if(prdctLine!=undefined && prdctLine!=null && prdctLine!=''){
            for(var i in pdtTypesEnabledForPrdctDtlLst){
                if(prdctLine==pdtTypesEnabledForPrdctDtlLst[i]){
                 isprdctTypeEnabledForPrdctDtl=true;   
                }
            }
        }
        return isprdctTypeEnabledForPrdctDtl;
    },
    
    isRenewalConfirmed:function(renewalConfirmedValue){
        var isRenewalConfirmed=false;
     	var renewalStatusMemberSafeFieldTriggerValueStr = $A.get("$Label.c.Renewal_Status_MemberSafe_field_trigger_value"); 
       var renewalStatusMemberSafeFieldTriggerValueList=[];
        if(renewalStatusMemberSafeFieldTriggerValueStr!=undefined &&
         renewalStatusMemberSafeFieldTriggerValueStr!=null &&
          renewalStatusMemberSafeFieldTriggerValueStr!=''){
           if(renewalStatusMemberSafeFieldTriggerValueStr.indexOf('##') !== -1){
                renewalStatusMemberSafeFieldTriggerValueList=renewalStatusMemberSafeFieldTriggerValueStr.split('##');
            }
            else{
                renewalStatusMemberSafeFieldTriggerValueList = renewalStatusMemberSafeFieldTriggerValueStr;
            }  
       } 
        
        if(renewalConfirmedValue!=undefined && renewalConfirmedValue!=null && renewalConfirmedValue!=''){
        for(var i in renewalStatusMemberSafeFieldTriggerValueList){
            if(renewalConfirmedValue==renewalStatusMemberSafeFieldTriggerValueList[i])
            {
                isRenewalConfirmed=true;
			}
        }
       }
       return isRenewalConfirmed; 
    }
    
    
})