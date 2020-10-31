import * as React from 'react';
import { withApollo } from 'react-apollo';
import { TabContent, TabPane, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import { MessageBox } from '../Message/MessageBox';
import { commonFunctions } from '../_utilites/common.functions';
import { ADD_INVOICE, GET_INVOICE_LIST } from '../_queries';

const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = 'Mandatory fields missing';
const ERROR_MESSAGE_SERVER_SIDE_ERROR = 'Error in cms service, payment invoice could not be generated. Please check cms service logs';
const SUCCESS_MESSAGE_ADDED = 'Payment saved successfully';
const SUCCESS_MESSAGE_UPDATED = 'Payment updated successfully';


type StudentTableStates = {
  user: any;
  activeTab: any;
  stObj: any;
  amountPaid: any;
  branchId: any;
  academicYearId: any;
  departmentId: any;
  errorMessage: any;
  successMessage: any;
  modeOfPayment: any;
  chkDdNo: any;
  bank: any;
  tempFeesPaid: any;
  isModalOpen: any;
  paymentObj: any;
};

export interface StudentDetailsProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  user?: any;
}

class StudentDetailsPage<T = { [data: string]: any }> extends React.Component<StudentDetailsProps, StudentTableStates> {
  constructor(props: any) {
    super(props);
    this.state = {
      isModalOpen: false,
      activeTab: 0,
      stObj: this.props.data,
      user: this.props.user,
      amountPaid: null,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      errorMessage: '',
      successMessage: '',
      modeOfPayment: '',
      chkDdNo: '',
      bank: '',
      tempFeesPaid: null,
      paymentObj: [],
    };
    this.toggleTab = this.toggleTab.bind(this);
    this.createFeeLineItems = this.createFeeLineItems.bind(this);
    this.createFacilityItems = this.createFacilityItems.bind(this);
    this.registerSocket = this.registerSocket.bind(this);
    this.takePayment = this.takePayment.bind(this);
    this.doSave = this.doSave.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.getPaymentHistory = this.getPaymentHistory.bind(this);
    this.createRows = this.createRows.bind(this);
  }

  onChange = (e: any) => {
    e.preventDefault();
    const { name, value } = e.nativeEvent.target;
    if (name === "amountPaid") {
      this.setState({
        amountPaid: value
      });
    }
    if (name === "chkDdNo") {
      this.setState({
        chkDdNo: value
      });
    }
    if (name === "bank") {
      this.setState({
        bank: value
      });
    }
    if (name === "modeOfPayment") {
      this.setState({
        modeOfPayment: value
      });
      commonFunctions.restoreTextBoxBorderToNormal('chkDdNo');
      commonFunctions.restoreTextBoxBorderToNormal('bank');
      commonFunctions.restoreTextBoxBorderToNormal('amountPaid');
    }
    this.setState({
      errorMessage: '',
      successMessage: '',
    });

    commonFunctions.restoreTextBoxBorderToNormal(name);
  };

  async componentDidMount() {
    this.setState({
      stObj: this.props.data,
    });
    await this.registerSocket();
  }

  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    socket.onmessage = (response: any) => {
      let message = JSON.parse(response.data);
      console.log('StudentDetailsPage. message received from server ::: ', message);
      this.setState({
        branchId: message.selectedBranchId,
        academicYearId: message.selectedAcademicYearId,
        departmentId: message.selectedDepartmentId,
      });
      console.log('StudentDetailsPage. branchId: ', this.state.branchId);
      console.log('StudentDetailsPage. academicYearId: ', this.state.academicYearId);
      console.log('StudentDetailsPage. departmentId: ', this.state.departmentId);
    };

    socket.onopen = () => {
      console.log('StudentDetailsPage. Opening websocekt connection to cmsbackend. User : ',
        new URLSearchParams(location.search).get("signedInUser")
      );
      socket.send(new URLSearchParams(location.search).get("signedInUser"));
    };

