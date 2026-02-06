public with sharing class ExecutiveSummaryReports {
    @AuraEnabled
    public Static tabularReportResponse getTabularReportResponse(Id opportunityId) {
        tabularReportResponse trr = new tabularReportResponse();
        List<List<fieldData>> fieldDataList = new List<List<fieldData>>();
        
        List <OpportunityLineItem> productsList = [Select Product2.Name,Disposition_Other_Buy_Up_Programs__c,Product_Line__c,Estimated_Additional_New_Members__c,Existing_Membership_at_Risk__c,Sold_New_Members__c,Termed_Members__c,Net_Results__c,Sold_Retained_Members__c,Existing_Members_Involved_in_the_Bid__c,Mbrs_Transferred_From_To_Another_Segment__c,Existing_Members_Retained__c from OpportunityLineItem where OpportunityId = :opportunityId AND (Product2.Name = 'Total' OR Product_Line__c='Other')];
      	for(OpportunityLineItem product : productsList){
            List<fieldData> fieldDataRow = new List<fieldData>();
            //Name
            fieldData fd = new fieldData();               
            fd.fieldValue = product.Product_Line__c;          
            fieldDataRow.add(fd);
            
            fieldData fd1 = new fieldData();               
            fd1.fieldValue = product.Product2.Name;          
            fieldDataRow.add(fd1);
            
            fieldData fd2 = new fieldData();               
            fd2.fieldValue = product.Estimated_Additional_New_Members__c;          
            fieldDataRow.add(fd2);
            
            fieldData fd3 = new fieldData();               
            fd3.fieldValue = product.Existing_Membership_at_Risk__c;          
            fieldDataRow.add(fd3);
            
            fieldData fd4 = new fieldData();               
            fd4.fieldValue = product.Sold_New_Members__c;          
            fieldDataRow.add(fd4);
            
            fieldData fd5 = new fieldData();               
            fd5.fieldValue = product.Termed_Members__c;          
            fieldDataRow.add(fd5);
            
            fieldData fd6 = new fieldData();               
            fd6.fieldValue = product.Net_Results__c;          
            fieldDataRow.add(fd6);
            
            fieldData fd7 = new fieldData();               
            fd7.fieldValue = product.Sold_Retained_Members__c;          
            fieldDataRow.add(fd7);
            
            fieldData fd8 = new fieldData();               
            fd8.fieldValue = product.Existing_Members_Involved_in_the_Bid__c;          
            fieldDataRow.add(fd8);
            
            fieldData fd9 = new fieldData();               
            fd9.fieldValue = product.Mbrs_Transferred_From_To_Another_Segment__c;          
            fieldDataRow.add(fd9);
            
            fieldData fd10 = new fieldData();               
            fd10.fieldValue = product.Disposition_Other_Buy_Up_Programs__c;          
            fieldDataRow.add(fd10);
            
            fieldData fd11 = new fieldData();               
            fd11.fieldValue = product.Existing_Members_Retained__c;          
            fieldDataRow.add(fd11);
                                                        
            fieldDataList.add(fieldDataRow);
        }
             
        trr.fieldDataList = fieldDataList;
        return trr;
    }
    
    @AuraEnabled
    public Static tabularReportResponse getCompetitorReportResponse(Id opportunityId) {
        tabularReportResponse trr = new tabularReportResponse();
        List<List<fieldData>> fieldDataList = new List<List<fieldData>>();
        
        List<MA_Competitor__c> competitorsList = [Select Competitor_Classification__c,Competitor_Account__r.Name,Name, Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c from MA_Competitor__c where Competitor_Classification__c != 'Other' AND (Number_of_Members_Held__c > 0 OR Number_of_Members_Awarded__c > 0) AND Opportunity__c = :opportunityId AND Competitor_Account__r.Name != 'Total'];
      	for(MA_Competitor__c competitor : competitorsList){
            List<fieldData> fieldDataRow = new List<fieldData>();
            //Name
            fieldData fd = new fieldData();               
            fd.fieldValue = competitor.Competitor_Classification__c;          
            fieldDataRow.add(fd);
            
            fieldData fd1 = new fieldData();               
            fd1.fieldValue = competitor.Competitor_Account__r.Name;          
            fieldDataRow.add(fd1);
            
            fieldData fd2 = new fieldData();               
            fd2.fieldValue = competitor.Name;          
            fieldDataRow.add(fd2);
            
            fieldData fd3 = new fieldData();               
            fd3.fieldValue = competitor.Number_of_Members_Held__c;          
            fieldDataRow.add(fd3);
            
            fieldData fd4 = new fieldData();               
            fd4.fieldValue = competitor.of_Members_Held__c;          
            fieldDataRow.add(fd4);
            
            fieldData fd5 = new fieldData();               
            fd5.fieldValue = competitor.Number_of_Members_Awarded__c;          
            fieldDataRow.add(fd5);
            
            fieldData fd6 = new fieldData();               
            fd6.fieldValue = competitor.of_Members_Awarded__c;          
            fieldDataRow.add(fd6);
            
            fieldDataList.add(fieldDataRow);
        }
                     
        trr.fieldDataList = fieldDataList;
        return trr;
    }
    
    public class tabularReportResponse {     
        @AuraEnabled
        public List<List<fieldData>> fieldDataList {get; set;}
        public tabularReportResponse(){}       
        
    }
      
    public class fieldData {
        @AuraEnabled
        public Object fieldValue {get; set;}             
        @AuraEnabled
        public Boolean isHyperLink {get; set;}          
        public fieldData(){isHyperLink=false;}
    } 
}