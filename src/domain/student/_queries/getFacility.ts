import gql from 'graphql-tag';

export const GET_FACILITY_LIST = gql`
  {
    getFacilities {
      id
      name
      status
      amount
    }
  }
`;