    window.onbeforeunload = () => {
      console.log('StudentDetailsPage. Closing websocket connection with cms backend service');
    };
  }

  componentWillReceiveProps() {
    this.setState({
      stObj: this.props.data,
    });
  }
  toggleTab(tabNo: any) {
    this.setState({
      activeTab: tabNo,
    });
  }

  createFeeLineItems(stObj: any) {
    const retVal: any = [];
    if (stObj !== null && stObj !== undefined) {
      if (stObj.feeDetailsList !== undefined && stObj.feeDetailsList !== null && stObj.feeDetailsList.length > 0) {
        for (let i = 0; i < stObj.feeDetailsList.length; i++) {
          const fd = stObj.feeDetailsList[i];
          console.log("FD :::::::::::::", fd);
          retVal.push(
            <tr>
              <td>{fd.feeParticularsName}</td>
              <td>{fd.amount}</td>
            </tr>
          )
        }
      }
      return retVal;
    }
  }

  createFacilityItems(stObj: any) {
    const retVal: any = [];
    if (stObj !== null && stObj !== undefined) {
      if (stObj.facilityList !== undefined && stObj.facilityList !== null && stObj.facilityList.length > 0) {
        for (let i = 0; i < stObj.facilityList.length; i++) {
          const fd = stObj.facilityList[i];
          console.log("Facility :::::::::::::", fd);
          retVal.push(
            <tr>
              <td>{fd.facilityId}</td>
              {/* <td>{fd.facility.amount}</td> */}
            </tr>
          )
        }
      }
      return retVal;
    }
  }

  async doSave(inputObj: any) {
    let btn = document.querySelector('#btnTakePayment');
    btn && btn.setAttribute('disabled', 'true');
    let exitCode = 0;

    await this.props.client
      .mutate({
        mutation: ADD_INVOICE,
        variables: {
          input: inputObj,
        },
      })
      .then((resp: any) => {
        console.log('Success in save invoice. Response ::: ', resp);
        this.setState({
          tempFeesPaid: resp.data.addInvoice.invoice.outStandingAmount
          // tempFeesPaid: (parseInt((this.state.stObj.totalFeePaid !== '' ? this.state.stObj.totalFeePaid : 0),10) + parseInt(inputObj.amountPaid, 10))
        });
      })
      .catch((error: any) => {
        exitCode = 1;
        console.log('Error in save invoice : ', error);
      });

    btn && btn.removeAttribute('disabled');

    let errorMessage = '';
    let successMessage = '';
    if (exitCode === 0) {
      successMessage = SUCCESS_MESSAGE_ADDED;

    } else {
      errorMessage = ERROR_MESSAGE_SERVER_SIDE_ERROR;
    }
    this.setState({
      successMessage: successMessage,
      errorMessage: errorMessage,
    });

  }

  takePayment() {
    const { user, stObj, bank, amountPaid, branchId, academicYearId,departmentId, errorMessage, successMessage, modeOfPayment, chkDdNo } = this.state;
    console.log("Payment amount : ", amountPaid);
    if (!branchId) {
      this.setState({
        errorMessage: 'Please select branch from preferences'
      });
      return;
    }
    if (!departmentId) {
      this.setState({
        errorMessage: 'Please select deparment from preferences'
      });
      return;
    }
    if (!academicYearId) {
      this.setState({
        errorMessage: 'Please select academicyear from preferences'
      });
      return;
    }
    let isValid = true;
    if (modeOfPayment === null || modeOfPayment === undefined || modeOfPayment === '') {
      this.setState({
        errorMessage: ERROR_MESSAGE_MANDATORY_FIELD_MISSING
      });
      commonFunctions.changeTextBoxBorderToError('', 'modeOfPayment');
      isValid = false;
    }
    if ((modeOfPayment === 'CHEQUE' || modeOfPayment === 'DEMANDDRAFT') && (chkDdNo === null || chkDdNo === undefined || chkDdNo === '')) {
      this.setState({
        errorMessage: ERROR_MESSAGE_MANDATORY_FIELD_MISSING
      });
      commonFunctions.changeTextBoxBorderToError('', 'chkDdNo');
      isValid = false;
    }
    if ((modeOfPayment === 'CHEQUE' || modeOfPayment === 'DEMANDDRAFT') && (bank === null || bank === undefined || bank === '')) {
      this.setState({
        errorMessage: ERROR_MESSAGE_MANDATORY_FIELD_MISSING
      });
      commonFunctions.changeTextBoxBorderToError('', 'bank');
      isValid = false;
    }
    if (amountPaid === null || amountPaid === undefined || amountPaid === '') {
      this.setState({
        errorMessage: ERROR_MESSAGE_MANDATORY_FIELD_MISSING
      });
      commonFunctions.changeTextBoxBorderToError('', 'amountPaid');
      isValid = false;
    }
    if (isValid === false) {
      return;
    }
    if ((modeOfPayment === "CHEQUE" || modeOfPayment === "DEMANDDRAFT")
      && (chkDdNo === null || chkDdNo === undefined || chkDdNo === '')) {
      this.setState({
        errorMessage: ERROR_MESSAGE_MANDATORY_FIELD_MISSING
      });
      commonFunctions.changeTextBoxBorderToError('', 'chkDdNo');
      return;
    }
    let inputObj = {
      studentId: stObj.id,
      branchId: branchId,
      academicYearId: academicYearId,
      departmentId: departmentId,
      modeOfPayment: modeOfPayment,
      chequeNumber: modeOfPayment === 'CHEQUE' ? chkDdNo : null,
      demandDraftNumber: modeOfPayment === 'DEMANDDRAFT' ? chkDdNo : null,
      bank: (modeOfPayment === 'CHEQUE' || modeOfPayment === 'DEMANDDRAFT') ? bank : null,
      amountPaid: amountPaid,
      updatedBy: user
    }
    this.doSave(inputObj);
  }


  async showDetail(bShow: boolean, stObj: any) {
    // e && e.preventDefault();
    if (bShow) {
      await this.getPaymentHistory(stObj);
    }
    this.setState({
      isModalOpen: bShow,
    });
  }

  async getPaymentHistory(stObj: any) {
    const { branchId } = this.state;
    await this.props.client.query({
      query: GET_INVOICE_LIST,
      variables: {
        studentId: stObj.id,
        branchId: branchId,
      },
      fetchPolicy: 'no-cache',
    }).then((data: any) => {
      //This is dummy data to show details in popup. Please remove it. 
      // data = {
      //   "data": {
      //     "getInvoices": [
      //       {
      //         "id": 1101,
      //         "invoiceNumber": "9511584994345380",
      //         "amountPaid": 300,
      //         "outStandingAmount": 0,
      //         "modeOfPayment": "CASH",
      //         "chequeNumber": null,
      //         "demandDraftNumber": null,
      //         "onlineTxnRefNumber": null,
      //         "paymentStatus": "PAID",
      //         "comments": null,
      //         "updatedBy": null,
      //         "branchId": 1051,
      //         "strPaymentDate": "24-03-2020",
      //         "strNextPaymentDate": null,
      //         "strUpdatedOn": "24-03-2020",
      //         "bank": null
      //       },
      //       {
      //         "id": 1052,
      //         "invoiceNumber": "9511584992962303",
      //         "amountPaid": 100,
      //         "outStandingAmount": 300,
      //         "modeOfPayment": "DEMANDDRAFT",
      //         "chequeNumber": null,
      //         "demandDraftNumber": 22222,
      //         "onlineTxnRefNumber": null,
      //         "paymentStatus": "PAID",
      //         "comments": null,
      //         "updatedBy": null,
      //         "branchId": 1051,
      //         "strPaymentDate": "24-03-2020",
      //         "strNextPaymentDate": null,
      //         "strUpdatedOn": "24-03-2020",
      //         "bank": "CITY Bank"
      //       },
      //       {
      //         "id": 1051,
      //         "invoiceNumber": "9511584991665939",
      //         "amountPaid": 100,
      //         "outStandingAmount": 400,
      //         "modeOfPayment": "CASH",
      //         "chequeNumber": null,
      //         "demandDraftNumber": null,
      //         "onlineTxnRefNumber": null,
      //         "paymentStatus": "PAID",
      //         "comments": null,
      //         "updatedBy": null,
      //         "branchId": 1051,
      //         "strPaymentDate": "24-03-2020",
      //         "strNextPaymentDate": null,
      //         "strUpdatedOn": "24-03-2020",
      //         "bank": null
      //       },
      //       {
      //         "id": 1001,
      //         "invoiceNumber": "9511584991157994",
      //         "amountPaid": 200,
      //         "outStandingAmount": 700,
      //         "modeOfPayment": "CASH",
      //         "chequeNumber": null,
      //         "demandDraftNumber": null,
      //         "onlineTxnRefNumber": null,
      //         "paymentStatus": "PAID",
      //         "comments": null,
      //         "updatedBy": null,
      //         "branchId": 1051,
      //         "strPaymentDate": "24-03-2020",
      //         "strNextPaymentDate": null,
      //         "strUpdatedOn": "24-03-2020",
      //         "bank": null
      //       },
      //       {
      //         "id": 952,
      //         "invoiceNumber": "9511584986340255",
      //         "amountPaid": 300,
      //         "outStandingAmount": 2700,
      //         "modeOfPayment": "CHEQUE",
      //         "chequeNumber": 111111,
      //         "demandDraftNumber": null,
      //         "onlineTxnRefNumber": null,
      //         "paymentStatus": "PAID",
      //         "comments": null,
      //         "updatedBy": null,
      //         "branchId": 1051,
      //         "strPaymentDate": "23-03-2020",
      //         "strNextPaymentDate": null,
      //         "strUpdatedOn": "23-03-2020",
      //         "bank": "Axis Bank"
      //       },
      //       {
      //         "id": 951,
      //         "invoiceNumber": "9511584985892362",
      //         "amountPaid": 2000,
      //         "outStandingAmount": 1000,
      //         "modeOfPayment": "CASH",
      //         "chequeNumber": null,
      //         "demandDraftNumber": null,
      //         "onlineTxnRefNumber": null,
      //         "paymentStatus": "PAID",
      //         "comments": null,
      //         "updatedBy": null,
      //         "branchId": 1051,
      //         "strPaymentDate": "23-03-2020",
      //         "strNextPaymentDate": null,
      //         "strUpdatedOn": "23-03-2020",
      //         "bank": null
      //       }
      //     ]
      //   }
      // }
      this.setState({
        paymentObj: data.data.getInvoices
      })
    }
    );


  }

  async createRows() {
    const { paymentObj } = this.state;
    console.log("paymentObj :::::----------------------->>>>>> ", paymentObj);
    let homeArray = new Array(paymentObj.length);
    let i = 0

    for (var key in paymentObj) {
      homeArray[i] = paymentObj[key];
      i = i + 1;
    }

    const retVal = [];

    for (let x = 0; x < homeArray.length; x++) {
      const tempObj = homeArray[x];
      retVal.push(
        <tbody>
          <tr>
            <td>{tempObj.invoiceNumber}</td>
            <td>{tempObj.amountPaid}</td>
            <td>{tempObj.outStandingAmount}</td>
            <td>{tempObj.strPaymentDate}</td>
            <td>{tempObj.modeOfPayment}</td>
            <td>{tempObj.chequeNumber}</td>
            <td>{tempObj.demandDraftNumber}</td>
            <td>{tempObj.bank}</td>
          </tr>
        </tbody>
      );
    }

    // console.log("Payment history data :::::: ",data.getInvoices);  

    return retVal;
  }

  createPaymentHistoryRows(paymentObj: any) {
    if (paymentObj && paymentObj.length > 0) {
      return paymentObj.map((item: any) =>
        <tr key={item.id}>
          <td>{item.invoiceNumber}</td>
          <td>{item.amountPaid}</td>
          <td>{item.outStandingAmount}</td>
          <td>{item.strPaymentDate}</td>
          <td>{item.modeOfPayment}</td>
          <td>{item.chequeNumber}</td>
          <td>{item.demandDraftNumber}</td>
          <td>{item.bank}</td>
        </tr>
      );
    }
    return [];
  }

  render() {
    const { activeTab, isModalOpen, paymentObj, tempFeesPaid, stObj, amountPaid, errorMessage, successMessage, modeOfPayment, chkDdNo, bank } = this.state;
    return (
      <section className="student-profile-container">
        <div className="plugin-bg-white">
          {errorMessage !== '' ? (
            <MessageBox id="mbox" message={errorMessage} activeTab={2} />
          ) : null}
          {successMessage !== '' ? (
            <MessageBox id="mbox" message={successMessage} activeTab={1} />
          ) : null}
          <div>
            <div className="b-1 m-1">
              <div className="student-photo-container profile-grid">
                <div className="text-center">
                  <img
                    className="photo"
                    id="stPhoto"
                    // src={student.uploadPhoto}
                    style={{ width: '12rem', height: '12rem' }}
                  ></img>
                </div>
                <div className="">
                  <div className="row">
                    <div className="col-sm-4 col-xs-12 m-b-2">
                      <h3 className="dblue-text">
                        {stObj.studentName} {stObj.studentMiddleName}{' '}
                        {stObj.studentLastName}
                      </h3>
                    </div>
                    <div className="col-sm-4 col-xs-12 m-b-2">
                      <span className="profile-label">Primary Contact No: </span>
                      <span>{stObj.studentPrimaryCellNumber}</span>
                    </div>
                    <div className="col-sm-4 col-xs-12 m-b-2">
                      <span className="profile-label">Alternate Contact No: </span>
                      <span>{stObj.studentAlternateCellNumber}</span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-xs-12 col-sm-4 m-b-2">
                      <span className="profile-label">Admission No:</span>
                      <span>{stObj.admissionNo}</span>
                    </div>
                    <div className="col-xs-12 col-sm-4 m-b-2">
                      <span className="profile-label">Roll No:</span>
                      <span>{stObj.rollNo}</span>
                    </div>
                    <div className="col-xs-12 col-sm-4 m-b-2">
                      <span className="profile-label">Class:</span>
                      {stObj.batch !== undefined && <span>{stObj.batch.batch}</span>}
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: '10px' }}>
                    <div className="col-xs-12 col-sm-4 m-b-2">
                      <span className="profile-label">Student Id:</span>
                      <span>{stObj.id}</span>
                    </div>
                    <div className="col-xs-12 col-sm-4 m-b-2">
                      <span className="profile-label">Department:</span>
                      {stObj.department !== undefined && (
                        <span>{stObj.department.name}</span>
                      )}
                    </div>
                    <div className="col-xs-12 col-sm-4 m-b-2">
                      <span className="profile-label">Section:</span>
                      {stObj.section !== undefined && (
                        <span>{stObj.section.section}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-m-1">
                <Nav tabs className="" id="rmfloat">
                  <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 0 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(0);
                      }}
                    >
                      Profile
                    </NavLink>
                  </NavItem>
                  {/* <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 1 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(1);
                      }}
                    >
                      Details
                    </NavLink>
                  </NavItem>
                  <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 2 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(2);
                      }}
                    >
                      Academic
                    </NavLink>
                  </NavItem> */}
                  <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 3 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(3);
                      }}
                    >
                      Fee
                    </NavLink>
                  </NavItem>
                  {/* <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 4 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(4);
                      }}
                    >
                      Reports
                    </NavLink>
                  </NavItem>
                  <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 5 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(5);
                      }}
                    >
                      ID Cards
                    </NavLink>
                  </NavItem>
                  <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 6 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(6);
                      }}
                    >
                      Documents
                    </NavLink>
                  </NavItem> */}
                  <NavItem className="cursor-pointer">
                    <NavLink
                      className={`${activeTab === 7 ? 'active' : ''}`}
                      onClick={() => {
                        this.toggleTab(7);
                      }}
                    >
                      Facility
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="ltab-contianer p-0">
                  <TabPane tabId={0}>
                    <span>
                      <div className="main-details m-1 p-2">
                        <div className="details-container">
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Fathers Name:</span>
                              <span>{stObj.fatherName}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Fathers Contact:</span>
                              <span>{stObj.fatherCellNumber}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Email Address</span>
                              <span>{stObj.fatherEmailId}</span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Mothers Name:</span>
                              <span>{stObj.motherName}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Mothers Contact:</span>
                              <span>{stObj.motherCellNumber}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Email Address:</span>
                              <span>{stObj.motherEmailId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="details-container p-t-2">
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Local Address:</span>
                              <span>{stObj.studentLocalAddress}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Parmenent Address:</span>
                              <span>{stObj.studentPermanentAddress}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">City:</span>
                              <span>{stObj.city}</span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">State:</span>
                              <span>{stObj.state}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Country:</span>
                              <span>{stObj.country}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Pin Code:</span>
                              <span>{stObj.pinCode}</span>
                            </div>
                          </div>
                        </div>
                        <div className="details-container p-t-2">
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Adhar No:</span>
                              <span>{stObj.studentAadharNo}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Date Of Birth:</span>
                              <span>{stObj.strDateOfBirth}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Place Of Birth:</span>
                              <span>{stObj.placeOfBirth}</span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Religion:</span>
                              <span>{stObj.religion}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Cast:</span>
                              <span>{stObj.caste}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Sub Cast:</span>
                              <span>{stObj.subCaste}</span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Blood Group:</span>
                              <span>{stObj.bloodGroup}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Sex:</span>
                              <span>{stObj.sex}</span>
                            </div>
                            <div className="col-sm-4 col-xs-12 m-b-1">
                              <span className="profile-label">Student Type:</span>
                              <span>{stObj.studentType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </span>
                  </TabPane>
                  {/* <TabPane tabId={1}>
                    <div className="p-1">Details Content</div>
                  </TabPane>
                  <TabPane tabId={2}>
                    <div className="p-1"> Academic Content</div>
                  </TabPane> */}
                  <TabPane tabId={3}>
                    <span>
                      <div className="main-details m-1 p-2">
                        <div className="details-container m-b-2">
                          <div className="dflex ">
                            <div className="fwidth dflex ">
                              <div className="fwidth">
                                <div className="profile-label">Total Fee</div>
                                <div className="box-text">{stObj.totalFee !== null ? stObj.totalFee : 0}</div>
                              </div>
                              <div className="fwidth">
                                <div className="profile-label">Fees Paid</div>
                                <div className="box-text ">{tempFeesPaid === null ? (stObj.totalFeePaid !== null ? stObj.totalFeePaid : 0) : (stObj.totalFee - tempFeesPaid)}</div>
                              </div>
                              <div className="fwidth">
                                <div className="profile-label">Fees Due</div>
                                <div className="box-text">{stObj.totalFeeOverDue}</div>
                              </div>
                              <div className="fwidth">
                                <div className="profile-label">Next Due Date</div>
                                <div className="box-text" style={{ height: '31px' }}>{stObj.strNextPaymentDate !== null ? stObj.strNextPaymentDate : ''}</div>
                              </div>
                              <div className="fwidth">
                                <div className="profile-label">Total Remaining</div>
                                <div className="box-text">{tempFeesPaid === null ? (parseInt(stObj.totalFee, 10) - parseInt(stObj.totalFeePaid, 10)) : tempFeesPaid}</div>
                              </div>
                              {/* <div className="fwidth">
                                <div className="profile-label mbten">
                                  Send Notification
                                </div>
                                <button className="btn btn-primary btn-cust-width">
                                  Send SMS
                                </button>
                              </div> */}

                            </div>
                          </div>
                          <div className="fwidth dflex m-b-1">{}</div>
                          <div className="fwidth dflex bdr-bpttom">
                            <div className="fwidth">
                              <div className="profile-label">Mode of Payment </div>
                              <div className="profile-label">
                                <select name="modeOfPayment" id="modeOfPayment" className="gf-form-input" style={{ marginTop: '10px' }} onChange={this.onChange} value={modeOfPayment} >
                                  <option value="">Select</option>
                                  <option value="CASH">CASH</option>
                                  <option value="CHEQUE">CHEQUE</option>
                                  <option value="DEMANDDRAFT">DEMANDDRAFT</option>
                                </select>
                              </div>
                            </div>
                            <div className="fwidth">
                              <div className="profile-label">Cheque/Demand Draft No </div>
                              <div className="profile-label"><input disabled={(modeOfPayment === 'CHEQUE' || modeOfPayment === 'DEMANDDRAFT') ? false : true} className="gf-form-input" style={{ marginTop: '10px' }} type="number" id="chkDdNo" name="chkDdNo" onChange={this.onChange} value={chkDdNo} /></div>
                            </div>
                            <div className="fwidth">
                              <div className="profile-label">Issuer Bank</div>
                              <div className="profile-label">
                                <select disabled={(modeOfPayment === 'CHEQUE' || modeOfPayment === 'DEMANDDRAFT') ? false : true} name="bank" id="bank" className="gf-form-input" style={{ marginTop: '10px' }} onChange={this.onChange} value={bank} >
                                  <option value="">Select</option>
                                  <option value="Axis Bank">Axis Bank</option>
                                  <option value="CITY Bank">CITY Bank</option>
                                  <option value="HDFC Bank">HDFC Bank</option>
                                  <option value="ICICI Bank">ICICI Bank</option>
                                  <option value="SBI Bank">SBI Bank</option>
                                </select>
                              </div>
                            </div>
                            <div className="fwidth">
                              <div className="profile-label">Provide Fee Amount </div>
                              <div className="profile-label"><input className="gf-form-input" style={{ marginTop: '10px' }} type="number" id="amountPaid" name="amountPaid" onChange={this.onChange} value={amountPaid} /></div>
                            </div>
                            <div className="fwidth">
                              <div className="profile-label mbten">&nbsp;</div>
                              <button className="btn btn-primary btn-cust-width" id="btnTakePayment" name="btnTakePayment" onClick={this.takePayment}>
                                Take Payment
                                </button>
                            </div>
                          </div>


                          <div className="dflex m-t-1">
                            <table className="w-40" id="txt-align">
                              <thead style={{ backgroundColor: 'rgb(216, 216, 216)' }}>
                                <tr>
                                  <th style={{ border: '1px solid #868686' }}>Fee Line Item</th>
                                  <th style={{ border: '1px solid #868686' }}>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.createFeeLineItems(stObj)}
                              </tbody>

                            </table>
                            <table className="w-40 m-r-3 m-l-3" id="txt-align">
                              <thead style={{ backgroundColor: 'rgb(216, 216, 216)' }}>
                                <tr>
                                  <th style={{ border: '1px solid #868686' }}>Facility</th>
                                  <th style={{ border: '1px solid #868686' }}>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.createFacilityItems(stObj)}
                              </tbody>
                            </table>
                            {/* <div className="w-20">
                              <div className="profile-label">Next Payment</div>
                              <div className="box-text">35,000</div>
                            </div> */}
                          </div>
                          <div>
                            <Modal isOpen={isModalOpen} className="react-strap-modal-container">
                              <ModalHeader>{'Payment History'}</ModalHeader>
                              <ModalBody className="modal-content">
                                <div style={{ height: '350px', width: '100%', boxSizing: 'border-box', display: 'inline-block', verticalAlign: 'middle', overflowY: 'auto' }}>
                                  <table className="fwidth">
                                    <thead>
                                      <tr>
                                        <th>Invoice No</th>
                                        <th>Amount Paid</th>
                                        <th>Remaining Amount</th>
                                        <th>Payment Date</th>
                                        <th>Mode of Payment</th>
                                        <th>Cheque No</th>
                                        <th>Demand Draft No</th>
                                        <th>Issuer Bank</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {
                                        this.createPaymentHistoryRows(paymentObj)
                                      }
                                    </tbody>
                                  </table>
                                </div>
                                <button className="btn btn-primary" onClick={e => this.showDetail(false, null)}>
                                  Close
                            </button>
                              </ModalBody>
                            </Modal>
                          </div>
                          <div className="w-20">
                            <button className="btn btn-primary" onClick={e => this.showDetail(true, stObj)}>
                              Payment History
                            </button>
                          </div>

                        </div>
                      </div>
                    </span>
                  </TabPane>
                  {/* <TabPane tabId={4}>
                    <div className="p-1"> Report Content</div>
                  </TabPane>
                  <TabPane tabId={5}>
                    <div className="p-1"> ID Card Content</div>
                  </TabPane>
                  <TabPane tabId={6}>
                    <div className="p-1"> Document Content</div>
                  </TabPane> */}
                  <TabPane tabId={7}>
                    <span>
                      <div className="main-details m-1 p-2">
                        <div className="details-container">
                          <div className="fflex m-b-1">
                            <div className="profile-label cust-wh">Transport</div>
                            <div className="cust-wh">Yes</div>
                            <div className="profile-label cust-wh">Route</div>
                            <div className="cust-box-text cust-wh m-r-3">A1</div>
                            <div className="profile-label cust-wh m-l-3 m-r-2">
                              Route Charges
                            </div>
                            <div className="cust-box-text cust-wh">1,000</div>
                          </div>
                        </div>
                        <div className="details-container p-t-2">
                          <div className="fflex m-b-1">
                            <div className="profile-label cust-wh">Gym</div>
                            <div className="cust-wh">No</div>
                          </div>
                          <div className="fflex m-b-1">
                            <div className="profile-label cust-wh">Mess</div>
                            <div className="cust-wh">Yes</div>
                          </div>
                          <div className="fflex m-b-1">
                            <div className="profile-label cust-wh">Sports</div>
                            <div className="cust-wh">No</div>
                          </div>
                          <div className="fflex m-b-1">
                            <div className="profile-label cust-wh">Cultural class</div>
                            <div className="cust-wh">No</div>
                          </div>
                        </div>
                      </div>
                    </span>
                  </TabPane>
                </TabContent>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default withApollo(StudentDetailsPage);
