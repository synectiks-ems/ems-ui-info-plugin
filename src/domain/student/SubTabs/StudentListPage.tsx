import * as React from 'react';
import * as _ from 'lodash';
import {withRouter, RouteComponentProps, Link} from 'react-router-dom';
import {withApollo} from 'react-apollo';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import StudentDetailsPage from './StudentDetailsPage';
import '../../../css/dark.css';
import withLoadingHandler from '../withLoadingHandler';
import {GET_STUDENT_LIST, GET_STUDENT_FILTER_DATA} from '../_queries';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import {FaBluetooth} from 'react-icons/fa';
import EditStudentPage from './EditStudentPage';
import { Table } from '../../../css/table';

const w140 = {
  width: '140px',
  marginBottom: '5px',
};

type StudentTableStates = {
  students: any;
  studentData: any;
  branches: any;
  departments: any;
  batches: any;
  sections: any;
  studentTypes: any;
  genders: any;
  pageSize: any;
  search: any;
  branchId: any;
  academicYearId: any;
  departmentId: any;
  createStudentFilterDataCache: any;
  user: any;
  activeTab: any;
  StdObj: any;
  columns: any;
  studentListObj: any;
};

export interface StudentListProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  user?: any;
  createStudentFilterDataCache?: any;
  // branchId?: any;
  // academicYearId?: any;
  // departmentId?: any;
}

class StudentsTable extends React.Component<StudentListProps, StudentTableStates> {
  constructor(props: any) {
    super(props);
    const params = new URLSearchParams(location.search);
    this.state = {
      activeTab: 0,
      StdObj: {},
      user: this.props.user,
      studentListObj: [],
      createStudentFilterDataCache: this.props.createStudentFilterDataCache,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      students: {},
      studentData: {
        batch: {
          id: '',
        },
        section: {
          id: '',
        },
        studentType: "",
        gender: "",
        mutateResult: [],
        search: '',
      },
      columns: [
        {
          label: 'Student Name',
          key: 'studentName',
          renderCallback: (value: any, obj: any) => {
            return <td>
               <a
                    onClick={(e: any) => this.showDetail(obj, e)}
                    style={{color: '#307dc2'}}
                  >  
                   {obj.studentName}
                  </a>   
                       
                   </td>
          },
        },
       
        {
          label: "Roll No",
          key: 'rollNo',
          // isCaseInsensitive: false,
        },
        {
          label: " Student Id",
          key: 'id',
          // isCaseInsensitive: false,
        },
        {
          label: "Department",
          key: 'name',
          // isCaseInsensitive: false,
        },
        {
          label: "Year",
          key: 'batch',
          // isCaseInsensitive: false,
        },
        {
          label: "Section",
          key: 'section',
          // isCaseInsensitive: false,
        },
        {
          label: "Gender",
          key: 'sex',
          // isCaseInsensitive: false,
        },
        {
          label: "Type",
          key: 'studentType',
          // isCaseInsensitive: false,
        },
        {
          label: "Primary Contact",
          key: 'studentPrimaryCellNumber',
          // isCaseInsensitive: false,
        },
        {
          label: 'Action',
          key: 'action',
          renderCallback: (value: any, obj: any) => {
            return <td>
              <button
                    className="btn btn-primary"
                    onClick={(e: any) => this.getStDetail(obj, e)}
                  >
                    {' '}
                    Edit{' '}
                  </button>
            </td>
          },
          isCaseInsensitive: true
        },
        
      ],
      branches: [],
      departments: [],
      batches: [],
      sections: [],
      studentTypes: [],
      genders: [],
      pageSize: 5,
      search: '',
    };
    // this.createBranches = this.createBranches.bind(this);
    // this.createDepartments = this.createDepartments.bind(this);
    this.createBatches = this.createBatches.bind(this);
    this.createSections = this.createSections.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.SetObject = this.SetObject.bind(this);
    this.getcreateStudentFilterDataCache = this.getcreateStudentFilterDataCache.bind(
      this
    );
    this.toggleTab = this.toggleTab.bind(this);

    // this.searchHandlers = this.searchHandlers.bind(this);

    this.checkAllStudents = this.checkAllStudents.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    // this.createStudentRows = this.createStudentRows.bind(this);
    this.createNoRecordMessage = this.createNoRecordMessage.bind(this);
    this.exportStudents = this.exportStudents.bind(this);
    this.convertArrayOfObjectsToCSV = this.convertArrayOfObjectsToCSV.bind(this);
    this.download = this.download.bind(this);
    this.registerSocket = this.registerSocket.bind(this);
  }

