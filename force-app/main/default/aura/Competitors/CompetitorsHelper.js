({
    calculatePerTotalCompetitors : function(component, event, noOfMembersHeldItag, ofMembersHeld) {
        
        /*
         * Update the Total record on change of Number of Members Held in the Pharmacy, Dental, Vision Sections.
         */ 
        var competitorsList = component.get('v.competitorObject.competitorsDetailsList');
        var competitorTotalList = component.get('v.MACompetitorTotalList'); 
        var productType = component.get('v.productType');
        
        var totalNoOfMemebersHeld = 0;
        var membersInvolvedINMA_Total = 0;
        membersInvolvedINMA_Total = component.get('v.competitorObject.membersInvolvedInMA');
        if(membersInvolvedINMA_Total == undefined || membersInvolvedINMA_Total == null) {
        	component.set('v.competitorObject.membersInvolvedInMA', 0); 
        } else {
            membersInvolvedINMA_Total = Math.round(membersInvolvedINMA_Total);
        }
        
        for(var i=0;i<competitorsList.length;i++) {
            if(competitorsList[i][noOfMembersHeldItag] != null &&
               competitorsList[i][noOfMembersHeldItag] != undefined) {
                totalNoOfMemebersHeld = totalNoOfMemebersHeld + parseInt(competitorsList[i][noOfMembersHeldItag]);   
            }
        }
        competitorTotalList[noOfMembersHeldItag] = totalNoOfMemebersHeld;
        
        if(productType != null && productType != $A.get("$Label.c.Other_Buy_Up_Program") ) {
            
            if(totalNoOfMemebersHeld <= membersInvolvedINMA_Total) {
               
                /*
                 * Update the % of Members Held & Total record on change of Number of Members Held 
                 * in the Pharmacy, Dental, Vision Sections.
                 */
                var totalPercentageVal = 0.00;
                if(membersInvolvedINMA_Total > 0) {
                    for(var i=0;i<competitorsList.length;i++) {
                        if(competitorsList[i][noOfMembersHeldItag] == undefined || competitorsList[i][noOfMembersHeldItag] == null) { 
                            competitorsList[i][noOfMembersHeldItag] = 0;
                        }
                        competitorsList[i][ofMembersHeld] =
                            //((parseInt(competitorsList[i][noOfMembersHeldItag])/membersInvolvedINMA_Total)*100).toFixed(2);
                            Math.round(((parseInt(competitorsList[i][noOfMembersHeldItag])/membersInvolvedINMA_Total)*100));
                        totalPercentageVal = totalPercentageVal + 
                            ((parseInt(competitorsList[i][noOfMembersHeldItag])/membersInvolvedINMA_Total)*100);  
                    }    
                } else if(membersInvolvedINMA_Total == 0) {
                    for(var i=0;i<competitorsList.length;i++) {
                        if(competitorsList[i][noOfMembersHeldItag] != null && competitorsList[i][noOfMembersHeldItag] != undefined) {
                            competitorsList[i][ofMembersHeld] = 0;
                        } else {
                            competitorsList[i][noOfMembersHeldItag] = 0;
                            competitorsList[i][ofMembersHeld] = 0;
                        }
                    }
                }
                component.set('v.competitorObject.competitorsDetailsList', competitorsList);
                //competitorTotalList[ofMembersHeld] = totalPercentageVal.toFixed(2);
                competitorTotalList[ofMembersHeld] = Math.round(totalPercentageVal);
                component.set('v.MACompetitorTotalList', competitorTotalList);
                
            } else {
                
                component.set('v.MACompetitorTotalList', competitorTotalList);
            }
            
        } else if(productType != null && productType == $A.get("$Label.c.Other_Buy_Up_Program")) { 
        	
            /*
             * Update the % of Members Held & Total record on change of Number of Members Held 
             * in the Pharmacy, Dental, Vision Sections.
             */
            var totalPercentageVal = 0.00;
            if(totalNoOfMemebersHeld > 0) {
                for(var i=0;i<competitorsList.length;i++) {
                    if(competitorsList[i][noOfMembersHeldItag] == undefined || competitorsList[i][noOfMembersHeldItag] == null) { 
                        competitorsList[i][noOfMembersHeldItag] = 0;
                    } 
                    competitorsList[i][ofMembersHeld] =
                        //((parseInt(competitorsList[i][noOfMembersHeldItag])/totalNoOfMemebersHeld)*100).toFixed(2);
                        Math.round(((parseInt(competitorsList[i][noOfMembersHeldItag])/totalNoOfMemebersHeld)*100));
                    totalPercentageVal = totalPercentageVal + 
                        ((parseInt(competitorsList[i][noOfMembersHeldItag])/totalNoOfMemebersHeld)*100);
                }    
            } else if(totalNoOfMemebersHeld == 0) {
                for(var i=0;i<competitorsList.length;i++) {
                    if(competitorsList[i][noOfMembersHeldItag] != null &&
                       competitorsList[i][noOfMembersHeldItag] != undefined) {
                        competitorsList[i][ofMembersHeld] = 0;
                    } else {
                        competitorsList[i][noOfMembersHeldItag] = 0;
                        competitorsList[i][ofMembersHeld] = 0;
                    }
                }
            }
            
            component.set('v.competitorObject.competitorsDetailsList', competitorsList);
            //competitorTotalList[ofMembersHeld] = totalPercentageVal.toFixed(2);
            competitorTotalList[ofMembersHeld] = Math.round(totalPercentageVal);
            component.set('v.MACompetitorTotalList', competitorTotalList);
        }
        
        if(competitorTotalList != undefined && competitorTotalList != null) {
            var maCompetitorTotalRecord = component.get('v.competitorObject.totalCompetitorRecordObj');
            maCompetitorTotalRecord.Number_of_Members_Held__c = competitorTotalList.Number_of_Members_Held__c;
            maCompetitorTotalRecord.of_Members_Held__c = competitorTotalList.of_Members_Held__c;
            maCompetitorTotalRecord.Number_of_Members_Awarded__c = competitorTotalList.Number_of_Members_Awarded__c;
            maCompetitorTotalRecord.of_Members_Awarded__c = competitorTotalList.of_Members_Awarded__c;
            component.set('v.competitorObject.totalCompetitorRecordObj', maCompetitorTotalRecord);
        }
        
    },
    
    updateRecordsOnChangeInProducts : function(component, event, totalRecordObj, updatedMembersInvolvedInMA) { 
    
    	this.updateMembersInvolvedInMA(component, event, totalRecordObj, updatedMembersInvolvedInMA);
        this.updateNationalAccountRecord(component, event, totalRecordObj, updatedMembersInvolvedInMA);
    },
    
    updateNationalAccountRecord : function(component, event, totalRecordObj, updatedMembersInvolvedInMA) {

        if(totalRecordObj == undefined || totalRecordObj == null){
            totalRecordObj = { "Existing_Members_Involved_in_the_Bid__c":0,"Mbrs_Transferred_From_To_Another_Segment__c" :0 ,"Estimated_Additional_New_Members__c":0,"Estimated_Members_Existing_New__c":0,"Members_Quoted_in_the_Proposal__c":0,"Existing_Membership_at_Risk__c":0,"Sold_Retained_Members__c":0,"Net_Results__c":0};
        }
        
        var numberOfMembersHeld = 0;
        var numberOfMembersAwarded = 0;
        var dispositionVal = component.get('v.Disposition');
        
        var maTypeVal = component.get('v.maType');
        var currentSalesStage = component.get('v.SalesStage');
        var prevSalesStage = component.get('v.previousSalesStage');
        var productType = component.get('v.productType');
         if(currentSalesStage != null && productType!= null && productType == 'Medical') {
        	if(maTypeVal != null && maTypeVal == 'NBEA') {
                if(currentSalesStage == 'Notified') {
                    if(prevSalesStage != null) {
                        if(prevSalesStage == currentSalesStage) {
							var opportunityRecordObj = component.get('v.opportunityRecord');
                            var itag = 'Progression_Sales_Stage_'+productType+'__c';
                            var salesStageValues = opportunityRecordObj[itag];
                            var salesStageValuesArray = salesStageValues.split('_');
                            if(salesStageValuesArray != undefined && salesStageValuesArray != null && salesStageValuesArray.length == 3) {
                                prevSalesStage = salesStageValuesArray[1];
                                currentSalesStage = salesStageValuesArray[2];
                            }  
                        }
                        var stageVal = prevSalesStage+'->'+currentSalesStage;
                        if(stageVal=='Lead->Notified' || stageVal=='Proposal->Notified' || stageVal=='In Review->Notified' || 
                           stageVal=='Finalist->Notified') {
                            numberOfMembersHeld = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;    
                        } else if(stageVal==$A.get("$Label.c.EmergingRiskOrNoUpside_Notified")) {
                            numberOfMembersHeld = totalRecordObj.Existing_Membership_at_Risk__c;    
                        }
                        
                    }
                } else {
                    if(currentSalesStage=='Lead' || currentSalesStage=='Proposal' || currentSalesStage=='In Review' || 
                       currentSalesStage=='Finalist') {
                        numberOfMembersHeld = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;
                    } else if(currentSalesStage==$A.get("$Label.c.EmergingRiskOrNoUpside")) {
                        numberOfMembersHeld = totalRecordObj.Existing_Membership_at_Risk__c; 
                    }
                } 
            } else if(maTypeVal != null && maTypeVal == 'NB') {
                numberOfMembersHeld = 0;
            }
         } else if(currentSalesStage != null && productType!= null && (productType == 'Pharmacy' || productType == 'Dental' || productType == 'Vision')) {
            if(maTypeVal != null && maTypeVal == 'NBEA') { 
            	if(currentSalesStage == 'Notified') {
                    if(prevSalesStage != null) {
                        if(prevSalesStage == currentSalesStage) {
                            var opportunityRecordObj = component.get('v.opportunityRecord');
                            var itag = 'Progression_Sales_Stage_'+productType+'__c';
                            var salesStageValues = opportunityRecordObj[itag];
                            var salesStageValuesArray = salesStageValues.split('_');
                            if(salesStageValuesArray != undefined && salesStageValuesArray != null && salesStageValuesArray.length > 0) {
                                prevSalesStage = salesStageValuesArray[1];
                                currentSalesStage = salesStageValuesArray[2];
                            }  
                        }
                        var stageVal = prevSalesStage+'->'+currentSalesStage;
                        if(stageVal=='Lead->Notified' || stageVal=='Proposal->Notified' || stageVal=='In Review->Notified' || stageVal=='Finalist->Notified') {
                            numberOfMembersHeld = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;
                        } else if(stageVal==$A.get("$Label.c.EmergingRiskOrNoUpside_Notified")) {
                            numberOfMembersHeld = totalRecordObj.Existing_Membership_at_Risk__c;    
                        }
                    }
                } else if(currentSalesStage =='Lead' || currentSalesStage =='Proposal' || currentSalesStage =='In Review' || currentSalesStage =='Finalist') {
                    numberOfMembersHeld = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;
                } else if(currentSalesStage==$A.get("$Label.c.EmergingRiskOrNoUpside")) {
                    numberOfMembersHeld = totalRecordObj.Existing_Membership_at_Risk__c; 
                }
            } else if(maTypeVal != null && maTypeVal == 'NB') {
            	numberOfMembersHeld = 0;
            }
         }

        if(maTypeVal != null && maTypeVal == 'NBEA') {
            if(dispositionVal != undefined && dispositionVal != null && dispositionVal=='Dead') {
                numberOfMembersAwarded = numberOfMembersHeld;
            } else {
                numberOfMembersAwarded = totalRecordObj.Sold_Retained_Members__c;
            }
        }  if(maTypeVal != null && maTypeVal == 'NB') {
            numberOfMembersAwarded = totalRecordObj.Sold_Retained_Members__c;
        }
        
        var competitorsList = component.get('v.competitorObject.competitorsDetailsList');
        if(competitorsList != undefined && competitorsList != null) {
              console.log('test2');
            for(var i=0; i<competitorsList.length; i++) {
                  console.log('test3');
                if(competitorsList[i] != null && competitorsList[i] != undefined) {
                    if(competitorsList[i].Competitor_Account__r.Name != null && 
                       competitorsList[i].Competitor_Account__r.Name == 'National Accounts') {
                        competitorsList[i].Number_of_Members_Held__c=numberOfMembersHeld;
                        competitorsList[i].Number_of_Members_Awarded__c=numberOfMembersAwarded;
                        break;
                    }
                }
            }

            component.set('v.competitorObject.competitorsDetailsList', competitorsList);
            this.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Held__c', 'of_Members_Held__c');
            this.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Awarded__c', 'of_Members_Awarded__c');
        }
    },
    
    updateMembersInvolvedInMA : function(component, event, totalRecordObj, updatedMembersInvolvedInMA) { 

        if(totalRecordObj == undefined || totalRecordObj == null){
            totalRecordObj = { "Existing_Members_Involved_in_the_Bid__c":0,"Mbrs_Transferred_From_To_Another_Segment__c" :0 ,"Estimated_Additional_New_Members__c":0,"Estimated_Members_Existing_New__c":0,"Members_Quoted_in_the_Proposal__c":0,"Existing_Membership_at_Risk__c":0,"Sold_Retained_Members__c":0,"Net_Results__c":0};
        }
        
        var membersInvolvedInProposal = 0;
    	var maTypeVal = component.get('v.maType');
        var currentSalesStage = component.get('v.SalesStage');
        var prevSalesStage = component.get('v.previousSalesStage');
        var productType = component.get('v.productType');
        var dispositionVal = component.get('v.Disposition');
        console.log('update');
        if(currentSalesStage != null && productType!= null && productType == 'Medical') {
        	if(maTypeVal != null && maTypeVal == 'NBEA') {
                if(currentSalesStage == 'Notified') {
                    if(prevSalesStage != null) {
                        if(prevSalesStage == currentSalesStage) {
							var opportunityRecordObj = component.get('v.opportunityRecord');
                            var itag = 'Progression_Sales_Stage_'+productType+'__c';
                            var salesStageValues = opportunityRecordObj[itag];
                            var salesStageValuesArray = salesStageValues.split('_');
                            if(salesStageValuesArray != undefined && salesStageValuesArray != null && salesStageValuesArray.length > 0) {
                                prevSalesStage = salesStageValuesArray[1];
                                currentSalesStage = salesStageValuesArray[2];
                            }  
                        }
                        var stageVal = prevSalesStage+'->'+currentSalesStage;
                        if(stageVal=='Lead->Notified') {
                                if(dispositionVal != null && dispositionVal != undefined && dispositionVal != 'Sold' && 
                                   		totalRecordObj != undefined && totalRecordObj != undefined) {
                                    
                                    totalRecordObj.Estimated_Additional_New_Members__c != null ?
                                        totalRecordObj.Estimated_Additional_New_Members__c : 0;
                                    totalRecordObj.Existing_Members_Involved_in_the_Bid__c != null ?
                                        totalRecordObj.Existing_Members_Involved_in_the_Bid__c : 0;
                                    membersInvolvedInProposal = totalRecordObj.Estimated_Additional_New_Members__c + 
                                        totalRecordObj.Existing_Members_Involved_in_the_Bid__c;  
                                    
                                } else if(dispositionVal != null && dispositionVal != undefined && dispositionVal == 'Sold') {
                                    membersInvolvedInProposal = updatedMembersInvolvedInMA;
                                }
                        } else if(stageVal==$A.get("$Label.c.EmergingRiskOrNoUpside_Notified")) {
                            membersInvolvedInProposal = totalRecordObj.Existing_Membership_at_Risk__c;    
                        } else if((stageVal=='Proposal->Notified' || stageVal=='In Review->Notified' || 
                           			stageVal=='Finalist->Notified') && updatedMembersInvolvedInMA != null &&
                                 		updatedMembersInvolvedInMA != undefined && updatedMembersInvolvedInMA != null) {
                            membersInvolvedInProposal = updatedMembersInvolvedInMA;
                        }
                    } 
                } else {
                    if(currentSalesStage =='Lead') {
                        totalRecordObj.Estimated_Additional_New_Members__c != null ?
                            totalRecordObj.Estimated_Additional_New_Members__c : 0;
                        totalRecordObj.Existing_Members_Involved_in_the_Bid__c != null ?
                            totalRecordObj.Existing_Members_Involved_in_the_Bid__c : 0;
                        membersInvolvedInProposal = totalRecordObj.Estimated_Additional_New_Members__c + 
                            totalRecordObj.Existing_Members_Involved_in_the_Bid__c;
                    } else if(currentSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                        membersInvolvedInProposal = totalRecordObj.Existing_Membership_at_Risk__c; 
                    } else if((currentSalesStage =='Proposal' || currentSalesStage =='In Review' || currentSalesStage =='Finalist') && 
                    				updatedMembersInvolvedInMA != undefined && updatedMembersInvolvedInMA != null) {
                        membersInvolvedInProposal = updatedMembersInvolvedInMA;
                    }
                } 
            } else if(maTypeVal != null && maTypeVal == 'NB') {
                membersInvolvedInProposal = updatedMembersInvolvedInMA;
                if(membersInvolvedInProposal == undefined || membersInvolvedInProposal == null ||
                   (membersInvolvedInProposal != undefined && membersInvolvedInProposal != null && membersInvolvedInProposal <= 0)) {
                    membersInvolvedInProposal = totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c+totalRecordObj.Estimated_Additional_New_Members__c;
                }
            }
        } else if(currentSalesStage != null && productType!= null && (productType == 'Pharmacy' || productType == 'Dental' || productType == 'Vision')) {
            if(maTypeVal != null && maTypeVal == 'NBEA') { 
                if(currentSalesStage == 'Notified') {
                    if(prevSalesStage != null) {
                        if(prevSalesStage == currentSalesStage) {
                            var opportunityRecordObj = component.get('v.opportunityRecord');
                            var itag = 'Progression_Sales_Stage_'+productType+'__c';
                            var salesStageValues = opportunityRecordObj[itag];
                            var salesStageValuesArray = salesStageValues.split('_');
                            if(salesStageValuesArray != undefined && salesStageValuesArray != null && salesStageValuesArray.length > 0) {
                                prevSalesStage = salesStageValuesArray[1];
                                currentSalesStage = salesStageValuesArray[2];
                            }  
                        }
                        var stageVal = prevSalesStage+'->'+currentSalesStage;
                        if(stageVal=='Lead->Notified' || stageVal=='Proposal->Notified' || stageVal=='In Review->Notified' || stageVal=='Finalist->Notified') {
                            totalRecordObj.Estimated_Additional_New_Members__c != null ? totalRecordObj.Estimated_Additional_New_Members__c : 0;
                            totalRecordObj.Existing_Members_Involved_in_the_Bid__c != null ? totalRecordObj.Existing_Members_Involved_in_the_Bid__c : 0;
                            membersInvolvedInProposal = totalRecordObj.Estimated_Additional_New_Members__c + totalRecordObj.Existing_Members_Involved_in_the_Bid__c;    
                        } else if(stageVal==$A.get("$Label.c.EmergingRiskOrNoUpside_Notified")) {
                            membersInvolvedInProposal = totalRecordObj.Existing_Membership_at_Risk__c;    
                        }
                    }
                } else if(currentSalesStage =='Lead' || currentSalesStage =='Proposal' || currentSalesStage =='In Review' || currentSalesStage =='Finalist') {
                    totalRecordObj.Estimated_Additional_New_Members__c != null ? totalRecordObj.Estimated_Additional_New_Members__c : 0;
                    totalRecordObj.Existing_Members_Involved_in_the_Bid__c != null ? totalRecordObj.Existing_Members_Involved_in_the_Bid__c : 0;
                    membersInvolvedInProposal = totalRecordObj.Estimated_Additional_New_Members__c + totalRecordObj.Existing_Members_Involved_in_the_Bid__c;
                } else if(currentSalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")) {
                    membersInvolvedInProposal = totalRecordObj.Existing_Membership_at_Risk__c; 
                }
            } else if(maTypeVal != null && maTypeVal == 'NB') { 
            	membersInvolvedInProposal = totalRecordObj.Members_Quoted_in_the_Proposal__c;
                if(membersInvolvedInProposal == undefined || membersInvolvedInProposal == null ||
                   (membersInvolvedInProposal != undefined && membersInvolvedInProposal != null && membersInvolvedInProposal <= 0)) {
                    membersInvolvedInProposal = totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c+totalRecordObj.Estimated_Additional_New_Members__c;
                }
            }
        }
        component.set('v.competitorObject.membersInvolvedInMA', membersInvolvedInProposal);
        this.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Held__c', 'of_Members_Held__c');
        this.calculatePerTotalCompetitors(component, event, 'Number_of_Members_Awarded__c', 'of_Members_Awarded__c');
    }
})