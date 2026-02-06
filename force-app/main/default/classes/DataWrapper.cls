public class DataWrapper {
    public Id contactId { get; set; }
    public String columnName1 { get; set; }
    public String vpcrRvp { get; set; }
    public String sce { get; set; }
    public Id accountId { get; set; }

    public DataWrapper() {
        contactId = null;
        accountId = null;
        columnName1 = '';
        vpcrRvp = '';
        sce = 'Shruthi';
    }
}