import { InMemoryCache, ApolloClient, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";

const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
const httpLink = createHttpLink({
  uri: graphqlUrl,
});

// http://jwtbuilder.jamiekurtz.com/ --> Testtokens
const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NjEzODE1NzQsImV4cCI6MTc5MjkxNzU3NCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.AotLz3yCkc7j6QkeZ0LyXhvjbadf5wCPRsuR6Np6hzY";
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  //const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
