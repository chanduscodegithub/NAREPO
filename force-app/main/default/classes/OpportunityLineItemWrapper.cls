global class OpportunityLineItemWrapper implements Comparable {
    public OpportunityLineItem oppLineItem;
    String fieldName;
    Boolean sortOrder;
    
    // Constructor
    public OpportunityLineItemWrapper(OpportunityLineItem opLnItm,String fldNm, Boolean srtOrdr) {
        oppLineItem = opLnItm;
        fieldName = fldNm;
        sortOrder = srtOrdr;
    }
    
    // Compare opportunities based on the opportunity amount.
    global Integer compareTo(Object compareTo) {
        // Cast argument to OpportunityWrapper
        OpportunityLineItemWrapper compareToRecord = (OpportunityLineItemWrapper)compareTo;
        if(fieldName != null && fieldName.equalsIgnoreCase('Product2.Name')) {
            if(oppLineItem.Product2.Name=='Total')
            {
                if(compareToRecord.oppLineItem.Product2.Name=='Total'){
                    if (oppLineItem.Product_Line__c > compareToRecord.oppLineItem.Product_Line__c) {
                        return sortOrder ? 1 : -1;
                    } else if (oppLineItem.Product_Line__c < compareToRecord.oppLineItem.Product_Line__c) { 
                        return sortOrder ? -1 : 1;
                    }
                }
                else{
                    if (oppLineItem.Product_Line__c > compareToRecord.oppLineItem.Product2.Name) {
                        return sortOrder ? 1 : -1;
                    } else if (oppLineItem.Product_Line__c < compareToRecord.oppLineItem.Product2.Name) { 
                        return sortOrder ? -1 : 1;
                    }
                }
                
            }
            else{
                if(compareToRecord.oppLineItem.Product2.Name=='Total'){
                    if (oppLineItem.Product2.Name > compareToRecord.oppLineItem.Product_Line__c) {
                        return sortOrder ? 1 : -1;
                    } else if (oppLineItem.Product2.Name < compareToRecord.oppLineItem.Product_Line__c) { 
                        return sortOrder ? -1 : 1;
                    }
                }
                else{
                    if (oppLineItem.Product2.Name > compareToRecord.oppLineItem.Product2.Name) {
                        return sortOrder ? 1 : -1;
                    } else if (oppLineItem.Product2.Name < compareToRecord.oppLineItem.Product2.Name) { 
                        return sortOrder ? -1 : 1;
                    }
                }
            }
            
        }
        return 0;       
    }
}