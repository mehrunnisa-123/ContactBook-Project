using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContactBook.API.Models;

public class Contact
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [BsonElement("lastName")]
    public string LastName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("company")]
    public string? Company { get; set; }

    [BsonElement("address")]
    public string? Address { get; set; }

    [BsonElement("notes")]
    public string? Notes { get; set; }

    [BsonElement("category")]
    public string Category { get; set; } = "Personal";

    [BsonElement("isFavorite")]
    public bool IsFavorite { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
