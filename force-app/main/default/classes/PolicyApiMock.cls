@isTest
global class PolicyApiMock implements HttpCalloutMock {

    global HTTPResponse respond(HTTPRequest req) {

        // You can validate request here
        System.assertEquals('POST', req.getMethod());
        System.assert(req.getBody().contains('Policy 1'));

        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"status":"success"}');

        return res;
    }
}