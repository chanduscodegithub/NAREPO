public without sharing class AccountFieldSet {
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo(String accountId,String accType) {
       
        Boolean isLoggedInUserRoleToBeEnabled = false;
           
        try {            
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                System.debug('User Role : '+user.UserRole.Name);
                String[] roleNames = new List<String>();
                if(accType != null && accType == 'Client Management' && loggedInUserRole != 'CRM Administrator'){
                    isLoggedInUserRoleToBeEnabled = false;
                }else{
                   	isLoggedInUserRoleToBeEnabled = true;
                }                                
            }
            if(isLoggedInUserRoleToBeEnabled){
                isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(accountId);
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isLoggedInUserRoleToBeEnabled;
    }

     @AuraEnabled
    public static RequiredReadOnlyData getRequiredReadOnlyMapping(String oppType,String oppProductCatagory){
        RequiredReadOnlyData reqData = new RequiredReadOnlyData();  
       // list<string> readList =new List<string>();
       // readList.add('UHC_UDS_Submission_Comparison__c');
        //requiredDataList.add('UHC_UDS_Submission_Comparison__c');
       // reqData.readOnlyFieldsMapList.put('UHC_UDS_Submission_Comparison__c', readList);
            return reqData;
    }

    public static FeildSetMembemberData createFeildSets(Map<String, Schema.SObjectField> field_map,Schema.FieldSet fs,String fldSName,String productCatagory,String oppType){
        List<Schema.FieldSetMember> fieldSet = fs.getFields();
        List<FieldSetMember> fset = new List<FieldSetMember>();
        FeildSetMembemberData fsetData = new FeildSetMembemberData();
        List<String> fieldItagList = new List<String>();
        fieldItag fieldItaglst = new fieldItag();
        for (Schema.FieldSetMember f: fieldSet) {
            List<String> option = new List<String>();
            fieldItagList.add(f.fieldPath);
            Schema.DescribeFieldResult dfr = field_map.get(f.fieldPath).getDescribe();
            String positionText = dfr.getInlineHelpText();
            String helpOrInstText;
            Boolean left = true;
            Boolean right = false;
            Boolean inst = false;
            Boolean help = false;
            String posKey = '';
            if(oppType.endsWithIgnoreCase('NBEA')){
                posKey = 'CM';
            }else{
                posKey = 'CD';
            }            
           
            if(positionText != null && positionText.length() > 0){               
                string[] positionTextSpilt = positionText.split(';;');
                for(string eachText : positionTextSpilt){
                    if(eachText.startsWithIgnoreCase(posKey)){
                        positionText = eachText;
                        break;
                    }
                }
            }
            System.debug('Pos Text'+positionText);
            
            if(positionText != null && positionText.length() > 0){ 
                positionText = positionText.substringBetween('[', ']');
                System.debug('Pos Value'+positionText);
                if(positionText != null){
                    string[] positionTextSpilt = positionText.split(':');
                    for(string eachText : positionTextSpilt){
                        if(eachText != null ){
                            if(eachText.equalsIgnoreCase('left')){                            
                                left = true;
                            }else if(eachText.equalsIgnoreCase('right')){                           
                                right = true;
                                left = false;
                            }if(eachText.equalsIgnoreCase('inst')){                            
                                inst = true;
                            }else if(eachText.equalsIgnoreCase('help')){                           
                                help = true;
                            }
                        }                	                      
                    }                                                                               
                }                
            }
            
            if(help || inst){
                /*
                String helpInstItag;
                if(help){
                    helpInstItag = posKey+'_'+f.fieldPath+'_Help';                  
                }else{
                    helpInstItag = posKey+'_'+f.fieldPath+'_Inst';
                }
                System.debug('helpInstItag'+helpInstItag);
                MA_GenericMapping__mdt helpOrInstTextObj = [SELECT Id, Generic_Map_Text__c FROM MA_GenericMapping__mdt where Help_Instuction_Text__c =:helpInstItag LIMIT 1];
                if(helpOrInstTextObj != null){
                    helpOrInstText = helpOrInstTextObj.Generic_Map_Text__c;
                }                
                if(helpOrInstText == null || helpOrInstText.trim().length() == 0){
                    helpOrInstTextObj = [SELECT Id, Generic_Map__c FROM MA_GenericMapping__mdt where Help_Instuction_Text__c =:helpInstItag LIMIT 1];
                    if(helpOrInstTextObj != null){
                        helpOrInstText = helpOrInstTextObj.Generic_Map__c;
                    }                   
                }*/
            }            
            if(f.getType() == field_map.get(f.fieldPath).getDescribe().getType()){
                String label = f.fieldPath;
                List<Schema.PicklistEntry> pick_list_values = field_map.get(f.fieldPath).getDescribe().getPickListValues();
                
                option.add('');
                for (Schema.PicklistEntry a : pick_list_values) {
                    option.add(a.getValue());                    
                }
                fset.add(new FieldSetMember(f,option,dfr,left,right,inst,help,helpOrInstText));
            }else{
                option.add(null);
                fset.add(new FieldSetMember(f,option,dfr,left,right,inst,help,helpOrInstText));
            }
        }        
        fsetData.fsetMember = fset;
        fsetData.fsetItag = fieldItagList;
        fsetData.fSetName = fldSName;
        fsetData.isComments = false;
        fsetData.isAdditionalInfo = false;
        fsetData.isAdditionalInfo2 = false;
        fsetData.isProdCat = false;
        string[] fsHeading = fs.getDescription().split(';;');
        if(fsHeading[0] != null && fsHeading[0].trim().length() != 0){
            System.debug('fsHeading[0]'+fsHeading[0]);           
            fsetData.fsetSectionLabel = fsHeading[0];
            fsetData.isProdCat = true;
        }
        if(fsHeading.size() == 2 && fsHeading[1] != null && fsHeading[1].trim().length() != 0){            
            fsetData.fsetSectionSubLabel = fsHeading[1];          
        }
        
        return fsetData;
    }
    
    @AuraEnabled
    public static ProgressionAndFeildSetData getAccountFields(String accType,String fieldSetName) {        
        String fsName = '';
        String intialSalesStageString = '';
        String progressSalesStageString = '';
        RequiredReadOnlyData reqData = new RequiredReadOnlyData();
        List<String> progressReadRequLst = new List<String>();
        List<String> requiredDataList = new List<String>();
        List<String> progressList = new List<String>();
        List<String> progressMOList = new List<String>();
        Map<string,List<String>> fsetMemberMapList = new Map<string,List<String>>();
        List<String> possSet = new List<String>();
        List<String> initialList = new List<String>();
        List<String> initialMOList = new List<String>();
        List<String> intialSet = new List<String>();
        Boolean isDataService = false;
        Map<String,List<String>> dispostionValuesMap = new Map<String,List<String>>();
        List<String> dispostionValuesLst = new List<String>();
        String dispositionItag = '';
        String possItag = '';
        String transitionStr = '';
        String PreviousSelectedStage = '';
        String CurrentSelectedStage = '';
        String PreviousSelectedStageMO = '';
        String CurrentSelectedStageMO = '';
        String tranStr = '';
        Set<String> ClearFieldsSet = new Set<string>();
        List<MA_GenericMapping__mdt> transtionPicklistValues = new List<MA_GenericMapping__mdt>();
        Map<String,List<String>> clearValMap = new Map<String,List<String>>();
       
        MA_GenericMapping__mdt isDataServiceData = [SELECT SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c ='isDataService'];
        isDataService = Boolean.valueOf(isDataServiceData.Generic_Map_Text__c);
                               
        
        ProgressionAndFeildSetData progressFeildSetData = new ProgressionAndFeildSetData();   
               
        System.debug('possSet'+possSet);
        requiredDataList.add('Bic_and_Top_Market_Last_Modified_Date__c');
        requiredDataList.add('UHC_UDS_Submission_Comparison__c');
        reqData = getRequiredReadOnlyMapping(accType,fieldSetName);
        System.debug('reqData'+reqData);
        progressFeildSetData.requiredFieldsMap = reqData.requiredFieldsMapList;
        progressFeildSetData.readOnlyFieldsMap = reqData.readOnlyFieldsMapList;
        progressFeildSetData.genReadOnlyFieldsMap = requiredDataList;   
        
        String sectionsListKey = accType+'_'+fieldSetName+'_Sections';
        system.debug('sectionsListKey : '+sectionsListKey);
        MA_GenericMapping__mdt categorySectionFeilds = [SELECT Id, Generic_Map_Text__c FROM MA_GenericMapping__mdt where QualifiedApiName =:sectionsListKey LIMIT 1];
        if(categorySectionFeilds != null){
            fsName = categorySectionFeilds.Generic_Map_Text__c;
            if(fsName == null || fsName.trim().length() == 0){
                MA_GenericMapping__mdt categorySectionFeildsLong = [SELECT Id, Generic_Map__c FROM MA_GenericMapping__mdt where QualifiedApiName =:sectionsListKey LIMIT 1];
                if(categorySectionFeildsLong != null){
                    fsName = categorySectionFeildsLong.Generic_Map__c;   
                }                     
            }
        }                
        
        Schema.sObjectType sobject_type = Account.getSObjectType(); //grab the sobject that was passed
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); //describe the sobject
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
        System.debug('field_map'+field_map);
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get('Account');
        Schema.DescribeSObjectResult describe = targetType.getDescribe();
        Map<String, Schema.FieldSet> fsMap = describe.fieldSets.getMap();
        System.debug('fsMap'+fsMap);
        FeildSetMembemberData fsetData = new FeildSetMembemberData();    
        
        List<FeildSetMembemberData> fsetMemberData = new List<FeildSetMembemberData>();
        string[] fsNameSpilt= fsName.split(';;'); 
        List<String> itagList = new List<String>();
        for(string fldSetName: fsNameSpilt)
        {
            System.debug('fldSetName'+fldSetName);
            Schema.FieldSet fs = fsMap.get(fldSetName.trim());
            System.debug('fs'+fs);
            if(fs != null){
                fsetData = createFeildSets(field_map,fs,fldSetName,fieldSetName,accType);
                for(String iTag: fsetData.fsetItag){
                    itagList.add(iTag);
                }
                fsetMemberData.add(fsetData);               
            }            
        }       
        
        
        itagList.add('Bic_and_Top_Market_Last_Modified_Date__c');

        progressFeildSetData.fsetMemberMap = fsetMemberData;
        progressFeildSetData.layoutFieldsItag = itagList;
        progressFeildSetData.intialSalesStageList = initialList;
        progressFeildSetData.possibleSaleStageList =  progressList;
        progressFeildSetData.possibleMOSaleStageList = progressMOList;
        progressFeildSetData.intialSalesStageMOList = initialMOList;
        progressFeildSetData.dispostionValMap = dispostionValuesMap;
       
        progressFeildSetData.isProdCat = fsetData.isProdCat;
        progressFeildSetData.possItag = possItag;
        progressFeildSetData.isDataService  = isDataService;
        System.debug('progressFeildSetData'+progressFeildSetData);
        return progressFeildSetData;
    }
    
        public class FieldSetMember {
        
        public FieldSetMember(Schema.FieldSetMember f,List<String> opt,Schema.DescribeFieldResult dfr,Boolean left,Boolean right,Boolean inst,Boolean help,String helpOrInstText) {        
            this.fieldPath = f.fieldPath;
            this.label = f.label;   
            this.type = '' + f.getType();
            this.picklistoptions = opt;           
            this.DefalutValue = dfr.getDefaultValue();
            this.FormulaValue = dfr.getDefaultValueFormula();
            this.name = dfr.getName();
            this.help = help;
            this.left = left;
            this.right = right;
            this.inst = inst;
            this.getPrecision = dfr.getScale();
            this.helpOrInstText = helpOrInstText;
        }        
        
        @AuraEnabled
        public String fieldPath { get;set; }
        
        @AuraEnabled
        public String label { get;set; }
        
        @AuraEnabled
        public String name { get;set; } 
        
        @AuraEnabled
        public String type { get; set; }
        
        @AuraEnabled
        public Object DefalutValue { get; set; }
        
        @AuraEnabled
        public String FormulaValue { get; set; }
        
        @AuraEnabled
        public List<String> picklistoptions { get; set;}
        
        @AuraEnabled
        public Boolean left { get;set; }
        
        @AuraEnabled
        public Boolean right { get;set; }
        
        @AuraEnabled
        public Boolean inst { get;set; }
        
        @AuraEnabled
        public Boolean help { get;set; }
            
        @AuraEnabled
        public Integer getPrecision { get;set; }
        
        @AuraEnabled
        public String helpOrInstText { get;set; }
    }
    
    public class fieldItag{
        @AuraEnabled
        public Set<String> feildItagsSet { get; set;}
    }
    
    public class FeildSetMembemberData{
        @AuraEnabled
        public List<FieldSetMember> fsetMember { get; set;}
        
        @AuraEnabled
        public String fSetName { get; set;}
        
        @AuraEnabled
        public String fsetSectionLabel { get; set;}        
        
        @AuraEnabled
        public List<String> fsetItag { get; set;}
        
        @AuraEnabled
        public String fsetSectionSubLabel { get; set;}
        
        @AuraEnabled
        public Boolean isComments { get; set;} 
        
        @AuraEnabled
        public Boolean isAdditionalInfo{get; set;}
        
        @AuraEnabled
        public Boolean isAdditionalInfo2{get; set;}
        
        @AuraEnabled
        public Boolean isProdCat{get; set;}
        
    } 
    
    public class ProgressionAndFeildSetData{
        @AuraEnabled
        public List<FeildSetMembemberData> fsetMemberMap { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> requiredFieldsMap { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> readOnlyFieldsMap { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> requiredFieldsMapMO { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> readOnlyFieldsMapMO { get; set;}  
        
        @AuraEnabled
        public List<String> genReadOnlyFieldsMap { get; set;}  
        
        @AuraEnabled
        public List<String> genReadOnlyFieldsMapMO { get; set;}  
        
        @AuraEnabled
        public List<String> medicalFieldsList { get; set;}
        
        @AuraEnabled
        public List<String> othersFieldsList { get; set;}
        
        @AuraEnabled
        public List<String> layoutFieldsItag { get; set;}
        
        @AuraEnabled
        public List<String> intialSalesStageList { get; set;}  
        
        @AuraEnabled
        public List<String> intialSalesStageMOList { get; set;}
        
        @AuraEnabled
        public List<String> possibleSaleStageList { get; set;}
        
        @AuraEnabled
        public List<String> possibleMOSaleStageList { get; set;}
        
        @AuraEnabled
        public Map<String,List<String>> dispostionValMap { get; set;}
        
        @AuraEnabled
        public Map<String,List<String>> clearValMap { get; set;}
        
        @AuraEnabled
        public Boolean isComments { get; set;} 
        
        @AuraEnabled
        public Boolean isAdditionalInfo{get; set;}
        
        @AuraEnabled
        public Boolean isAdditionalInfo2{get; set;}
        
        @AuraEnabled
        public Boolean isProdCat{get; set;}
        
        @AuraEnabled
        public Boolean isDataService { get; set;} 
        
        @AuraEnabled
        public String possItag { get; set;}
        
        @AuraEnabled
        public String PreviousSelectedStage { get; set;}  
        
        @AuraEnabled
        public String CurrentSelectedStage { get; set;}
        
        @AuraEnabled
        public String PreviousSelectedStageMO { get; set;}  
        
        @AuraEnabled
        public String CurrentSelectedStageMO { get; set;}
    }  
    
    public class RequiredReadOnlyData{
        
        @AuraEnabled
        public List<String> genReadOnlyFieldsMapList { get; set;}  
        
        @AuraEnabled
        public Map<string,List<String>> requiredFieldsMapList = new Map<string,List<String>>();
        
        @AuraEnabled
        public Map<string,List<String>> readOnlyFieldsMapList = new Map<string,List<String>>();
        
    }
    
    public class AccessControl{
        @AuraEnabled
        public Boolean fullAccess { get; set;}  
        @AuraEnabled
        public Boolean readWrite { get; set;}
        @AuraEnabled
        public Boolean readOnly { get; set;}
        @AuraEnabled
        public Boolean isSystemAdmin { get; set;}
    }
}