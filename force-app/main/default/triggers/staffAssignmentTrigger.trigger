/**
* Purpose     : 1.Update Staffing Assignment field with respective staff when Staff User Assignment changed
				2. Create staff record when there is no staff available for the use
				3. Update Case management end date(Obj: Service AMT) with start date of staff assignment
* Class       : staffAssignmentTrigger
* Test class  : staffAssignmentTriggerHelperTest
* Helper class: staffAssignmentTriggerHelper
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
trigger staffAssignmentTrigger on Staff_Assignment__c (before insert , before update, after insert, after update) {
    if([Select Active__c, Id, Label From Capacity_Planning_trigger_flags__mdt  where Label='isstaffAssignmentTriggerActive'].Active__c){
        if(trigger.isBefore){
            if(trigger.isupdate){
                system.debug('Inside trigger.isupdate = '+trigger.isupdate);
                if (!staffAssignmentTriggerHelper.isRunUpdate) {
                    staffAssignmentTriggerHelper.staffAssignmentUpdate(trigger.newMap, trigger.oldMap);
                    staffAssignmentTriggerHelper.calculateHoc(trigger.new);
                    //staffAssignmentTriggerHelper.calculateStaffHoc(trigger.new);
                }
               /** if (!staffAssignmentTriggerHelper.isRunUpdate2) {
                    staffAssignmentTriggerHelper.serviceAMTEndDateUpdate(trigger.newMap, trigger.oldMap);
                }**/
            }else if(trigger.isinsert ){
                if (!staffAssignmentTriggerHelper.isRunInsert) {
                    staffAssignmentTriggerHelper.staffAssignmentInsert(trigger.new);
                    staffAssignmentTriggerHelper.calculateHoc(trigger.new);
                    //staffAssignmentTriggerHelper.calculateStaffHoc(trigger.new);
                }
            }
            
            /*if (Trigger.isInsert || Trigger.isUpdate) {
            	staffAssignmentTriggerHelper.calculateTotalHoursOfComplexity(Trigger.new);
        	}*/
        }
        if(Trigger.isAfter){
                system.debug('Inside Trigger.isAfter');
                if(trigger.isInsert){
                    staffAssignmentTriggerHelper.calculateStaffHoc(trigger.new);
                }
                else if(trigger.isUpdate){
                    system.debug('Inside Trigger.isAfter trigger.isUpdate');
                    staffAssignmentTriggerHelper.calculateStaffHoc(trigger.new);
                }
            }
    }
    
}