({
    buildSummaryTable : function(component,reportResponse){
        var finalHeadrs = ['Product Type','Sales Stage\/Disposition','Anticipated\/Actual Close Date','Estimated New Mbrs',
                           'Existing Mbrs at Risk','Risk Probability','Sold New Mbrs','Termed Mbrs','Net Results','Existing Mbrs Retained'];
        var finalData = [];   
        var totalMbrsTransfred = 0;
        var footer = '';
        var medicalSalesStage =''; 
        
        var productInvalved = component.get('v.MA_Data').Product_Type_Involved_in_Opp__c;
        var productsInvalved = productInvalved.split(';')
        var businessType = component.get('v.MA_Data').BusinessType__c;
        var header = component.get('v.MA_Data').Account.Name + ' --- ' +component.get('v.MA_Data').EffectiveDate__c + ' --- ' + component.get('v.MA_Data').Name;
        //component.set('v.header',header);
        
        for(var i=0; i<productsInvalved.length; i++){
            if(productsInvalved[i] !== 'Other Buy Up Programs'){
                var eachRow = [];                
                eachRow.push(productsInvalved[i]);
                var product = productsInvalved[i];
                var salesStageDispo = '';
                var antiCloseDate = '';
                var estimatedNewMembers = 0;
                var estimatedAtRisk = 0;
                var soldNewMbrs = 0;
                var termedMbrs = 0;
                var netResults = 0;
                var existingMbrs = 0;
                var totalRetainedMbrs = 0;
                var totalMbrsInBid = 0;
                var riskProbabilty = '';
                var lineItemsExist = false;
                for(var j=0; j<reportResponse.fieldDataList.length; j++){                	         
                    if(product === reportResponse.fieldDataList[j][0].fieldValue){                        
                        if(reportResponse.fieldDataList[j][0].fieldValue === 'Medical'){
                            if(product === 'Medical' && reportResponse.fieldDataList[j][0].fieldValue === 'Medical'){
                                lineItemsExist = true;
                            }
                            if(reportResponse.fieldDataList[j][9].fieldValue !== undefined){
                                totalMbrsTransfred = parseInt(reportResponse.fieldDataList[j][9].fieldValue);
                            }
     						antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Medical__c;
                            riskProbabilty = component.get('v.MA_Data').Risk_Probability_Medical__c;
                            if(component.get('v.MA_Data').Sales_Stage_Medical__c === 'Notified'){
                                salesStageDispo = component.get('v.MA_Data').Disposition_Medical__c;
                            }else{
                                salesStageDispo = component.get('v.MA_Data').Sales_Stage_Medical__c;
                                medicalSalesStage = component.get('v.MA_Data').Sales_Stage_Medical__c;
                            }                                                                             
                        }else if(reportResponse.fieldDataList[j][0].fieldValue === 'Dental'){
                            if(product === 'Dental' && reportResponse.fieldDataList[j][0].fieldValue === 'Dental'){
                                lineItemsExist = true;
                            }
                            antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Dental__c;
                            riskProbabilty = component.get('v.MA_Data').Risk_Probability_Dental__c;
                            if(component.get('v.MA_Data').Sales_Stage_Dental__c === 'Notified'){
                                salesStageDispo = component.get('v.MA_Data').Disposition_Dental__c;
                            }else{
                                salesStageDispo = component.get('v.MA_Data').Sales_Stage_Dental__c;
                            }  
                        }else if(reportResponse.fieldDataList[j][0].fieldValue === 'Vision'){
                            if(product === 'Vision' && reportResponse.fieldDataList[j][0].fieldValue === 'Vision'){
                                lineItemsExist = true;
                            }
                            antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Vision__c;
                            riskProbabilty = component.get('v.MA_Data').Risk_Probability_Vision__c;
                            if(component.get('v.MA_Data').Sales_Stage_Vision__c === 'Notified'){
                                salesStageDispo = component.get('v.MA_Data').Disposition_Vision__c;
                            }else{
                                salesStageDispo = component.get('v.MA_Data').Sales_Stage_Vision__c;
                            }   
                        }else if(reportResponse.fieldDataList[j][0].fieldValue === 'Pharmacy'){
                            if(product === 'Pharmacy' && reportResponse.fieldDataList[j][0].fieldValue === 'Pharmacy'){
                                lineItemsExist = true;
                            }
                            antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Pharmacy__c;
                            riskProbabilty = component.get('v.MA_Data').Risk_Probability_Pharmacy__c;
                            if(component.get('v.MA_Data').Sales_Stage_Pharmacy__c === 'Notified'){
                                salesStageDispo = component.get('v.MA_Data').Disposition_Pharmacy__c;
                            }else{
                                salesStageDispo = component.get('v.MA_Data').Sales_Stage_Pharmacy__c;
                            }  
                        }
                        var eachRowData = reportResponse.fieldDataList[j];
                        if(eachRowData[2].fieldValue !== undefined){
                            estimatedNewMembers = parseInt(eachRowData[2].fieldValue);
                        }if(eachRowData[3].fieldValue !== undefined){
                            estimatedAtRisk = parseInt(eachRowData[3].fieldValue);
                        }if(eachRowData[6].fieldValue !== undefined){
                            netResults = parseInt(eachRowData[6].fieldValue);
                        }
                        if(eachRowData[7].fieldValue !== undefined){
                            totalRetainedMbrs = parseInt(eachRowData[7].fieldValue);
                        }
                        if(eachRowData[8].fieldValue !== undefined){
                            totalMbrsInBid = parseInt(eachRowData[8].fieldValue);
                        }
                        if(eachRowData[11].fieldValue !== undefined){
                            existingMbrs = parseInt(eachRowData[11].fieldValue);
                        }
                    }                                        
                }
                if(netResults > 0){
                    soldNewMbrs = netResults;
                }else if(netResults < 0){
                    termedMbrs = netResults;
                }else{
                    soldNewMbrs = 0;
                    termedMbrs = 0;
                }
                
               /* if(totalRetainedMbrs >= totalMbrsInBid){
                    existingMbrs = totalMbrsInBid;
                }else{
                    existingMbrs = totalRetainedMbrs;
                }*/
                if(businessType === 'Client Development'){
                    existingMbrs = 0;
                }                
                if(lineItemsExist){
                    eachRow.push(salesStageDispo);
                    eachRow.push(antiCloseDate);
                    eachRow.push(estimatedNewMembers);
                    eachRow.push(estimatedAtRisk);
                    eachRow.push(riskProbabilty);
                    eachRow.push(soldNewMbrs);
                    eachRow.push(termedMbrs);
                    eachRow.push(netResults);
                    eachRow.push(existingMbrs);                    
                }else{                   
                    if(product === 'Medical'){
                        riskProbabilty = component.get('v.MA_Data').Risk_Probability_Medical__c;
                        antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Medical__c;
                        if(component.get('v.MA_Data').Sales_Stage_Medical__c === 'Notified'){
                            salesStageDispo = component.get('v.MA_Data').Disposition_Medical__c;
                        }else{
                            salesStageDispo = component.get('v.MA_Data').Sales_Stage_Medical__c;                               
                        }    
                    }else if(product === 'Vision'){
                        riskProbabilty = component.get('v.MA_Data').Risk_Probability_Vision__c;
                        antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Vision__c;
                        if(component.get('v.MA_Data').Sales_Stage_Vision__c === 'Notified'){
                            salesStageDispo = component.get('v.MA_Data').Disposition_Vision__c;
                        }else{
                            salesStageDispo = component.get('v.MA_Data').Sales_Stage_Vision__c;
                        }  
                    }else if(product === 'Dental'){
                        riskProbabilty = component.get('v.MA_Data').Risk_Probability_Dental__c;
                        antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Dental__c;
                        if(component.get('v.MA_Data').Sales_Stage_Dental__c === 'Notified'){
                            salesStageDispo = component.get('v.MA_Data').Disposition_Dental__c;
                        }else{
                            salesStageDispo = component.get('v.MA_Data').Sales_Stage_Dental__c;
                        }   
                    }else if(product === 'Pharmacy'){
                        riskProbabilty = component.get('v.MA_Data').Risk_Probability_Pharmacy__c;
                        antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Pharmacy__c;
                        if(component.get('v.MA_Data').Sales_Stage_Pharmacy__c === 'Notified'){
                            salesStageDispo = component.get('v.MA_Data').Disposition_Pharmacy__c;
                        }else{
                            salesStageDispo = component.get('v.MA_Data').Sales_Stage_Pharmacy__c;
                        } 
                    }         
                    eachRow.push(salesStageDispo);
                    eachRow.push(antiCloseDate);
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push(riskProbabilty);
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                }                                
                finalData.push(eachRow);
            }
        }
        var eachRow = [];
        if(finalData.length > 0){
            finalData.push(eachRow);   
        }
        if(totalMbrsTransfred > 0){
            if(businessType === 'Client Management' && (medicalSalesStage === 'Pending Transfer In' || medicalSalesStage === 'Pending Transfer Out' || medicalSalesStage === 'Transfer In/Out')){            	
                component.set('v.footer',totalMbrsTransfred);
            }else if(businessType === 'Client Development'){              
                component.set('v.footer',totalMbrsTransfred);
            }
        }else{
            component.set('v.footer','');
        }
        
        for(var i=0; i<productsInvalved.length; i++){
            if(productsInvalved[i] === 'Other Buy Up Programs'){
                var isOtherAdded = false;
                var diposition = false;
                if(isOtherAdded == false){
                    eachRow = [];
                    eachRow.push('Other Buy Up Programs');
                    riskProbabilty = component.get('v.MA_Data').Risk_Probability_Other__c;
                    antiCloseDate = component.get('v.MA_Data').Anticipated_Actual_Close_Date_Other__c;                    
                    if(component.get('v.MA_Data').Sales_Stage_Other__c === 'Notified'){
                        salesStageDispo = 'Notified';                                
                        diposition = true;
                    }else{
                        salesStageDispo = component.get('v.MA_Data').Sales_Stage_Other__c;                                                                
                    }                            
                    eachRow.push(salesStageDispo);
                    eachRow.push(antiCloseDate);
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push(riskProbabilty);
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    finalData.push(eachRow);
                    isOtherAdded = true;
                }
                for(var j=0; j<reportResponse.fieldDataList.length; j++){
                    if(reportResponse.fieldDataList[j][0].fieldValue === undefined || reportResponse.fieldDataList[j][0].fieldValue === 'Other'){
                        
                        if(reportResponse.fieldDataList[j][0].fieldValue === 'Other'){
                            eachRow = [];
                            salesStageDispo = '';
                            antiCloseDate = '';
                            estimatedNewMembers = 0;
                            estimatedAtRisk = 0;
                            soldNewMbrs = 0;
                            termedMbrs = 0;
                            netResults = 0;
                            existingMbrs = 0;
                            var totalRetainedMbrs = 0;
                            var totalMbrsInBid = 0;                            
                            eachRow.push(reportResponse.fieldDataList[j][1].fieldValue);
                            //antiCloseDate = reportResponse.fieldDataList[j][16].fieldLabel;
                            if(diposition){
                                //salesStageDispo = component.get('v.MA_Data').Disposition_Other__c;
                                salesStageDispo = reportResponse.fieldDataList[j][10].fieldValue;
                            }else{
                                salesStageDispo = '';
                            } 
                            var eachRowData = reportResponse.fieldDataList[j];
                            if(eachRowData[2].fieldValue !== undefined){
                                estimatedNewMembers = parseInt(eachRowData[2].fieldValue);
                            }if(eachRowData[3].fieldValue !== undefined){
                                estimatedAtRisk = parseInt(eachRowData[3].fieldValue);
                            }/*if(eachRowData[4].fieldValue !== undefined){
                                soldNewMbrs = parseInt(eachRowData[4].fieldValue);
                            }if(eachRowData[5].fieldValue !== undefined){
                                termedMbrs = parseInt(eachRowData[5].fieldValue);
                            }*/if(eachRowData[6].fieldValue !== undefined){
                                netResults = parseInt(eachRowData[6].fieldValue);
                            }
                            if(eachRowData[7].fieldValue !== undefined){
                                totalRetainedMbrs = eachRowData[7].fieldValue;
                            }
                            if(eachRowData[8].fieldValue !== undefined){
                                totalMbrsInBid = eachRowData[8].fieldValue;
                            }
                            if(salesStageDispo === 'Closed Emerging Risk'){
                                if(eachRowData[7].fieldValue !== undefined){
                                    existingMbrs = eachRowData[7].fieldValue;
                                }
                            }else{
                                 if(totalRetainedMbrs >= totalMbrsInBid){
                                    existingMbrs = totalMbrsInBid;
                                }else{
                                    existingMbrs = totalRetainedMbrs;
                                }
                            }                           
                            if(businessType === 'Client Development'){
                                existingMbrs = 0;
                            }
                            if(netResults > 0){
                                soldNewMbrs = netResults;
                            }else if(netResults < 0){
                                termedMbrs = netResults;
                            }else{
                                soldNewMbrs = 0;
                                termedMbrs = 0;
                            }
                            eachRow.push(salesStageDispo);
                            eachRow.push('');
                            eachRow.push(estimatedNewMembers);
                            eachRow.push(estimatedAtRisk);
                            eachRow.push('');
                            eachRow.push(soldNewMbrs);
                            eachRow.push(termedMbrs);
                            eachRow.push(netResults);
                            eachRow.push(existingMbrs);
                            finalData.push(eachRow);
                        }
                    }
                }
                if(isOtherAdded === false){
                    eachRow = [];
                    eachRow.push('Other Buy Up Programs');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    eachRow.push('');
                    finalData.push(eachRow);
                }
            }
        }
        component.set("v.headerLabels",finalHeadrs);
        component.set("v.summaryData",finalData);
    },
    getCompetitorsReport :function(component, event) {
        console.log("Executive Summary");
        var spinner = component.find("mySpinner");        
        var action = component.get('c.getCompetitorReportResponse');	    
        action.setParams({
            "opportunityId" : component.get('v.recordId')          
        });
        action.setCallback(this, function(response) {
            //this.stopProcessing(component);
            var state = response.getState();            
            if (state === "SUCCESS") {               
                var reportResponse = response.getReturnValue();
                this.buildCompetitorTable(component,reportResponse);
                var spinner = component.find("mySpinner");
                $A.util.addClass(spinner, "slds-hide");                
            }
            else if (state === "INCOMPLETE") {
                var spinner = component.find("mySpinner");
                $A.util.addClass(spinner, "slds-hide");                
            }
                else if (state === "ERROR") {
                    var spinner = component.find("mySpinner");
                    $A.util.addClass(spinner, "slds-hide");
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            alert('Error'); 
                            $A.util.removeClass(spinner, "slds-hide");
                        }
                    } else {
                        //console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    },
    buildCompetitorTable : function(component,reportResponse) {
        var finalHeadrs = ['Product Type','Carrier','Number of Mbrs Held','% of Mbrs Held','Number of Mbrs Awarded','% of Mbrs Awarded'];
        var finalData = [];
        var productInvalved = component.get('v.MA_Data').Product_Type_Involved_in_Opp__c;
        var productsInvalved = productInvalved.split(';')
        //var competitorCategory = ['Medical','Pharmacy','Dental','Vision'];
        var competitorCategory = productInvalved.split(';');
        for(var j=0; j<competitorCategory.length; j++){
            if(reportResponse.fieldDataList.length > 0 && competitorCategory !== 'Other Buy Up Programs'){            
                for(var i=0; i<reportResponse.fieldDataList.length; i++){
                    if(reportResponse.fieldDataList[i][0].fieldValue !== undefined){
                        if(competitorCategory[j] === reportResponse.fieldDataList[i][0].fieldValue){
                            var eachRow = [];
                            eachRow.push(reportResponse.fieldDataList[i][0].fieldValue); 
                            eachRow.push(reportResponse.fieldDataList[i][1].fieldValue); 
                            eachRow.push(reportResponse.fieldDataList[i][3].fieldValue);
                            if(reportResponse.fieldDataList[i][4].fieldValue !== undefined){
                                eachRow.push(reportResponse.fieldDataList[i][4].fieldValue + '%');
                            }else{
                                eachRow.push('0%');
                            }               
                            var mbrsAwarded = '';
                            var mbrsAwardedPerc = '';
                            var salesStage;
                            if(reportResponse.fieldDataList[i][0].fieldValue === 'Medical'){
                                salesStage = component.get('v.MA_Data').Sales_Stage_Medical__c;
                            }else if(reportResponse.fieldDataList[i][0].fieldValue === 'Pharmacy'){
                                salesStage = component.get('v.MA_Data').Sales_Stage_Pharmacy__c;
                            }else if(reportResponse.fieldDataList[i][0].fieldValue === 'Dental'){
                                salesStage = component.get('v.MA_Data').Sales_Stage_Dental__c;
                            }else if(reportResponse.fieldDataList[i][0].fieldValue === 'Vision'){
                                salesStage = component.get('v.MA_Data').Sales_Stage_Vision__c;
                            } 
                            
                            if(salesStage === 'Notified'){
                                mbrsAwarded = reportResponse.fieldDataList[i][5].fieldValue;
                                if(reportResponse.fieldDataList[i][6].fieldValue !== undefined){
                                    mbrsAwardedPerc = reportResponse.fieldDataList[i][6].fieldValue + '%';
                                }else{
                                    mbrsAwardedPerc = '0%';
                                }                    
                            }
                            eachRow.push(mbrsAwarded); 
                            eachRow.push(mbrsAwardedPerc);
                            if(salesStage !== 'Pending Transfer In' && salesStage !== 'Pending Transfer Out' && salesStage !== 'Transfer In/Out'){
                                finalData.push(eachRow);
                            }                                                        
                        }
                    }
                }           
            }
        }        
        component.set("v.headerCompetitors",finalHeadrs);
        
        component.set("v.competitorsData",finalData);
        
    }
})