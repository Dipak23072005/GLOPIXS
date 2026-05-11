# V GLOPIXS MongoDB Mapping

Use `database.sql` as the relational backup and map these tables to MongoDB collections later:

- `users` -> `users`
- `plans` -> `plans`
- `titles` -> `titles`
- `subscriptions` -> `subscriptions`
- `watchlist` -> `watchlist`

Suggested title document:

```json
{
  "_id": "title_city_hearts",
  "title": "City Hearts",
  "type": "romance",
  "category": "romance",
  "description": "Modern romance stream",
  "posterUrl": "/uploads/poster.jpg",
  "trailerUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "videoUrl": "/uploads/movie.mp4",
  "isPremium": true,
  "createdAt": "2026-05-08T00:00:00.000Z"
}
```

Run backend:

```bash
npm install
npm start
```

API base URL:

```text
http://localhost:3000/api
```
