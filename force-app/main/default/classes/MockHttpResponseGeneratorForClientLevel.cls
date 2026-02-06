@isTest
public class MockHttpResponseGeneratorForClientLevel implements HttpCalloutMock {
     public HTTPResponse respond(HTTPRequest req) {
            // Creating a mocked HTTP response
            HttpResponse res = new HttpResponse();
            res.setBody('Mocked XML Template');
            res.setStatusCode(200);
            return res;
        }
}