({
    exportRecord: function(component, event, helper,externalOrAll){
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var ipmId=component.get("v.recordId");
        //var externalOrAll = event.getParam("value");
        var isExternal=false;
        if(externalOrAll == 'external')
        {
            isExternal=true;
        }
        var generateAction = component.get('c.getTemplateInXML');
        generateAction.setParams({
            "ipmId" : ipmId,
            "isExternal":isExternal,
        });
        component.set('v.ErrorMessage','');
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                component.set('v.timeZone',responseData.timeZone);
                /*if(responseData.IPMFinalData.length == 0)
                {
                    $A.get("e.force:closeQuickAction").fire();
                    helper.showToast('No External IPM records to export',' ');
                }*/
                if(isExternal)
                {
                    var ipmFinalData = responseData.IPMFinalData.filter(element => element.Checked__c == true);
                    if(ipmFinalData.length == 0){
                        $A.get("e.force:closeQuickAction").fire();
                        helper.showToast('No External IPM records to export',' ');
                    }else{
                        this.generateXmlFile(component,responseData.objectItags,responseData.xmlString,responseData.IPMFinalData,responseData.FieldSetMap,responseData.ipmData,responseData.ipmTeamData,responseData.holidayData,isExternal);
                    }
                    
                }
                else
                {
                    helper.generateXmlFile(component,responseData.objectItags,responseData.xmlString,responseData.IPMFinalData,responseData.FieldSetMap,responseData.ipmData,responseData.ipmTeamData,responseData.holidayData,isExternal);
                }
                
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
    
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    
    
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,IPMFinalData,FieldSetMap,ipmData,ipmTeamData,holidayData,isExternal) 
    {
        if(isExternal)
        {
            //IPMFinalData=this.getExternalCheckedPrjctTskWithMainTask(IPMFinalData);
            //IPMFinalData=this.getExternalCheckedPrjctTskWithMainTask1(IPMFinalData);
            IPMFinalData=this.getExtrnlChckdPrjctTskWithMainAndSubTask(IPMFinalData);
        }
        var accountName='';
        for(var objectName in objectItagesMap) 
        {
            if (objectItagesMap.hasOwnProperty(objectName)) 
            {
                if(objectName=='Project_Template__c')
                {
                    
                    for(var k in objectItagesMap[objectName])
                    {
                        var key = objectItagesMap[objectName][k];
                        var replaceItagName = '%%'+objectName+'.'+key+'@@';
                        var value='';
                        if(key.indexOf('__r')!== -1)
                        {
                            var relatedObj = ipmData[key];;
                            if(relatedObj!=null)
                            {
                                value= relatedObj.Name;
                                if(key=='Account__r')
                                {
                                	accountName=relatedObj.Name;
                                }
                            }
                            
                        }
                        else if(key=='Owner')
                        {
                            var ownerObj=value= ipmData[key];;
                            if(ownerObj!=null)
                            {
                                value= ownerObj.Name;
                            }
                            
                        }
                            else
                            {
                                value= ipmData[key];
                            }
                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);
                        
                        if(key=='LastModifiedDate')
                        {
                           
                            /*var dateTimeArray=value.split('T');
                            value=dateTimeArray[0];
                            var formattedDateArray = value.split('-');
                            var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                            var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                            //var year =  formattedDateArray[0].substring(2);
                            var year =  formattedDateArray[0];
                            value = month+'/'+date+'/'+year;*/
                            
                            
                            var dtTm = new Date(value).toLocaleString("en-US", {timeZone: component.get("v.timeZone")});
                            dtTm = new Date(dtTm);
                        	value=dtTm.toLocaleString();
                            if(value !== null && value !== undefined && value !== ''){
                                var dateTimeArray = value.split(',');
                                value = dateTimeArray[0];
                            }
                            
                            
                            
                        }
                        
                        
                        xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                    }
                    
                }    
                else
                {
                    
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
                    var xmlTempleteString =  this.returnChildRows(rowToReccurse,xmlWsectTag,IPMFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap,ipmTeamData,holidayData);
                    var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
                    var JsonData = this.xmlToJson(xmlDOM);
                    var today = this.formatDate();
                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'IPM_'+accountName+'_'+today+'.xls';  // CSV file Name* you can change it.[only name not .csv] 
                    document.body.appendChild(hiddenElement); // Required for FireFox browser
                    // $A.util.removeClass(spinner, 'slds-show');
                    //$A.util.addClass(spinner, 'slds-hide');
                    
                    hiddenElement.click();
                    this.showToast('IPM\'s exported successfully ','');
                    $A.get("e.force:closeQuickAction").fire();
                }
            }
        }
    },
    returnChildRows:function(rowToReccurse, xmlWsectTag, IPMFinalData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, FieldSetMap, ipmTeamData, holidayData){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        var charCount=0;
        let defaultCssMap = {Serial_No:'s141', WBS_Code__c : 's101',
                             Project_Task_Name__c: 's101', Start_Date__c : 's144',
                             End_Date_Form__c: 's144', Actual_Finish__c: 's144',
                             Duration__c: 's144', Resource_Id__c:'s144', predecessors__c:'s144',Notes__c:'s145',
                             Additional_Comments__c:'s145'};
        
        let projectRowCssMap = {Serial_No:'s142', WBS_Code__c : 's1102',
                                Project_Task_Name__c: 's1102', Start_Date__c : 's117',
                                End_Date_Form__c: 's117', Actual_Finish__c: 's117',
                                Duration__c: 's117', Resource_Id__c:'s117', predecessors__c:'s117',Notes__c:'s117',
                                Additional_Comments__c:'s117'};
        
        let mileStoneCSSMap = {Serial_No:'s143', WBS_Code__c : 's1103',
                               Project_Task_Name__c: 's1103', Start_Date__c : 's118',
                               End_Date_Form__c: 's118', Actual_Finish__c: 's118',
                               Duration__c: 's118', Resource_Id__c:'s118', predecessors__c:'s118',Notes__c:'s118',
                               Additional_Comments__c:'s118'};
        
        for(var i in IPMFinalData){
            var eachRow = rowToReccurse;
            count = count+1;
            
            var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
            eachRow = eachRow.split(replaceItagName).join(count);
           
            let isProject = IPMFinalData[i]['Project_Type__c'].toLowerCase() == 'project';
            let isMileStone  = IPMFinalData[i]['Mark_as_Milestone__c']? true : false;
            
            for (const [key, value] of Object.entries(defaultCssMap)) {
                if(isProject){
                    eachRow = eachRow.split('##'+key+'##').join(projectRowCssMap[key]);    
                }else if(isMileStone){
                    eachRow = eachRow.split('##'+key+'##').join(mileStoneCSSMap[key]);    
                }else{
                    eachRow = eachRow.split('##'+key+'##').join(value);
                }
            }
       
   
            for(var k in objectItagesMap[objectName]){
                
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value='';
                var FieldSetVal=FieldSetMap[key];
                
                if(key== 'Status'){
                    
                    var projectedDate = IPMFinalData[i]['End_Date_Form__c'];
                    var progressPercentage = IPMFinalData[i]['Progress__c'];
                    var actualFinishDate = IPMFinalData[i]['Actual_Finish__c'];
                    var status = this.setStatus(projectedDate,holidayData,progressPercentage,actualFinishDate);
                    if(status=='C'){
                        eachRow = eachRow.split('##statusStyleId@@').join('s300');                                
                    }
                    
                    if(status=='G'){
                        eachRow = eachRow.split('##statusStyleId@@').join('s301');                                
                    }
                    
                    if(status=='Y'){
                        eachRow = eachRow.split('##statusStyleId@@').join('s302');                                
                    }
                    
                    if(status=='R'){
                        eachRow = eachRow.split('##statusStyleId@@').join('s303');                                
                    }else{
                        eachRow = eachRow.split('##statusStyleId@@').join('s304');
                    }
                    
                   // eachRow = eachRow.split(replaceItagName).join(status);
                   value=status;
                    
                }else{
                    
                    value= IPMFinalData[i][key];
                }
                
                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);
                var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                if(value != '' && FieldSetMap[key] != undefined && FieldSetMap[key] != null ){
                    if(FieldSetMap[key].type == 'DATE'){
                        if(value.indexOf('-') !== -1)
                        {
                        	var formattedDateArray = value.split('-');
                        	var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                        	var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                        	//var year =  formattedDateArray[0].substring(2);
                        	var year =  formattedDateArray[0];
                        	//var day = days[ new Date(value).getDay()];
                        	var day = days[ this.parseDate(value).getDay()];
                        	value = day+' '+month+'/'+date+'/'+year;
                    	}
                                                
                    }
                    
                }
                
                if(key=='WBS_Code__c' && value!='' && (value.split(".").length - 1)>0)
                {
                   
                    var decimalPointCount= value.split(".").length;
                    var styleId='s10'+decimalPointCount;
                    var eachRow=eachRow.split("s101").join(styleId);
                    var strArraySplittedByStlyesCloseTag=xmlWsectTag.split("</Styles>");
                    var strBeforeStlyesCloseTag=strArraySplittedByStlyesCloseTag[0];
                    //var ind= strBeforeStlyesCloseTag.lastIndexOf("ss:ID");
                    //if(strBeforeStlyesCloseTag.substring(ind+7, ind+11)!= styleId)
                    if((strBeforeStlyesCloseTag.split(styleId).length-1)==0)
                    {
                        var styleAdd='<Style ss:ID="'+styleId+'">'+
                            '<Alignment ss:Horizontal="Left" ss:Vertical="Bottom" ss:Indent="'+decimalPointCount+'" ss:WrapText="1"/>'+
                            '<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>'+
    						'<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>'+
    						'<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>'+
    						'<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>'+
   							'</Borders><Font ss:FontName="Arial" ss:Size="10"/></Style></Styles>';
                        xmlWsectTag=xmlWsectTag.split("</Styles>").join(styleAdd);
                        charCount=charCount+(styleAdd.length-9);
                    }
                    
                }
                
                if(key=='Resource_Id__c' && value!='' && value!=undefined && value!=null)
                {
                    if(value.indexOf(',') == -1)
                    {
                        if(ipmTeamData[value]!=null)
                        {
                            var fullName=this.getFullName(ipmTeamData[value].First_Name__c,ipmTeamData[value].Last_Name__c)
                            if(fullName!=null && fullName!=undefined && fullName!='') 
                            {
                                value=fullName;
                            }
                            else
                            {
                                value=ipmTeamData[value].IPM_Roles__c;
                            }
                        }
                    }
                    else
                    {
                        var ipmTeamIdArray=value.split(',');
                        var ipmTeamRoleStr='';
                        for(var m=0;m<ipmTeamIdArray.length;m++)
                        {
                            if(m== ipmTeamIdArray.length-1)
                            {
                                if(ipmTeamData[ipmTeamIdArray[m]]!=null)
                                {
                                    var fullName=this.getFullName(ipmTeamData[ipmTeamIdArray[m]].First_Name__c,ipmTeamData[ipmTeamIdArray[m]].Last_Name__c)
                                    if(fullName!=null && fullName!=undefined && fullName!='') 
                                    {
                                        ipmTeamRoleStr=ipmTeamRoleStr+fullName;
                                    }
                                    else
                                    {
                                        ipmTeamRoleStr=ipmTeamRoleStr+ipmTeamData[ipmTeamIdArray[m]].IPM_Roles__c;
                                    }
                                    
                                }
                                
                            }
                            else
                            {
                                if(ipmTeamData[ipmTeamIdArray[m]]!=null)
                                {
                                    var fullName=this.getFullName(ipmTeamData[ipmTeamIdArray[m]].First_Name__c,ipmTeamData[ipmTeamIdArray[m]].Last_Name__c)
                                    if(fullName!=null && fullName!=undefined && fullName!='') 
                                    {
                                        ipmTeamRoleStr=ipmTeamRoleStr+fullName;
                                    }
                                    else
                                    {
                                        ipmTeamRoleStr=ipmTeamRoleStr+ipmTeamData[ipmTeamIdArray[m]].IPM_Roles__c;
                                    }
                                    ipmTeamRoleStr+=',';
                                }
                            }
                        }
                        value=ipmTeamRoleStr;
                    }
                    
                }
                
                if(key=='Actual_Finish__c' && value=='')
                {
                    value='N/A';
                }
                
                
                
                eachRow = eachRow.split(replaceItagName).join(value);
                
                
            }
            
            totalRows += eachRow;
            
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx+charCount)+totalRows+xmlWsectTag.substring(endHeaderIdx+charCount);
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
    
    formatDate:function() {
        
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        
        if (dd < 10) {
            dd = '0' + dd;
        }
        
        if (mm < 10) {
            mm = '0' + mm;
        }
        
        //today = mm + '/' + dd + '/' + yyyy;
        today = mm + '-' + dd + '-' + yyyy;
        return today;
    },
    
    getFullName:function(firstName,lastName) 
    {
        var name='';
        if(firstName!=null && firstName!='' && firstName!=undefined)
        {
            name=firstName;
        }
        if(lastName!=null && lastName!='' && lastName!=undefined)
        {
            name=name+' '+lastName;
        }
        return name;
        
    },
    
    setStatus : function(projectedFinishDate,holidayData,progressPercentage,actualFinishDate){
        
        //console.log('Holiday==>'+holidayData);
        var status = '';
        /*if(progressPercentage != '' && progressPercentage != null && progressPercentage != undefined
           && progressPercentage == 100)*/
        if(actualFinishDate!=undefined && actualFinishDate!=null && actualFinishDate!='')
        {
            status = 'C';
        }
        else if(projectedFinishDate != '' && projectedFinishDate!= null && projectedFinishDate!= undefined )
        {
           var currentDate=new Date();
            currentDate.setHours(0,0,0,0);
            var nextDayDate;
            var tempDate=currentDate;
            var finishDate=this.parseDate(projectedFinishDate);
            //finishDate.setHours(0,0,0,0);
            var count=0;
            if(currentDate>finishDate)
            {
                status = 'R';
            }
            else
            {
                do
                {
                    if(!this.checkHoliday(tempDate,holidayData) && !this.checkWeekEndDay(tempDate))
                    {
                        count=count+1;
                    }
                    nextDayDate= new Date(tempDate);
                    nextDayDate.setDate(tempDate.getDate()+1);
                    nextDayDate.setHours(0,0,0,0);
                    tempDate=nextDayDate;
                }while(tempDate<finishDate || (tempDate.getTime() === finishDate.getTime()));
                
                if(count>3)
                {
                    status= 'G';
                }
                else if(count>1)
                {
                    status= 'Y';
                }
                else
                {
                    status= 'R';
                }
                
            }
            
        }
        return status;
    },
    
    checkHoliday:  function (dateToCheck,holidayData) 
    {
        var isHoliday=false;
        for(var hldyDataIndx in holidayData)
        {
			//var eachHoliday=new Date(holidayData[hldyDataIndx].ActivityDate);
			var eachHoliday=this.parseDate(holidayData[hldyDataIndx].ActivityDate);
            eachHoliday.setHours(0,0,0,0);
            if(dateToCheck.getTime() === eachHoliday.getTime())
            {
                isHoliday=true;
            }
        }
        return isHoliday;
    },
    
    checkWeekEndDay:function (dateToCheck) 
    {
        var isWeekendDay=false;
        if(dateToCheck.getDay() == 0 || dateToCheck.getDay() == 6 )
        {
            isWeekendDay=true;
        }
        
        return isWeekendDay;
        
    },
    
    getExternalCheckedPrjctTskWithMainTask:function (prjctTaskList) 
    {
        var returnPrjctTaskList=[];
        
        for(var indx in prjctTaskList)
        {
            if(prjctTaskList[indx].WBS_Code__c.indexOf('.') !== -1 && prjctTaskList[indx].Checked__c==true)
            {
                returnPrjctTaskList.push(prjctTaskList[indx]);
                
            }
            else if(prjctTaskList[indx].WBS_Code__c.indexOf('.') == -1)
            {
                returnPrjctTaskList.push(prjctTaskList[indx]);
            }
        }
        
        return returnPrjctTaskList;
        
        
    },
    
    getExternalCheckedPrjctTskWithMainTask1:function (prjctTaskList) 
    {
        var returnPrjctTaskList=[];
        
        var extrnlChkdPrjctLst=prjctTaskList.filter(element => element.Checked__c == true);
        
        for(var i in extrnlChkdPrjctLst)
        {
            if(extrnlChkdPrjctLst[i].WBS_Code__c.indexOf('.') !== -1)
            {
                var mainTaskExists=false;
                if(returnPrjctTaskList!=undefined && returnPrjctTaskList.length>0)
                {
                    var externalCheckedMainTaskInReturnLst=returnPrjctTaskList.filter(element => element.WBS_Code__c == extrnlChkdPrjctLst[i].WBS_Code__c.split('.')[0]);
                    if(externalCheckedMainTaskInReturnLst!=undefined && externalCheckedMainTaskInReturnLst.length>0)
                    {
                        mainTaskExists=true;
                    }
                    
                }
                if(!mainTaskExists)
                {
                    var externalCheckedMainTask=prjctTaskList.filter(element => element.WBS_Code__c == extrnlChkdPrjctLst[i].WBS_Code__c.split('.')[0]);
                    if(externalCheckedMainTask!=undefined && externalCheckedMainTask.length>0)
                    {
                        
                        returnPrjctTaskList.push(externalCheckedMainTask[0]);
                         
                    } 
                }
                
            	returnPrjctTaskList.push(extrnlChkdPrjctLst[i]);
            }
            else
            {
                returnPrjctTaskList.push(extrnlChkdPrjctLst[i]);
            }
        }
		        
        return returnPrjctTaskList;
        
        
    },
    
    getExtrnlChckdPrjctTskWithMainAndSubTask:function (prjctTaskList) 
    {
        var returnPrjctTaskList=[];
        
        var extrnlChkdPrjctLst=prjctTaskList.filter(element => element.Checked__c == true);
        
        for(var i in extrnlChkdPrjctLst)
        {
            if(extrnlChkdPrjctLst[i].WBS_Code__c.indexOf('.') !== -1)
            {
                var wbsCodeSplittedArr=extrnlChkdPrjctLst[i].WBS_Code__c.split('.');
                var wbsCode='';
                
                for(var k=0;k<=wbsCodeSplittedArr.length;k++){
                    
                    if(wbsCode==''){
                       wbsCode=wbsCodeSplittedArr[k]; 
                    }else{
                       wbsCode+='.'+wbsCodeSplittedArr[k];
                    }
                    var taskExists=this.checkTaskExists(wbsCode,returnPrjctTaskList);
                    
                    if(!taskExists)
                    {
                        var externalCheckedMainTask=prjctTaskList.filter(element => element.WBS_Code__c == wbsCode);
                        if(externalCheckedMainTask!=undefined && externalCheckedMainTask.length>0)
                        {
                            
                            returnPrjctTaskList.push(externalCheckedMainTask[0]);
                            
                        } 
                    }
                    
                }
                
            	
            }
            else
            {
                returnPrjctTaskList.push(extrnlChkdPrjctLst[i]);
            }
        }
		        
        return returnPrjctTaskList;
        
        
    },
    
    checkTaskExists:function(wbsCode,projectTaskList){
    	var taskExists=false;
        if(projectTaskList!=undefined && projectTaskList.length>0)
        {
            var externalCheckedMainTaskInReturnLst=projectTaskList.filter(element => element.WBS_Code__c == wbsCode);
            if(externalCheckedMainTaskInReturnLst!=undefined && externalCheckedMainTaskInReturnLst.length>0)
            {
                taskExists=true;
            }
            
        }
    	return taskExists;
	},
    
    parseDate:function(inputDate) {
        var parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    }
    
})