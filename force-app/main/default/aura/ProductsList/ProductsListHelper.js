({    
	caluculateTotalRecord : function(component) {	
        
        if(component.get('v.productType') == $A.get("$Label.c.Other_Buy_Up_Program"))return;
     
        console.log('caluculateTotalRecord');
        
        var opportunityList = component.get('v.productObject.opportunityLineList'); 
        var opportunitySpecialityLineList = component.get('v.productObject.opportunitySpecialityLineList'); 
        var opportunityLineList = [...opportunityList, ...opportunitySpecialityLineList];
        var totalRecordObj = component.get("v.totalRecordObj");
       
        // Reseting the Total Records values to 0
        for(var i in totalRecordObj) {
            if (totalRecordObj.hasOwnProperty(i)) {
                totalRecordObj[i] = parseInt(0);
            }
        }
        
        // Setting the for Total Records
        for(var i=0; i< opportunityLineList.length; i++){
            var opportunityLineObj = opportunityLineList[i];        
            var doNotIncludeInTotal = opportunityLineObj.Product2.Do_Not_Include_in_Total__c;
            if(doNotIncludeInTotal == null || (doNotIncludeInTotal != null && doNotIncludeInTotal != true)){
                for(var j in opportunityLineObj) {
                    if (totalRecordObj.hasOwnProperty(j)) {
                        if(opportunityLineObj[j] != undefined && opportunityLineObj[j] != null){
                            totalRecordObj[j] += parseInt(opportunityLineObj[j]);    
                        }                  
                    }
                }
            }
        }
        
        component.set("v.totalRecordObj",totalRecordObj);
	},
})