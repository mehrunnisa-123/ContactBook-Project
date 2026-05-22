using ContactBook.API.DTOs;
using ContactBook.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContactBook.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ContactsController : ControllerBase
{
    private readonly ContactsService _contactsService;

    public ContactsController(ContactsService contactsService)
    {
        _contactsService = contactsService;
    }

    /// <summary>Get all contacts</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var contacts = await _contactsService.GetAllAsync();
        return Ok(new { success = true, data = contacts, count = contacts.Count });
    }

    /// <summary>Search contacts</summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { success = false, message = "Search query is required." });

        var contacts = await _contactsService.SearchAsync(q);
        return Ok(new { success = true, data = contacts, count = contacts.Count });
    }

    /// <summary>Get contact by ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var contact = await _contactsService.GetByIdAsync(id);
        if (contact is null)
            return NotFound(new { success = false, message = "Contact not found." });
        return Ok(new { success = true, data = contact });
    }

    /// <summary>Create a new contact</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateContactDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { success = false, message = "Validation failed.", errors });
        }

        var (contact, error) = await _contactsService.CreateAsync(dto);
        if (error is not null)
            return Conflict(new { success = false, message = error });

        return CreatedAtAction(nameof(GetById), new { id = contact!.Id },
            new { success = true, message = "Contact created successfully.", data = contact });
    }

    /// <summary>Update an existing contact</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateContactDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { success = false, message = "Validation failed.", errors });
        }

        var (contact, error) = await _contactsService.UpdateAsync(id, dto);
        if (error == "Contact not found.")
            return NotFound(new { success = false, message = error });
        if (error is not null)
            return Conflict(new { success = false, message = error });

        return Ok(new { success = true, message = "Contact updated successfully.", data = contact });
    }

    /// <summary>Delete a contact</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _contactsService.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { success = false, message = "Contact not found." });
        return Ok(new { success = true, message = "Contact deleted successfully." });
    }

    /// <summary>Toggle favorite status</summary>
    [HttpPatch("{id}/favorite")]
    public async Task<IActionResult> ToggleFavorite(string id)
    {
        var toggled = await _contactsService.ToggleFavoriteAsync(id);
        if (!toggled)
            return NotFound(new { success = false, message = "Contact not found." });
        return Ok(new { success = true, message = "Favorite status updated." });
    }
}
