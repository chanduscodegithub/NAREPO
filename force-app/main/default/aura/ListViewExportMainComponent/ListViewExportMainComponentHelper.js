({
	getListViewData : function(component, event, helper) {
        var action = component.get('c.getListViewDataFromController');
        component.set('v.isProcessing',true);
        /*action.setParams({
            "riskType" : 'Risk Tracked by SCE'
        }); */
        action.setCallback(this, function(response) {
            component.set('v.isProcessing',false);
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseResult = response.getReturnValue();    
                if(responseResult != null){                                        
                    console.log(responseResult);
                    component.set("v.sObjectType",responseResult.sObjectType);
                    component.set("v.sObjectTypeMap",responseResult.sObjectTypeMap);        
                    component.set("v.listViewDataIdMap",responseResult.listViewDataIdMap);                            
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
    getRecords : function(component, event, helper,listViewId,sObjectType) {
        component.set('v.isProcessing',true);
        var action = component.get('c.getFilterQuery');	
        action.setParams({
		"listViewId" : listViewId, 
		"sObjectType" : sObjectType    
        }); 
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            component.set('v.isProcessing',false);
            if (state === "SUCCESS") {
                var responseResult = response.getReturnValue();   
                debugger;
                console.log('response');
                var csvData = '';
                if(responseResult != null){                    
                    if(responseResult.columnData != null){
                        var columnData = responseResult.columnData;
                        for(var key in columnData){
                    		csvData += key+',';        
                        }                                           
                        if(responseResult.sobjectRecords != null){
                            var sobjectRecords = responseResult.sobjectRecords;
                            for(var i = 0; i < sobjectRecords.length > 0 ; i++){
                                csvData += '\n';
                                for(var key in columnData){
                                    var fileterFieldNameItags = columnData[key].split('.');
                                    var feildValue = this.getFeildValueFromSobject(sobjectRecords[i], fileterFieldNameItags, 0);
                                    feildValue = feildValue != null ? '"'+feildValue+'"' : '';
                                    csvData += feildValue+',';
                                }       
                            }
                        }
                        
                        var a = window.document.createElement('a');
                        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
                        a.target = '_blank';
                        //a.href = window.URL.createObjectURL(new Blob([csvData]));                    
                        
                        var sObjectTypeName = component.get('v.sObjectTypeName'); 
                        var sObjectListViewName = component.get('v.sObjectListViewName');                     
                        
                        console.log(responseResult);
                        var objName = '';
                        if(sObjectTypeName == 'Account')objName = 'Companies';
                        else if(sObjectTypeName == 'Contact')objName = 'Contacts';
                        else if(sObjectTypeName == 'Opportunity')objName = 'Membership Activities';
                        a.download = objName+'__'+sObjectListViewName+'.csv';
                        //a.name = templateName+'.xml';
                        
                        // Append anchor to body.
                        document.body.appendChild(a);
                        a.click();
                        
                        // Remove anchor from body
                        document.body.removeChild(a);  
                        
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
    getFeildValueFromSobject : function(sObj, fileterFieldNameItags, index) {        
        if(fileterFieldNameItags != null && index+1 < fileterFieldNameItags.length){
            if(sObj[fileterFieldNameItags[index]] != null && sObj[fileterFieldNameItags[index]] != undefined){
             	return this.getFeildValueFromSobject(sObj[fileterFieldNameItags[index]], fileterFieldNameItags, index+1);   
            }else return '';            
        }else{
            var val = sObj[fileterFieldNameItags[index]];
            if(val != null && typeof val == 'string' && val.startsWith('<a ')){
                var start = val.indexOf('>') + 1;
                var end = val.lastIndexOf('<');
                val = val.substr(start,(end - start));
                return val;
            }else{
                return sObj[fileterFieldNameItags[index]];
            }                        
        }
    }
})