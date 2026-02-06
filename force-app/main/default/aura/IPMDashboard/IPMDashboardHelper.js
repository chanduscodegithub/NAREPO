({
    helperMethod : function() {
        
    },
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
            "NPSId" : '',
            "isExternal":isExternal,
        });
        component.set('v.ErrorMessage','');
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                if(responseData.IPMFinalData.length == 0){
                    $A.get("e.force:closeQuickAction").fire();
                    helper.showToast('No IPM Dashboard records to export',' ');
                }else{
                    if(component.get("v.value") == 'external'){
                        
                        //var ipmFinalData = responseData.IPMFinalData.filter(element => element.Checked__c == true && element.Dashboard__c == true);
                        var ipmFinalData = responseData.IPMFinalData.filter(element => element.Checked__c == true);
                        if(ipmFinalData.length == 0){
                            $A.get("e.force:closeQuickAction").fire();
                            helper.showToast('No External records to export',' ');
                        }else{
                            this.generateXmlFile(responseData.objectItags,responseData.xmlString,responseData.IPMFinalData,responseData.ipmData,responseData.iradData,responseData.ipmTeamData,responseData.holidayData,component);
                        }
                        
                    }else{
                        var ipmFinalData = responseData.IPMFinalData.filter(element => element.Dashboard__c == true);
                        if(ipmFinalData.length == 0){
                            $A.get("e.force:closeQuickAction").fire();
                            helper.showToast('No Dashboard records to export',' ');
                        }else{
                            this.generateXmlFile(responseData.objectItags,responseData.xmlString,responseData.IPMFinalData,responseData.ipmData,responseData.iradData,responseData.ipmTeamData,responseData.holidayData,component);
                        }
                        
                    }
                    
                }
                
            }else if (state === "INCOMPLETE") {   
                var reponseMessage = 'Exception Occured at IPM Dashboard, Please Try again.';
                this.showToast(reponseMessage,'Failure');
                $A.get("e.force:closeQuickAction").fire();
            }else if (state === "ERROR") {                    
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
                var reponseMessage = 'Exception Occured at IPM Dashboard, Please Try again.';
                this.showToast(reponseMessage,'Failure');
                $A.get("e.force:closeQuickAction").fire();
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            
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
    generateXmlFile :function(objectItagesMap, xmlString,ipmFinalData, ipmData, iradData,ipmTeamData,holidayData,component){
       var accountName=''; 
        var modxmlString = xmlString;
        for(var objectName in objectItagesMap) {
            
            if(objectItagesMap.hasOwnProperty(objectName)){
                
                if(objectName=='Project_Template__c'){
                    for(var k in objectItagesMap[objectName]){
                        var key = objectItagesMap[objectName][k];
                        var replaceItagName = '%%'+objectName+'.'+key+'@@';
                        var value='';
                        
                        if(key == 'CurrentDate'){
                            var today = new Date();
                            var dd = today.getDate();
                            
                            var mm = today.getMonth()+1; 
                            var yyyy = today.getFullYear();
                            today = yyyy+'-'+mm+'-'+dd;
                            var formattedDateArray = today.split('-');
                            var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                            var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                            //var year =  formattedDateArray[0].substring(2);
                            var year =  formattedDateArray[0];
                            value = month+'/'+date+'/'+year;
                        }else if(key == 'Effective_Date__c'){
                            if(ipmData[key] != null && ipmData[key] != '' && ipmData[key] != undefined){
                                var formattedDateArray = ipmData[key].split('-');
                                var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                                var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                                //var year =  formattedDateArray[0].substring(2);
                                var year =  formattedDateArray[0];
                                value = month+'/'+date+'/'+year;
                            }else{
                                value= '';
                            }
                            
                        }else if(key.indexOf('__r')!== -1){
                            var relatedObj = ipmData[key];;
                            if(relatedObj!=null)
                            {
                                value= relatedObj.Name;
                                if(key=='Account__r')
                                {
                                	accountName=relatedObj.Name;
                                }
                            }
                        }else
                        {
                            value= ipmData[key];
                        }
                        if(value != '' && value != null && value != undefined){
                             modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        }else{
                             modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                       
                    }
                }
                /*else if(objectName=='Project_Template__c'){
                    
                    
                }*/
                else if(objectName=='IPM_Team__c'){
                    //var role = [{SCE:'Strategic Client Executive'},{IPM:'Implementation Project Manager'},{CM:'Client Manager'},{OptumSAEPM: ''},{ITCRM: 'IT Client Relationship Manager'},{SOLENGINEER:'Solutions Engineer'}];
                    var roleArray = ['Strategic Client Executive','Implementation Project Manager',
                                     'Client Manager','IT Client Relationship Manager','Solutions Engineer'];
                                   /*  'Surest Implementation Project Manager','Surest Account Partner','Surest Client Manager',
                                     'Optum Client Executive/Manager','Optum Implementation Project Manager',
                                     'Surest Enrollment Data Manager'];*/
                    var sceRoleArray,ipmRoleArray, cmRoleArray,itCRMRoleArray,optumSAERoleArray,optumIPMRoleArray,cmcRoleArray,solEngArray = '' ;
                    var SIPMRoleArray,SAPRoleArray,SCMRoleArray,SEDMRoleArray,OCEMRoleArray = '' ;
                    var ipmRole = {};
                    console.log('ipmTeamData'+ipmTeamData);
                    for(var i in ipmTeamData){
                         if(ipmTeamData[i]['IPM_Roles__c'] == 'Surest Implementation Project Manager'){
                            SIPMRoleArray = this.setRoleValues(SIPMRoleArray,ipmTeamData[i]);
                        }
                         else if(ipmTeamData[i]['IPM_Roles__c'] == 'Surest Account Partner'){
                            SAPRoleArray = this.setRoleValues(SAPRoleArray,ipmTeamData[i]);
                        }
                        else if(ipmTeamData[i]['IPM_Roles__c'] == 'Surest Client Manager'){
                            SCMRoleArray = this.setRoleValues(SCMRoleArray,ipmTeamData[i]);
                        }
                        else if(ipmTeamData[i]['IPM_Roles__c'] == 'Surest Enrollment Data Manager'){
                            SEDMRoleArray = this.setRoleValues(SEDMRoleArray,ipmTeamData[i]);
                        }else if(ipmTeamData[i]['IPM_Roles__c'] =='Optum Client Executive/Manager'){
                            OCEMRoleArray = this.setRoleValues(OCEMRoleArray,ipmTeamData[i]);
                        }
                        else if(ipmTeamData[i]['IPM_Roles__c'] == 'Strategic Client Executive'){
                            sceRoleArray = this.setRoleValues(sceRoleArray,ipmTeamData[i]);
                        }else if(ipmTeamData[i]['IPM_Roles__c'] == 'Implementation Project Manager'){
                            ipmRoleArray = this.setRoleValues(ipmRoleArray,ipmTeamData[i]);
                        } else if(ipmTeamData[i]['IPM_Roles__c'] == 'Client Manager' || ipmTeamData[i]['IPM_Roles__c'] == 'Senior Client Manager'){
                            cmRoleArray =  this.setRoleValues(cmRoleArray,ipmTeamData[i]);	 
                        }else if(ipmTeamData[i]['IPM_Roles__c'] == 'IT Client Relationship Manager'){
                            itCRMRoleArray = this.setRoleValues(itCRMRoleArray,ipmTeamData[i]);   
                        }else if(ipmTeamData[i]['IPM_Roles__c'] == 'Solutions Engineer'){
                            solEngArray = this.setRoleValues(solEngArray,ipmTeamData[i]);	
                        }else if(ipmTeamData[i]['IPM_Roles__c'] == 'Optum Clinical Account Executive' || ipmTeamData[i]['IPM_Roles__c'] == 'Optum Strategic Account Executive' || ipmTeamData[i]['IPM_Roles__c'] =='Optum SAE'){
                            optumSAERoleArray = this.setRoleValues(optumSAERoleArray,ipmTeamData[i]);
                        }else if(ipmTeamData[i]['IPM_Roles__c'] == 'Optum Implementation Project Manager' || ipmTeamData[i]['IPM_Roles__c'] == 'Optum Director, Service Delivery Lead'|| ipmTeamData[i]['IPM_Roles__c'] == 'Optum Health - Service Delivery Lead' || ipmTeamData[i]['IPM_Roles__c'] == 'Optum Service Delivery Lead'){
                            optumIPMRoleArray = this.setRoleValues(optumIPMRoleArray,ipmTeamData[i]);
                        }else if(ipmTeamData[i]['IPM_Roles__c'] == 'Client Management Consultant'){
                            cmcRoleArray = this.setRoleValues(cmcRoleArray,ipmTeamData[i]);
                        } 
                        
                        
                    }
                    
                    for(var k in objectItagesMap[objectName]){
                        var key = objectItagesMap[objectName][k];
                        var replaceItagName = '%%'+objectName+'.'+key+'@@';
                        var value='';
                        if(key == 'SCE'){
                            value = sceRoleArray;
                        }else if(key == 'IPM'){
                            value = ipmRoleArray;
                        }else if(key == 'CM'){
                            value = cmRoleArray;
                        }else if(key == 'ITCRM'){
                            value = itCRMRoleArray;
                        }else if(key == 'OPTUMSAE'){
                            value = optumSAERoleArray;
                        }else if(key == 'OPTUMIPM'){
                            value = optumIPMRoleArray;
                        }else if(key == 'CMC'){
                            value = cmcRoleArray;
                        }else if(key == 'SOL'){
                            value = solEngArray;
                        }else if(key == 'SAP'){
                            value = SAPRoleArray;
                        }else if(key == 'SIPM'){
                            value = SIPMRoleArray;
                        }else if(key == 'SCM'){
                            value = SCMRoleArray;
                        }
                        else if(key == 'OCE'){
                            value = OCEMRoleArray;
                        }
                        else if(key == 'SEDM'){
                            value = SEDMRoleArray;
                        }
                        if(value != '' && value != null && value != undefined){
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        }else{
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                        
                    }
                    
                }else if(objectName =='IRAD__c' || objectName == 'Project_Task__c'){
                    
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
                    var startIndex = modxmlString.lastIndexOf(startItag);
                    var endIndex = modxmlString.indexOf(endItag);
                    
                    
                    var stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    var endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx +='</w:tbl>'.length; 
                    var TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);
                    //console.log('TableHeader : '+TableHeader);
                    
                    var stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    var stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);
                    
                    
                    if (stIdx == -1) {
                        stIdx = 0;
                    } 
                    
                    if (stTableIdx == -1) {
                        stTableIdx = 0;
                    } 
                    
                    var endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    var endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);
                    
                    endIdx += '</w:tr>'.length; 
                    endTableIdx +='</w:tbl>'.length; 
                    
                    var rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    var TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                    
                    var NPSFinalData = '';
                    if(objectName =='IRAD__c'){
                        NPSFinalData = iradData;
                    }else{
                        NPSFinalData = ipmFinalData;
                    }
                    
                    //modxmlString =  this.returnChildRows(rowToReccurse,TableToReccurse,NPSFinalData,objectName,objectItagesMap,stIdx, endIdx,modxmlString,stTableIdx, endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx);
                    if(objectName =='IRAD__c'){
                        modxmlString =  this.returnIRADData(rowToReccurse,TableToReccurse,NPSFinalData,objectName,objectItagesMap,stIdx, endIdx,modxmlString,stTableIdx, endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx);
                    }else{
                        modxmlString =  this.returnProjectTasksData(rowToReccurse,TableToReccurse,NPSFinalData,objectName,objectItagesMap,stIdx, endIdx,modxmlString,stTableIdx, endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx,holidayData,component);
                    }
                    
                }
                
                
            }
            
        }
        
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([modxmlString]));                    
        //a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlTempleteString));
        
        var templateName = 'IPMDashboard';
        var today = new Date();                   
        templateName = templateName+'_'+accountName+'_'+$A.localizationService.formatDate(today, "MM-dd-YYYY");
        //a.target = '_self';
        a.download = templateName+'.doc';
        //a.name = templateName+'.xml';
        
        // Append anchor to body.
        document.body.appendChild(a);
        a.click();
        
        // Remove anchor from body
        document.body.removeChild(a);
        this.showToast('IPM Dashboard exported successfully ','');
        $A.get("e.force:closeQuickAction").fire();
        
    },
    
    setRoleValues : function(roleArray,ipmTeamData){
        var firstName = ipmTeamData['First_Name__c'] != undefined ? ipmTeamData['First_Name__c'] : '';
        var lastName = ipmTeamData['Last_Name__c'] != undefined ? ipmTeamData['Last_Name__c'] : '';
        if(roleArray != '' && roleArray != null && roleArray != undefined){
            roleArray += ','+firstName+ ' ' + lastName;
        }else if((firstName != '' && firstName != undefined) || (lastName != '' && lastName != undefined)){
            roleArray = firstName + ' ' + lastName;
        }
        return roleArray;
    },
    returnIRADData:function(rowToReccurse,TableToReccurse,NPSFinalData,objectName,objectItagesMap,stIdx,endIdx,xmlWsectTag,stTableIdx,endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        var startIndex = TableToReccurse.lastIndexOf(startItag);
        var endIndex = TableToReccurse.indexOf(endItag);        
        var stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        var endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length; 
        totalRows = '';
        for(var i in NPSFinalData){
            var TableToIterate = TableToReccurse;
            //totalRows = '';
            count = count+1;
            var eachRow = rowToReccurse;
            var replaceSerialNumber = '%%'+objectName+'.'+'Serial_No'+'@@';
            eachRow = eachRow.split(replaceSerialNumber).join(count);
            for(var k in objectItagesMap[objectName]){                    
                //for(var k in objectItagesMap[objectName]){
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                if(replaceItagName.indexOf("__r") >-1){
                    var splitItag = replaceItagName.split('.');
                    //var splitPattern = splitItag[3].split('@@');
                    var splitPattern = splitItag[2].split('@@');
                    //eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][j][splitItag[1]][splitItag[2]][splitPattern[0]]);
                    eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][splitItag[1]][splitPattern[0]]);
                }else if(key.indexOf(".") >-1){
                    var splitItag = replaceItagName.split('.');
                    var splitPattern = splitItag[2].split('@@');
                    if(splitItag.length == 3){
                        eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][splitItag[1]][splitPattern[0]]);
                    }
                    
                }else{
                    /* if(replaceItagName.indexOf("Resolution_Comments__c") >-1){
                                eachRow = eachRow.split(replaceItagName).join('');
                            }else{
                                eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][j][key]);
                            }*/
                            
                            
                            
                            /*if(NPSFinalData[i][j][key] != null && NPSFinalData[i][j][key] != '' && NPSFinalData[i][j][key] != undefined){
                              eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][j][key]);  
                            }else{
                                eachRow = eachRow.split(replaceItagName).join('');
                            }*/
                            
                            
                            if(NPSFinalData[i][key] != null && NPSFinalData[i][key] != '' && NPSFinalData[i][key] != undefined){
                                if(key == 'Current_Due_Date__c'){
                                    var formattedDateArray = NPSFinalData[i][key].split('-');
                                    var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                                    var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                                    //var year =  formattedDateArray[0].substring(2);
                                    var year =  formattedDateArray[0];
                                    var value = month+'/'+date+'/'+year;
                                    eachRow = eachRow.split(replaceItagName).join(value); 
                                }else{
                                    eachRow = eachRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(NPSFinalData[i][key]));   
                                }
                            }else{
                                eachRow = eachRow.split(replaceItagName).join('');
                            }
                            
                        } 
                //}
                
                
            }
            totalRows += eachRow;
            // if(count >1){
            //   FinalTable +=totalRows;
            // }
            
            //FinalTable +=TableHeader;
            //FinalTable +=TableToIterate.substring(0, stIndxTbl)+eachRow+TableToIterate.substring(endIndxTbl);
            //FinalTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
            
        }
        if(NPSFinalData == '' || NPSFinalData == null ){
            var TableToIterate = TableToReccurse;
            var noRows = `<w:tr w:rsidR="00D64FB8" w:rsidTr="00A254D2">
                <w:trPr>
                    <w:trHeight w:val="351" />
                        </w:trPr>
                    <w:tc>
                        <w:tcPr>
                            <w:tcW w:w="11895" w:type="dxa" />
                                <w:gridSpan w:val="7" />
                                    </w:tcPr>
                                <w:p w:rsidR="00D64FB8" w:rsidRPr="00D64FB8" w:rsidRDefault="00D64FB8" w:rsidP="00D64FB8">
                                    <w:pPr>
                                        <w:spacing w:before="40" w:after="40" />
                                            <w:rPr>
                                                <w:b />
                                                    <w:bCs />
                                                        <w:sz w:val="24" />
                                                            <w:szCs w:val="24" />
                                                                </w:rPr>
                                                            </w:pPr>
                                                            <w:r>
                                                                <w:rPr>
                                                                    <w:b />
                                                                        <w:bCs />
                                                                            <w:sz w:val="18" />
                                                                                <w:szCs w:val="18" />
                                                                                    </w:rPr>
                                                                                <w:t xml:space="preserve">                                                                                                </w:t>
                                                                                </w:r>
                                                                                <w:r w:rsidRPr="00D64FB8">
                                                                                    <w:rPr>
                                                                                        <w:b />
                                                                                            <w:bCs />
                                                                                                <w:sz w:val="24" />
                                                                                                    <w:szCs w:val="24" />
                                                                                                        </w:rPr>
                                                                                                    <w:t>No Data Available to this Record</w:t>
                                                                                                    </w:r>
                                                                                                    </w:p>
                                                                                                    </w:tc>
                                                                                                    </w:tr>`;
                                                                                                    FinalTable +=TableToIterate.substring(0, stIndxTbl)+noRows+TableToIterate.substring(endIndxTbl);
            FinalTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
            //FinalTable
        }else{
            
        FinalTable +=TableToIterate.substring(0, stIndxTbl)+totalRows+TableToIterate.substring(endIndxTbl);
        FinalTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
        }
                
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx)+FinalTable+xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;
        
        
        
    },
    returnProjectTasksData:function(rowToReccurse,TableToReccurse,finalData,objectName,objectItagesMap,stIdx,endIdx,xmlWsectTag,stTableIdx,endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx,holidayData,component){
        var FinalTable = '';
        var fullTable = '';
        var totalRows = '';
        var count = 0;
        var startIndex = TableToReccurse.lastIndexOf(startItag);
        var endIndex = TableToReccurse.indexOf(endItag);        
        var stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        var endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length; 
        var wbsValue = '';
        var NPSFinalData,allData = '';
        var intExt = component.get("v.value");
        if(component.get("v.value") == 'external'){
            allData = finalData;
              //NPSFinalData = finalData.filter(element => element.Checked__c == true && element.Dashboard__c == true);
              NPSFinalData = finalData.filter(element => element.Checked__c == true);
        }else{
            allData = finalData;
            //NPSFinalData = finalData;
              NPSFinalData = finalData.filter(element => element.Dashboard__c == true);
        }
        var finalDataLength = NPSFinalData.length;
        //var TableToIterate = TableToReccurse;
        var TableToIterate = '';
        var wbsCode = '1';
        var noParentTask = false;
        var prevParentCode = '';
        for(var i in NPSFinalData){
            //var TableToIterate = TableToReccurse;
            wbsValue = NPSFinalData[i]['WBS_Code__c'].split('.');
            //wbsValue = wbsValue.substring(0,1);
            wbsValue = wbsValue[0];
            count = count+1;
            var eachRow = rowToReccurse;   
            if(!NPSFinalData[i]['WBS_Code__c'].includes('.')){
                //wbsValue = NPSFinalData[i]['WBS_Code__c'];
                prevParentCode = wbsValue;
                if((totalRows != '' && totalRows != null && totalRows != undefined) || (TableToIterate != '' && TableToIterate != undefined)){
                    totalRows += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
                    fullTable += TableToIterate.replace(rowToReccurse,totalRows); 
                    totalRows = '';
                    //TableToIterate = TableToReccurse;
                    TableToIterate = '';
                }
                
                TableToIterate = TableToReccurse;
                /*if(NPSFinalData[i]['Project_Task_Name__c'] != null && NPSFinalData[i]['Project_Task_Name__c'] != '' && NPSFinalData[i]['Project_Task_Name__c'] != undefined){
                    TableToIterate = TableToIterate.split('%%header.Project_Task__c.Project_Task_Name__c@@').join(this.replaceXmlSpecialCharacters(NPSFinalData[i]['Project_Task_Name__c']));   
                }else{
                    TableToIterate = TableToIterate.split('%%header.Project_Task__c.Project_Task_Name__c@@').join('');
                }*/
                
                for(var k in objectItagesMap['header']){
                    var key = objectItagesMap['header'][k];
                    var replaceItagName = '%%header'+'.'+key+'@@';
                    
                    if(key != 'Status__c'){
                        if(NPSFinalData[i][key] != '' && NPSFinalData[i][key] != null && NPSFinalData[i][key] != undefined ){
                            TableToIterate = TableToIterate.split(replaceItagName).join(this.replaceXmlSpecialCharacters(NPSFinalData[i][key]));   
                        }else{
                            TableToIterate = TableToIterate.split(replaceItagName).join('');
                        }
                    }else{
                        
                            var projectStartDate=NPSFinalData[i]['Start_Date__c'];
                         	var projectedDate = NPSFinalData[i]['End_Date_Form__c'];
                            var progressPercentage = NPSFinalData[i]['Progress__c'];
                        	var actualFinishDate = NPSFinalData[i]['Actual_Finish__c'];
                            var status = this.setStatus(projectedDate,holidayData,progressPercentage,actualFinishDate);
                            
                            TableToIterate = this.setStatusColor(status,replaceItagName,'##headerBackgroundColor@@',TableToIterate);
                            
                    }
  
                    
                }
                
                
                              	
            }else{
                
                if((!NPSFinalData[i]['WBS_Code__c'].startsWith(wbsCode) || wbsCode =='1')){
                    
                    wbsCode = NPSFinalData[i]['WBS_Code__c'].split('.');
                   // wbsCode = wbsCode.substring(0,1);
                    wbsCode = wbsCode[0];
                    
                        
                        if(prevParentCode == undefined || prevParentCode != wbsCode){
                            if(totalRows != '' && totalRows != null && totalRows != undefined || (TableToIterate != '' && TableToIterate != undefined)){
                                totalRows += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
                                fullTable += TableToIterate.replace(rowToReccurse,totalRows); 
                                totalRows = '';
                            }
                            prevParentCode = wbsCode;
                            var filteredData = allData.filter(element => element.WBS_Code__c == wbsCode);
                            TableToIterate = TableToReccurse;
                            
                            /*if(filteredData[0]['Project_Task_Name__c'] != null && filteredData[0]['Project_Task_Name__c'] != '' && filteredData[0]['Project_Task_Name__c'] != undefined){
                                TableToIterate = TableToIterate.split('%%header.Project_Task__c.Project_Task_Name__c@@').join(this.replaceXmlSpecialCharacters(filteredData[0]['Project_Task_Name__c']));   
                            }else{
                                TableToIterate = TableToIterate.split('%%header.Project_Task__c.Project_Task_Name__c@@').join('');
                            }*/
                            
                            for(var k in objectItagesMap['header']){
                    var key = objectItagesMap['header'][k];
                    var replaceItagName = '%%header'+'.'+key+'@@';
                    
                    if(key != 'Status__c'){
                        if(filteredData[0][key] != '' && filteredData[0][key] != null && filteredData[0][key] != undefined ){
                            TableToIterate = TableToIterate.split(replaceItagName).join(this.replaceXmlSpecialCharacters(filteredData[0][key]));   
                        }else{
                            TableToIterate = TableToIterate.split(replaceItagName).join('');
                        }
                    }else{
                        
                            var projectStartDate=filteredData[0]['Start_Date__c'];
                         	var projectedDate = filteredData[0]['End_Date_Form__c'];
                            var progressPercentage = filteredData[0]['Progress__c'];
                            var actualFinishDate = filteredData[0]['Actual_Finish__c'];
                            var status = this.setStatus(projectedDate,holidayData,progressPercentage,actualFinishDate);
                            
                            TableToIterate = this.setStatusColor(status,replaceItagName,'##headerBackgroundColor@@',TableToIterate);
                            
                    }
  
                    
                }
                            
                        }
                        
                    }
                
                for(var k in objectItagesMap[objectName]){                    
                    var key = objectItagesMap[objectName][k];
                    var replaceItagName = '%%'+objectName+'.'+key+'@@';
                    if(replaceItagName.indexOf("__r") >-1){
                        var splitItag = replaceItagName.split('.');
                        var splitPattern = splitItag[2].split('@@');
                        eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][splitItag[1]][splitPattern[0]]);
                    }else if(key.indexOf(".") >-1){
                        var splitItag = replaceItagName.split('.');
                        var splitPattern = splitItag[2].split('@@');
                        if(splitItag.length == 3){
                            eachRow = eachRow.split(replaceItagName).join(NPSFinalData[i][splitItag[1]][splitPattern[0]]);
                        }
                        
                    }else{
                        if(NPSFinalData[i][key] != null && NPSFinalData[i][key] != '' && NPSFinalData[i][key] != undefined){
                            if(key == 'End_Date_Form__c'){
                                var formattedDateArray = NPSFinalData[i][key].split('-');
                                var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                                var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                                //var year =  formattedDateArray[0].substring(2);
                                var year =  formattedDateArray[0];
                                var value = month+'/'+date+'/'+year;
                                eachRow = eachRow.split(replaceItagName).join(value); 
                            }else if(key!='Status'){
                                eachRow = eachRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(NPSFinalData[i][key]));   
                            }
                        }
                        else if(key == 'Status'){
                            var projectStartDate=NPSFinalData[i]['Start_Date__c'];
                            var projectedDate = NPSFinalData[i]['End_Date_Form__c'];
                            var progressPercentage = NPSFinalData[i]['Progress__c'];
                            var actualFinishDate = NPSFinalData[i]['Actual_Finish__c'];
                            var status = this.setStatus(projectedDate,holidayData,progressPercentage,actualFinishDate);
                            
                            eachRow = this.setStatusColor(status,replaceItagName,'##cellBackgroundColor@@',eachRow);
                            
                            
                           /* if(status=='C')
                            {
								eachRow = eachRow.split('##cellBackgroundColor@@').join('3813AD');                                
                            }
                            if(status=='G')
                            {
								eachRow = eachRow.split('##cellBackgroundColor@@').join('00B050');                                
                            }
                            if(status=='Y')
                            {
								eachRow = eachRow.split('##cellBackgroundColor@@').join('ffcc00');                                
                            }
                            if(status=='R')
                            {
								eachRow = eachRow.split('##cellBackgroundColor@@').join('C00000');                                
                            }
                            else
                            {
                                eachRow = eachRow.split('##cellBackgroundColor@@').join('auto');
                            }
                            
                            eachRow = eachRow.split(replaceItagName).join(status);
                            */
                            
                            
                        }
                        
                        
                            else{
                                eachRow = eachRow.split(replaceItagName).join('');
                            }
                        
                    }
                    
                }
                totalRows += eachRow;
            }
            if(finalDataLength == parseInt(i)+1){
                totalRows += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
                fullTable += TableToIterate.replace(rowToReccurse,totalRows); 
            }
            
            /*else if(wbsCode==prevParentCode && intExt != 'all'){
                totalRows += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
                      	fullTable += TableToIterate.replace(rowToReccurse,totalRows);
                totalRows = '';
                TableToIterate = TableToReccurse;
            } */ 
            //fullTable += TableToIterate.replace(rowToReccurse,totalRows);
            //totalRows += eachRow;
            
        }
        if(NPSFinalData == '' || NPSFinalData == null ){
            var TableToIterate = TableToReccurse;
            var noRows = `<w:tr w:rsidR="00D64FB8" w:rsidTr="00A254D2">
                <w:trPr>
                    <w:trHeight w:val="351" />
                        </w:trPr>
                    <w:tc>
                        <w:tcPr>
                            <w:tcW w:w="11895" w:type="dxa" />
                                <w:gridSpan w:val="7" />
                                    </w:tcPr>
                                <w:p w:rsidR="00D64FB8" w:rsidRPr="00D64FB8" w:rsidRDefault="00D64FB8" w:rsidP="00D64FB8">
                                    <w:pPr>
                                        <w:spacing w:before="40" w:after="40" />
                                            <w:rPr>
                                                <w:b />
                                                    <w:bCs />
                                                        <w:sz w:val="24" />
                                                            <w:szCs w:val="24" />
                                                                </w:rPr>
                                                            </w:pPr>
                                                            <w:r>
                                                                <w:rPr>
                                                                    <w:b />
                                                                        <w:bCs />
                                                                            <w:sz w:val="18" />
                                                                                <w:szCs w:val="18" />
                                                                                    </w:rPr>
                                                                                <w:t xml:space="preserve">                                                                                                </w:t>
                                                                                </w:r>
                                                                                <w:r w:rsidRPr="00D64FB8">
                                                                                    <w:rPr>
                                                                                        <w:b />
                                                                                            <w:bCs />
                                                                                                <w:sz w:val="24" />
                                                                                                    <w:szCs w:val="24" />
                                                                                                        </w:rPr>
                                                                                                    <w:t>No Data Available to this Record</w:t>
                                                                                                    </w:r>
                                                                                                    </w:p>
                                                                                                    </w:tc>
                                                                                                    </w:tr>`;
                                                                                                    FinalTable +=TableToIterate.substring(0, stIndxTbl)+noRows+TableToIterate.substring(endIndxTbl);
            FinalTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
            //FinalTable
        }
        
        //FinalTable +=TableToIterate.substring(0, stIndxTbl)+totalRows+TableToIterate.substring(endIndxTbl);
        
        
       // fullTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';        
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx)+fullTable+xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;
        
        
        
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
    formatDate :  function () {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [year, month, day].join('-')+':'+d.getDay();
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
    setStatusColor : function(status,replaceItagName,bgColor,eachRow){
         if(status=='C')
         {
			eachRow = eachRow.split(bgColor).join('3813AD');                                
         }
         if(status=='G')
         {
			eachRow = eachRow.split(bgColor).join('00B050');                                
         }
         if(status=='Y')
         {
			eachRow = eachRow.split(bgColor).join('ffcc00');                                
         }
         if(status=='R')
         {
			eachRow = eachRow.split(bgColor).join('C00000');                                
         }
         else
         {
            eachRow = eachRow.split(bgColor).join('auto');
         }
                            
         eachRow = eachRow.split(replaceItagName).join(status);
        return eachRow;
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
    replaceXmlSpecialCharacters : function(value) {
        if(value != null && value != undefined && value != ''){  
            if(typeof (value) == 'string'){
              value = value.replace(/&/g,'&amp;');
              value = value.replace(/>/g,'&gt;');
              value = value.replace(/</g,'&lt;');
              value = value.replace(/\n/g,'<w:br/>'); 
            }
            return value;
        }else{
            return '';
        }
    },
    parseDate:function(inputDate) {
        var parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    }
})