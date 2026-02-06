public with sharing class GenerateReportController {
       public String renderValue{get;private set;}
    public Boolean isPdf{get;private set;}
    public String ContentTypeValue{get;private set;}
     public Opportunity opportunity { get; set; }
        public String recordTypeName { get; private set; }


    public GenerateReportController() {
        String opportunityId = ApexPages.currentPage().getParameters().get('opportunityId');
        
        if (opportunityId != null) {
            opportunity = [SELECT Id, Name, Account.Name, RecordType.DeveloperName,EffectiveDate__c, Owner.Name,Notes_taken_on_call_with_consultant__c
                           FROM Opportunity 
                           WHERE Id = :opportunityId 
                           LIMIT 1];
                        recordTypeName = opportunity.RecordType.DeveloperName;

        }
        /*map<String,String> UrlParameterMap = ApexPages.currentPage().getParameters();
        for(String str:UrlParameterMap.keySet()){
            if(str =='pdfReport'){
                this.isPdf=true;
            }
            else if(str =='wordReport'){
                this.isPdf=false;
            }
        }

        if(this.isPdf == true){
            this.renderValue='pdf';
            this.ContentTypeValue='';
            ApexPages.currentPage().getHeaders().put('Content-Disposition', 'attachment; filename="' + getFileName() + '"');
        }
        else if(this.ispdf == false){
            this.ContentTypeValue = 'application/msword#';
            this.ContentTypeValue += this.getWordFileName()+'.doc';
        }
    }*/
        map<String,String> UrlParameterMap = ApexPages.currentPage().getParameters();
        for(String str:UrlParameterMap.keySet()){
            if(str =='wordReport'){
                this.isPdf=true;
            }
        }
        if (this.isPdf == true) {
    this.renderValue='word';
    this.ContentTypeValue = 'application/msword#' + this.getWordFileName() + '.doc';
}

    }
    
    


    /**
     * @description Generate PDf File Name
     * @return   return
     */
    private String getFileName() {
        return 'GenratePdf'+'.pdf';
    }

    /**
     * @description Generate word File Name
     * @return   return
     */
    private String getWordFileName() {
        return 'GenerateWord';
    }


 
}