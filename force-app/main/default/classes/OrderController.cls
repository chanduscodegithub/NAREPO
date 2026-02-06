public with sharing class OrderController {
    private static final String MULESOFT_ENDPOINT = 'https://your-mulesoft-endpoint.com/api/orders';

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getOrdersByAccountId(String accountId) {
        if (String.isBlank(accountId)) {
            throw new AuraHandledException('AccountId is required.');
        }

        Http http = new Http();
        HttpRequest request = new HttpRequest();

        String endpoint = MULESOFT_ENDPOINT + '?accountId=' + EncodingUtil.urlEncode(accountId, 'UTF-8');

        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');

        try {
            HttpResponse response = http.send(request);
            if (response.getStatusCode() == 200) {
                String responseBody = response.getBody();
                // Deserialize into a List of Maps
                List<Map<String, Object>> results = (List<Map<String, Object>>) JSON.deserializeUntyped(responseBody);
                return results;
            } else {
                throw new AuraHandledException('Failed to fetch data from API. Status: ' + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
}