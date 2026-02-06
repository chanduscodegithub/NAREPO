public with sharing class NativeOrders {
    // MuleSoft API base URL
    private static final String MULESOFT_API_BASE_URL = 'https://anypoint.mulesoft.com/mocking/api/v1/links/a5856a65-a4b7-4e69-8660-23f8623296d8/v2/orders';

    /**
     * Fetch order data from MuleSoft API for given Sold_To__c and PoNumber
     * @param soldTo - Sold_To__c value (Account id)
     * @param poNumber - PO Number
     * @return List of OrderWrapper objects
     */
    @AuraEnabled(cacheable=true)
    public static List<OrderWrapper> getOrders(String soldTo, String poNumber) {
        String endpoint = MULESOFT_API_BASE_URL + '?Sold_To__c=' + EncodingUtil.urlEncode(soldTo, 'UTF-8') +
                          '&PoNumber=' + EncodingUtil.urlEncode(poNumber, 'UTF-8');

        HttpRequest req = new HttpRequest();
        req.setEndPoint(endpoint);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');

        // Add auth header if required
        // req.setHeader('Authorization', 'Bearer YOUR_ACCESS_TOKEN');

        try {
            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() == 200) {
                String body = res.getBody();

                // Use JSON.deserializeUntyped for flexible parsing
                Object jsonResponse = JSON.deserializeUntyped(body);
                if (jsonResponse instanceof List<Object>) {
                    List<Object> listResp = (List<Object>) jsonResponse;
                    List<OrderWrapper> orders = new List<OrderWrapper>();
                    for (Object obj : listResp) {
                        Map<String, Object> mapObj = (Map<String, Object>) obj;
                        OrderWrapper order = new OrderWrapper();

                        // Map JSON fields to class variables
                        order.jdeOrder = (Integer) mapObj.get('JDE_Order__c');
                        order.jdeOrderCompany = (String) mapObj.get('JDE_Order_Company__c');
                        order.type = (String) mapObj.get('Type');
                        order.soldTo = (Integer) mapObj.get('Sold_To__c');
                        order.shipTo = (Integer) mapObj.get('Ship_To__c');
                        order.orderCreatedDateTime = (String) mapObj.get('JDE_Order_Created_Date_Time__c');
                        order.requestedDate = (String) mapObj.get('Requested_Date__c');
                        order.cancelDate = (String) mapObj.get('Cancel_Date');
                        order.poNumber = (String) mapObj.get('PoNumber');
                        order.poContactName = (String) mapObj.get('PO_Contact_Name__c');
                        order.orderTakenBy = (String) mapObj.get('Order_Taken_By');
                        order.dateUpdated = (String) mapObj.get('Date_Updated');
                        order.timeUpdated = (Decimal) mapObj.get('Time_Updated');
                        order.sfHeaderId = (String) mapObj.get('SF_Header_ID');
                        order.orderNumber = (String) mapObj.get('OrderNumber');
                        order.status = (String) mapObj.get('jde__status');
                        order.startTimestamp = (String) mapObj.get('jde__startTimestamp');
                        order.endTimestamp = (String) mapObj.get('jde__endTimestamp');
                        order.serverExecutionSeconds = (Decimal) mapObj.get('jde__serverExecutionSeconds');

                        orders.add(order);
                    }
                    return orders;
                } else {
                    return new List<OrderWrapper>();
                }
            } else {
                System.debug('API call failed with status: ' + res.getStatusCode());
                return new List<OrderWrapper>();
            }
        } catch (Exception e) {
            System.debug('Exception during API call: ' + e.getMessage());
            return new List<OrderWrapper>();
        }
    }

    // Wrapper class with valid variable names
        public class OrderWrapper {
            @AuraEnabled public Integer jdeOrder;
        @AuraEnabled public String jdeOrderCompany;
        @AuraEnabled public String type;
        @AuraEnabled public Integer soldTo;
        @AuraEnabled public Integer shipTo;
        @AuraEnabled public String orderCreatedDateTime;
        @AuraEnabled public String requestedDate;
       @AuraEnabled public String cancelDate;
        @AuraEnabled public String poNumber;
        @AuraEnabled public String poContactName;
        @AuraEnabled public String orderTakenBy;
        @AuraEnabled public String dateUpdated;
        @AuraEnabled public Decimal timeUpdated;
        @AuraEnabled public String sfHeaderId;
        @AuraEnabled public String orderNumber;
        @AuraEnabled public String status;
        @AuraEnabled public String startTimestamp;
        @AuraEnabled public String endTimestamp;
        @AuraEnabled public Decimal serverExecutionSeconds;
    }
}