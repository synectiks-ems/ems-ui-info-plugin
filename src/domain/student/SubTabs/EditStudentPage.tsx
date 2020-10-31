import * as React from 'react';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import {withApollo} from 'react-apollo';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import * as moment from 'moment';
import {ADD_STUDENT, GET_STUDENT_FILTER_DATA} from '../_queries';
import {MessageBox} from '../Message/MessageBox';
import {commonFunctions} from '../_utilites/common.functions';
import FacilityList from './FacilityList';

type StudentTableStates = {
  studentData: any;
  branches: any;
  departments: any;
  batches: any;
  sections: any;
  studentTypes: any;
  genders: any;
  branchId: any;
  academicYearId: any;
  departmentId: any;
  createStudentFilterDataCache: any;
  user: any;
  stObj: any;
  StdObj: any;
  facilityList:any;
};

export interface StudentProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  branchList?: any;
  departmentList?: any;
  createStudentFilterDataCache?: any;
  facilityList?: any;
  user?: any;
  batches?: any;
  sections?: any;
  stObj?: any;
  StdObj?: any;
}

const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = 'Mandatory fields missing';
const ERROR_MESSAGE_INVALID_EMAIL_ID = 'Invalid email id';
const ERROR_MESSAGE_SERVER_SIDE_ERROR =
  'Due to some error in cms service, student could not be saved. Please check cms service logs';
const SUCCESS_MESSAGE_STUDENT_ADDED = 'New student saved successfully';
const SUCCESS_MESSAGE_STUDENT_UPDATED = 'Student updated successfully';

class AddStudentPage extends React.Component<StudentProps, any> {
  DEFAULT_STUDENT_IMAGE = '/public/img/user_profile.png';
  isActive: any = false;
  constructor(props: any) {
    super(props);
    this.state = {
      branchList: this.props.branchList,
      departmentList: this.props.departmentList,
      createStudentFilterDataCache: this.props.createStudentFilterDataCache,
      facilityList: this.props.facilityList,
      selectedFacility:'',
      user: this.props.user,
      stObj: this.props.data,
      StdObj: this.props.StdObj,
      batches: this.props.batches,
      sections: this.props.sections,
      activeTab: 0,
      uploadPhoto: null,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      errorMessage: '',
      successMessage: '',
      studentObj: {
        studentName: '',
        studentMiddleName: '',
        studentLastName: '',
        fatherName: '',
        fatherMiddleName: '',
        fatherLastName: '',
        studentAadharNo: '',
        studentPanNo: '',
        dateOfBirth: '',
        religion: '',
        caste: '',
        sex: '',
        studentLocalAddress: '',
        studentPermanentAddress: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
        studentPrimaryCellNumber: '',
        studentAlternateCellNumber: '',
        studentPrimaryEmailId: '',
        studentAlternateEmailId: '',
        relationWithStudent: '',
        emergencyContactName: '',
        emergencyContactMiddleName: '',
        emergencyContactLastName: '',
        emergencyContactCellNumber: '',
        studentImagePath: '',
        admissionNo: '',
        rollNo: '',
        studentType: '',
        fatherCellNumber: '',
        fatherEmailId: '',
        status: '',
        comments: '',
        departmentId: '',
        branchId: '',
        facilityId: '',
        facility:{
          id: ''
        }
      },
      studentData: {
        batch: {
          id: '',
        },
        section: {
          id: '',
        },
        studentType: {
          id: '',
        },
        gender: {
          id: '',
        },
        selectedIds:'',
      },
      branches: [],
      departments: [],
      // batches: [],
      // sections: [],
      studentTypes: [],
      genders: [],

    };
    this.toggleTab = this.toggleTab.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.createBatches = this.createBatches.bind(this);
    this.createSections = this.createSections.bind(this);
    this.validatePersonalInfo = this.validatePersonalInfo.bind(this);
    this.validateContactDetails = this.validateContactDetails.bind(this);
    this.validateEmergencyDetails = this.validateEmergencyDetails.bind(this);
    this.registerSocket = this.registerSocket.bind(this);
    this.save = this.save.bind(this);
    this.doSave = this.doSave.bind(this);
    this.getInput = this.getInput.bind(this);
    this.setSelectedFacility = this.setSelectedFacility.bind(this);
    this.getcreateStudentFilterDataCache = this.getcreateStudentFilterDataCache.bind(
      this
    );
    this.onChange = this.onChange.bind(this);
    this.editInputValue = this.editInputValue.bind(this);
  }

