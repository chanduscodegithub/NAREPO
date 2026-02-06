({
    
    showToast : function(reponseMessage,title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": reponseMessage
        });
        toastEvent.fire();
    },
    
    
    generateXmlFile : function(component,objectItagesMap,xmlWsectTag,IRADFinalData,FieldSetMap,ipmData) 
    { 
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
                            var relatedObj = ipmData[key];
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
                    var xmlTempleteString =  this.returnChildRows(rowToReccurse,xmlWsectTag,IRADFinalData,objectName,objectItagesMap,stHeaderIdx,endHeaderIdx,FieldSetMap);
                    var xmlDOM = new DOMParser().parseFromString(xmlTempleteString, 'text/xml');
                    var JsonData = this.xmlToJson(xmlDOM);
                    var today = this.formatDate();
                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                     //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'IRAD_'+accountName+'_'+today+'.xls';  // CSV file Name* you can change it.[only name not .csv] 
                    document.body.appendChild(hiddenElement); // Required for FireFox browser
                    // $A.util.removeClass(spinner, 'slds-show');
                    //$A.util.addClass(spinner, 'slds-hide');
                    
                    hiddenElement.click();
                    this.showToast('IRAD\'s exported successfully ','');
                    $A.get("e.force:closeQuickAction").fire();
                }
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
                var value='';
                var FieldSetVal=FieldSetMap[key];
                if(key=='Owner')
                {
                    var assignedToOwnerObj=IRADFinalData[i][key];
                    if(assignedToOwnerObj!=null)
                    {
                        value=assignedToOwnerObj.Name; 
                    }
                    
                }
                else
                {
                    value= IRADFinalData[i][key];
                }
                
                
                
                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);
                if(value != '' && FieldSetMap[key] != undefined && FieldSetMap[key] != null ){
                    if(FieldSetMap[key].type == 'DATE'){
                        var formattedDateArray = value.split('-');
                        var date =  formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
                        var month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
                        //var year =  formattedDateArray[0].substring(2);
                        var year =  formattedDateArray[0];
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
    exportRecord: function(component, event, helper,externalOrAll){
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var ipmID=component.get("v.recordId");
        var isExternal=false;
        if(externalOrAll == 'external')
        {
            isExternal=true;
        }
        var generateAction = component.get('c.getTemplateInXML');
        generateAction.setParams({
            "ipmID" : ipmID,
            "isExternal":isExternal,
        });
        component.set('v.ErrorMessage','');
        generateAction.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                component.set('v.timeZone',responseData.timeZone);
                if(responseData.IRADFinalData.length == 0)
                {
                    $A.get("e.force:closeQuickAction").fire();
                    helper.showToast('No External IRAD records to export',' ');
                }
                else
                {
                   helper.generateXmlFile(component,responseData.objectItags,responseData.xmlString,responseData.IRADFinalData,responseData.FieldSetMap,responseData.ipmData); 
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
    
    base64Encode: function(stringInput )
    {
       var normalizedInput = c( stringInput ).replace(
                /%([0-9A-F]{2})/g,
                function toSolidBytes( $0, hex ) {
 
                    return( String.fromCharCode( "0x" + hex ) );
 
                }
            );
 
            return( btoa( normalizedInput ) ); 
        
    },
})