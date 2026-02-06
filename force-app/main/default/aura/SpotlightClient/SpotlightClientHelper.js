({
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,IPMFinalData,snrExecData,taskData,IRADData,holidayData) 
    {
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var accountName='';
        for(var objectName in objectItagesMap) 
        {
            if (objectItagesMap.hasOwnProperty(objectName)) 
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
                
                var stHeaderIdx = xmlWsectTag.lastIndexOf('<w:tr w:rsidR="007655DF" w:rsidTr="00B82D90">', startIndex);
                var endHeaderIdx = xmlWsectTag.indexOf('</w:tr>', endIndex);
                endHeaderIdx +='</w:tr>'.length; 
                var rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);
                var xmlTempleteString =  this.returnChildRows(rowToReccurse,xmlWsectTag,IPMFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,snrExecData,taskData,IRADData,holidayData);
                
                /*var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
                    var JsonData = this.xmlToJson(xmlDOM);
                    var today = this.formatDate();
                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);

                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'IPM_'+accountName+'_'+today+'.xls';  // CSV file Name* you can change it.[only name not .csv] 
                    document.body.appendChild(hiddenElement); // Required for FireFox browser


                    
                    hiddenElement.click();
                    this.showToast('IPM\'s exported successfully ','');*/
                
                var a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([xmlTempleteString]));                    
                //a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlTempleteString));
                
                var templateName = 'SpotlightClient_Report';
                var today = new Date();                   
                templateName = templateName+'_'+$A.localizationService.formatDate(today, "MM-dd-YYYY");
                //a.target = '_self';
                a.download = templateName+'.doc';
                //a.name = templateName+'.xml';
                
                // Append anchor to body.
                document.body.appendChild(a);
                a.click();
                
                // Remove anchor from body
                document.body.removeChild(a);
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                this.showToast('Spotlight report exported successfully ','');
                
                
            }
        }
        
    },
    returnChildRows:function(rowToReccurse,xmlWsectTag,IPMFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,snrExecData,taskData,IRADData,holidayData){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        var charCount=0;
        for(var i in IPMFinalData){
            var eachRow = rowToReccurse;
            count = count+1;
            
            
            for(var k in objectItagesMap[objectName])
            {
                var key = objectItagesMap[objectName][k];
                var replaceItagName = '%%'+objectName+'.'+key+'@@';
                var value='';
                
                
                
                if(key=='Account__r.Name'){
                    var accountObj = IPMFinalData[i]['Account__r'];
                    if(accountObj!=null)
                    {
                        value= accountObj.Name;
                        
                    }
                    
                }
                else if(key=='Account__r.RecordType.Name'){
                    var accountObj = IPMFinalData[i]['Account__r'];
                    if(accountObj!=null)
                    {
                        var accountRecordTypeObj=accountObj.RecordType;
                        
                        //var recordTypeName= accountObj.RecordType.Name;
                        if(accountRecordTypeObj!=null){
                            var recordTypeName=accountRecordTypeObj.Name;
                            if(!this.isBlank(recordTypeName)){
                                
                                /*if(recordTypeName=='Prospect' || recordTypeName=='Suspect' || recordTypeName=='Prospect Subsidiary'){
                                    value='New Business'; 
                                }
                                else{
                                    value='Renewal'; 
                                }*/
                                var cdRecordTypeNameList = this.getListFromCommaSprtdCustomLabelValue($A.get("$Label.c.CD_RecordType_Name"));
                                var cmRecordTypeNameList = this.getListFromCommaSprtdCustomLabelValue($A.get("$Label.c.CM_RecordType_Name"));
                                for(var cdRecTypeLstIndx in cdRecordTypeNameList){
                                    if(recordTypeName==cdRecordTypeNameList[cdRecTypeLstIndx]){
                                        value='New Business';   
                                    }
                                }
                                if(value==''){
                                    for(var cmRecTypeLstIndx in cmRecordTypeNameList){
                                        if(recordTypeName==cmRecordTypeNameList[cmRecTypeLstIndx]){
                                            value='Renewal';   
                                        }
                                    }
                                }
                                if(value==''){
                                    value='N/A';
                                }
                                
                            }
                            
                        } 
                    }
                    
                }
                        else if(key=='UHCExecutiveSponsorName__c'){
                            if(snrExecData!=undefined && snrExecData!=null &&  snrExecData.length!==0){
                                var snrExecList=snrExecData.filter(element => element.Account__c == IPMFinalData[i]['Account__c']);
                                if(snrExecList!=null && snrExecList!=undefined && snrExecList.length!==0){
                                    if( !this.isBlank(snrExecList[0].UHCExecutiveSponsorName__c)){
                                        value=snrExecList[0].UHCExecutiveSponsorName__c;
                                    }
                                    else{
                                        value='N/A';
                                    }
                                }
                                else if(!this.isBlank(IPMFinalData[i]['Account__c'])){
                                    value='N/A';
                                }
                            }
                            else if(!this.isBlank(IPMFinalData[i]['Account__c'])){
                                value='N/A';
                            }
                            
                        } 
                            else if(key=='Start_Date__c'){
                                if(taskData!=undefined && taskData!=null && taskData.length!==0){
                                    var taskList=taskData.filter(element => element.PRT_Name__c == IPMFinalData[i]['Id']);
                                    if(taskList!=null && taskList!=undefined && taskList.length!==0){
                                        for(var taskIndx in taskList){
                                            if(value=='' && !this.isBlank(taskList[taskIndx].Start_Date__c)){
                                                var formattedDateArray = taskList[taskIndx].Start_Date__c.split('-');
                                                var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                                                var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                                                //var year =  formattedDateArray[0].substring(2);
                                                var year =  formattedDateArray[0];
                                                value = month+'/'+date+'/'+year;
                                            }
                                        }
                                        
                                    }
                                }
                                if(value=='' && !this.isBlank(IPMFinalData[i]['Effective_Date__c'])){
                                    var formattedDateArray = IPMFinalData[i]['Effective_Date__c'].split('-');
                                    var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                                    var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                                    //var year =  formattedDateArray[0].substring(2);
                                    var year =  formattedDateArray[0];
                                    value = month+'/'+date+'/'+year;
                                }
                                
                            }
                                /*else if(key=='issues'){
                                    var cnt=0;
                                    var iradRelatedToIPMLst=IRADData.filter(element => element.Project__c == IPMFinalData[i]['Id']);
                                    var iradList=[];
                                    for(var eachIradIndx in iradRelatedToIPMLst){
                                        if(iradRelatedToIPMLst[eachIradIndx].Status__c=='Open'){
                                            iradList.push(iradRelatedToIPMLst[eachIradIndx]);
                                        }else if(iradRelatedToIPMLst[eachIradIndx].Status__c=='Closed'){
                                            if(!this.isAWeekOverAfterCompletedDate(iradRelatedToIPMLst[eachIradIndx].Completed_Date__c,holidayData)){
                                                iradList.push(iradRelatedToIPMLst[eachIradIndx]);
                                            }
                                        }      
                                    }
                                    var commonParatxt='<w:p w:rsidR="00000000" w:rsidRPr="009C17C9" w:rsidRDefault="009C17C9" w:rsidP="009C17C9"><w:pPr><w:spacing w:before="40" w:after="0"/>'+
                                        '<w:jc w:val="left"/><w:rPr><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/>'+
                                        '<w:szCs w:val="20"/><w:lang w:val="en-IN"/></w:rPr></w:pPr>';
                                    
                                    if(iradList!=null && iradList!=undefined && iradList.length!==0){
                                        var iradTxt='';
                                        for(var indx in iradList){
                                            if(iradList[indx].Description__c!=undefined || iradList[indx].Notes_Comments__c!=undefined || iradList[indx].Resolution_Plan__c!=undefined){
                                                cnt++;
                                                iradTxt=iradTxt+commonParatxt+'<w:r><w:rPr><w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/>'+
                                                    '<w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">';
                                                
                                                iradTxt=iradTxt+cnt+'.</w:t></w:r><w:r w:rsidR="002C1862"><w:rPr><w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>'+
                                                    '<w:t xml:space="preserve"> </w:t></w:r>';
                                                if(iradList[indx].Description__c!=undefined){
                                                    iradTxt+='<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr>'+
                                                    '<w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">';
                                                    iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Description__c)+'</w:t></w:r><w:r w:rsidR="00981DB1"><w:rPr><w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/>'+
                                                        '<w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r>';
                                                    if((iradList[indx].Notes_Comments__c==undefined || iradList[indx].Notes_Comments__c==null) &&  
                                                       (iradList[indx].Resolution_Plan__c==undefined || iradList[indx].Resolution_Plan__c==null)){
                                                        iradTxt+='</w:p>';
                                                    }
                                                }
                                                if(iradList[indx].Notes_Comments__c!=undefined){
                                                    iradTxt=iradTxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                                        '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>';
                                                    iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Notes_Comments__c)+' ';
                                                    if(iradList[indx].Resolution_Plan__c!=undefined){
                                                        iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Resolution_Plan__c);
                                                    }
                                                    iradTxt=iradTxt+'</w:t></w:r></w:p>';
                                                }
                                                if(iradList[indx].Notes_Comments__c==undefined && iradList[indx].Resolution_Plan__c!=undefined){
                                                    iradTxt=iradTxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                                        '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>';
                                                    iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Resolution_Plan__c);
                                                    iradTxt=iradTxt+'</w:t></w:r></w:p>';
                                                }
                                            }
                                            
                                        }
                                        if(cnt==0){
                                            iradTxt=iradTxt+commonParatxt+'</w:p>';
                                        }
                                        value=iradTxt;
                                        
                                    }
                                    else{
                                        value=commonParatxt+
                                            '<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Completed</w:t></w:r></w:p>';
                                    }
                                }*/
                				else if(key=='issues'){
                                    var keyIssueOrRiskExist=false;
                                    var commonParatxt='<w:p w:rsidR="00000000" w:rsidRPr="009C17C9" w:rsidRDefault="009C17C9" w:rsidP="009C17C9"><w:pPr><w:spacing w:before="40" w:after="0"/>'+
                                        '<w:jc w:val="left"/><w:rPr><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/>'+
                                        '<w:szCs w:val="20"/><w:lang w:val="en-IN"/></w:rPr></w:pPr>';
                                    if(IRADData!=undefined && IRADData!=null && IRADData.length!==0){
                                    var cnt=0;
                                    var iradRelatedToIPMLst=IRADData.filter(element => element.Project__c == IPMFinalData[i]['Id']);
                                    var iradList=[];
                                    for(var eachIradIndx in iradRelatedToIPMLst){
                                        if(iradRelatedToIPMLst[eachIradIndx].Status__c=='Open'){
                                            iradList.push(iradRelatedToIPMLst[eachIradIndx]);
                                        }else if(iradRelatedToIPMLst[eachIradIndx].Status__c=='Closed'){
                                            if(!this.isAWeekOverAfterCompletedDate(iradRelatedToIPMLst[eachIradIndx].Completed_Date__c,holidayData)){
                                                iradList.push(iradRelatedToIPMLst[eachIradIndx]);
                                            }
                                        }      
                                    }
                                   
                                    if(iradList!=null && iradList!=undefined && iradList.length!==0){
                                        keyIssueOrRiskExist=true;
                                        var iradTxt='';
                                        for(var indx in iradList){
                                            
                                            if(!this.isBlank(iradList[indx].Description__c) || !this.isBlank(iradList[indx].Notes_Comments__c) || !this.isBlank(iradList[indx].Resolution_Plan__c!=undefined)){
                                                cnt++;
                                                iradTxt+=commonParatxt+'<w:r><w:rPr><w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/>'+
                                                    '<w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">';
                                                
                                                iradTxt+=cnt+'.</w:t></w:r><w:r w:rsidR="002C1862"><w:rPr><w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>'+
                                                    '<w:t xml:space="preserve"> </w:t></w:r>';
                                                if(!this.isBlank(iradList[indx].Description__c)){
                                                    iradTxt+='<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr>'+
                                                    '<w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">';
                                                    iradTxt+=this.replaceXmlSpecialCharacters(iradList[indx].Description__c +' - '+iradList[indx].Applicable_To__c+' - ')+'</w:t></w:r><w:r w:rsidR="00981DB1"><w:rPr><w:b/><w:bCs/><w:color w:val="002060"/><w:sz w:val="20"/>'+
                                                        '<w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r>';
                                                    if(this.isBlank(iradList[indx].Notes_Comments__c) &&  
                                                       this.isBlank(iradList[indx].Resolution_Plan__c)){
                                                        iradTxt+='</w:p>';
                                                    }
                                                    
                                                }
                                                if(!this.isBlank(iradList[indx].Notes_Comments__c)){
                                                    iradTxt=iradTxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                                        '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>';
                                                    iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Notes_Comments__c)+' ';
                                                    if(!this.isBlank(iradList[indx].Resolution_Plan__c)){
                                                        iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Resolution_Plan__c);
                                                    }
                                                    iradTxt=iradTxt+'</w:t></w:r></w:p>';
                                                }
                                                if(this.isBlank(iradList[indx].Notes_Comments__c) && !this.isBlank(iradList[indx].Resolution_Plan__c)){
                                                    iradTxt=iradTxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                                        '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>';
                                                    iradTxt=iradTxt+this.replaceXmlSpecialCharacters(iradList[indx].Resolution_Plan__c);
                                                    iradTxt=iradTxt+'</w:t></w:r></w:p>';
                                                }
                                            }
                                            
                                        }
                                        value=iradTxt;
                                        
                                    }
                                        /*if(!keyIssueOrRiskExist && iradRelatedToIPMLst!=undefined && iradRelatedToIPMLst!=null && iradRelatedToIPMLst.length!==0){
                                       		value='<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Completed</w:t></w:r>';
                                        }*/
                                        
                                }
                                    if(!keyIssueOrRiskExist){
                                        /*var status=this.getStatus(IPMFinalData[i]['Project_Tasks__r'],holidayData);
                                        if(status=='C'){
                                            value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Completed</w:t></w:r></w:p>';
                                        }*/
                                        var status=IPMFinalData[i]['Overall_Project_Status__c'];
                                        if(status=='Blue'){
                                            value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Completed</w:t></w:r></w:p>';
                                        }
                                        /*else if(status=='G' || status=='Y' || status=='R'){
                                            value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>In Progress</w:t></w:r></w:p>';
                                        }*/
                                        else{
                                              value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t></w:t></w:r></w:p>';  
                                        }
                                        
                                    }
                                    else if(keyIssueOrRiskExist && value==''){
                                        /*var status=this.getStatus(IPMFinalData[i]['Project_Tasks__r'],holidayData);
                                        if(status=='C'){
                                            value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Completed</w:t></w:r></w:p>';
                                        }*/
                                        var status=IPMFinalData[i]['Overall_Project_Status__c'];
                                        if(status=='Blue'){
                                            value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>Completed</w:t></w:r></w:p>';
                                        }
                                        /*else if(status=='G' || status=='Y' || status=='R'){
                                            value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>In Progress</w:t></w:r></w:p>';
                                        }*/
                                        else{
                                              value=commonParatxt+'<w:r w:rsidR="00E626E2" w:rsidRPr="009C17C9"><w:rPr><w:bCs/><w:color w:val="002060"/>'+
                                            '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t></w:t></w:r></w:p>';  
                                        }
                                    }
                                    
                                }
                                    else if(key=='statusColor'){
                                        /*var ipmRelatedTaskLst=IPMFinalData[i]['Project_Tasks__r'];
                                        var finalStatus=this.getStatus(ipmRelatedTaskLst,holidayData);
                                        if(finalStatus=='C')
                                        {
                                            value='3813AD';                                
                                        }
                                        else if(finalStatus=='G')
                                        {
                                            value='00B050';                                
                                        }
                                            else if(finalStatus=='Y')
                                            {
                                                value='ffcc00';                                
                                            }
                                                else if(finalStatus=='R')
                                                {
                                                    value='C00000';                                
                                                }
                                                    else
                                                    {
                                                        value='FFFFFF';
                                                    } */
                                        var finalStatus = IPMFinalData[i]['Overall_Project_Status__c'];
                                        if(finalStatus=='Green'){
                                            value='00B050';
                                        }else if(finalStatus=='Yellow'){
                                            value='ffff00';
                                        }else if(finalStatus=='Red'){
                                            value='ff0000'; 
                                        }else if(finalStatus=='Blue'){
                                            value='0000FF';
                                        }else{
                                            value='FFFFFF';
                                        }
                                        
                                    }
                                        else
                                        {
                                            value= IPMFinalData[i][key];
                                        }
                
                
                
                
                
                value = value != null ? value : '';
                value = value.toString();
                if(key!='issues'){
                    value = this.replaceXmlSpecialCharacters(value);
                }
                
                if(key=='Number_of_Lives__c' && !this.isBlank(value) && value.length>3){
                   value=parseFloat(value).toLocaleString('en')
                }
                
                
                
                
                eachRow = eachRow.split(replaceItagName).join(value);
                
                
            }
            totalRows += eachRow;
            
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx+charCount)+totalRows+xmlWsectTag.substring(endHeaderIdx+charCount);
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
    
    setStatus : function(projectedFinishDate,holidayData,actualFinishDate){
        
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
    
    parseDate:function(inputDate) {
        var parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    },
    
    isAWeekOverAfterCompletedDate : function(completedDate,holidayData){
        var isAWeekOverAfterCompletedDate=true;
        if(completedDate != '' && completedDate!= null && completedDate!= undefined){
            var currentDate=new Date();
            currentDate.setHours(0,0,0,0);
            var cmpltdDt=this.parseDate(completedDate); 
            var tempDate=cmpltdDt;
            var nextDayDate;
            var count=0;
            do
            {
                nextDayDate= new Date(tempDate);
                nextDayDate.setDate(tempDate.getDate()+1);
                nextDayDate.setHours(0,0,0,0);
                tempDate=nextDayDate;
                if(!this.checkHoliday(tempDate,holidayData) && !this.checkWeekEndDay(tempDate))
                {
                    count=count+1;
                }
                
            }while(count<7);
            if(currentDate<tempDate || (currentDate.getTime() === tempDate.getTime())){
                isAWeekOverAfterCompletedDate=false
            }else{
                isAWeekOverAfterCompletedDate=true; 
            }
            
        }
        return isAWeekOverAfterCompletedDate;
    },
    
    isBlank : function(str){
        var isStrBlank=true;
        if(str!=undefined && str!=null && str!=''){
            isStrBlank=false;
        }
        return isStrBlank;
    },
        
    getListFromCommaSprtdCustomLabelValue : function(customLabelValue){
        var  returnList=[];
        if(!this.isBlank(customLabelValue)){
           if(customLabelValue.indexOf(',') !== -1){
            returnList=customLabelValue.split(',');
        }
        else{
            returnList = customLabelValue;
        } 
    }
    	return returnList;
    },
    
    getStatus : function(ipmRelatedTaskLst,holidayData){
        var finalStatus='';
        for(var eachtskIndx in ipmRelatedTaskLst){
            var projectedDate = ipmRelatedTaskLst[eachtskIndx]['End_Date_Form__c'];
            var actualFinishDate = ipmRelatedTaskLst[eachtskIndx]['Actual_Finish__c'];
            var status = this.setStatus(projectedDate,holidayData,actualFinishDate);
            if(finalStatus==''){
                finalStatus=status;
            }else{
                if(finalStatus!=status){
                    if(status=='R'){
                        finalStatus=status;
                    }else if(finalStatus!='R' && status=='Y'){
                        finalStatus=status;
                    }else if((finalStatus!='R' && finalStatus!='Y') && status=='G'){
                        finalStatus=status;
                    }
                    
                }
            }
            
            
        }
        return finalStatus;
    }
    
})