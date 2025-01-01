# NX-MOVIES-DB

[Original NX Readme](NX_README.md)

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
# Setting Up the Development Database

This project includes a development database located in the `./seed` folder, which can be deployed to a MySQL database using the `docker-compose` file found in the `./development-db` folder.

Please make sure, ports 7200 and 7300 are available on your system or modify the `docker-compose.yaml`.

To run the example database, you need to provide at least the following environment variables:

```
MYSQL_DATABASE="db-name"
MYSQL_ROOT_PASSWORD="secret"
```

It is recommended to create an `.env` file in the `./development-db` folder to store these variables. Then, from the `./development-db` directory, run the following command:

```
docker-compose --env-file .env up
```

In addition to the MySQL container, a phpMyAdmin container is also included. To access it, open a web browser and navigate to `http://localhost:7300`. Use the username `root` and the password specified in your environment variable to log in to your database.