  async toggleTab(tabNo: any) {
    await this.setState({
      activeTab: tabNo,
    });
    // if (tabNo === 0) {
    //   this.getcreateStudentFilterDataCache();
    // }
  }

  async componentDidMount() {
    await this.registerSocket();
    
    console.log(
      '5. check create catch batches:',
      this.state.createStudentFilterDataCache.batches
    );
  }

  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    // let dpid: any = 0;
    // let bid: any = 0;
    // let ayid: any = 0;

    socket.onmessage = (response: any) => {
      let message = JSON.parse(response.data);
      console.log('StudentList. message received from server ::: ', message);
      this.setState({
        branchId: message.selectedBranchId,
        academicYearId: message.selectedAcademicYearId,
        departmentId: message.selectedDepartmentId,
      });
      // bid = '' + message.selectedBranchId;
      // ayid = '' + message.selectedAcademicYearId;
      // dpid = '' + message.selectedDepartmentId;
      console.log('StudentList. branchId: ', this.state.branchId);
      console.log('StudentList. departmentId: ', this.state.departmentId);
    };

    socket.onopen = () => {
      console.log(
        'StudentList. Opening websocekt connection on User : ',
        new URLSearchParams(location.search).get("signedInUser")
      );
      socket.send(new URLSearchParams(location.search).get("signedInUser"));
    };

