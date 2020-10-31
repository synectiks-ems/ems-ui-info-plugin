const IP = 'localhost';

const graphqlUrl = 'http://' + IP + ':9093';
const loggedInUserUrl = 'http://' + IP + ':3000';

export const config = {
  GRAPHQL_URL: graphqlUrl + '/graphql',
  LOGGED_IN_USER_URL: loggedInUserUrl + '/api/user',
};
