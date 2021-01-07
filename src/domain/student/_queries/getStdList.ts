import gql from 'graphql-tag';

export const GET_STD_LIST = gql`
  query {
    getStudentList {
      id
      studentName
      studentMiddleName
      studentLastName
      fatherName
      fatherMiddleName
      fatherLastName
      motherName
      motherMiddleName
      motherLastName
      studentAadharNo
      placeOfBirth
      religion
      caste
      subCaste
      age
      sex
      bloodGroup
      state
      country
      strDateOfBirth
      relationWithStudent
      emergencyContactName
      emergencyContactMiddleName
      emergencyContactLastName
      studentPrimaryCellNumber
      admissionNo
      rollNo
      studentType
      departmentId
      batchId
      sectionId
      department {
        id
        name
      }
      batch {
        id
        batch
      }
      section {
        id
        section
      }
    }
  }
`;
