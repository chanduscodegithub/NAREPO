public class CMAccountTeamHistorySortWrapper implements Comparable {

    public CM_Account_Team_History__c cmAccountTeamHistoryObj;
    String fieldName;
    Boolean sortOrder;
    
    // Constructor
    public CMAccountTeamHistorySortWrapper(CM_Account_Team_History__c cmObj, String fN, Boolean sO) {
        cmAccountTeamHistoryObj = cmObj;
        fieldName = fN;
        sortOrder = sO;
    }
    
    // Implement the compareTo() method
    public Integer compareTo(Object compareTo) {
        
        CMAccountTeamHistorySortWrapper compareToRecord = (CMAccountTeamHistorySortWrapper)compareTo;
        
        if(fieldName != null && fieldName.equalsIgnoreCase('Case_Management_Start_Date__c')) {
            
        	if (cmAccountTeamHistoryObj.Case_Management_Start_Date__c > compareToRecord.cmAccountTeamHistoryObj.Case_Management_Start_Date__c) {
            	return sortOrder ? 1 : -1;
            } else if(cmAccountTeamHistoryObj.Case_Management_Start_Date__c < compareToRecord.cmAccountTeamHistoryObj.Case_Management_Start_Date__c) {
                return sortOrder ? -1 : 1;
            }
            
        } else if(fieldName != null && fieldName.equalsIgnoreCase('Case_Management_End_Date__c')) {
            
        	if (cmAccountTeamHistoryObj.Case_Management_End_Date__c > compareToRecord.cmAccountTeamHistoryObj.Case_Management_End_Date__c) {
            	return sortOrder ? 1 : -1;
            } else if (cmAccountTeamHistoryObj.Case_Management_End_Date__c < compareToRecord.cmAccountTeamHistoryObj.Case_Management_End_Date__c) { 
                return sortOrder ? -1 : 1;
            }
        } else if(fieldName != null && fieldName.equalsIgnoreCase('Last_Name__c')) {
            
        	if (cmAccountTeamHistoryObj.Last_Name__c > compareToRecord.cmAccountTeamHistoryObj.Last_Name__c) {
            	return sortOrder ? 1 : -1;
            } else if (cmAccountTeamHistoryObj.Last_Name__c < compareToRecord.cmAccountTeamHistoryObj.Last_Name__c) { 
                return sortOrder ? -1 : 1;
            }
        } else if(fieldName != null && fieldName.equalsIgnoreCase('Name')) {
            
        	if (cmAccountTeamHistoryObj.Name > compareToRecord.cmAccountTeamHistoryObj.Name) {
            	return sortOrder ? 1 : -1;
            } else if (cmAccountTeamHistoryObj.Name < compareToRecord.cmAccountTeamHistoryObj.Name) { 
                return sortOrder ? -1 : 1;
            }
        }  else if(fieldName != null && fieldName.equalsIgnoreCase('Job_Title__c')) {
            
        	if (cmAccountTeamHistoryObj.Job_Title__c > compareToRecord.cmAccountTeamHistoryObj.Job_Title__c) {
            	return sortOrder ? 1 : -1;
            } else if (cmAccountTeamHistoryObj.Job_Title__c < compareToRecord.cmAccountTeamHistoryObj.Job_Title__c) { 
                return sortOrder ? -1 : 1;
            }
        }
        return 0;
    }
}