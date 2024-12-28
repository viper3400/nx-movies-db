# NX-MOVIES-DB

[Original NX Readme](NX_README)

## App Settings

Following settings must be provided via .env file.

### movies-service

|Setting       |Description                 |Base Project       |
|--------------|----------------------------|-------------------|
|DATABASE_URL  |PrismaORM connection string |movies-prisma-lib  |
|JWT_SECRET    |Secret to decode JWT token  |movies-graphql-lib |


**Example**
``` 
DATABASE_URL=mysql://root:password@localhost:7200/videodb
JWT_SECRET=984038080dw0
```

### movies-ui

Got it, here's the Markdown table with just the descriptions:

| Setting | Description |
| --- | --- |
| `GRAPHQL_URL` | The URL for the GraphQL API |
| `NEXT_PUBLIC_GRAPHQL_URL` | The public URL for the GraphQL API |
| `GITHUB_SECRET` | The secret for the GitHub authentication |
| `GITHUB_ID` | The ID for the GitHub authentication |
| `GOOGLE_CLIENT_ID` | The client ID for the Google authentication |
| `GOOGLE_CLIENT_SECRET` | The client secret for the Google authentication |
| `NEXTAUTH_SECRET` | The secret for NextAuth.js |
| `NEXTAUTH_URL` | The URL for the NextAuth.js authentication |
| `NEXT_PUBLIC_NEXTAUTH_URL` | The public URL for the NextAuth.js authentication |
| `ALLOWED_USERS` | A list of allowed users, with email addresses, names, and IDs separated by commas |
| `APP_BASE_PATH` | The base path for the application |
| `COVER_IMAGE_PATH` | The path for cover images |

**Example**

```
GRAPHQL_URL="http://localhost:7100/graphql"
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:7100/graphql"
GITHUB_SECRET="secret"
GITHUB_ID="id"
GOOGLE_CLIENT_ID="id"
GOOGLE_CLIENT_SECRET="secret"
NEXTAUTH_SECRET="secret"
NEXTAUTH_URL=http://localhost:3000/movies/api/auth
NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000/movies/api/auth
ALLOWED_USERS=jane@doe.com,Jane,3;John@example.org,3
APP_BASE_PATH=/movies
COVER_IMAGE_PATH=/media/coverimages
```
