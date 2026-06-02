trigger CampaignMemberTrigger on CampaignMember (after insert, after update) {
    if (Trigger.isAfter) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CampaignMemberTriggerHandler.processCampaignMember(Trigger.new, Trigger.oldMap);
        }
    }
}