    window.onbeforeunload = () => {
      console.log('StudentList. Closing websocket connection with cms backend service');
    };
  }

  async getcreateStudentFilterDataCache() {
    const {branchId, academicYearId, departmentId} = this.state;
    console.log('student branch Id:', branchId);
    const {data} = await this.props.client.query({
      query: GET_STUDENT_FILTER_DATA,
      variables: {
      },

      fetchPolicy: 'no-cache',
    });
    this.setState({
      createStudentFilterDataCache: data,
    });
  }

  createBatches(batches: any, selectedDepartmentId: any) {
    let batchesOptions = [
      <option key={0} value="">
        Select Year
      </option>,
    ];
    for (let i = 0; i < batches.length; i++) {
      let id = batches[i].id;
      let dptId = '' + batches[i].department.id;
      if (dptId == selectedDepartmentId) {
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

  checkAllStudents(e: any) {
    const {studentData} = this.state;
    const mutateResLength = studentData.mutateResult.length;
    let chkAll = e.nativeEvent.target.checked;
    let els = document.querySelectorAll('input[type=checkbox]');

    var empty = [].filter.call(els, function(el: any) {
      if (chkAll) {
        el.checked = true;
      } else {
        el.checked = false;
      }
    });
  }

  onClickCheckbox(index: any, e: any) {
    // const { target } = e;
    const {id} = e.nativeEvent.target;
    let chkBox: any = document.querySelector('#' + id);
    chkBox.checked = e.nativeEvent.target.checked;
  }
  createNoRecordMessage(objAry: any) {
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const students = tempObj.data.getStudentList;
      const length = students.length;
      if (length === 0) {
        retVal.push(<h4 className="ptl-06">No Record Found</h4>);
      }
    }
    return retVal;
  }

  // createStudentRows(objAry: any) {
  //   let {search} = this.state.studentData;
  //   search = search.trim();
  //   const mutateResLength = objAry.length;
  //   const retVal = [];
  //   for (let x = 0; x < mutateResLength; x++) {
  //     const tempObj = objAry[x];
  //     const students = tempObj.data.getStudentList;
  //     const length = students.length;
  //     for (let i = 0; i < length; i++) {
  //       const student = students[i];
  //       if (search) {
  //         if (student.studentName.indexOf(search) !== -1) {
  //           retVal.push(
  //             <tr key={student.id}>
  //               <td>
  //                 <input
  //                   onClick={(e: any) => this.onClickCheckbox(i, e)}
  //                   checked={student.isChecked}
  //                   type="checkbox"
  //                   name="chk"
  //                   id={'chk' + student.id}
  //                 />
  //               </td>
  //               <td>
                
  //                 <a
  //                   onClick={(e: any) => this.showDetail(student, e)}
  //                   style={{color: '#307dc2'}}
  //                 >
  //                   {student.studentName}
  //                 </a>
  //               </td>
  //               <td>{student.rollNo}</td>
  //               <td>{student.id}</td>
  //               <td>
  //                 {student.department.name}
  //               </td>
  //               <td>{student.batch.batch}</td>
  //               <td>{student.section.section}</td>
  //               <td>{student.sex}</td>
  //               <td>{student.studentType}</td>
  //               <td>{student.studentPrimaryCellNumber}</td>
  //               <td>
  //                 <button
  //                   className="btn btn-primary"
  //                   onClick={(e: any) => this.getStDetail(student, e)}
  //                 >
  //                   {' '}
  //                   Edit{' '}
  //                 </button>
  //               </td>
  //             </tr>
  //           );
  //           console.log('print student obj:', student);
  //         }
  //       } else {
  //         retVal.push(
  //           <tr key={student.id}>
  //             <td>
  //               <input
  //                 onClick={(e: any) => this.onClickCheckbox(i, e)}
  //                 checked={student.isChecked}
  //                 type="checkbox"
  //                 name="chk"
  //                 id={'chk' + student.id}
  //               />
  //             </td>
  //             <td>
  //               <a
  //                 onClick={(e: any) => this.showDetail(student, e)}
  //                 style={{color: '#307dc2'}}
  //               >
  //                 {student.studentName}
  //               </a>
  //             </td>
  //             <td>{student.rollNo}</td>
  //             <td>{student.id}</td>
  //             <td>
  //               {student.department.name}
  //             </td>
  //             <td>{student.batch.batch}</td>
  //             <td>{student.section.section}</td>
  //             <td>{student.sex}</td>
  //             <td>{student.studentType}</td>
  //             <td>{student.studentPrimaryCellNumber}</td>
  //             <td>
  //               <button
  //                 className="btn btn-primary"
  //                 onClick={(e: any) => this.getStDetail(student, e)}
  //               >
  //                 {' '}
  //                 Edit{' '}
  //               </button>
  //             </td>
  //           </tr>
  //         );
  //         console.log('print student obj:', student);
  //       }
  //     }
  //   }

  //   return retVal;
  // }

  exportStudents(objAry: any) {
    const studentsToExport = [];
    const mutateResLength = objAry.length;
    let fileType: any = document.querySelector('#fileType');
    if (fileType.value == '') {
      alert('Please select a file type to export');
      return;
    }
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const students = tempObj.data.getStudentList;
      const length = students.length;
      for (let i = 0; i < length; i++) {
        const student = students[i];
        let chkBox: any = document.querySelector('#chk' + student.id);
        if (chkBox.checked) {
          studentsToExport.push(student);
        }
      }
    }
    if (studentsToExport.length > 0) {
      var csvContent = this.convertArrayOfObjectsToCSV(studentsToExport);
      this.download(csvContent, 'studentlist.csv', 'text/csv;encoding:utf-8');
    } else {
      alert('Please select records to export');
    }
  }

  convertArrayOfObjectsToCSV(data: any) {
    var result: any, ctr: any, keys: any, columnDelimiter: any, lineDelimiter: any;

    data = data || null;
    if (data == null || !data.length) {
      return null;
    }

    columnDelimiter = ',';
    lineDelimiter = '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item: any) {
      ctr = 0;
      keys.forEach(function(key: any) {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  download(content: any, fileName: any, mimeType: any) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';

    if (navigator.msSaveBlob) {
      // IE10
      navigator.msSaveBlob(
        new Blob([content], {
          type: mimeType,
        }),
        fileName
      );
    } else if (URL && 'download' in a) {
      //html5 A[download]
      a.href = URL.createObjectURL(
        new Blob([content], {
          type: mimeType,
        })
      );
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
  }

  onChange = (e: any) => {
    const {search} = e.nativeEvent.target;
    const {name, value} = e.nativeEvent.target;
    const {studentData} = this.state;
    // if (name === 'branch') {
    //   this.setState({
    //     studentData: {
    //       ...studentData,
    //       branch: {
    //         id: value,
    //       },
    //       department: {
    //         id: '',
    //       },
    //       batch: {
    //         id: value,
    //       },
    //       section: {
    //         id: '',
    //       },
    //       gender: {
    //         id: '',
    //       },
    //       studentType: {
    //         id: '',
    //       },
    //     },
    //   });
    // }
    // if (name === 'department') {
    //   this.setState({
    //     studentData: {
    //       ...studentData,
    //       department: {
    //         id: value,
    //       },
    //       batch: {
    //         id: '',
    //       },
    //       section: {
    //         id: '',
    //       },
    //       gender: {
    //         id: '',
    //       },
    //       studentType: {
    //         id: '',
    //       },
    //     },
    //   });
    // } else

    if (name === 'year') {
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
    } else if (name === 'sectionObj') {
      this.setState({
        studentData: {
          ...studentData,
          section: {
            id: value,
          },
        },
      });
    }
    //  else if (name === 'studentTypeObj') {
    //   this.setState({
    //     studentData: {
    //       ...studentData,
    //       studentType: value,
    //     },
    //   });
    // }
    // else if (name === 'gender') {
    //   this.setState({
    //     studentData: {
    //       ...studentData,
    //       gender: {
    //         id: value,
    //       },
    //       studentType: {
    //         id: '',
    //       },
    //     },
    //   });
    // }
    // else if (name === 'studentType') {
    //   this.setState({
    //     studentData: {
    //       ...studentData,
    //       studentType: {
    //         id: value,
    //       },
    //     },
    //   });
    // }
    else {
      this.setState({
        studentData: {
          ...studentData,
          [name]: value,
        },
      });
    }
  };
  // updateSearch = (e:any) => {
  //   this.setState({search: event.target.value.substr()});
  // }

  async getStDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in StdObj:', this.state.StdObj);
    await this.toggleTab(2);
  }

  async showDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in StdObj:', this.state.StdObj);
    await this.toggleTab(1);
  }

  async SetObject(obj: any) {
    console.log('1. setting object :', obj);
    await this.setState({
      StdObj: obj,
    });
    console.log('2. data in obj:', obj);
  }

  

  onClick = (e: any) => {
    const {name, value} = e.nativeEvent.target;
    const {mutate} = this.props;
    const {studentData, branchId, departmentId} = this.state;
    e.preventDefault();
    if (!branchId) {
      alert('Please select branch from preferences');
      return;
    }
    let studentFilterInputObject = {
      branchId: branchId, // branchId,
      departmentId: departmentId, // 1151,
      batchId: studentData.batch.id, // studentData.batch.id, //1201,
      sectionId: studentData.section.id, // studentData.section.id, //1251,
      gender: studentData.gender,
      studentType: studentData.studentType,
    };

    this.props.client
      .mutate({
        mutation: GET_STUDENT_LIST,
        variables: {
          filter: studentFilterInputObject,
        },
      })
      .then((data: any) => {
        const sdt = data;
        studentData.mutateResult = [];
        // studentData.mutateResult.push(sdt);
        const temp = data.data.getStudentList;
        console.log("final Data : ", temp)
        let i;
        // let ary = [];
        let obj;
        for (i in temp) {
          
          // obj = new StudentObj(temp[i].studentName, temp[i].rollNo, temp[i].id, temp[i].department, temp[i].batch, temp[i].section, temp[i].sex, temp[i].studentType, temp[i].studentPrimaryCellNumber);
          obj = {
            studentName: temp[i].studentName,
            rollNo: temp[i].rollNo,
            batch: temp[i].batch.batch,
            id: temp[i].id,
            name: temp[i].department.name, 
            section: temp[i].section.section,
            sex: temp[i].sex,
            department: temp[i].department,
            admissionNo: temp[i].admissionNo,
            studentType: temp[i].studentType,
            studentPrimaryCellNumber: temp[i].studentPrimaryCellNumber,
            studentAadharNo: temp[i].studentAadharNo,
            studentMiddleName: temp[i].studentMiddleName,
             studentLastName: temp[i].studentLastName,
             fatherName: temp[i].fatherName,
             fatherMiddleName: temp[i].fatherMiddleName,
             fatherLastName: temp[i].fatherLastName,
             motherName: temp[i].motherName,
            motherMiddleName: temp[i].motherMiddleName,
             motherLastName: temp[i].motherLastName,
            // studentAadharNo
             studentPanNo: temp[i].studentPanNo,
             strDateOfBirth: temp[i].strDateOfBirth,
             studentLocalAddress : temp[i].studentLocalAddress,
             studentPermanentAddress : temp[i].studentPermanentAddress,
             city : temp[i].city,
             state : temp[i].state,
             country : temp[i].country,
             pinCode : temp[i].pinCode,
             studentAlternateCellNumber : temp[i].studentAlternateCellNumber,
             studentLandLinePhoneNumber : temp[i].studentLandLinePhoneNumber,
             studentPrimaryEmailId : temp[i].studentPrimaryEmailId,
             studentAlternateEmailId : temp[i].studentAlternateEmailId,
             emergencyContactEmailId : temp[i].emergencyContactEmailId,
             relationWithStudent : temp[i].relationWithStudent,
             emergencyContactName : temp[i].emergencyContactName,
             emergencyContactMiddleName : temp[i].emergencyContactMiddleName,
             emergencyContactLastName : temp[i].emergencyContactLastName,
             emergencyContactCellNumber : temp[i].emergencyContactCellNumber,
             emergencyContactLandLinePhoneNumber : temp[i].emergencyContactLandLinePhoneNumber,
             studentImagePath : temp[i].studentImagePath,
             enrollmentNo : temp[i].enrollmentNo,
             fatherCellNumber : temp[i].fatherCellNumber,
             fatherEmailId : temp[i].fatherEmailId,
             religion : temp[i]. religion,
           cast: temp[i].cast,  
           




          };
          studentData.mutateResult.push(obj);
        }
        console.log("Final Data ", studentData.mutateResult)
        this.setState({
          studentData: studentData,
          
        });
    
        console.log('Student filter mutation result ::::: ', studentData.mutateResult);
      })
      .catch((error: any) => {
        console.log('there was an error sending the query result', error);
        return Promise.reject(`Could not retrieve student data: ${error}`);
      });
  };

  render() {
    // const {
    //   data: {createStudentFilterDataCache, refetch},
    //   mutate,
    // } = this.props;
    const {
      studentData,
      createStudentFilterDataCache,
      departmentId,
      activeTab,
      user,
    } = this.state;
    // { studentData.filter((this.state.search)).map() }
    return (
      <section className="customCss">
        <TabContent activeTab={activeTab}>
          <TabPane tabId={0}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Student Details</h4>
                </div>
                <div className="">
                  {/* <Link
                to={`/plugins/ems-student/page/addstudent`}
                className="btn btn-primary"
                style={w180}
              >
                Create New Student
              </Link> */}
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={(e: any) =>
                      this.exportStudents(this.state.studentData.mutateResult)
                    }
                  >
                    Export
                  </a>
                  <select name="fileType" id="fileType" className="max-width-10 m-l-1">
                    <option value="">Select File Type</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="student-flex">
                  <div>
                    <label htmlFor="">Year</label>
                    <select
                      required
                      name="year"
                      id="year"
                      onChange={this.onChange}
                      value={studentData.batch.id}
                      className="gf-form-input max-width-22"
                    >
                      {createStudentFilterDataCache !== null &&
                      createStudentFilterDataCache !== undefined &&
                      createStudentFilterDataCache.batches !== null &&
                      createStudentFilterDataCache.batches !== undefined
                        ? this.createBatches(
                            createStudentFilterDataCache.batches,
                            departmentId
                          )
                        : null}
                      {/* {this.createBatches(createStudentFilterDataCache.batches, departmentId)} */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="">Section</label>
                    <select
                      required
                      name="sectionObj"
                      id="sectionObj"
                      onChange={this.onChange}
                      value={studentData.section.id}
                      className="gf-form-input max-width-12"
                    >
                      {createStudentFilterDataCache !== null &&
                      createStudentFilterDataCache !== undefined &&
                      createStudentFilterDataCache.sections !== null &&
                      createStudentFilterDataCache.sections !== undefined
                        ? this.createSections(
                            createStudentFilterDataCache.sections,
                            studentData.batch.id
                          )
                        : null}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="">Gender</label>
                    <select
                      required
                      name="gender"
                      id="gender"
                      onChange={this.onChange}
                      // value={studentData.gender}
                      className="gf-form-input max-width-15"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                    {/* <select
                  required
                  name="gender"
                  id="gender"
                  onChange={this.onChange}
                  value={studentData.gender.id}
                  className="gf-form-input max-width-15"
                >
                  {createStudentFilterDataCache !== null &&
                  createStudentFilterDataCache !== undefined &&
                  createStudentFilterDataCache.genders !== null &&
                  createStudentFilterDataCache.genders !== undefined
                    ? this.createGenders(createStudentFilterDataCache.genders)
                    : null}
                </select> */}
                  </div>
                  <div>
                    <label htmlFor="">Student Type</label>
                    <select
                      required
                      name="studentTypeObj"
                      id="studentTypeObj"
                      onChange={this.onChange}
                      // value={studentData.studentType}
                      className="gf-form-input max-width-22"
                    >
                      <option value="">Select Student Type</option>
                      <option value="REGULAR">REGULAR</option>
                      <option value="STAFF_CONCESSION">STAFF_CONCESSION</option>
                      <option value="BENEFITS">BENEFITS</option>
                      <option value="SCHOLARSHIP">SCHOLARSHIP</option>
                      <option value="OTHER_BENEFITS">OTHER_BENEFITS</option>
                    </select>
                    {/* <select
                  required
                  name="studentType"
                  id="studentType"
                  onChange={this.onChange}
                  value={studentData.studentType.id}
                  className="gf-form-input max-width-22"
                >
                  {createStudentFilterDataCache !== null &&
                  createStudentFilterDataCache !== undefined &&
                  createStudentFilterDataCache.studentTypes !== null &&
                  createStudentFilterDataCache.studentTypes !== undefined
                    ? this.createStudentTypes(createStudentFilterDataCache.studentTypes)
                    : null}
                </select> */}
                  </div>
                  {/* <div id="srch" className="margin-bott">
                    <label htmlFor="">Search</label>
                    <input
                      type="text"
                      className="gf-form-input"
                      name="search"
                      value={studentData.search}
                      onChange={this.onChange}
                    />
                  </div> */}
                  <div className="bg-heading-bg studentSearch">
                    {/* <h4 className="ptl-06"></h4> */}
                    <button
                      className="btn btn-primary"
                      id="btnFind"
                      name="btnFind"
                      onClick={this.onClick}
                      style={w140}
                    >
                      Search Students
                    </button>
                  </div>
                </div>

                {/* <table id="studentlistpage" className="striped-table fwidth bg-white">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          onClick={(e: any) => this.checkAllStudents(e)}
                          value="checkedall"
                          name=""
                          id="chkCheckedAll"
                        />
                      </th>
                      <th>Student Name</th>
                      <th>Roll No</th>
                      <th>Student Id</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Section</th>
                      <th>Gender</th>
                      <th>Type</th>
                      <th>Primary Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.createStudentRows(this.state.studentData.mutateResult)}
                  </tbody>
                </table> */}
                <Table valueFromData={{ columns: this.state.columns, data: this.state.studentData.mutateResult }} perPageLimit={6} visiblecheckboxStatus={true} tableClasses={{ table: "alert-data-tabel", tableParent: "alerts-data-tabel", parentClass: "all-alert-data-table" }} searchKey="name" showingLine="Showing %start% to %end% of %total%" />
                {/* {this.createNoRecordMessage(this.state.studentData.mutateResult)} */}
              </div>
            </div>
          </TabPane>
          <TabPane tabId={1}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Student Details</h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={() => {
                      this.toggleTab(0);
                    }}
                  >
                    Back
                  </a>
                  {/* <a
                    className="btn btn-primary m-l-1"
                    onClick={(e: any) => {
                      print();
                    }}
                  >
                    Print
                  </a> */}
                </div>
              </div>
              {/* {user !== null &&
                this.state.StdObj !== null &&
                this.state.StdObj !== undefined && (
                  <StudentDetailsPage user={user} data={this.state.StdObj} />
                )} */}
              {this.state.StdObj !== null && this.state.StdObj !== undefined && (
                <StudentDetailsPage data={this.state.StdObj} />
              )}
            </div>
          </TabPane>
          <TabPane tabId={2}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Student Details</h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={() => {
                      this.toggleTab(0);
                    }}
                  >
                    Back
                  </a>
                </div>
              </div>
              {user !== null &&
                this.state.StdObj !== null &&
                this.state.StdObj !== undefined && (
                  <EditStudentPage
                    user={user}
                    data={this.state.StdObj}
                    StdObj={this.state.StdObj}
                    batches={this.state.createStudentFilterDataCache.batches}
                    sections={this.state.createStudentFilterDataCache.sections}
                  />
                )}
              {/* {this.state.StdObj !== null && this.state.StdObj !== undefined && (
                <EditStudentPage data={this.state.StdObj} />
              )} */}
            </div>
          </TabPane>
        </TabContent>
      </section>
    );
  }
}

export default withApollo(StudentsTable);