  async componentDidMount() {
    this.setState({
      stObj: this.props.data,
    });
    await this.registerSocket();
    console.log('check batches:', this.props.batches);
    console.log('1.test stObj data:', this.state.stObj);
    console.log('30. test StdObj data state:', this.state.StdObj);
    console.log('40. test StdObj data props:', this.props.StdObj);
    this.editInputValue();
  }

  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    let dpid: any = 0;
    let bid: any = 0;
    let ayid: any = 0;

    socket.onmessage = (response: any) => {
      let message = JSON.parse(response.data);
      console.log('StudentAddPage. message received from server ::: ', message);
      this.setState({
        branchId: message.selectedBranchId,
        academicYearId: message.selectedAcademicYearId,
        departmentId: message.selectedDepartmentId,
      });
      bid = '' + message.selectedBranchId;
      ayid = '' + message.selectedAcademicYearId;
      dpid = '' + message.selectedDepartmentId;
      console.log('StudentAdd. branchId: ', this.state.branchId);
      console.log('StudentAdd. departmentId: ', this.state.departmentId);
    };

    socket.onopen = () => {
      console.log(
        'Student. Opening websocekt connection to cmsbackend. User : ',
        this.state.user.login
      );
      socket.send(this.state.user.login);
    };

    window.onbeforeunload = () => {
      console.log('Student. Closing websocket connection with cms backend service');
    };
  }


  componentWillReceiveProps() {
    this.setState({
      stObj: this.props.data,
    });
    console.log('check batches:', this.props.batches);
    console.log('2. test stObj data:', this.state.stObj);
    console.log('30. test StdObj data state:', this.state.StdObj);
    console.log('40. test StdObj data props:', this.props.StdObj);
    this.editInputValue();
  }

  setSelectedFacility(selectedFacilities: any) {
    console.log("SELECTED Facility :::: ",selectedFacilities[0]);
    this.setState({
      selectedFacility: selectedFacilities[0].id,
    });
  }
  
  async getcreateStudentFilterDataCache() {
    const {branchId, academicYearId, departmentId} = this.state;
    console.log('student branch Id:', branchId);
    const {data} = await this.props.client.query({
      query: GET_STUDENT_FILTER_DATA,
      variables: {
        collegeId: '' + branchId,
        academicYearId: '' + academicYearId,
      },

      fetchPolicy: 'no-cache',
    });
    this.setState({
      createStudentFilterDataCache: data,
    });
  }

  createBatches(batches: any, selectedDepartmentId: any) {
    let batchesOptions = [
      <option key={''} value={''}>
        {' '}
        Select Year{' '}
      </option>,
    ];
    for (let i = 0; i < batches.length; i++) {
      let id = batches[i].id;
      let dptId = batches[i].department.id;
      if (parseInt(dptId, 10) === parseInt(selectedDepartmentId, 10)) {
        batchesOptions.push(
          <option key={id} value={id}>
            {batches[i].batch}
          </option>
        );
      }
    }
    return batchesOptions;
  }

  createSections(sections: any, selectedBatchId: any) {
    let sectionsOptions = [
      <option key={0} value="">
        Select Section
      </option>,
    ];
    for (let i = 0; i < sections.length; i++) {
      let id = sections[i].id;
      let sbthId = '' + sections[i].batch.id;
      if (sbthId == selectedBatchId) {
        sectionsOptions.push(
          <option key={id} value={id}>
            {sections[i].section}
          </option>
        );
      }
    }
    return sectionsOptions;
  }

  onChange = (e: any) => {
    e.preventDefault();
    const {name, value} = e.nativeEvent.target;
    const {studentObj, studentData} = this.state;

    if (name === 'batch') {
      this.setState({
        studentData: {
          ...studentData,
          batch: {
            id: value,
          },
          section: {
            id: '',
          },
        },
      });
    } else if (name === 'section') {
      this.setState({
        studentData: {
          ...studentData,
          section: {
            id: value,
          },
        },
      });
    } else {
      this.setState({
        studentObj: {
          ...studentObj,
          [name]: value,
        },
        studentData: {
          ...studentData,
          [name]: value,
        },
        errorMessage: '',
        successMessage: '',
      });
    }
    commonFunctions.restoreTextBoxBorderToNormal(name);
  };

  toggleTab(tabNo: any) {
    this.setState({
      activeTab: tabNo,
    });
  }

  async doSave(inputObj: any, id: any) {
    const {studentData, branchId, academicYearId, departmentId} = this.state;
    let btn = document.querySelector('#' + id);
    btn && btn.setAttribute('disabled', 'true');
    let exitCode = 0;

    await this.props.client
      .mutate({
        mutation: ADD_STUDENT,
        variables: {
          input: inputObj,
        },
      })
      .then((resp: any) => {
        console.log(
          'Success in saveStaff Mutation. Exit code : '
          // resp.data.addStudent.cmsStudentVo.exitCode
        );
        console.log('total IDS : ', studentData.selectedIds);
        // exitCode = resp.data.addStudent.cmsStudentVo.exitCode;

        // this.setState({
        //   studentList: resp.data.addStudent.cmsStudentVo.dataList,
        // });
      })
      .catch((error: any) => {
        exitCode = 1;
        console.log('Error in addStudent : ', error);
      });
    btn && btn.removeAttribute('disabled');

    let errorMessage = '';
    let successMessage = '';
    if (exitCode === 0) {
      successMessage = SUCCESS_MESSAGE_STUDENT_ADDED;
      if (inputObj.id !== null) {
        successMessage = SUCCESS_MESSAGE_STUDENT_UPDATED;
      }
    } else {
      errorMessage = ERROR_MESSAGE_SERVER_SIDE_ERROR;
    }
    this.setState({
      successMessage: successMessage,
      errorMessage: errorMessage,
    });
    // this.props.onSaveUpdate(errorMessage, successMessage);
  }

  save = (e: any) => {
    const {id} = e.nativeEvent.target;
    const {studentObj, branchId} = this.state;
    if (!branchId) {
      this.setState({
        errorMessage: 'Please select branch from preferences',
      });
      return;
    }
    if (!this.validatePersonalInfo()) {
      this.toggleTab(0);
      return;
    } else if (!this.validateContactDetails()) {
      this.toggleTab(1);
      return;
    } else if (!this.validateEmergencyDetails()) {
      this.toggleTab(2);
      return;
    }
    const inputObj = this.getInput(studentObj);
    this.doSave(inputObj, id);
  };

  getImage = (e: any) => {
    const {studentObj} = this.state;
    let objImg: any = document.querySelector('#uploadPhoto');
    objImg.src = studentObj.studentImagePath;
    studentObj.studentImagePath = URL.createObjectURL(e.target.files[0]);
    var r = new FileReader();
    r.onload = function(e: any) {
      studentObj.fileName = e.target.result;
      console.log('Image converted to base64 string :\n\n' + studentObj.fileName);
    };
    r.readAsDataURL(e.target.files[0]);

    this.setState({
      studentObj: studentObj,
    });
  };

  deleteImage() {
    const {studentObj} = this.state;
    let objImg: any = document.querySelector('#uploadPhoto');
    objImg.src = null;
    studentObj.studentImagePath = '';
    studentObj.fileName = '';
    this.setState({
      studentObj: studentObj,
    });
  }

  isMandatoryField(objValue: any, obj: any) {
    let errorMessage = '';
    if (objValue === undefined || objValue === null || objValue.trim() === '') {
      let tempVal = '';
      commonFunctions.changeTextBoxBorderToError(tempVal, obj);
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
    }
    return errorMessage;
  }

  validatePersonalInfo() {
    const {studentObj, studentData} = this.state;
    let errorMessage = this.isMandatoryField(studentObj.rollNo, 'rollNo');
    errorMessage = this.isMandatoryField(studentData.batch.id, 'batch');
    errorMessage = this.isMandatoryField(studentData.section.id, 'section');
    errorMessage = this.isMandatoryField(studentObj.studentType, 'studentType');
    errorMessage = this.isMandatoryField(studentObj.status, 'status');
    errorMessage = this.isMandatoryField(studentObj.studentName, 'studentName');
    errorMessage = this.isMandatoryField(studentObj.studentLastName, 'studentLastName');
    errorMessage = this.isMandatoryField(studentObj.fatherName, 'fatherName');
    errorMessage = this.isMandatoryField(studentObj.fatherLastName, 'fatherLastName');
    errorMessage = this.isMandatoryField(studentObj.dateOfBirth, 'dateOfBirth');
    errorMessage = this.isMandatoryField(studentObj.sex, 'sex');
    errorMessage = this.isMandatoryField(studentObj.religion, 'religion');
    errorMessage = this.isMandatoryField(studentObj.caste, 'caste');

    this.setState({
      errorMessage: errorMessage,
    });

    if (errorMessage !== '') {
      return false;
    }
    this.toggleTab(1);
    return true;
  }

  validateContactDetails() {
    const {studentObj, studentData} = this.state;
    let errorMessage = this.isMandatoryField(studentObj.rollNo, 'rollNo');
    errorMessage = this.isMandatoryField(studentData.batch.id, 'batch');
    errorMessage = this.isMandatoryField(studentData.section.id, 'section');
    errorMessage = this.isMandatoryField(studentObj.studentType, 'studentType');
    errorMessage = this.isMandatoryField(studentObj.status, 'status');
    errorMessage = this.isMandatoryField(
      studentObj.studentLocalAddress,
      'studentLocalAddress'
    );
    errorMessage = this.isMandatoryField(
      studentObj.studentPermanentAddress,
      'studentPermanentAddress'
    );
    errorMessage = this.isMandatoryField(
      studentObj.studentPrimaryCellNumber,
      'studentPrimaryCellNumber'
    );
    errorMessage = this.isMandatoryField(
      studentObj.studentPrimaryEmailId,
      'studentPrimaryEmailId'
    );

    this.setState({
      errorMessage: errorMessage,
    });

    if (errorMessage !== '') {
      return false;
    }
    this.toggleTab(2);
    return true;
  }

  validateEmergencyDetails() {
    const {studentObj, studentData} = this.state;
    let errorMessage = this.isMandatoryField(studentObj.rollNo, 'rollNo');
    errorMessage = this.isMandatoryField(studentData.batch.id, 'batch');
    errorMessage = this.isMandatoryField(studentData.section.id, 'section');
    errorMessage = this.isMandatoryField(studentObj.studentType, 'studentType');
    errorMessage = this.isMandatoryField(studentObj.status, 'status');
    errorMessage = this.isMandatoryField(
      studentObj.relationWithStudent,
      'relationWithStudent'
    );
    errorMessage = this.isMandatoryField(
      studentObj.emergencyContactName,
      'emergencyContactName'
    );
    errorMessage = this.isMandatoryField(
      studentObj.emergencyContactLastName,
      'emergencyContactLastName'
    );
    errorMessage = this.isMandatoryField(
      studentObj.emergencyContactCellNumber,
      'emergencyContactCellNumber'
    );

    this.setState({
      errorMessage: errorMessage,
    });

    if (errorMessage !== '') {
      return false;
    }
    this.toggleTab(3);
    return true;
  }

  editInputValue() {
    const {
      branchId,
      departmentId,
      academicYearId,
      facilityId,
      studentData,
      stObj,
      studentObj,
    } = this.state;
    let stValue: any = '';
    stValue = this.props.StdObj;
    console.log('100. test StdObj data:', stValue);
    this.setState({
      studentObj: {
        ...studentObj,
        id: stValue.id,
        studentName: stValue.studentName,
        studentMiddleName: stValue.studentMiddleName,
        studentLastName: stValue.studentLastName,
        fatherName: stValue.fatherName,
        fatherMiddleName: stValue.fatherMiddleName,
        fatherLastName: stValue.fatherLastName,
        studentAadharNo: stValue.studentAadharNo,
        studentPanNo: stValue.studentPanNo,
        religion: stValue.religion,
        caste: stValue.caste,
        sex: stValue.sex,
        studentLocalAddress: stValue.studentLocalAddress,
        studentPermanentAddress: stValue.studentPermanentAddress,
        town: stValue.town,
        state: stValue.state,
        country: stValue.country,
        pinCode: stValue.pinCode,
        studentPrimaryCellNumber: stValue.studentPrimaryCellNumber,
        alternateContactNumber: stValue.alternateContactNumber,
        studentAlternateCellNumber: stValue.studentAlternateCellNumber,
        studentPrimaryEmailId: stValue.studentPrimaryEmailId,
        studentAlternateEmailId: stValue.studentAlternateEmailId,
        relationWithStudent: stValue.relationWithStudent,
        emergencyContactName: stValue.emergencyContactName,
        emergencyContactMiddleName: stValue.emergencyContactMiddleName,
        emergencyContactLastName: stValue.emergencyContactLastName,
        emergencyContactCellNumber: stValue.emergencyContactCellNumber,
        emergencyContactEmailId: stValue.emergencyContactEmailId,
        status: stValue.status,
        rollNo: stValue.rollNo,
        studentType: stValue.studentType,
        departmentId: departmentId,
        branchId: branchId,
        batchId: studentData.batch.id,
        sectionId: studentData.section.id,
        academicYearId: academicYearId,
        // facilityId:     this.state.facilityId , 
      },
    });
    return;
  }

  getInput(studentObj: any) {
    const {branchId, departmentId, academicYearId, studentData,facilityId, stObj} = this.state;
    let inputObj = {
      id:
        studentObj.id !== null || studentObj.id !== undefined || studentObj.id !== ''
          ? studentObj.id
          : null,
      // uploadPhoto: null,
      // logoFilePath: null,
      // logoFileName: null,
      // logoFileExtension: null,
      // logoFile: null,
      studentName: studentObj.studentName,
      studentMiddleName: studentObj.studentMiddleName,
      studentLastName: studentObj.studentLastName,
      fatherName: studentObj.fatherName,
      fatherMiddleName: studentObj.fatherMiddleName,
      fatherLastName: studentObj.fatherLastName,
      studentAadharNo: studentObj.studentAadharNo,
      studentPanNo: studentObj.studentPanNo,
      religion: studentObj.religion,
      caste: studentObj.caste,
      sex: studentObj.sex,
      studentLocalAddress: studentObj.studentLocalAddress,
      studentPermanentAddress: studentObj.studentPermanentAddress,
      town: studentObj.town,
      state: studentObj.state,
      country: studentObj.country,
      pinCode: studentObj.pinCode,
      studentPrimaryCellNumber: studentObj.studentPrimaryCellNumber,
      alternateContactNumber: studentObj.alternateContactNumber,
      studentAlternateCellNumber: studentObj.studentAlternateCellNumber,
      studentPrimaryEmailId: studentObj.studentPrimaryEmailId,
      studentAlternateEmailId: studentObj.studentAlternateEmailId,
      relationWithStudent: studentObj.relationWithStudent,
      emergencyContactName: studentObj.emergencyContactName,
      emergencyContactMiddleName: studentObj.emergencyContactMiddleName,
      emergencyContactLastName: studentObj.emergencyContactLastName,
      emergencyContactCellNumber: studentObj.emergencyContactCellNumber,
      emergencyContactEmailId: studentObj.emergencyContactEmailId,
      status: studentObj.status,
      rollNo: studentObj.rollNo,
      studentType: studentObj.studentType,
      departmentId: departmentId,
      branchId: branchId,
      batchId: studentData.batch.id,
      sectionId: studentData.section.id,
      academicYearId: academicYearId,
      
      facilityId: this.state.selectedFacility , 
      // strDateOfBirth:
      //   studentObj.dateOfBirth !== null ||
      //   studentObj.dateOfBirth !== undefined ||
      //   studentObj.dateOfBirth !== ''
      //     ? moment(studentObj.dateOfBirth).format('DD-MM-YYYY')
      //     : '',
    };
    return inputObj;
  }

  // getInput(studentObj: any) {
  //   let inputObj = {
  //     studentName: studentObj.studentName,
  //   };
  //   return inputObj;
  // }

  render() {
    const {
      activeTab,
      errorMessage,
      successMessage,
      studentObj,
      studentData,
      facilityList,
      facilityId,
      createStudentFilterDataCache,
      departmentId,
    } = this.state;

    return (
      <section className="tab-container">
        {errorMessage !== '' ? (
          <MessageBox id="mbox" message={errorMessage} activeTab={2} />
        ) : null}
        {successMessage !== '' ? (
          <MessageBox id="mbox" message={successMessage} activeTab={1} />
        ) : null}

        <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
          <div className="">
            <h4 className="ptl-06"> Edit Student</h4>
          </div>
          <div className="asflex">
            <label>
              Status <span style={{color: 'red'}}> * </span>{' '}
            </label>
            <select
              name="status"
              id="status"
              className="gf-form-input width-11 m-1"
              style={{width: '10.8rem', marginLeft: '10px'}}
              onChange={this.onChange}
              value={studentObj.status}
              required
            >
              <option key={''} value={''}>
                Select Status
              </option>
              <option key={'ACTIVE'} value={'ACTIVE'}>
                ACTIVE
              </option>
              <option key={'DEACTIVE'} value={'DEACTIVE'}>
                DEACTIVE
              </option>
              <option key={'DRAFT'} value={'DRAFT'}>
                DRAFT
              </option>
            </select>
          </div>
        </div>
        <div className="grid">
          <div className="leftbar">
            <div className="row p-1">
              <div className="">
                <img
                  id="studentImagePath"
                  src={studentObj.studentImagePath || this.DEFAULT_STUDENT_IMAGE}
                  className="student-photo"
                  style={{width: '150px', height: '150px'}}
                />
              </div>
            </div>
            <div className="gf-form m-b-1">
              {/* <label className="upload-cursor">
                <input
                  id="d-none"
                  type="file"
                  file-select="ctrl.getFile(file)"
                  className="gf-form-file-input"
                  accept="image/*"
                />
                Upload <i className="fa fa-info-circle l-grey" aria-hidden="true" />
              </label> */}
              <label className="upload-cursor m-r-2" style={{marginLeft: '0rem'}}>
                <input
                  type="file"
                  id="d-none"
                  accept="image/*"
                  onChange={this.getImage}
                />
                Upload <i className="fa fa-info-circle l-grey" aria-hidden="true" />
              </label>
              <label className="upload-cursor">
                <input type="button" id="d-none" onClick={this.deleteImage} />
                Delete
              </label>
            </div>
            <div className="form-justify">
              <label htmlFor="">
                Roll No <span style={{color: 'red'}}> * </span>
              </label>
              <input
                className="gf-form-input width-11 m-b-1"
                style={{width: '10.8rem', marginBottom: '10px'}}
                name="rollNo"
                id="rollNo"
                onChange={this.onChange}
                type="number"
                maxLength={255}
                required
              />
            </div>
            <div className="form-justify">
              <label htmlFor="">
                {' '}
                Year <span style={{color: 'red'}}> * </span>{' '}
              </label>
              <select
                name="batch"
                id="batch"
                className="gf-form-input width-11 m-b-1"
                onChange={this.onChange}
                value={studentData.batch.id}
                style={{width: '10.8rem', marginBottom: '10px', borderRadius: '0px'}}
              >
                {/* {createStudentFilterDataCache !== null &&
                createStudentFilterDataCache !== undefined &&
                createStudentFilterDataCache.batches !== null &&
                createStudentFilterDataCache.batches !== undefined
                  ? this.createBatches(createStudentFilterDataCache.batches, departmentId)
                  : null} */}
                {this.createBatches(this.state.batches, departmentId)}
              </select>
            </div>
            <div className="form-justify">
              <label htmlFor="">
                Section <span style={{color: 'red'}}> * </span>
              </label>
              <select
                required
                name="section"
                id="section"
                onChange={this.onChange}
                value={studentData.section.id}
                className="gf-form-input width-11 m-b-1"
                style={{width: '10.8rem', marginBottom: '10px', borderRadius: '0px'}}
              >
                {/* {createStudentFilterDataCache !== null &&
                createStudentFilterDataCache !== undefined &&
                createStudentFilterDataCache.sections !== null &&
                createStudentFilterDataCache.sections !== undefined
                  ? this.createSections(
                      createStudentFilterDataCache.sections,
                      studentData.batch.id
                    )
                  : null} */}
                {this.createSections(this.state.sections, studentData.batch.id)}
              </select>
            </div>
            <div className="form-justify">
              <label htmlFor="">
                Student Type <span style={{color: 'red'}}> * </span>
              </label>
              <select
                name="studentType"
                id="studentType"
                className="gf-form-input width-11 m-b-1"
                style={{width: '10.8rem', marginBottom: '10px', borderRadius: '0px'}}
                onChange={this.onChange}
                value={studentObj.studentType}
              >
                <option value="">Select Student Type</option>
                <option value="REGULAR">REGULAR</option>
                <option value="STAFF_CONCESSION">STAFF_CONCESSION</option>
                <option value="BENEFITS">BENEFITS</option>
                <option value="SCHOLARSHIP">SCHOLARSHIP</option>
                <option value="OTHER_BENEFITS">OTHER_BENEFITS</option>
              </select>
            </div>
          </div>
          <div className="">
            <Nav tabs className="" id="rmfloat">
              <NavItem className="cursor-pointer">
                <NavLink
                  className={`${activeTab === 0 ? 'active' : ''}`}
                  onClick={() => {
                    this.toggleTab(0);
                  }}
                >
                  Personal Details
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={`${activeTab === 1 ? 'active' : ''}`}
                  onClick={() => {
                    this.toggleTab(1);
                  }}
                >
                  Contact Details
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={`${activeTab === 2 ? 'active' : ''}`}
                  onClick={() => {
                    this.toggleTab(2);
                  }}
                >
                  Primary & Emergency Contact
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={`${activeTab === 3 ? 'active' : ''}`}
                  onClick={() => {
                    this.toggleTab(3);
                  }}
                >
                  Facility
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab} className="ltab-contianer p-0">
              <TabPane tabId={0}>
                <div>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="">
                        First Name <span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.studentName}
                        id="studentName"
                        className="gf-form-input fwidth"
                        type="text"
                        required
                        name="studentName"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">Middle Name</label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.studentMiddleName}
                        id="studentMiddleName"
                        className="gf-form-input fwidth"
                        type="text"
                        name="studentMiddleName"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Student Last Name <span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.studentLastName}
                        id="studentLastName"
                        className="gf-form-input fwidth"
                        type="text"
                        required
                        name="studentLastName"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Father Name <span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.fatherName}
                        id="fatherName"
                        className="gf-form-input fwidth"
                        type="text"
                        required
                        name="fatherName"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">Father Middle Name</label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.fatherMiddleName}
                        className="gf-form-input fwidth"
                        type="text"
                        name="fatherMiddleName"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Father Last Name <span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.fatherLastName}
                        id="fatherLastName"
                        className="gf-form-input fwidth"
                        type="text"
                        required
                        name="fatherLastName"
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label htmlFor="">Adhar No</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentAadharNo}
                        name="studentAadharNo"
                        id="studentAadharNo"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">PAN No</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentPanNo}
                        name="studentPanNo"
                        id="studentPanNo"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Date Of Birth <span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        onChange={this.onChange}
                        value={studentObj.dateOfBirth}
                        id="dateOfBirth"
                        className="gf-form-input fwidth"
                        name="dateOfBirth"
                        type="date"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Religion<span style={{color: 'red'}}> * </span>
                      </label>
                      <select
                        className="gf-form-input fwidth"
                        onChange={this.onChange}
                        value={studentObj.religion}
                        name="religion"
                        id="religion"
                      >
                        <option value="">Select Religion</option>
                        <option value="HINDU">HINDU</option>
                        <option value="MUSLIM">MUSLIM</option>
                        <option value="SIKH">SIKH</option>
                        <option value="CHRISTIAN">CHRISTIAN</option>
                        <option value="BUDH">BUDH</option>
                        <option value="PARSIAN">PARSIAN</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="">
                        Caste<span style={{color: 'red'}}> * </span>
                      </label>
                      <select
                        className="gf-form-input fwidth"
                        onChange={this.onChange}
                        value={studentObj.caste}
                        name="caste"
                        id="caste"
                      >
                        <option value="">Select Caste</option>
                        <option value="GENERAL">GENERAL</option>
                        <option value="SC">SCHEDULED CASTES</option>
                        <option value="ST">SCHEDULED TRIBES</option>
                        <option value="OBC">OTHER BACKWARDS CLASSES</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="">
                        Gender<span style={{color: 'red'}}> * </span>
                      </label>
                      <select
                        className="gf-form-input fwidth"
                        onChange={this.onChange}
                        value={studentObj.sex}
                        name="sex"
                        id="sex"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={this.validatePersonalInfo}
                        className="btn btn-primary border-bottom"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={1}>
                <div>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="">
                        Local Address<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentLocalAddress}
                        name="studentLocalAddress"
                        id="studentLocalAddress"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Permanent Address<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentPermanentAddress}
                        name="studentPermanentAddress"
                        id="studentPermanentAddress"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">City</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.city}
                        name="city"
                        id="city"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">State</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.state}
                        name="state"
                        id="state"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">Country</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.country}
                        name="country"
                        id="country"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">Pin Code</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.pinCode}
                        name="pinCode"
                        id="pinCode"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Primary Contact Number<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentPrimaryCellNumber}
                        name="studentPrimaryCellNumber"
                        id="studentPrimaryCellNumber"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">Alternate Contact Number</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentAlternateCellNumber}
                        name="studentAlternateCellNumber"
                        id="studentAlternateCellNumber"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Primary Email Address<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentPrimaryEmailId}
                        name="studentPrimaryEmailId"
                        id="studentPrimaryEmailId"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">Alternate Email Address</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.studentAlternateEmailId}
                        name="studentAlternateEmailId"
                        id="studentAlternateEmailId"
                        maxLength={255}
                      />
                    </div>
                    <div></div>
                    <div></div>
                    <div>
                      <button
                        type="button"
                        onClick={this.validateContactDetails}
                        className="btn btn-primary border-bottom"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={2}>
                <div>
                  <div className="st-p">
                    <label htmlFor="">
                      Relation with Student<span style={{color: 'red'}}> * </span>
                    </label>
                    <select
                      className="gf-form-input fwidth"
                      onChange={this.onChange}
                      value={studentObj.relationWithStudent}
                      name="relationWithStudent"
                      id="relationWithStudent"
                      required
                    >
                      <option value="">Select Relation</option>
                      <option value="FATHER">FATHER</option>
                      <option value="MOTHER">MOTHER</option>
                      <option value="GUARDIAN">GUARDIAN</option>
                    </select>
                  </div>
                  <div className="form-grid m-t-1">
                    <div>
                      <label htmlFor="">
                        Emergency Contact Name<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.emergencyContactName}
                        name="emergencyContactName"
                        id="emergencyContactName"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">Emergency Contact Middle Name</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.emergencyContactMiddleName}
                        name="emergencyContactMiddleName"
                        id="emergencyContactMiddleName"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Emergency Contact Last Name<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.emergencyContactLastName}
                        name="emergencyContactLastName"
                        id="emergencyContactLastName"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">
                        Emergency Contact Number<span style={{color: 'red'}}> * </span>
                      </label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.emergencyContactCellNumber}
                        name="emergencyContactCellNumber"
                        id="emergencyContactCellNumber"
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="">Emergency Email Address</label>
                      <input
                        className="gf-form-input fwidth"
                        type="text"
                        onChange={this.onChange}
                        value={studentObj.emergencyContactEmailId}
                        name="emergencyContactEmailId"
                        id="emergencyContactEmailId"
                        maxLength={255}
                      />
                    </div>
                    <div></div>
                    <div>
                      <button
                        type="button"
                        onClick={this.validateEmergencyDetails}
                        className="btn btn-primary border-bottom"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={3}>
                <div>
                <FacilityList facilityList={facilityList} onSelectFacility={this.setSelectedFacility}   ></FacilityList>
                   <div>
                      <button
                        type="button"
                        name="btnSaveStudent"
                        id="btnSaveStudent"
                        onClick={this.save}
                        className="btn btn-primary border-bottom"
                      >
                        {' '}
                        Save{' '}
                      </button>
                    </div>
                  </div>
                
              </TabPane>
            </TabContent>
          </div>
        </div>
      </section>
    );
  }
}

export default withApollo(AddStudentPage);
