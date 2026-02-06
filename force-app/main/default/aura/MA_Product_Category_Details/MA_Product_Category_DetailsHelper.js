({
    salesStageChng : function(component,event,genericFeildComponent_Id,selectedITag,sales_Stage_Name,isU_W_Engagement_not_yet_Needed) {
        var onLoad = component.get('v.isOnload');
        var salesStage = sales_Stage_Name;
        var DispositionValueArr = [];
        var requiredFieldsItagList = [];
        var readOnlyFieldsItagList = [];
        var conditionallyRequiredisU_W_Engagement = [];
        var isU_W_EngagementFields = [];
        var salesStageVal = '';
        var selectedTab = component.get('v.selectedProductTab');
        var dispostionValue = component.get('v.possItag')+'_Gen_Disposition';
        for(var i=0; i<genericFeildComponent_Id.length; i++){
            if(genericFeildComponent_Id[i].get('v.iTag') == component.get('v.DispositonItag')){
                var DispositionValue = component.get('v.DispositonMap')[dispostionValue];
                DispositionValueArr.push('');
                DispositionValueArr.push.apply(DispositionValueArr,DispositionValue);
                genericFeildComponent_Id[i].set('v.fields.picklistoptions',DispositionValueArr);
                break;
            }        
        } 
        
        if(salesStage != undefined && salesStage != null && salesStage !=''){
            salesStage = salesStage.replace(/ /g, '_');
            requiredFieldsItagList = component.get('v.requiredFieldsItag')[salesStage];
            if(!isU_W_Engagement_not_yet_Needed && isU_W_Engagement_not_yet_Needed != undefined){
                if(component.get('v.isMedOth')){
                    isU_W_EngagementFields =  component.get('v.requiredFieldsItagMO')[salesStage]; 
                }else{
                    isU_W_EngagementFields =  component.get('v.requiredFieldsItag')[salesStage];                      
                }
                for(var i=0; i<isU_W_EngagementFields.length; i++){
                    if(isU_W_EngagementFields[i].includes('Proposal_Received_') || isU_W_EngagementFields[i].includes('Proposal_Due_')){
                        conditionallyRequiredisU_W_Engagement.push(isU_W_EngagementFields[i]);
                    }
                }
            }
            
            if(salesStage == 'Notified' && component.get('v.oppCategory') == 'NBEA' && !selectedITag.includes('Other')){
                if(component.get('v.isMedOth')){
                    selectedTab = 'Medical';
                }
                var conditionallyItag = 'Existing_Members_Risk_Outcome_'+selectedTab+'__c';
                var riskItag = 'Risk_Probability_'+selectedTab+'__c';
                if(component.get('v.selectedRiskProb') == "" || component.get('v.selectedRiskProb') == null){
                    for(var i=0; i<component.get('v.requiredFieldsItag')[salesStage].length; i++){
                        if(component.get('v.requiredFieldsItag')[salesStage][i] == conditionallyItag){
                            //delete component.get('v.requiredFieldsItag')[salesStage][i];
                            component.get('v.requiredFieldsItag')[salesStage].splice(i, 1);
                        }
                    }
                }else{
                    if(component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag) == -1){
                        component.get('v.requiredFieldsItag')[salesStage].push(conditionallyItag);
                    }
                }
            }
            
            //CR : 22/04/20 Proactive renewal - Addtional info and Underwriter field mandatory
            if(salesStage == 'Notified' && component.get('v.oppCategory') == 'NBEA' && selectedITag.includes('Medical') && component.get('v.simpleRecord')['Reason_for_the_Opportunity_Risk__c'] == 'Proactive Renewal' && (component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2021' || component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2022' || component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2023')){
            	var proactiveRenwalMandatory = ['Proactive_Renewal_Additional_Info__c','Proactive_Renewal_Underwriter__c'];               
                 for(var j=0; j<proactiveRenwalMandatory.length; j++){
                     if(component.get('v.simpleRecord')['Disposition_Medical__c'] == 'Sold'){
                         if(component.get('v.requiredFieldsItag')[salesStage].indexOf(proactiveRenwalMandatory[j]) == -1){
                         	//component.get('v.requiredFieldsItag')[salesStage].push(proactiveRenwalMandatory[j]);
                         	//-------SAMARTH-------
                            /*if(component.get('v.simpleRecord')['Competitive_Non_Competitive_calculated__c'] == 'Non Competitive'){
                                component.get('v.requiredFieldsItag')[salesStage].push(proactiveRenwalMandatory[j]);
                            }
                            if(component.get('v.simpleRecord')['Competitive_Non_Competitive_calculated__c'] == 'Competitive'){
                                if(proactiveRenwalMandatory[j] == 'Proactive_Renewal_Underwriter__c'){
                                    component.get('v.requiredFieldsItag')[salesStage].push(proactiveRenwalMandatory[j]);
                                }
                            }*/
                            //-------SAMARTH-------
                            component.get('v.requiredFieldsItag')[salesStage].push(proactiveRenwalMandatory[j]);
                         }
                     }else{
                         if(component.get('v.requiredFieldsItag')[salesStage].indexOf(proactiveRenwalMandatory[j]) != -1){
                         	var index =  component.get('v.requiredFieldsItag')[salesStage].indexOf(proactiveRenwalMandatory[j]);
                         	component.get('v.requiredFieldsItag')[salesStage].splice(index, 1);
                         }
                     }                              
                 }
            }/*else if(salesStage != 'Notified' && component.get('v.oppCategory') == 'NBEA' && selectedITag.includes('Medical') && component.get('v.simpleRecord')['Reason_for_the_Opportunity_Risk__c'] == 'Proactive Renewal' && (component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2021' || component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2022' || component.get('v.simpleRecord')['Sales_Season1__c'] == 'SS 2023')){
            	component.get('v.simpleRecord')['Proactive_Renewal_Additional_Info__c'] = '';
                component.get('v.simpleRecord')['Proactive_Renewal_Underwriter__c'] = '';
            }*/
            
            
            var conditionallyItag = ['Employees_in_the_Proposal_CI_AP_HI__c','Retirees_in_the_Proposal_CI_AP_HI__c','Date_the_CI_APP_HIPP_Quote_is_Needed__c'];
            if(component.get('v.simpleRecord')['U_W_Engagement_not_yet_Needed_CI_APP_HI__c']){
                var selectedITagVal = '';
                if(component.get('v.isMedOth')){
                    salesStageVal = component.get('v.otherSalesStage'); 
                    selectedITagVal = 'Sales_Stage_Other__c';
                }else{
                    salesStageVal = component.get('v.generalSalesStage'); 
                    selectedITagVal = selectedITag;
                }
            }else{
                if(!component.get('v.isMedOth')){
                    salesStageVal = component.get('v.generalSalesStage'); 
                    selectedITagVal = selectedITag;
                }else{
                    salesStageVal = component.get('v.otherSalesStage'); 
                    selectedITagVal = 'Sales_Stage_Other__c';
                }
            }
            if(salesStageVal != null && salesStageVal != undefined && salesStageVal != ''){
                salesStageVal = salesStageVal.replace(/ /g, '_');
            }
            if(component.get('v.simpleRecord')['CI_AP_HII__c'] && !component.get('v.simpleRecord')['U_W_Engagement_not_yet_Needed_CI_APP_HI__c']){
                if((salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && selectedITagVal.includes('Other') && component.get('v.maActivityType') == 'Traditional'){
                    for(var j=0; j<conditionallyItag.length; j++){
                        if(component.get('v.isMedOth')){
                            if(component.get('v.requiredFieldsItagMO')[salesStageVal].indexOf(conditionallyItag[j]) == -1){
                                component.get('v.requiredFieldsItagMO')[salesStageVal].push(conditionallyItag[j]); 
                            }
                        }else{
                            if(component.get('v.requiredFieldsItag')[salesStageVal].indexOf(conditionallyItag[j]) == -1){
                                component.get('v.requiredFieldsItag')[salesStageVal].push(conditionallyItag[j]); 
                            }                          
                        } 
                    }
                }
            }else if((salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && (selectedITagVal.includes('Other')) && component.get('v.maActivityType') == 'Traditional'){
                var requiredData = '';
                var requiredArr = [];
                if(component.get('v.isMedOth')){
                    requiredData = component.get('v.requiredFieldsItagMO')[salesStageVal];
                }else{
                    requiredData = component.get('v.requiredFieldsItag')[salesStageVal];
                }
                for(var i=0; i<requiredData.length; i++){
                    if(conditionallyItag.indexOf(requiredData[i]) == -1){
                        if(requiredArr.indexOf(requiredData[i]) == -1){
                            requiredArr.push(requiredData[i]);
                        }
                    }
                }
                if(component.get('v.isMedOth')){
                    component.get('v.requiredFieldsItagMO')[salesStageVal] = requiredArr;
                }else{
                    component.get('v.requiredFieldsItag')[salesStageVal] = requiredArr;
                }                
            }
            /*var conditionalDentalTab = ['Date_the_CI_APP_HIPP_Quote_is_Needed__c',
                                             'Date_the_Dental_Quote_is_Needed_from_UW__c',
                                             'Date_the_Vision_Quote_is_Needed_from_UW__c',
                                             'Employees_in_the_Proposal_CI_AP_HI__c',
                                             'Employees_in_the_Proposal_Dental__c',
                                             'Employees_in_the_Proposal_Vision__c',
                                             'Retirees_in_the_Proposal_CI_AP_HI__c',
                                             'Retirees_in_the_Proposal_Dental__c',
                                             'Retirees_in_the_Proposal_Vision__c'];*/
            var conditionalDentalTab = ['Date_the_Dental_Quote_is_Needed_from_UW__c',
                                        'Employees_in_the_Proposal_Dental__c',
                                        'Retirees_in_the_Proposal_Dental__c'];
            if(!isU_W_Engagement_not_yet_Needed && (selectedITag.includes('Dental')) && (salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                var conditionalFields = [];
                var reqFields = component.get('v.requiredFieldsItag')[salesStageVal];
                for(var j=0; j<reqFields.length; j++){
                    if(conditionalDentalTab.indexOf(reqFields[j]) == -1){
                        if(conditionallyRequiredisU_W_Engagement.indexOf(reqFields[j]) == -1){
                            conditionallyRequiredisU_W_Engagement.push(reqFields[j]);
                        }
                    }
                }
            }else if(isU_W_Engagement_not_yet_Needed && (selectedITag.includes('Dental')) && (salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                var conditionalFields = [];
                for(var i=0; i<conditionalDentalTab.length; i++){
                    if(component.get('v.requiredFieldsItag')[salesStageVal].indexOf(conditionalDentalTab[i]) == -1){
                        component.get('v.requiredFieldsItag')[salesStageVal].push(conditionalDentalTab[i]);
                    }
                }
            }
            
            var conditionalDentalTab = ['Date_the_Vision_Quote_is_Needed_from_UW__c',
                                        'Employees_in_the_Proposal_Vision__c',
                                        'Retirees_in_the_Proposal_Vision__c'];
            if(!isU_W_Engagement_not_yet_Needed && (selectedITag.includes('Vision')) && (salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                var conditionalFields = [];
                var reqFields = component.get('v.requiredFieldsItag')[salesStageVal];
                for(var j=0; j<reqFields.length; j++){
                    if(conditionalDentalTab.indexOf(reqFields[j]) == -1){
                        if(conditionallyRequiredisU_W_Engagement.indexOf(reqFields[j]) == -1){
                            conditionallyRequiredisU_W_Engagement.push(reqFields[j]);
                        }
                    }
                }
            }else if(isU_W_Engagement_not_yet_Needed && (selectedITag.includes('Vision')) && (salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                var conditionalFields = [];
                for(var i=0; i<conditionalDentalTab.length; i++){
                    if(component.get('v.requiredFieldsItag')[salesStageVal].indexOf(conditionalDentalTab[i]) == -1){
                        component.get('v.requiredFieldsItag')[salesStageVal].push(conditionalDentalTab[i]);
                    }
                }
            }
            
            var conditionalDentalTab = ['Date_the_CI_APP_HIPP_Quote_is_Needed__c',
                                        'Employees_in_the_Proposal_CI_AP_HI__c',
                                        'Retirees_in_the_Proposal_CI_AP_HI__c'];
            if(component.get('v.simpleRecord')['CI_AP_HII__c'] && !isU_W_Engagement_not_yet_Needed && !component.get('v.isMedOth') &&(selectedITag.includes('Other')) && (salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                var conditionalFields = [];
                var reqFields = component.get('v.requiredFieldsItag')[salesStageVal];
                for(var j=0; j<reqFields.length; j++){
                    if(conditionalDentalTab.indexOf(reqFields[j]) == -1){
                        if(conditionallyRequiredisU_W_Engagement.indexOf(reqFields[j]) == -1){
                            conditionallyRequiredisU_W_Engagement.push(reqFields[j]);
                        }
                    }
                }
            }else if(component.get('v.simpleRecord')['CI_AP_HII__c'] && isU_W_Engagement_not_yet_Needed && !component.get('v.isMedOth') &&(selectedITag.includes('Other')) && (salesStageVal == 'Proposal' || salesStageVal == 'Emerging_Risk\\No_Upside') && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                var conditionalFields = [];
                for(var i=0; i<conditionalDentalTab.length; i++){
                    if(component.get('v.requiredFieldsItag')[salesStageVal].indexOf(conditionalDentalTab[i]) == -1){
                        component.get('v.requiredFieldsItag')[salesStageVal].push(conditionalDentalTab[i]);
                    }
                }
            }
            
            var SelectedFinalistDetail = '';
            if(component.get('v.isOnload')){
                if(component.get('v.isMedOth') && selectedITag.includes('Medical')){
                    selectedTab = 'Medical';
                }
                var finalistDetail = 'Finalist_Date_Detail_'+selectedTab+'__c';
                SelectedFinalistDetail = component.get('v.simpleRecord')[finalistDetail];
            }else{
                SelectedFinalistDetail = component.get('v.SelectedFinalistDetail');
                if(SelectedFinalistDetail == null || SelectedFinalistDetail == '' || SelectedFinalistDetail == undefined){
                    if(component.get('v.isMedOth') && selectedITag.includes('Medical')){
                        selectedTab = 'Medical';
                    }
                    var finalistDetail = 'Finalist_Date_Detail_'+selectedTab+'__c';
                    if(salesStage == 'Finalist'){
                        SelectedFinalistDetail = component.get('v.simpleRecord')[finalistDetail];
                    }else if(salesStage == 'In_Review'){
                        SelectedFinalistDetail = component.get('v.simpleRecord')[finalistDetail];
                    }
                }else{
                    SelectedFinalistDetail = component.get('v.SelectedFinalistDetail');
                }
            }
            if(component.get('v.isMedOth') && selectedITag.includes('Medical')){
                selectedTab = 'Medical';
            }
            var conditionallyItag = 'Finalist_Date_'+selectedTab+'__c';
            if(component.get('v.oppCategory') == 'NB' && salesStage == 'Finalist' && component.get('v.maActivityType') == 'Traditional' && (selectedITag.includes('Vision') || selectedITag.includes('Dental') || selectedITag.includes('Pharmacy'))){
                if(component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag) == -1){
                    component.get('v.requiredFieldsItag')[salesStage].push(conditionallyItag);
                }
            }
            if(SelectedFinalistDetail != null && SelectedFinalistDetail!= undefined && SelectedFinalistDetail != '' && !selectedITag.includes('Other') && salesStage == 'Finalist' && component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional'){
                if(SelectedFinalistDetail != "Mtg Expected - Date Confirmed" && SelectedFinalistDetail != "Mtg Expected - Date Estimated" && SelectedFinalistDetail != "Mtg Conducted"){
                    if(component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag) > -1){
                        var index =  component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag);
                        component.get('v.requiredFieldsItag')[salesStage].splice(index, 1);
                    }
                }else{
                    if(component.get('v.requiredFieldsItag')[salesStage] != null && component.get('v.requiredFieldsItag')[salesStage] != undefined){
                        if(component.get('v.requiredFieldsItag')[salesStage].length == 0){
                            component.get('v.requiredFieldsItag')[salesStage].push(conditionallyItag);
                        }else{
                            if(component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag) == -1){
                                component.get('v.requiredFieldsItag')[salesStage].push(conditionallyItag);
                            }
                            
                        }
                    }
                }
            }
            
            if(SelectedFinalistDetail != null && SelectedFinalistDetail!= undefined && SelectedFinalistDetail != '' && !selectedITag.includes('Other') && salesStage == 'In_Review' && component.get('v.oppCategory') == 'NB'  && component.get('v.maActivityType') == 'Traditional'){
                if(SelectedFinalistDetail != "Mtg Expected - Date Confirmed" && SelectedFinalistDetail != "Mtg Expected - Date Estimated" && SelectedFinalistDetail != "Mtg Conducted"){
                    if(component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag) > -1){
                        var index =  component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag);
                        component.get('v.requiredFieldsItag')[salesStage].splice(index, 1);
                    }
                    
                }else{
                    if(component.get('v.requiredFieldsItag')[salesStage] != null && component.get('v.requiredFieldsItag')[salesStage] != undefined){
                        if(component.get('v.requiredFieldsItag')[salesStage].length == 0){
                            component.get('v.requiredFieldsItag')[salesStage].push(conditionallyItag);
                        }else{
                            if(component.get('v.requiredFieldsItag')[salesStage].indexOf(conditionallyItag) == -1){
                                component.get('v.requiredFieldsItag')[salesStage].push(conditionallyItag);
                            }
                            
                        }
                    }
                }
            }
            var DetailDate = 'Finalist_Date_Detail_'+selectedTab+'__c';
            if(component.get('v.oppCategory') == 'NB' && component.get('v.maActivityType') == 'Traditional' && !selectedITag.includes('Other')){
                if(salesStage == 'In_Review'){
                    if(component.get('v.requiredFieldsItag')[salesStage] != null && component.get('v.requiredFieldsItag')[salesStage].length == 0){
                        component.get('v.requiredFieldsItag')[salesStage].push(DetailDate);
                    }else{
                        if(component.get('v.requiredFieldsItag')[salesStage].indexOf(DetailDate) == -1){
                            component.get('v.requiredFieldsItag')[salesStage].push(DetailDate);
                        }
                        
                    }
                }else if(salesStage == 'Finalist'){
                    if(component.get('v.requiredFieldsItag')[salesStage] != null && component.get('v.requiredFieldsItag')[salesStage].length == 0){
                        component.get('v.requiredFieldsItag')[salesStage].push('Finalist_SubStage_Medical__c');
                    }else{
                        if(component.get('v.requiredFieldsItag')[salesStage].indexOf('Finalist_SubStage_Medical__c') == -1){
                            component.get('v.requiredFieldsItag')[salesStage].push('Finalist_SubStage_Medical__c');
                        }
                        
                    }
                }
            }            
            if(component.get('v.oppCategory') == 'NBEA' && component.get('v.maActivityType') == 'Traditional' && !selectedITag.includes('Other') && salesStage == 'Finalist'){
                if(component.get('v.requiredFieldsItag')[salesStage] != null && component.get('v.requiredFieldsItag')[salesStage].length == 0){
                    component.get('v.requiredFieldsItag')[salesStage].push(DetailDate);
                    component.get('v.requiredFieldsItag')[salesStage].push('Finalist_SubStage_Medical__c');
                }else{
                    if(component.get('v.requiredFieldsItag')[salesStage].indexOf(DetailDate) == -1){
                        component.get('v.requiredFieldsItag')[salesStage].push(DetailDate);
                    } 
                    if(component.get('v.requiredFieldsItag')[salesStage].indexOf('Finalist_SubStage_Medical__c') == -1){
                        component.get('v.requiredFieldsItag')[salesStage].push('Finalist_SubStage_Medical__c');
                    }
                }
            }
            if(!isU_W_Engagement_not_yet_Needed && isU_W_Engagement_not_yet_Needed != undefined){
                requiredFieldsItagList = conditionallyRequiredisU_W_Engagement; 
            }else{
                requiredFieldsItagList = component.get('v.requiredFieldsItag')[salesStage];
            }
            readOnlyFieldsItagList = component.get('v.readOnlyFieldsItag')[salesStage];
        }else{
            if(component.get('v.isComments')){
                readOnlyFieldsItagList = component.get('v.readOnlyFieldsItag');
            }else{
                readOnlyFieldsItagList = component.get('v.genreadOnlyFieldsItag');
            }
            
        }
        var isMedOther = component.get('v.isMedOth');
        if(isMedOther === undefined){
            isMedOther = false;
        }
        
        var currentFieldsList;
        if(component.get('v.medicalFieldsList') !== undefined){
            currentFieldsList = component.get('v.medicalFieldsList');
        }
        if(isMedOther && onLoad){
            //salesStage = component.get('v.simpleRecord')[component.get('v.MedOthsalesStageItag')];
            //Proactive renewal update
            salesStage = component.get('v.otherSalesStage');
            if(salesStage != undefined && salesStage != null && salesStage !=''){
                salesStage = salesStage.replace(/ /g, '_');
            }
            if(component.get('v.requiredFieldsItagMO')[salesStage] !== undefined){
                requiredFieldsItagList = requiredFieldsItagList.concat(component.get('v.requiredFieldsItagMO')[salesStage]);                
            } 
            if(component.get('v.readOnlyFieldsItagMO')[salesStage] !== undefined){
                readOnlyFieldsItagList = readOnlyFieldsItagList.concat(component.get('v.readOnlyFieldsItagMO')[salesStage]);
            }else{
                readOnlyFieldsItagList = readOnlyFieldsItagList.concat(component.get('v.genreadOnlyFieldsItagMO'));
            }            	
        }else if(isMedOther === true && selectedITag.includes('Other')){
            //requiredFieldsItagList = requiredFieldsItagList.concat(component.get('v.requiredFieldsItagMO')[salesStage]);
            //readOnlyFieldsItagList = readOnlyFieldsItagList.concat(component.get('v.readOnlyFieldsItagMO')[salesStage]);
            requiredFieldsItagList = component.get('v.requiredFieldsItagMO')[salesStage];
            readOnlyFieldsItagList = component.get('v.readOnlyFieldsItagMO')[salesStage];
            currentFieldsList = component.get('v.othersFieldsList');
        }
        
        for(var i=0; i<genericFeildComponent_Id.length; i++){
            var readOnly = false;
            var required = false;
            
            if(readOnlyFieldsItagList !== undefined && readOnlyFieldsItagList.indexOf(genericFeildComponent_Id[i].get('v.iTag')) >= 0){
                readOnly = true;                
            } 
            if(requiredFieldsItagList !== undefined && requiredFieldsItagList.indexOf(genericFeildComponent_Id[i].get('v.iTag')) >= 0){
                required = true;                
            }              
            
            if(isMedOther && onLoad == false && currentFieldsList.indexOf(genericFeildComponent_Id[i].get('v.iTag')) >= 0){                
                if(readOnly && required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),true);
                }else if(readOnly){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),false);
                }else if(required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),true);
                }else{
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),false);
                } 
            }else if(isMedOther === false && onLoad == true){
                if(readOnly && required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),true);
                }else if(readOnly){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),false);
                }else if(required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),true);
                }else{
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),false);
                } 
            }else if(isMedOther === false && onLoad == false){
                if(readOnly && required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),true);
                }else if(readOnly){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),false);
                }else if(required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),true);
                }else{
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),false);
                } 
            }else if(isMedOther === true && onLoad == true){
                if(readOnly && required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),true);
                }else if(readOnly){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,true,component.get('v.isEdit'),false);
                }else if(required){
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),true);
                }else{
                    genericFeildComponent_Id[i].buildFeildsMethod(false,false,component.get('v.isEdit'),false);
                } 
            }
        } 
    },
    SyncSalesStagePicklist:function(component, event, selectedITag,sales_Stage_Name,DispositionValue) {
        if(sales_Stage_Name != undefined && sales_Stage_Name != null && sales_Stage_Name != ''){
            sales_Stage_Name = sales_Stage_Name.replace(/_/g,' ');
        }
        var genericFeildComponent_Id = component.find('genericFeildComponent_Id');
        var Selected_Stage_Name = '';
        var isFound = false;
        var DispositionValueArr = [];
        debugger;
        for(var i=0; i<genericFeildComponent_Id.length; i++){
            if(genericFeildComponent_Id[i].get('v.iTag') == selectedITag){
                var pregressionFieldItag = 'Progression_';
                pregressionFieldItag = pregressionFieldItag+selectedITag;
                //genericFeildComponent_Id[i].find('feildSetId').set('v.value',component.get('v.simpleRecord')[pregressionFieldItag]);
                genericFeildComponent_Id[i].find('feildSetId').set('v.value',sales_Stage_Name);
                genericFeildComponent_Id[i].set('v.MAFeildValue',sales_Stage_Name);
                if(isFound){
                    break
                }else{
                    isFound = true;
                }
            }else if(genericFeildComponent_Id[i].get('v.iTag') == component.get('v.DispositonItag')){
                var DispositionValue = component.get('v.DispositonMap')[DispositionValue];
                DispositionValueArr.push('');
                DispositionValueArr.push.apply(DispositionValueArr,DispositionValue);
                genericFeildComponent_Id[i].set('v.fields.picklistoptions',DispositionValueArr);
                if(isFound){
                    break
                }else{
                    isFound = true;
                }
            }
            
        } 
    },
    SyncSalesStage:function(component, event, selectedITag,sales_Stage_Name,DispositionValue) {
        if(sales_Stage_Name != undefined && sales_Stage_Name != null && sales_Stage_Name != ''){
            sales_Stage_Name = sales_Stage_Name.replace(/_/g,' ');
        }
        var saleStageProgressionId = component.find('saleStageProgressionId');
        var genericFeildComponent_Id = component.find('genericFeildComponent_Id');
        var Selected_Stage_Name = '';
        var DispositionValueArr = [];
        if(saleStageProgressionId != undefined || saleStageProgressionId != null){
            var isFound = false;
            if(Array.isArray(saleStageProgressionId)) {
                for(var i=0; i<saleStageProgressionId.length; i++){
                    if(saleStageProgressionId[i].get('v.SalesStageItag') == selectedITag){
                        saleStageProgressionId[i].syncSelectedStage(sales_Stage_Name);
                        break;
                    }
                } 
            } else{
                if(saleStageProgressionId.get('v.SalesStageItag') == selectedITag){
                    saleStageProgressionId.syncSelectedStage(sales_Stage_Name);
                }
            }
        }
        
        for(var i=0; i<genericFeildComponent_Id.length; i++){
            if(genericFeildComponent_Id[i].get('v.iTag') == component.get('v.DispositonItag')){
                var DispositionValue = component.get('v.DispositonMap')[DispositionValue];
                DispositionValueArr.push('');
                DispositionValueArr.push.apply(DispositionValueArr,DispositionValue);
                genericFeildComponent_Id[i].set('v.fields.picklistoptions',DispositionValueArr);
                break;
            }        
        } 
    },
    highlightsection: function(component, event,sales_Stage_Name,sectionlabel,selectedITag) {
        var oppcat= component.get('v.oppCategory');
        var selectedProdCatg= component.get('v.selectedProdCatg');
        var checkSectionLabel = '';
        var isMedOherMap = {};
        //Assign labels
        var MA_CM_Proposal_Highlight = $A.get("$Label.c.MA_CM_Proposal_Highlight");
        var MA_CM_Notified_Highlight = $A.get("$Label.c.MA_CM_Notified_Highlight");
        var MA_CM_Finalist_Highlight = $A.get("$Label.c.MA_CM_Finalist_Highlight");
        var MA_CD_Proposal_Highlight = $A.get("$Label.c.MA_CD_Proposal_Highlight");
        var MA_CD_Notified_Highlight = $A.get("$Label.c.MA_CD_Notified_Highlight");
        var MA_CD_Finalist_Highlight = $A.get("$Label.c.MA_CD_Finalist_Highlight");
        var MA_CD_InReview_Highlight = $A.get("$Label.c.MA_CD_InReview_Highlight");
        var MA_CD_Proposal_HighlightOther = $A.get("$Label.c.MA_CD_Proposal_HighlightOther");
        var MA_CM_Proposal_HighlightOther = $A.get("$Label.c.MA_CM_Proposal_HighlightOther");
        
        
        if(oppcat=='NBEA'){ 
            var checkEngagementBoolean = component.get('v.simpleRecord')['U_W_Engagement_not_yet_Needed_CI_APP_HI__c'];
            if(selectedProdCatg=='Medical_And_Other_Buy_Up'){
                if(selectedITag.includes('Medical')){
                    component.set('v.isMedicalSelected',true);
                }else{
                    component.set('v.isOtherSelected',true);
                }
                var medicalHighlight = '';
                if(component.get('v.isMedicalSelected')){
                    if(component.get('v.generalSalesStage') == 'Proposal'){
                        medicalHighlight = MA_CM_Proposal_Highlight.split(';;');
                        checkSectionLabel = medicalHighlight[0];                   
                    }
                    if(component.get('v.generalSalesStage')=='Notified'){
                        checkSectionLabel = MA_CM_Notified_Highlight;
                    } 
                    if(component.get('v.generalSalesStage')=='Finalist'){
                        checkSectionLabel = MA_CM_Finalist_Highlight;
                    } 
                }
                if(component.get('v.isOtherSelected')){
                    if(component.get('v.otherSalesStage') == 'Proposal'){
                        //checkSectionLabel = MA_CM_Proposal_HighlightOther;  
                        if(checkSectionLabel != ''){
                            checkSectionLabel = MA_CM_Proposal_Highlight+';;'+checkSectionLabel;
                        }else{
                            checkSectionLabel = MA_CM_Proposal_Highlight;
                        }
                        
                    }
                    if(component.get('v.otherSalesStage')=='Notified'){
                        if(checkSectionLabel != ''){
                            checkSectionLabel = MA_CM_Notified_Highlight+';;'+checkSectionLabel;
                        }else{
                            checkSectionLabel = MA_CM_Notified_Highlight;
                        }
                    } 
                    if(component.get('v.otherSalesStage') == 'Finalist'){
                        if(checkSectionLabel != ''){
                            checkSectionLabel = MA_CM_Finalist_Highlight+';;'+checkSectionLabel;
                        }else{
                            checkSectionLabel = MA_CM_Finalist_Highlight;
                        }
                    } 
                }
                
            }
            
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Medical') && selectedProdCatg!='Medical_And_Other_Buy_Up'){
                checkSectionLabel = MA_CM_Proposal_Highlight;                   
            }
            if(sales_Stage_Name=='Proposal' && selectedProdCatg=='Other_Buy_Up_Programs'){
                checkSectionLabel = MA_CM_Proposal_Highlight;                   
            }
            
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Pharmacy')){
                checkSectionLabel = MA_CM_Proposal_Highlight;                   
            }
            
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Dental')){
                checkSectionLabel = MA_CM_Proposal_Highlight;                   
            }
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Vision')){
                checkSectionLabel = MA_CM_Proposal_Highlight;                   
            }
            
            if(sales_Stage_Name=='Notified' && selectedProdCatg!='Medical_And_Other_Buy_Up'){
                checkSectionLabel = MA_CM_Notified_Highlight;
            } 
            if(sales_Stage_Name=='Finalist' && selectedProdCatg!='Medical_And_Other_Buy_Up'){
                checkSectionLabel =MA_CM_Finalist_Highlight;
            } 
            var arrcheckSectionLabel=checkSectionLabel.split(';;');
            if(sectionlabel!=null) {
                if(sectionlabel.length>0){
                    for(var i =0; i<sectionlabel.length; i++){
                        $A.util.removeClass(sectionlabel[i], 'hightlighfocus');
                    }                   
                    for(var i =0; i<sectionlabel.length; i++){
                        for(var j=0;j<arrcheckSectionLabel.length;j++){
                            if(sectionlabel[i].getElements()[0].textContent == arrcheckSectionLabel[j]){
                                //var cmpTarget = cmp.find('Section_Label');
                                $A.util.addClass(sectionlabel[i], 'hightlighfocus');
                            }  
                        }
                        
                    }
                }               
            } 
            
            
        }
        //NB
        if(oppcat=='NB'){            
            if(selectedProdCatg=='Medical_And_Other_Buy_Up'){
                if(selectedITag.includes('Medical')){
                    component.set('v.isMedicalSelected',true);
                }else{
                    component.set('v.isOtherSelected',true);
                }
                if(component.get('v.isMedicalSelected')){
                    if(component.get('v.generalSalesStage') == 'Proposal'){
                        checkSectionLabel = MA_CD_Proposal_Highlight;
                        checkSectionLabel = checkSectionLabel+';;General Information:';                  
                    }
                    if(component.get('v.generalSalesStage') =='In Review'){
                        checkSectionLabel = MA_CD_InReview_Highlight;
                    } 
                    if(component.get('v.generalSalesStage')=='Notified'){
                        checkSectionLabel = MA_CD_Notified_Highlight;
                    }
                    if(component.get('v.generalSalesStage')=='Finalist'){
                        checkSectionLabel = MA_CD_Finalist_Highlight;
                    }
                }
                if(component.get('v.isOtherSelected')){
                    if(component.get('v.otherSalesStage') == 'Proposal'){
                        if(checkSectionLabel != ''){
                            checkSectionLabel = MA_CD_Proposal_HighlightOther+';;'+checkSectionLabel;
                        }else{
                            checkSectionLabel = MA_CD_Proposal_HighlightOther;    
                        }
                        
                    }
                    if(component.get('v.otherSalesStage') == 'Notified'){
                        if(checkSectionLabel != ''){
                            checkSectionLabel = MA_CD_Notified_Highlight+';;'+checkSectionLabel;
                        }else{
                            checkSectionLabel = MA_CD_Notified_Highlight;
                        }
                    }
                    if(component.get('v.otherSalesStage') == 'Finalist'){
                        if(checkSectionLabel != ''){
                            checkSectionLabel = MA_CD_Finalist_Highlight+';;'+checkSectionLabel;
                        }else{
                            checkSectionLabel = MA_CD_Finalist_Highlight;
                        }
                    }
                }
            }
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Medical') && selectedProdCatg!='Medical_And_Other_Buy_Up'){
                checkSectionLabel = MA_CD_Proposal_Highlight;
                checkSectionLabel = checkSectionLabel+';;General Information:';
            }
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Pharmacy')){
                checkSectionLabel = MA_CD_Proposal_Highlight;                   
            }
            if(sales_Stage_Name=='Proposal' && selectedProdCatg=='Other_Buy_Up_Programs'){
                checkSectionLabel = MA_CD_Proposal_Highlight;                   
            }
            
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Dental')){
                checkSectionLabel = MA_CD_Proposal_Highlight;                   
            }
            if(sales_Stage_Name=='Proposal' && selectedITag.includes('Vision')){
                checkSectionLabel = MA_CD_Proposal_Highlight;                   
            }
            if(sales_Stage_Name=='Notified' && selectedProdCatg!='Medical_And_Other_Buy_Up'){
                checkSectionLabel = MA_CD_Notified_Highlight;
            }
            if(sales_Stage_Name=='Finalist' && selectedProdCatg!='Medical_And_Other_Buy_Up'){
                checkSectionLabel = MA_CD_Finalist_Highlight;
            }
            if(sales_Stage_Name=='In_Review' && selectedProdCatg=='Medical'){
                checkSectionLabel = MA_CD_InReview_Highlight;
            }
            
            
            var arrcheckSectionLabel=checkSectionLabel.split(';;');
            if(sectionlabel!=null) {
                if(sectionlabel.length>0){
                    for(var i =0; i<sectionlabel.length; i++){
                        $A.util.removeClass(sectionlabel[i], 'hightlighfocus');
                    }
                    for(var i =0; i<sectionlabel.length; i++){
                        for(var j=0;j<arrcheckSectionLabel.length;j++){
                            if(sectionlabel[i].getElements()[0].textContent == arrcheckSectionLabel[j]){
                                //var cmpTarget = cmp.find('Section_Label');
                                $A.util.addClass(sectionlabel[i], 'hightlighfocus');
                            }  
                        }
                        
                    }
                }                
                
            }            
        }         
    }
})