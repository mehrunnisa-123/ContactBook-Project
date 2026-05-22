using ContactBook.API.DTOs;
using ContactBook.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContactBook.API.Services;

public class ContactsService
{
    private readonly IMongoCollection<Contact> _contactsCollection;

    public ContactsService(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _contactsCollection = mongoDatabase.GetCollection<Contact>(
            mongoDbSettings.Value.ContactsCollectionName);

        // Create indexes
        var emailIndex = Builders<Contact>.IndexKeys.Ascending(c => c.Email);
        var nameIndex = Builders<Contact>.IndexKeys
            .Ascending(c => c.FirstName)
            .Ascending(c => c.LastName);
        _contactsCollection.Indexes.CreateMany(new[]
        {
            new CreateIndexModel<Contact>(emailIndex, new CreateIndexOptions { Unique = true }),
            new CreateIndexModel<Contact>(nameIndex)
        });
    }

    public async Task<List<ContactResponseDto>> GetAllAsync()
    {
        var contacts = await _contactsCollection
            .Find(_ => true)
            .SortBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();
        return contacts.Select(MapToDto).ToList();
    }

    public async Task<ContactResponseDto?> GetByIdAsync(string id)
    {
        if (!ObjectId.TryParse(id, out _)) return null;
        var contact = await _contactsCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
        return contact is null ? null : MapToDto(contact);
    }

    public async Task<List<ContactResponseDto>> SearchAsync(string query)
    {
        var filter = Builders<Contact>.Filter.Or(
            Builders<Contact>.Filter.Regex(c => c.FirstName, new BsonRegularExpression(query, "i")),
            Builders<Contact>.Filter.Regex(c => c.LastName, new BsonRegularExpression(query, "i")),
            Builders<Contact>.Filter.Regex(c => c.Email, new BsonRegularExpression(query, "i")),
            Builders<Contact>.Filter.Regex(c => c.Phone, new BsonRegularExpression(query, "i")),
            Builders<Contact>.Filter.Regex(c => c.Company!, new BsonRegularExpression(query, "i"))
        );
        var contacts = await _contactsCollection.Find(filter).SortBy(c => c.FirstName).ToListAsync();
        return contacts.Select(MapToDto).ToList();
    }

    public async Task<(ContactResponseDto? contact, string? error)> CreateAsync(CreateContactDto dto)
    {
        // Check for duplicate email
        var existing = await _contactsCollection.Find(c => c.Email == dto.Email).FirstOrDefaultAsync();
        if (existing is not null)
            return (null, "A contact with this email already exists.");

        var contact = new Contact
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone.Trim(),
            Company = dto.Company?.Trim(),
            Address = dto.Address?.Trim(),
            Notes = dto.Notes?.Trim(),
            Category = dto.Category,
            IsFavorite = dto.IsFavorite,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _contactsCollection.InsertOneAsync(contact);
        return (MapToDto(contact), null);
    }

    public async Task<(ContactResponseDto? contact, string? error)> UpdateAsync(string id, UpdateContactDto dto)
    {
        if (!ObjectId.TryParse(id, out _)) return (null, "Invalid contact ID.");

        // Check for duplicate email on other contacts
        var existing = await _contactsCollection
            .Find(c => c.Email == dto.Email.Trim().ToLower() && c.Id != id)
            .FirstOrDefaultAsync();
        if (existing is not null)
            return (null, "Another contact with this email already exists.");

        var update = Builders<Contact>.Update
            .Set(c => c.FirstName, dto.FirstName.Trim())
            .Set(c => c.LastName, dto.LastName.Trim())
            .Set(c => c.Email, dto.Email.Trim().ToLower())
            .Set(c => c.Phone, dto.Phone.Trim())
            .Set(c => c.Company, dto.Company?.Trim())
            .Set(c => c.Address, dto.Address?.Trim())
            .Set(c => c.Notes, dto.Notes?.Trim())
            .Set(c => c.Category, dto.Category)
            .Set(c => c.IsFavorite, dto.IsFavorite)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        var result = await _contactsCollection.UpdateOneAsync(c => c.Id == id, update);
        if (result.MatchedCount == 0) return (null, "Contact not found.");

        var updated = await _contactsCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
        return (MapToDto(updated!), null);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        if (!ObjectId.TryParse(id, out _)) return false;
        var result = await _contactsCollection.DeleteOneAsync(c => c.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ToggleFavoriteAsync(string id)
    {
        if (!ObjectId.TryParse(id, out _)) return false;
        var contact = await _contactsCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (contact is null) return false;

        var update = Builders<Contact>.Update
            .Set(c => c.IsFavorite, !contact.IsFavorite)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);
        await _contactsCollection.UpdateOneAsync(c => c.Id == id, update);
        return true;
    }

    private static ContactResponseDto MapToDto(Contact c) => new()
    {
        Id = c.Id!,
        FirstName = c.FirstName,
        LastName = c.LastName,
        Email = c.Email,
        Phone = c.Phone,
        Company = c.Company,
        Address = c.Address,
        Notes = c.Notes,
        Category = c.Category,
        IsFavorite = c.IsFavorite,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
