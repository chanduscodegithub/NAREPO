@isTest
public class RiskProfileAccountIdsForBatchTest {

    
    public testMethod static void validGetRiskProfileIdsFromSR(){        
        Test.startTest();
        RiskProfileAccountIdsForBatch.getRiskProfileIdsFromSR(null);
        RiskProfileAccountIdsForBatch.getRiskProfileIdsFromSR('dslkfjkdsljfkl');
        RiskProfileAccountIdsForBatch.getRiskProfileIdsFromSR('RiskProfileAccountList');
        Test.stopTest();
    }
}