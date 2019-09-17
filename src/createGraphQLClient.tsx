import { ApolloClient, createNetworkInterface } from 'react-apollo';


// 	http://dev.apollodata.com/react/initialization.html#creating-client
export const createGraphQLClient = () => {
  const networkInterface = createNetworkInterface({
    uri: 'http://100.81.3.25:8080/graphql' //18.209.4.2
  });
  const client = new ApolloClient({
    networkInterface: networkInterface

  });

  return client;
};

