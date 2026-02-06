/* **********************************************************************************************
* TimeConversions Class
*
************************************************************************************************ */
global class TimeConversions {
    
    /* -------------------------------------------------------------------------------------
* Returns an Integer  of the Timezone Offset from Eastern Time for the
* currently logged in user
*
* This is used to convert the String DateTime (that is in Eastern Time) into a
* DateTime value in SalesForce. The default behavior of SFC converts the string into
* a local datetime value, but we need to get into Eastern Time.
* ------------------------------------------------------------------------------------- */
    public static Integer getCurrentUserTZOffsetFromEastern(Id useriD) {
        
        Map<String, Integer[]> tzSIDKeys = getTZSidKeys();
        
        User user = [SELECT ID, TimeZoneSidKey FROM User WHERE ID =: useriD];
        
        Date[] dstDatesNow = getDSTDates(System.Today().year());
        Integer UsersTZOffset = 0;
        
        if (tzSIDKeys.get(user.TimeZoneSidKey) != null) {
            // Get the base timezone offset from GMT for the user
            if (System.Today() >= dstDatesNow[0] && System.Today() <= dstDatesNow[1])
                UsersTZOffset = tzSIDKeys.get(user.TimeZoneSidKey)[1];
            else 
                UsersTZOffset = tzSIDKeys.get(user.TimeZoneSidKey)[0];
            system.debug(LoggingLevel.Error, 'Base TimeZone for Current User=' + user.TimeZoneSidKey + '/' + UsersTZOffset );
            
            // Now make it a timezone offset from EASTERN time
            Integer EasternTZOffset = 0;
            if (System.Today() >= dstDatesNow[0] && System.Today() <= dstDatesNow[1]) 
                EasternTZOffset = tzSIDKeys.get('America/New_York')[1];
            else 
                EasternTZOffset = tzSIDKeys.get('America/New_York')[0];
            UsersTZOffset = Math.abs(EasternTZOffset) - Math.abs(UsersTZOffset);
            system.debug(LoggingLevel.Error, 'TimeZone Offset to Eastern Time=' + UsersTZOffset );
        }
        return UsersTZOffset ;
    }
    /*
public static Integer getCurrentUserTZOffset(String timeZone) {

Map<String, Integer[]> tzSIDKeys = getTZSidKeys();

User user = [SELECT ID, TimeZoneSidKey FROM User WHERE ID = :UserInfo.getUserId() LIMIT 1];

Date[] dstDatesNow = getDSTDates(System.Today().year());
Integer UsersTZOffset = 0;

if (tzSIDKeys.get(user.TimeZoneSidKey) != null) {
// Get the base timezone offset from GMT for the user
if (System.Today() >= dstDatesNow[0] && System.Today() <= dstDatesNow[1]) UsersTZOffset = tzSIDKeys.get(user.TimeZoneSidKey)[1];
else UsersTZOffset = tzSIDKeys.get(user.TimeZoneSidKey)[0];
system.debug(LoggingLevel.Error, 'Base TimeZone for Current User=' + user.TimeZoneSidKey + '/' + UsersTZOffset );

// Now make it a timezone offset from the provided time zone time
Integer EasternTZOffset = 0;
if (System.Today() >= dstDatesNow[0] && System.Today() <= dstDatesNow[1]) EasternTZOffset = tzSIDKeys.get(timeZone)[1];
else EasternTZOffset = tzSIDKeys.get(timeZone)[0];
UsersTZOffset = Math.abs(EasternTZOffset) - Math.abs(UsersTZOffset);
system.debug(LoggingLevel.Error, 'TimeZone Offset to '+ timeZone +' Time=' + UsersTZOffset );
}
return UsersTZOffset ;
}
*/
    
    /* -------------------------------------------------------------------------------------
* Returns a date Collection of Start/End dates for US Daylight Saving Time
* for the specified year.
*
* Based on code from: http://www.webexhibits.org/daylightsaving/b2.html
* ------------------------------------------------------------------------------------- */
    public static Date[] getDSTDates(Integer theYear) {
        Long thisYear;
        Long AprilDate;
        Long OctoberDate;
        Long MarchDate;
        Long NovemberDate;
        Long longSeven = 7;
        thisYear = Math.round(theYear);
        
        AprilDate = Math.mod(2+6 * thisYear - Math.floor(thisYear / 4).longValue(), longSeven) + 1;
        OctoberDate=  Math.mod(31-( Math.floor(thisYear * 5 / 4).longValue() + 1), longSeven);
        
        MarchDate = 14 - Math.mod(Math.floor(1 + thisYear * 5 / 4).LongValue(), longSeven);
        NovemberDate = 7 - Math.mod(Math.floor (1 + thisYear * 5 / 4).LongValue(), longSeven);
        
        string startDate = (thisYear > 2006 ? ('03/'+MarchDate) : ('04/'+AprilDate)) + '/' + thisYear;
        string endDate = (thisYear > 2006 ? ('11/'+NovemberDate):('10/'+OctoberDate))+ '/' + thisYear;
        
        Date[] rtnDates = new List<Date>();
        rtnDates.add(Date.parse(startDate));
        rtnDates.add(Date.parse(endDate));
        return rtnDates;
    }
    
    public static Map<String, Integer[]> getTZSidKeys() {
        Map<String, Integer[]> tzSIDKeys = new Map<String, Integer[]>();
        tzSIDKeys.put('America/Adak', new Integer[]{-10, -9});
        tzSIDKeys.put('America/Anchorage', new Integer[]{-9, -8});
        tzSIDKeys.put('America/Chicago', new Integer[]{-6, -5});
        tzSIDKeys.put('America/Denver', new Integer[]{-7, -6});
        tzSIDKeys.put('America/Detroit', new Integer[]{-5, -4});
        tzSIDKeys.put('America/Halifax', new Integer[]{-4, -3});
        tzSIDKeys.put('America/Indianapolis', new Integer[]{-5, -4});
        tzSIDKeys.put('America/Los_Angeles', new Integer[]{-8, -7});
        tzSIDKeys.put('America/Montreal', new Integer[]{-5, -4});
        tzSIDKeys.put('America/New_York', new Integer[]{-5, -4});
        tzSIDKeys.put('America/Panama', new Integer[]{-5, -5});
        tzSIDKeys.put('America/Phoenix', new Integer[]{-7, -7});
        tzSIDKeys.put('America/Puerto_Rico', new Integer[]{-4, -4});
        tzSIDKeys.put('America/Toronto', new Integer[]{-5, -4});
        tzSIDKeys.put('America/Vancouver', new Integer[]{-8, -7});
        tzSIDKeys.put('Europe/London', new Integer[]{0, 1});
        tzSIDKeys.put('Pacific/Honolulu', new Integer[]{-10, -10});
        tzSIDKeys.put('Pacific/Pago_Pago', new Integer[]{-11, -11});
        
        return tzSIDKeys;
    }
}