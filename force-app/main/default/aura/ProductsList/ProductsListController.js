({	    
    doInit : function(component, event, helper) {        
        if(component.get('v.productType') != $A.get("$Label.c.Medical") && component.get('v.productType') != $A.get("$Label.c.Other_Buy_Up_Program")){            
            var totalRecordObj = { "Existing_Members_Involved_in_the_Bid__c":0,"Mbrs_Transferred_From_To_Another_Segment__c" :0 ,"Estimated_Additional_New_Members__c":0,"Estimated_Members_Existing_New__c":0,"Members_Quoted_in_the_Proposal__c":0,"Existing_Membership_at_Risk__c":0,"Sold_Retained_Members__c":0,"Net_Results__c":0,"Annual_Revenue_Premium__c":0,"Product_Conversion__c":0};
            component.set('v.totalRecordObj',totalRecordObj);   
        }        
        helper.caluculateTotalRecord(component);
        
        try {
            var isQA = component.get('v.isQA');
            if(isQA != null && isQA == true){
                //name columns to highlight on QA doinit
                var columnNames = ['check_to_synch_with_medical','Existing_Membership_at_Risk__c','Existing_Members_Involved_in_the_Bid__c','Estimated_Additional_New_Members__c','Sold_Retained_Members__c','Mbrs_Transferred_From_To_Another_Segment__c','Mbrs_Transferred_From_To_Another_Segment__c','Members_Quoted_In_Proposal','Product_Conversion__c'];
                for(var i = 0; i < columnNames.length ; i++){
                    var focusColumn = component.find('Class_'+columnNames[i]);
                    if(focusColumn != undefined && focusColumn != null){
                        $A.util.removeClass(focusColumn, 'focusColor');      
                    }        	 
                }  
                
                var SalesStage = component.get('v.SalesStage');
                var maType = component.get('v.maType');
                var Disposition  = component.get('v.Disposition');
                var isPendingTransfer = component.get('v.isPendingTransfer');
                
                if(maType == $A.get("$Label.c.MA_CM_TYPE")){            
                    if(SalesStage == $A.get("$Label.c.EmergingRiskOrNoUpside")){                    
                        var focusColumn = component.find('Class_'+'Existing_Membership_at_Risk__c'); 
                        $A.util.addClass(focusColumn, 'focusColor');  
                        //ghanshyam c 1584
                        focusColumn = component.find('Class_'+'check_to_synch_with_medical');
                        $A.util.addClass(focusColumn, 'focusColor');
                    }else if(SalesStage == 'Lead'){                    
                        var focusColumn = component.find('Class_'+'Existing_Members_Involved_in_the_Bid__c'); 
                        $A.util.addClass(focusColumn, 'focusColor');
                        focusColumn = component.find('Class_'+'Estimated_Additional_New_Members__c'); 
                        $A.util.addClass(focusColumn, 'focusColor');
                        //ghanshyam c added to highlight column
                        focusColumn = component.find('Class_'+'check_to_synch_with_medical'); 
                        $A.util.addClass(focusColumn, 'focusColor');
                        focusColumn = component.find('Class_'+'Existing_Membership_at_Risk__c'); 
                        $A.util.addClass(focusColumn, 'focusColor');            
                    }else if(SalesStage == 'Notified'){
                        if(Disposition == 'Sold' || Disposition == 'Closed Emerging Risk'){                        
                            var focusColumn = component.find('Class_'+'Sold_Retained_Members__c'); 
                            $A.util.addClass(focusColumn, 'focusColor'); 
                        }                   
                    }else if(isPendingTransfer){                    
                        var focusColumn = component.find('Class_'+'Mbrs_Transferred_From_To_Another_Segment__c'); 
                        $A.util.addClass(focusColumn, 'focusColor');
                    }            
                }else if(maType == $A.get("$Label.c.MA_CD_TYPE")){                    
                    if(SalesStage == 'Lead'){
                        var focusColumn = component.find('Class_'+'Mbrs_Transferred_From_To_Another_Segment__c'); 
                         $A.util.addClass(focusColumn, 'focusColor');                 
                        focusColumn = component.find('Class_'+'Estimated_Additional_New_Members__c'); 
                         $A.util.addClass(focusColumn, 'focusColor');
                        //ghanshyam c added to highlight column
                        focusColumn = component.find('Class_'+'check_to_synch_with_medical'); 
                        $A.util.addClass(focusColumn, 'focusColor');
                        
                    }else if(SalesStage == 'Proposal'){
                        var focusColumn = component.find('Class_'+'Members_Quoted_In_Proposal'); 
                         $A.util.addClass(focusColumn, 'focusColor');                                 
                    }else if(SalesStage == 'Notified'){
                        if(Disposition == 'Sold'){                   
                            var focusColumn = component.find('Class_'+'Sold_Retained_Members__c'); 
                             $A.util.addClass(focusColumn, 'focusColor'); 
                        }                
                    }              
                }      
            }
            
        }
        catch(err) {         
        }
              
	}, 
    
    eachProductEvents : function(component, event, helper) {        
        if(event.getParam('isCaluculate')){
            helper.caluculateTotalRecord(component);           
            var compEvent = component.getEvent("ProductsListToProductCompEvent");         
            compEvent.setParams({
                "isCaluculateOtherProducts" : true
            });
            compEvent.fire();            
        }        
    },
    
    focusProducts : function(component, event, helper) {
        console.log('focusProducts');
        setTimeout(function() {
            var params = event.getParam('arguments');
            var focusInputField = '';
            var isPdtsReviewReminderVal = params.isPdtsReviewReminder;
            if(isPdtsReviewReminderVal != undefined && isPdtsReviewReminderVal != null && isPdtsReviewReminderVal) {
            	focusInputField = component.find("focusInputFieldForProductsMedOthrs1");
            } else {
                focusInputField = component.find("focusInputFieldForProductsMedOthrs");
            }
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 100);
    }
})