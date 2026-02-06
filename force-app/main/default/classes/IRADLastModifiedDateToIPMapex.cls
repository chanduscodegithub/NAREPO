/** ######################################################################################
* @author       Sudarshan reddy M
* @date         06/07/2019
* @description  This invocable class is to populate the IRAD Last Modified Date to IPM Record                
*##########################################################################################    */
public class IRADLastModifiedDateToIPMapex {
    
    @InvocableMethod(label='IRAD Last Modified Date Population' description='Populating the IRAD Last Modified Date to IPM Record')
    public static void IRADLastModifiedDatePopulatingToIPMRecord (List<string> iradId) {
        
        List<Project_Template__c> updateIPM = new List<Project_Template__c>();
        Map<id,Project_Template__c> ipmMapUpdate = new Map<id,Project_Template__c>();
        
        
        List<IRAD__c> iradList = [SELECT id, LastModifiedDate, Project__r.IRAD_Last_Modified_Date__c
                                  FROM IRAD__c
                                  WHERE ID In:iradId];
        
        if(iradList != null && iradList.size() > 0){
            for(IRAD__c ir : iradList){
                Project_Template__c ipm = new Project_Template__c();
                Date lastModDate  = Date.newinstance(ir.LastModifiedDate.year(), ir.LastModifiedDate.month(), ir.LastModifiedDate.day());
                ipm.Id = ir.Project__c;
                ipm.IRAD_Last_Modified_Date__c = lastModDate;
                updateIPM.add(ipm);
            }
            ipmMapUpdate.putall(updateIPM);
        }
        
        if(ipmMapUpdate != null && ipmMapUpdate.size() > 0){
            update ipmMapUpdate.values();
        }
    }
}