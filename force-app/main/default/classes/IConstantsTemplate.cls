public class IConstantsTemplate {
    
    public static final String ITAG_SUFFIX='@@';
    public static final String ITAG_PREFIX='%%';
    public static final String EMPTY_STRING='';
    public static final String DELIMETER_DOT='\\.';
    public static final String TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION='[%%]+[a-zA-Z0-9_.]*[@@]+';
    public static final String PERCENTAGE_WITH_BRACKET='[%%]';
    
    public static final String PAGE_BREAK_STYLE = '<w:style w:styleId="PageBreak" w:type="paragraph"><w:name w:val="PageBreak" /><w:pPr><w:pageBreakBefore w:val="on" /></w:pPr></w:style>';
    public static final String PAGE_BREAK_CLASS = '<w:p><w:pPr><w:pStyle w:val="PageBreak" /></w:pPr></w:p>'; 
    
    public static final String CUSTOM_OBJECTS = 'CompetitorMed::Competitor__c;;';
    
	public static Map<String,String> CUSTOM_OBJECT_MAP = new Map<String,String>();    
    public static Map<String,String> OBJECT_CONDITIONS_MAP = new Map<String,String>();
    public static Map<String,String> OBJECT_FILTER_RECORDS = new Map<String,String>();
    
    public static Map<String,String> ORDER_BY_RECORDS = new Map<String,String>();
    
    static{
        ORDER_BY_RECORDS.put('AccountContactRelations', ' ORDER BY Contact.LastName');
        
        
        OBJECT_CONDITIONS_MAP.put('Contacts', 'WHERE Status__c  = \'Active\' AND AMT_Log__c = true');
        
        OBJECT_CONDITIONS_MAP.put('Service_AMT__r', 'WHERE External__c  = false AND Case_Management_End_Date__c = null AND Contact_Role__c != null ORDER By Order__c ASC nulls last,Last_Name__c ASC');
        //OBJECT_CONDITIONS_MAP.put('Service_AMT__r', 'WHERE Case_Management_End_Date__c = null');
        
        OBJECT_CONDITIONS_MAP.put('AccountContactRelations', 'WHERE IsDirect=false AND Contact.Status__c = \'Active\' AND Contact.RecordType.Name= \'Consultant\'');      
        OBJECT_CONDITIONS_MAP.put('Competitors__r', 'WHERE CompetitorAccount__r.Name != null');
        
        CUSTOM_OBJECT_MAP.put('CompetitorMed', 'Competitors__r');
        CUSTOM_OBJECT_MAP.put('CompetitorOther', 'Competitors__r');
        CUSTOM_OBJECT_MAP.put('CompetitorVision', 'Competitors__r');
        CUSTOM_OBJECT_MAP.put('CompetitorDental', 'Competitors__r');
        CUSTOM_OBJECT_MAP.put('CompetitorPharmacy', 'Competitors__r');
        CUSTOM_OBJECT_MAP.put('AggregatorCompany', 'BGH__c');
        
        //CUSTOM_OBJECT_MAP.put('ServiceAmtInternal', 'Service_AMT__r');
        //CUSTOM_OBJECT_MAP.put('ServiceAmtExternal', 'Service_AMT__r');
        
        CUSTOM_OBJECT_MAP.put('riskProfileRiskTrackedBySCE', 'Risk_Profiles__r');
        CUSTOM_OBJECT_MAP.put('riskProfileAddRiskFactor', 'Risk_Profiles__r');
        
        CUSTOM_OBJECT_MAP.put('OpportunityProductsMedical', 'OpportunityLineItems'); 
        CUSTOM_OBJECT_MAP.put('OpportunityProductsOthers', 'OpportunityLineItems'); 
        
        OBJECT_FILTER_RECORDS.put('riskProfileRiskTrackedBySCE', 'RiskProfileType__c::Risk Tracked by SCE');
        OBJECT_FILTER_RECORDS.put('riskProfileAddRiskFactor', 'RiskProfileType__c::Additional Risk Factor');
        
        //OBJECT_FILTER_RECORDS.put('ServiceAmtInternal', 'External__c::true');
        //OBJECT_FILTER_RECORDS.put('ServiceAmtExternal', 'External__c::false');
        
        OBJECT_FILTER_RECORDS.put('CompetitorMed', 'Competitorclassification__c::Medical');
        OBJECT_FILTER_RECORDS.put('CompetitorPharmacy', 'Competitorclassification__c::Pharmacy');
        OBJECT_FILTER_RECORDS.put('CompetitorVision', 'Competitorclassification__c::Vision');
        OBJECT_FILTER_RECORDS.put('CompetitorDental', 'Competitorclassification__c::Dental');
        OBJECT_FILTER_RECORDS.put('CompetitorOther', 'Competitorclassification__c::Other');        
        //OBJECT_FILTER_RECORDS.put('CompetitorOther', 'Competitorclassification__c::Pharmacy;;Vision;;Dental;;Other');  
        
        OBJECT_FILTER_RECORDS.put('OpportunityProductsMedical', 'Product2.Product_Line__c::Medical');
        OBJECT_FILTER_RECORDS.put('OpportunityProductsOthers', 'Product2.Product_Line__c::Pharmacy;;Vision;;Dental;;Other');  
    }

}