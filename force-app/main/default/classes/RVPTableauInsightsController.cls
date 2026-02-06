public class RVPTableauInsightsController {
    public String firstName{get;set;}
    public String lastName{get;set;}
    public String pipeLineURL{get;set;}
    public String netResultsURL{get;set;}
    public String bobURL{get;set;}
    public String whiteSpaceURL{get;set;}
    
    public RVPTableauInsightsController(){
        String userRoleId = userinfo.getUserRoleId();
        String userRole = [SELECT Id,Name From UserRole WHERE Id =: userRoleId].Name;
        String userId = userInfo.getUserId();
        User sceUser = [SELECT Id,Name,SCE_Director__c,Manager.Name From User WHERE Id =:userId ];
        if(userRole=='CRM Administrator'){
            pipeLineURL ='https://orbitbi-tableau.optum.com/t/SCRM/views/RVP-HomePage-PipelineAnalysis/PipelineAnalysis?:showVizHome=no&:embed=true#2';
            netResultsURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/HomePage-NetResults/NetResults?:showVizHome=no&:embed=true#2';
            bobURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/BoBAnalysis/BoBSummary?:showVizHome=no&:embed=true#2';
            whiteSpaceURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/WhiteSpaceAnalysis-Homepage/WhiteSpaceHomepage?:showVizHome=no&:embed=true#2';
        }
        else{ 
            if(userRole == 'CM VPCR/RVP'){
                firstName = userinfo.getName();
                //lastName = userinfo.getLastName();
            }
            else if(userRole == 'CM SCE' && sceUser.SCE_Director__c == true ){
                /* if(sceUser.Manager.FirstName==null){
firstName='';
}
else*/
                firstName = sceUser.Manager.Name;
                //lastName = sceUser.Manager.LastName;
            }
            
           /*  pipeLineURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/RVP-HomePage-PipelineAnalysis/PipelineAnalysis?VPCR%20RVP='+firstName+'&:showVizHome=no&:embed=true#2';
            netResultsURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/HomePage-NetResults/NetResults?VPCR%20RVP='+firstName+'&:showVizHome=no&:embed=true#2';
            bobURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/BoBAnalysis/BoBSummary?VPCR%20RVP='+firstName+'&:showVizHome=no&:embed=true#2';
            whiteSpaceURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/WhiteSpaceAnalysis-Homepage/WhiteSpaceHomepage?VPCR%20RVP%20='+firstName+'&:showVizHome=no&:embed=true#2';
           */
            
            pipeLineURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/RVP-HomePage-PipelineAnalysis/PipelineAnalysis?:showVizHome=no&:embed=true#2';
            netResultsURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/HomePage-NetResults/NetResults?:showVizHome=no&:embed=true#2';
            bobURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/BoBAnalysis/BoBSummary?:showVizHome=no&:embed=true#2';
            whiteSpaceURL = 'https://orbitbi-tableau.optum.com/t/SCRM/views/WhiteSpaceAnalysis-Homepage/WhiteSpaceHomepage?:showVizHome=no&:embed=true#2';
            
            
        }
    }
}