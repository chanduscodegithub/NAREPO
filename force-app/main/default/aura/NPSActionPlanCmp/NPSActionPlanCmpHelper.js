({
    getTemplateDesign:function(component,event,NPSId){
      var action = component.get('c.getTemplateInXML');
        action.setParams({
            "accID" : component.get('v.accountId'),
            "NPSId" : NPSId
        });
        component.set('v.ErrorMessage','');
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                if(Object.keys(responseData.NPSFinalData).length != 0){
                    this.generateXmlFile(component,responseData.objectItags,responseData.xmlString,responseData.NPSFinalData);      
                }else{
                    var ErrorMessage = component.find('ErrorMessage');
                    component.set('v.ErrorMessage',"There aren't any NPS action items for this client. Once the items are created then you can use this button for a printable view.");
                    for(var i in ErrorMessage){
                        $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        $A.util.addClass(ErrorMessage[i], 'slds-show');
                    }
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
        $A.enqueueAction(action);  
    },
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,NPSFinalData) { 
        debugger;
        for(var objectName in objectItagesMap) {
            if (objectItagesMap.hasOwnProperty(objectName)) {                                                 
                var itagSets = objectItagesMap[objectName];
                
                var startItag = '';
                var endItag = '';
                
                var setCount = 0;                   
                for(var itagStrIndex in itagSets){
                    setCount++;
                    if(setCount == 2){
                        startItag = itagSets[itagStrIndex];
                    }
                    if(setCount == itagSets.length){
                        endItag = itagSets[itagStrIndex];
                    }
                }
                
                startItag = '%%'+objectName+'.'+startItag+'@@';
                endItag = '%%'+objectName+'.'+endItag+'@@';
                console.log('startItag'+startItag+' : endItag : '+endItag);
                
                var startHeaderIndex = xmlWsectTag.lastIndexOf('NPS Action Plan:');
                var endHeaderIndex = xmlWsectTag.indexOf('NPS Action Plan:');
                
                var stHeaderIdx = xmlWsectTag.lastIndexOf('<w:tbl>', startHeaderIndex);
                var endHeaderIdx = xmlWsectTag.indexOf('</w:tbl>', endHeaderIndex);
                endHeaderIdx +='</w:tbl>'.length; 
                var TableHeader = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);
                xmlWsectTag = xmlWsectTag.replace(TableHeader,'');
                
                var startIndex = xmlWsectTag.lastIndexOf(startItag);
                var endIndex = xmlWsectTag.indexOf(endItag);               

                
                var stIdx = xmlWsectTag.lastIndexOf('<w:tr ', startIndex);
                var stTableIdx = xmlWsectTag.lastIndexOf('<w:tbl>', stIdx);
                
                
                if (stIdx == -1) {
                    stIdx = 0;
                } 
                
                if (stTableIdx == -1) {
                    stTableIdx = 0;
                } 
                
                var endIdx = xmlWsectTag.indexOf('</w:tr>', endIndex);
                var endTableIdx = xmlWsectTag.indexOf('</w:tbl>', endIdx);
                
                endIdx += '</w:tr>'.length; 
                endTableIdx +='</w:tbl>'.length; 
                
                var rowToReccurse = xmlWsectTag.substring(stIdx, endIdx);
                var TableToReccurse = xmlWsectTag.substring(stTableIdx, endTableIdx);
                var xmlTempleteString =  this.returnChildRows(rowToReccurse,TableToReccurse,NPSFinalData,objectName,objectItagesMap,stIdx, endIdx,xmlWsectTag,stTableIdx, endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx);
                var a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([xmlTempleteString]));                    
                //a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlTempleteString));
                
                var templateName = 'NPSAction';
                var today = new Date();                   
                templateName = templateName+'_'+$A.localizationService.formatDate(today, "MM/dd/YYYY");
                //a.target = '_self';
                a.download = templateName+'.doc';
                //a.name = templateName+'.xml';
                
                // Append anchor to body.
                document.body.appendChild(a);
                a.click();
                var downLoadSuccess = component.find('downLoadSuccess');
                for(var i in downLoadSuccess){
                    $A.util.removeClass(downLoadSuccess[i], 'slds-hide');
                    $A.util.addClass(downLoadSuccess[i], 'slds-show');
                }
                // Remove anchor from body
                document.body.removeChild(a);
            }
        }
    },
    returnChildRows:function(rowToReccurse,TableToReccurse,NPSFinalData,objectName,objectItagesMap,stIdx,endIdx,xmlWsectTag,stTableIdx,endTableIdx,startItag,endItag,TableHeader,stHeaderIdx, endHeaderIdx){
        var FinalTable = '';
        var totalRows = '';
        var count = 0;
        var startIndex = TableToReccurse.lastIndexOf(startItag);
        var endIndex = TableToReccurse.indexOf(endItag);        
        var stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        var endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length; 
        for(var i in NPSFinalData){
            var TableToIterate = TableToReccurse;
            totalRows = '';
            var companyName = '';
            count = count+1;
            for(var j in NPSFinalData[i]){
                companyName = NPSFinalData[i][j].Company_Name__r.Name;
                companyName = this.replaceXmlSpecialCharacters(companyName);
                var tblHdr = TableHeader;
                if(NPSFinalData[i][j].Tasks != null && NPSFinalData[i][j].Tasks != undefined && NPSFinalData[i][j].Tasks != ''){
                    var value='';
                    for(var tasks in NPSFinalData[i][j].Tasks){
                        var eachRow = rowToReccurse;
                        for(var k in objectItagesMap[objectName]){
                            var key = objectItagesMap[objectName][k];
                            var replaceItagName = '%%'+objectName+'.'+key+'@@';
                            if(replaceItagName.indexOf("__r") >-1){
                                var splitItag = replaceItagName.split('.');
                                var splitPattern = '';
                                if(splitItag.length == 4){
                                   splitPattern =  splitItag[3].split('@@');
                                    value= NPSFinalData[i][j][splitItag[1]][splitItag[2]][splitPattern[0]];
                                }else{
                                    splitPattern = splitItag[2].split('@@');
                                    value= NPSFinalData[i][j][splitItag[1]][splitPattern[0]];
                                }
                                
                                value = value != null ? value : '';
                                value = value.toString();
                                value = this.replaceXmlSpecialCharacters(value);
                                eachRow = eachRow.split(replaceItagName).join(value);
                            }else{
                                if(replaceItagName.indexOf("Resolution_Comments__c") >-1){
                                    value= NPSFinalData[i][j].Tasks[tasks].Description;
                                    value = value != null ? value : '';
                                    value = value.toString();
                                    value = this.replaceXmlSpecialCharacters(value);
                                    eachRow = eachRow.split(replaceItagName).join(value);
                                }else{
                                    value= NPSFinalData[i][j][key];
                                    value = value != null ? value : '';
                                    value = value.toString();
                                    value = this.replaceXmlSpecialCharacters(value);
                                    eachRow = eachRow.split(replaceItagName).join(value);
                                }
                            } 
                        }
                        totalRows += eachRow;
                    }
                }else{
                    var eachRow = rowToReccurse;
                    var value='';
                    for(var k in objectItagesMap[objectName]){
                        var key = objectItagesMap[objectName][k];
                        var replaceItagName = '%%'+objectName+'.'+key+'@@';
                        if(replaceItagName.indexOf("__r") >-1){
                            var splitItag = replaceItagName.split('.');
                            var splitPattern = '';
                            //value= NPSFinalData[i][j][splitItag[1]][splitItag[2]][splitPattern[0]];
                            
                            if(splitItag.length == 4){
                                splitPattern =  splitItag[3].split('@@');
                                value= NPSFinalData[i][j][splitItag[1]][splitItag[2]][splitPattern[0]];
                            }else{
                                splitPattern = splitItag[2].split('@@');
                                value= NPSFinalData[i][j][splitItag[1]][splitPattern[0]];
                            }
                            
                            value = value != null ? value : '';
                            value = value.toString();
                            value = this.replaceXmlSpecialCharacters(value);
                            eachRow = eachRow.split(replaceItagName).join(value);
                        }else{
                            if(replaceItagName.indexOf("Resolution_Comments__c") >-1){
                                eachRow = eachRow.split(replaceItagName).join('');
                            }else{
                                value= NPSFinalData[i][j][key];
                                value = value != null ? value : '';
                                value = value.toString();
                                value = this.replaceXmlSpecialCharacters(value);
                                eachRow = eachRow.split(replaceItagName).join(value);
                            }
                        } 
                    }
                    totalRows += eachRow;
                }
                
                //totalRows += '<w:p><w:pPr><w:pStyle w:val="PageBreak" /></w:pPr></w:p>';  
            }
            tblHdr = TableHeader.split('%%Action_Service_Plan__c.Company_Name__r.Name@@').join(companyName);
            tblHdr += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
            if(count>1){
                FinalTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';  
            } 
            FinalTable +=tblHdr;
            FinalTable +=TableToIterate.substring(0, stIndxTbl)+totalRows+TableToIterate.substring(endIndxTbl);
            FinalTable += '<w:p w:rsidR="00A66674" w:rsidRDefault="00A66674"/>';
        } 
        //xmlWsectTag = xmlWsectTag.substring(0, stIdx)+totalRows+xmlWsectTag.substring(endIdx); 
        xmlWsectTag = xmlWsectTag.substring(0, stTableIdx)+FinalTable+xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;
    }
    ,
    replaceXmlSpecialCharacters : function(value) {
        if(value != null && value != undefined && value.length > 0){            
            value = value.replace(/&/g,'&amp;');
            value = value.replace(/>/g,'&gt;');
            value = value.replace(/</g,'&lt;');
            return value;
        }else{
            return '';
        }
    }
})