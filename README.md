# 📒 ContactBook

A full-stack Contact Book application built with **ASP.NET Core 8**, **MongoDB**, and vanilla **HTML/CSS/JavaScript**. Supports full CRUD operations via a RESTful API.
---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | ASP.NET Core 8 Web API (C#) |
| Database | MongoDB |
| API Docs | Swagger / OpenAPI |

---

## ✅ Features

- **GET** — Fetch and display all contacts from MongoDB
- **POST** — Add a new contact with form validation
- **PUT** — Edit/update an existing contact
- **DELETE** — Remove a contact with confirmation dialog
- **PATCH** — Toggle favorite status
- **Search** — Real-time client-side search + server-side search endpoint
- **Category Filter** — Filter by Personal / Work / Family / Other
- **Favorites** — Star contacts and view favorites separately
- **Grid / List View** — Toggle between card grid and list layout
- **Form Validation** — Client-side validation before every submission
- **Toast Notifications** — Success/error feedback on all actions
- **Swagger UI** — Interactive API docs at `/swagger`

---



## 📁 Project Structure

```
ContactBook/
├── ContactBook.API/               # ASP.NET Core backend
│   ├── Controllers/
│   │   └── ContactsController.cs  # REST API endpoints
│   ├── DTOs/
│   │   └── ContactDtos.cs         # Request/response data transfer objects
│   ├── Models/
│   │   ├── Contact.cs             # MongoDB document model
│   │   └── MongoDbSettings.cs     # Config POCO
│   ├── Services/
│   │   └── ContactsService.cs     # Business logic + MongoDB operations
│   ├── wwwroot/                   # Frontend (served as static files)
│   │   ├── index.html             # Page 1: All Contacts
│   │   ├── form.html              # Page 2: Add / Edit Contact
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── api.js             # REST API client
│   │       ├── main.js            # Main page logic
│   │       └── form.js            # Form page logic
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── ContactBook.API.csproj
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | Get all contacts |
| `GET` | `/api/contacts/{id}` | Get contact by ID |
| `GET` | `/api/contacts/search?q={query}` | Search contacts |
| `POST` | `/api/contacts` | Create new contact |
| `PUT` | `/api/contacts/{id}` | Update contact |
| `DELETE` | `/api/contacts/{id}` | Delete contact |
| `PATCH` | `/api/contacts/{id}/favorite` | Toggle favorite |

All responses follow the format:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## 🛠️ Development Notes

- The database and collection are created automatically on first run.
- An email uniqueness index is created automatically.
- Form validation runs both client-side (JS) and server-side (ASP.NET Data Annotations).
- CORS is set to allow all origins — restrict this for production.

---

## 👤 Author

**Syeda Mehrunisa **  
Roll No: 2502133
Course: Web technologies
Instructor:   Mam Warda
