global class NotesMigrationBatch implements Database.Batchable<Sobject>, Database.Stateful{
    global Static  Map<string,List<String>> inputDataMap;
    global Static Map<String,String> contentNoteSuccessList;
    global Static Map<String,String> contentDocumentSuccessList;
    global Database.QueryLocator start(Database.BatchableContext BC) {        
        System.debug('Start Competitor CD Total Batch');
        return Database.getQueryLocator('SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = \'NotesData\'');        
    }
 	public Map<String, List<string>> row_map { get; set; }
    global void execute(Database.BatchableContext BC,List<StaticResource> srList) {             
        try{      
            Map<string,List<String>> inputData = new Map<string,List<String>>();    
            List<String> csvRecordData =  new List<String>();
            //System.debug('csvRecordData'+srList.get(0).body);

            
            List<List<String>> fileValues = CsvReader.readIETFRFC4180CSVFile(srList.get(0).body);
            System.debug('fileValues'+fileValues);
            row_map = new Map<String, List<string>>();
            for(integer i = 1; i < fileValues.size(); i++) {
                row_map.put(fileValues[i][0], fileValues[i]);
            }
            //System.debug('row_map'+row_map);
            List<ContentNote> cntNote = new List<ContentNote>();
            List<ContentDocumentLink> DocumentLink = new List<ContentDocumentLink>();
            List<String> csvRecordDataList =  new List<String>();
            Set<Id> docId = new Set<Id>();
            for (String fieldName : row_map.keySet()){
                csvRecordDataList = row_map.get(fieldName);
                ContentNote n = new ContentNote();
                String body = csvRecordDataList[2];
                n.Content = Blob.valueOf(body.escapeHtml3().replace('\r\n', '<br>').replace('\n', '<br>').replace('\r', '<br>'));              
                n.title=csvRecordDataList[0];
                //n.CreatedDate = Datetime.valueOf(csvRecordDataList[3]);
                cntNote.add(n);                
            }
           //System.debug('cntNote'+cntNote);
            Database.SaveResult[] saveResultList = Database.insert(cntNote, false);
            
            // Iterate through saveResultList based on isSuccess capture the failed records
            for (Database.SaveResult sr : saveResultList) {
                System.debug('cntNote'+sr.isSuccess());
                if (sr.isSuccess()) {
                    // Operation was successful, so get the ID of the record that was processed
                    System.debug('Successfully inserted Note. Note ID: ' + sr.getId());
                    docId.add(sr.getId());
                    System.debug('docId'+docId.size());
                    //contentNoteSuccessList.put(sr.getId(),'Pass');
                }
                else {              
                    for(Database.Error err : sr.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Account fields that affected this error: ' + err.getFields());
                    }
                }
            }
            
            List<ContentNote> cntNoteList = [Select Id,Title from ContentNote where Id In:docId];
            System.debug('cntNoteList');
            for(ContentNote noteStr:cntNoteList)
            {
                ContentDocumentLink cdLink = new ContentDocumentLink();
                cdLink.LinkedEntityId = row_map.get(noteStr.Title)[1];
                cdLink.ContentDocumentId = noteStr.Id;
                cdLink.Visibility = 'AllUsers';
                cdLink.ShareType = 'V';
                DocumentLink.add(cdLink);
            }   
            
            Database.SaveResult[] saveDocumtLinkList = Database.insert(DocumentLink, false);
            
            // Iterate through saveResultList based on isSuccess capture the failed records
            for (Database.SaveResult sr : saveDocumtLinkList) {
                if (sr.isSuccess()) {
                    // Operation was successful, so get the ID of the record that was processed
                    System.debug('Successfully inserted account. Account ID: ' + sr.getId());
                    //contentDocumentSuccessList.put(sr.getId(),'Pass');
                }
                else {
                    // Operation failed, so get all errors                
                    for(Database.Error err : sr.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Account fields that affected this error: ' + err.getFields());
                    }
                }
            }
        }catch(Exception ex){
            System.debug('Error Line '+ex.getLineNumber());
            System.debug('Error Message '+ex.getMessage());
        }
    }  
    
    global void finish(Database.BatchableContext BC) {
        System.debug('contentNoteSuccessList'+contentNoteSuccessList);
        System.debug('contentDocumentSuccessList'+contentDocumentSuccessList);
        System.debug('Finish Competitor CD Total Batch');    
    }             
}