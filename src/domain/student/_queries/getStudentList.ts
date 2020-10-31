import gql from 'graphql-tag';

export const GET_STUDENT_LIST = gql`
  mutation getStudentList($filter: StudentListFilterInput!) {
    getStudentList(filter: $filter) {
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
      studentPanNo
      dateOfBirth
      strDateOfBirth
      placeOfBirth
      religion
      caste
      subCaste
      age
      sex
      studentLocalAddress
      studentPermanentAddress
      city
      state
      country
      pinCode
      bloodGroup
      studentPrimaryCellNumber
      studentAlternateCellNumber
      studentPrimaryEmailId
      studentAlternateEmailId
      relationWithStudent
      emergencyContactName
      emergencyContactMiddleName
      emergencyContactLastName
      emergencyContactCellNumber
      emergencyContactEmailId
      admissionNo
      enrollmentNo
      rollNo
      studentType
      fatherCellNumber
      fatherEmailId
      motherCellNumber
      motherEmailId
      status
      comments

      batch {
        id
        batch
      }
      section {
        id
        section
      }

      department {
        id
        name
      }

      feeDetailsList {
        id
        feeParticularsName
        feeParticularDesc
        studentType
        gender
        amount
        status
        batchId
      }
      feeCategoryId
      totalFee
      totalFeePaid
      totalFeeOverDue
      facilityList {
        id
        linkDesc
        facilityId
      }
      facility {
        id
        name
      }
      paymentHistory {
        id
        invoiceNumber
        amountPaid
        modeOfPayment
        chequeNumber
        demandDraftNumber
        onlineTxnRefNumber
        paymentStatus
        strPaymentDate
        student {
          id
        }
      }
      strNextPaymentDate
    }
  }
`;
