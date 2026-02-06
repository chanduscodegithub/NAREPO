({
	setMedTotalRecToChecked : function(cmp) {
        if(cmp.get("v.OpportunityLineItemsObj.Copy_the_Membership_from_Medical__c")){
            var OpportunityLineItemsObj = cmp.get('v.OpportunityLineItemsObj');
            var totalRecordObj = cmp.get('v.totalRecordObj');
            var maType = cmp.get('v.maType');            
            OpportunityLineItemsObj.Mbrs_Transferred_From_To_Another_Segment__c = totalRecordObj.Mbrs_Transferred_From_To_Another_Segment__c;   
            OpportunityLineItemsObj.Members_Quoted_in_the_Proposal__c = totalRecordObj.Members_Quoted_in_the_Proposal__c;                   
            OpportunityLineItemsObj.Existing_Members_Involved_in_the_Bid__c = totalRecordObj.Existing_Members_Involved_in_the_Bid__c;   
            OpportunityLineItemsObj.Estimated_Additional_New_Members__c = totalRecordObj.Estimated_Additional_New_Members__c;   
            OpportunityLineItemsObj.Existing_Membership_at_Risk__c = totalRecordObj.Existing_Membership_at_Risk__c; 
            OpportunityLineItemsObj.Product_Conversion__c = totalRecordObj.Product_Conversion__c;
            cmp.set('v.OpportunityLineItemsObj',OpportunityLineItemsObj);
            this.caluculateTotalRecord(cmp);
        }  
	},
    caluculateTotalRecordDisposition : function(component) {
        
        var oppor = component.get('v.OpportunityLineItemsObj');        
        var maType = component.get('v.maType');
        var SalesStage = component.get('v.SalesStage');        
        var isSpecial = component.get("v.isSpecialityProduct");

        if(SalesStage == 'Notified' || isSpecial){

            console.log('caluculateTotalRecord in modal');
            
            var soldRetainedMem = 0;
            var Disposition = component.get('v.Disposition');
            
            if(component.get('v.productType') == $A.get("$Label.c.Other_Buy_Up_Program")){
                Disposition = component.get('v.OpportunityLineItemsObj.Disposition_Other_Buy_Up_Programs__c');
            }
                    console.log('dispositionselected>>>'+Disposition);

            
            if(oppor['Sold_Retained_Members__c'] != undefined && oppor['Sold_Retained_Members__c'] != null){
                soldRetainedMem = oppor['Sold_Retained_Members__c'];
            }    
            
            if(maType == $A.get("$Label.c.MA_CD_TYPE")){
                
                debugger;
                if((Disposition != 'Sold')){                    
                    if(Disposition != null && Disposition != '' && Disposition.length > 0){                     	                        
                        oppor['Sold_Retained_Members__c'] = 0;                        
                    }else{
                        oppor['Sold_Retained_Members__c'] = undefined;
                    }                    
                }else{
                    oppor['Sold_Retained_Members__c'] = undefined;
                }
                soldRetainedMem = 0;
                if(oppor['Sold_Retained_Members__c'] != undefined && oppor['Sold_Retained_Members__c'] != null){
                    soldRetainedMem = oppor['Sold_Retained_Members__c'];
                }  
                
                if(Disposition == 'Sold'){                                  
                    oppor['Net_Results__c'] = soldRetainedMem - oppor['Mbrs_Transferred_From_To_Another_Segment__c'];            
                }else if(Disposition != null && Disposition != '' && Disposition.length > 0){
                    oppor['Net_Results__c'] = 0;
                    if(oppor['Sold_Retained_Members__c'] == null || oppor['Sold_Retained_Members__c'] == undefined || oppor['Sold_Retained_Members__c'] == ''){
                        oppor['Sold_Retained_Members__c'] = 0;   
                    }                        
                }   
            }else if(maType == $A.get("$Label.c.MA_CM_TYPE")){
                   debugger;
                if((Disposition != 'Sold' && Disposition != 'Closed Emerging Risk' && Disposition != 'Dead')){                    
                    if(Disposition != null && Disposition != '' && Disposition.length > 0){                     	                        
                            oppor['Sold_Retained_Members__c'] = 0;                        
                    }else{
                        oppor['Sold_Retained_Members__c'] = undefined;
                    }                    
                }else if(Disposition != 'Dead'){
                     //ghanshyam c 1493
                    oppor['Sold_Retained_Members__c'] = undefined;
                }
                
                soldRetainedMem = 0;
                if(oppor['Sold_Retained_Members__c'] != undefined && oppor['Sold_Retained_Members__c'] != null){
                    soldRetainedMem = oppor['Sold_Retained_Members__c'];
                }  
                
                if(Disposition == 'Sold' || Disposition == 'Lost: Finalist' || Disposition == 'Lost: Non-Finalist'){
                    oppor['Net_Results__c'] = soldRetainedMem - oppor['Existing_Members_Involved_in_the_Bid__c'];            
                } else if(Disposition == 'Closed Emerging Risk'){
                    oppor['Net_Results__c'] = soldRetainedMem - oppor['Existing_Membership_at_Risk__c']; 
                } else if(Disposition == 'Dead Lead' || Disposition == 'Dead RFI' || Disposition == 'Declined' || Disposition == 'Passed to Another Segment'){
                    oppor['Net_Results__c'] = 0;
                    if(oppor['Sold_Retained_Members__c'] == null || oppor['Sold_Retained_Members__c'] == undefined || oppor['Sold_Retained_Members__c'] == ''){
                        oppor['Sold_Retained_Members__c'] = 0;   
                    }                        
                }
                //ghanshyam 1493 start for other
                //checking dispositon condition
                if(component.get('v.OpportunityLineItemsObj.Disposition_Other_Buy_Up_Programs__c') =='Dead'){ 
                    oppor['Sold_Retained_Members__c'] =  oppor['Existing_Members_Involved_in_the_Bid__c'];
                }
                
                //Case 1226 - Existing Members Retained, Existing Members Retained Pinnacle
                var soldRetained = oppor.Sold_Retained_Members__c;
                soldRetained = (soldRetained != undefined && soldRetained != null) ? soldRetained : 0;
                
                if(Disposition == 'Closed Emerging Risk') { 
                    oppor['Existing_Members_Retained__c'] = soldRetained;
                } else {
                    if(soldRetained >= oppor.Existing_Members_Involved_in_the_Bid__c) {
                        oppor['Existing_Members_Retained__c'] = oppor.Existing_Members_Involved_in_the_Bid__c;
                    } else {
                        oppor['Existing_Members_Retained__c'] = soldRetained;
                    }
                }
                
                if(soldRetained >= oppor.Existing_Membership_at_Risk__c){
                    oppor['Existing_Members_Retained_Pinnacle__c'] = oppor.Existing_Membership_at_Risk__c;
                }else{
                    oppor['Existing_Members_Retained_Pinnacle__c'] = soldRetained;
                }
            }
            
            if(oppor['Net_Results__c'] != null && oppor['Net_Results__c'] != undefined){
                if(oppor['Net_Results__c'] >= 0){
                    oppor['Sold_New_Members__c'] = oppor['Net_Results__c'];
                    oppor['Termed_Members__c'] = 0;
                }else{
                    oppor['Termed_Members__c'] = oppor['Net_Results__c'];
                    oppor['Sold_New_Members__c'] = 0;
                }
            }            
        }
        
        component.set('v.OpportunityLineItemsObj',oppor);
        
        if(component.get('v.productType') == $A.get("$Label.c.Other_Buy_Up_Program"))return;        
        var compEvent = component.getEvent("ProductsListCompEvent");         
        compEvent.setParams({
            "isCaluculate" : true
        });
        compEvent.fire();
    },
    caluculateTotalRecord : function(component) {
        
        var oppor = component.get('v.OpportunityLineItemsObj');        
        var maType = component.get('v.maType');
        maType = (maType != undefined && maType != null) ? maType : '';
        var SalesStage = component.get('v.SalesStage');    
        SalesStage = (SalesStage != undefined && SalesStage != null) ? SalesStage : '';
        var isSpecial = component.get("v.isSpecialityProduct");
        isSpecial = (isSpecial != undefined && isSpecial != null) ? isSpecial : false;
        
        if((SalesStage == 'Notified' || isSpecial) && oppor != undefined && oppor != null){
            
            console.log('caluculateTotalRecord in modal');
            
            var soldRetainedMem = 0;
            var Disposition = component.get('v.Disposition');
            
            if(component.get('v.productType') == $A.get("$Label.c.Other_Buy_Up_Program")){
                Disposition = component.get('v.OpportunityLineItemsObj.Disposition_Other_Buy_Up_Programs__c');
            }else{
                if(Disposition == null || Disposition == undefined || Disposition == ''){
                    //oppor['Sold_Retained_Members__c'] = undefined;
                }
            }
            
            if(oppor['Sold_Retained_Members__c'] != undefined && oppor['Sold_Retained_Members__c'] != null){
                soldRetainedMem = oppor['Sold_Retained_Members__c'];
            }    
            
            if(maType == $A.get("$Label.c.MA_CD_TYPE")){
                if(Disposition == 'Sold'){                   
                    if(soldRetainedMem != undefined && soldRetainedMem != null){
                    	oppor['Net_Results__c'] = soldRetainedMem - oppor['Mbrs_Transferred_From_To_Another_Segment__c'];                
                    }else{
                        oppor['Net_Results__c'] = 0;
                    }
                    
                }else if(Disposition != null && Disposition != '' && Disposition.length > 0){
                    oppor['Net_Results__c'] = 0;
                    if(oppor['Sold_Retained_Members__c'] == null || oppor['Sold_Retained_Members__c'] == undefined || oppor['Sold_Retained_Members__c'] == ''){
                        oppor['Sold_Retained_Members__c'] = 0;   
                    }                        
                }                   
                                
            }else if(maType == $A.get("$Label.c.MA_CM_TYPE")){                 
                
                if(Disposition == 'Sold' || Disposition == 'Lost: Finalist' || Disposition == 'Lost: Non-Finalist'){
                    oppor['Net_Results__c'] = soldRetainedMem - oppor['Existing_Members_Involved_in_the_Bid__c'];            
                }else if(Disposition == 'Closed Emerging Risk'){
                    oppor['Net_Results__c'] = soldRetainedMem - oppor['Existing_Membership_at_Risk__c']; 
                }
                    else if(Disposition == 'Dead Lead' || Disposition == 'Dead RFI' || Disposition == 'Dead' || Disposition == 'Declined' || Disposition == 'Passed to Another Segment'){
                        oppor['Net_Results__c'] = 0;
                        if(oppor['Sold_Retained_Members__c'] == null || oppor['Sold_Retained_Members__c'] == undefined || oppor['Sold_Retained_Members__c'] == ''){
                            oppor['Sold_Retained_Members__c'] = 0;   
                        }                        
                    }
                
                var disposition = '';
                if(component.get('v.productType') == $A.get("$Label.c.Other_Buy_Up_Program")) {
                    disposition = component.get('v.OpportunityLineItemsObj.Disposition_Other_Buy_Up_Programs__c');
                } else {
                    disposition = component.get('v.Disposition');
                    disposition = (disposition != undefined && disposition != null) ? disposition : '';
                }

                var soldRetained = oppor.Sold_Retained_Members__c;
                soldRetained = (soldRetained != undefined && soldRetained != null) ? soldRetained : 0;
                
                if(disposition == 'Closed Emerging Risk') { 
                    oppor['Existing_Members_Retained__c'] = soldRetained;
                } else {
                    if(soldRetained >= oppor.Existing_Members_Involved_in_the_Bid__c) {
                        oppor['Existing_Members_Retained__c'] = oppor.Existing_Members_Involved_in_the_Bid__c;
                    } else {
                        oppor['Existing_Members_Retained__c'] = soldRetained;
                    }
                }
                
                if(soldRetained >= oppor.Existing_Membership_at_Risk__c){
                    oppor['Existing_Members_Retained_Pinnacle__c'] = oppor.Existing_Membership_at_Risk__c;
                }else{
                    oppor['Existing_Members_Retained_Pinnacle__c'] = soldRetained;
                }
            }
            
            if(oppor['Net_Results__c'] != null && oppor['Net_Results__c'] != undefined){
                if(oppor['Net_Results__c'] >= 0){
                    oppor['Sold_New_Members__c'] = oppor['Net_Results__c'];
                    oppor['Termed_Members__c'] = 0;
                }else{
                    oppor['Termed_Members__c'] = oppor['Net_Results__c'];
                    oppor['Sold_New_Members__c'] = 0;
                }
            } else {
                oppor['Sold_New_Members__c'] = 0;
                oppor['Termed_Members__c'] = 0;
            }  
            
        }
         if(oppor != undefined && oppor != null){
        //Added vignesh
        oppor['Product_Conversion__c'] = component.get('v.OpportunityLineItemsObj.Product_Conversion__c');
         }
        component.set('v.OpportunityLineItemsObj',oppor);
        
        if(component.get('v.productType') == $A.get("$Label.c.Other_Buy_Up_Program"))return;        
        var compEvent = component.getEvent("ProductsListCompEvent");         
        compEvent.setParams({
            "isCaluculate" : true
        });
        compEvent.fire();
    },
    evaluateDispositionEditability : function(component) {
        var isSpecialityProduct = component.get("v.isSpecialityProduct");
        var isEditRecord        = component.get("v.isEditRecord");
        var isQA                = component.get("v.isQA");
        var salesStage          = component.get("v.SalesStage");
        var copyFromMedical     = component.get("v.OpportunityLineItemsObj.Copy_the_Membership_from_Medical__c");

        var specialtyBranch = isSpecialityProduct && isEditRecord && !isQA;

        var notifiedBranch = isEditRecord && salesStage === 'Notified' && copyFromMedical !== true;

        var stageOverrideBranch =  isEditRecord && ( salesStage === 'Spin-Off' || salesStage === 'Transfer In/Out');

        var canEdit = specialtyBranch || notifiedBranch || stageOverrideBranch; 

        console.log('isQA:', isQA);
        console.log('specialtyBranch:', specialtyBranch);
        console.log('notifiedBranch:', notifiedBranch);
        console.log('canEditDisposition:', canEdit);

        component.set("v.canEditDisposition", canEdit);
    }

})