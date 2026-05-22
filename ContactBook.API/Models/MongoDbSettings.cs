namespace ContactBook.API.Models;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string ContactsCollectionName { get; set; } = string.Empty;
}
