import * as React from 'react';
import * as _ from 'lodash';
import {withRouter, RouteComponentProps, Link} from 'react-router-dom';
import {withApollo} from 'react-apollo';
import '../../../css/dark.css';
import withLoadingHandler from '../withLoadingHandler';
import {GET_STUDENT_LIST, GET_STUDENT_FILTER_DATA} from '../_queries';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';

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
  // user: any;
};

export interface StudentListProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  // user?: any;
  createStudentFilterDataCache?: any;
  branchId?: any;
  academicYearId?: any;
  departmentId?: any;
}

class StudentsTable extends React.Component<StudentListProps, StudentTableStates> {
  constructor(props: any) {
    super(props);
    const params = new URLSearchParams(location.search);
    this.state = {
      // user: this.props.user,
      createStudentFilterDataCache: this.props.createStudentFilterDataCache,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      students: {},
      studentData: {
        // college: {
        //   id: params.get('cid'),
        // },
        // branch: {
        //   id: params.get('bid'),
        // },
        // academicYear: {
        //   id: params.get('ayid'),
        // },
        // department: {
        //   id: params.get('dptid'),
        // },
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
        mutateResult: [],
        search: '',
      },
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
    this.createStudentTypes = this.createStudentTypes.bind(this);
    this.createGenders = this.createGenders.bind(this);
    this.showDetail = this.showDetail.bind(this);

    // this.searchHandlers = this.searchHandlers.bind(this);

    this.checkAllStudents = this.checkAllStudents.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    this.createStudentRows = this.createStudentRows.bind(this);
    this.createNoRecordMessage = this.createNoRecordMessage.bind(this);
    this.exportStudents = this.exportStudents.bind(this);
    this.convertArrayOfObjectsToCSV = this.convertArrayOfObjectsToCSV.bind(this);
    this.download = this.download.bind(this);
    this.registerSocket = this.registerSocket.bind(this);
  }

  async componentDidMount() {
    await this.registerSocket();
  }

  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    let dpid: any = 0;

    socket.onmessage = (response: any) => {
      let message = JSON.parse(response.data);
      console.log('StudentList. message received from server ::: ', message);
      this.setState({
        branchId: message.selectedBranchId,
        departmentId: message.selectedDepartmentId,
      });
      dpid = '' + message.selectedDepartmentId;
      console.log('StudentList. branchId: ', this.state.branchId);
      console.log('StudentList. departmentId: ', this.state.departmentId);
    };

    socket.onopen = () => {
      // console.log(
      //   'StudentList. Opening websocekt connection on User : ',
      //   this.state.user.login
      // );
      // socket.send(this.state.user.login);
    };

    window.onbeforeunload = () => {
      console.log('StudentList. Closing websocket connection with cms backend service');
    };
    return;
  }

  // createBranches(branches: any) {
  //   let branchesOptions = [
  //     <option key={0} value="">
  //       Select Branch
  //     </option>,
  //   ];
  //   for (let i = 0; i < branches.length; i++) {
  //     branchesOptions.push(
  //       <option key={branches[i].id} value={branches[i].id}>
  //         {branches[i].branchName}
  //       </option>
  //     );
  //   }
  //   return branchesOptions;
  // }

  // createDepartments(
  //   departments: any,
  //   selectedBranchId: any,
  //   selectedAcademicYearId: any
  // ) {
  //   let departmentsOptions = [
  //     <option key={0} value="">
  //       Select department
  //     </option>,
  //   ];
  //   for (let i = 0; i < departments.length; i++) {
  //     if (
  //       selectedBranchId == departments[i].branch.id &&
  //       selectedAcademicYearId == departments[i].academicyear.id
  //     ) {
  //       departmentsOptions.push(
  //         <option key={departments[i].id} value={departments[i].id}>
  //           {departments[i].name}
  //         </option>
  //       );
  //     }
  //   }
  //   return departmentsOptions;
  // }

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

  createStudentTypes(studentTypes: any) {
    let studentTypesOptions = [
      <option key={0} value="">
        Select Student Type
      </option>,
    ];
    for (let i = 0; i < studentTypes.length; i++) {
      let id = studentTypes[i].id;
      studentTypesOptions.push(
        <option key={id} value={studentTypes[i].description}>
          {studentTypes[i].description}
        </option>
      );
    }
    return studentTypesOptions;
  }

  createGenders(genders: any) {
    let gendersOptions = [
      <option key={0} value="">
        Select Gender
      </option>,
    ];
    for (let i = 0; i < genders.length; i++) {
      let id = genders[i].id;
      gendersOptions.push(
        <option key={id} value={genders[i].description}>
          {genders[i].description}
        </option>
      );
    }
    return gendersOptions;
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

  createStudentRows(objAry: any) {
    let {search} = this.state.studentData;
    search = search.trim();
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const students = tempObj.data.getStudentList;
      const length = students.length;
      for (let i = 0; i < length; i++) {
        const student = students[i];
        if (search) {
          if (student.studentName.indexOf(search) !== -1) {
            retVal.push(
              <tr key={student.id}>
                <td>
                  <input
                    onClick={(e: any) => this.onClickCheckbox(i, e)}
                    checked={student.isChecked}
                    type="checkbox"
                    name=""
                    id={'chk' + student.id}
                  />
                </td>
                <td>
                  {/* <Link
                    className="table-link link-color"
                    to={`/plugins/ems-student/page/student?id=${student.id}`}
                  >
                    {student.studentName}
                  </Link> */}
                  <a onClick={(e: any) => this.showDetail(student, e)}>
                    {student.studentName}
                  </a>
                </td>
                <td>{student.rollNo}</td>
                <td>{student.id}</td>
                <td>{student.department.name}</td>
                <td>{student.batch.batch}</td>
                <td>{student.section.section}</td>
                <td>{student.sex}</td>
                <td>{student.studentType}</td>
                <td>{student.studentContactNumber}</td>
              </tr>
            );
          }
        } else {
          retVal.push(
            <tr key={student.id}>
              <td>
                <input
                  onClick={(e: any) => this.onClickCheckbox(i, e)}
                  checked={student.isChecked}
                  type="checkbox"
                  name=""
                  id={'chk' + student.id}
                />
              </td>
              <td>
                {/* <Link
                  className="table-link link-color"
                  to={`/plugins/ems-student/page/student?id=${student.id}`}
                >
                  {student.studentName}
                </Link> */}
                <a onClick={(e: any) => this.showDetail(student, e)}>
                  {student.studentName}
                </a>
              </td>
              <td>{student.rollNo}</td>
              <td>{student.id}</td>
              <td>{student.department.name}</td>
              <td>{student.batch.batch}</td>
              <td>{student.section.section}</td>
              <td>{student.sex}</td>
              <td>{student.studentType}</td>
              <td>{student.studentContactNumber}</td>
            </tr>
          );
        }
      }
    }

    return retVal;
  }

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
          gender: {
            id: '',
          },
          studentType: {
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
          gender: {
            id: '',
          },
          studentType: {
            id: '',
          },
        },
      });
    } else if (name === 'gender') {
      this.setState({
        studentData: {
          ...studentData,
          gender: {
            id: value,
          },
          studentType: {
            id: '',
          },
        },
      });
    } else if (name === 'studentType') {
      this.setState({
        studentData: {
          ...studentData,
          studentType: {
            id: value,
          },
        },
      });
    } else {
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

  showDetail(obj: any, e: any) {
    console.log('object details:', obj);
    const {studentData} = this.state;
    studentData.id = obj.id;
  }

  onClick = (e: any) => {
    const {name, value} = e.nativeEvent.target;
    const {mutate} = this.props;
    const {studentData, branchId, departmentId} = this.state;
    e.preventDefault();

    let studentFilterInputObject = {
      branchId: branchId,
      departmentId: 1151,
      batchId: studentData.batch.id, //1201,
      sectionId: studentData.section.id, //1251,
      gender: studentData.gender.id,
      studentType: studentData.studentType.id,
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
        studentData.mutateResult.push(sdt);
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
    const {studentData, createStudentFilterDataCache, departmentId} = this.state;
    // { studentData.filter((this.state.search)).map() }
    console.log('See Department id:', departmentId);
    return (
      <section className="customCss">
        <div className="container-fluid p-1 ">
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
                  name="batch"
                  id="batch"
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
                </select>
              </div>
              <div>
                <label htmlFor="">Section</label>
                <select
                  required
                  name="section"
                  id="section"
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
                  value={studentData.gender.id}
                  className="gf-form-input max-width-15"
                >
                  {createStudentFilterDataCache !== null &&
                  createStudentFilterDataCache !== undefined &&
                  createStudentFilterDataCache.genders !== null &&
                  createStudentFilterDataCache.genders !== undefined
                    ? this.createGenders(createStudentFilterDataCache.genders)
                    : null}
                </select>
              </div>
              <div>
                <label htmlFor="">Student Type</label>
                <select
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
                </select>
              </div>
              <div id="srch" className="margin-bott">
                <label htmlFor="">Search</label>
                <input
                  type="text"
                  className="gf-form-input"
                  name="search"
                  value={studentData.search}
                  onChange={this.onChange}
                />
              </div>
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

            <table id="studentlistpage" className="striped-table fwidth bg-white">
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
                </tr>
              </thead>
              <tbody>{this.createStudentRows(this.state.studentData.mutateResult)}</tbody>
            </table>
            {/* <Pagination /> */}
            {this.createNoRecordMessage(this.state.studentData.mutateResult)}
          </div>
        </div>
      </section>
    );
  }
}

export default withApollo(StudentsTable);

// export default graphql(GET_STUDENT_FILTER_DATA, {
//   options: ({}) => ({
//     variables: {
//       collegeId: 1001,
//       academicYearId: 1101,
//     },
//   }),
// })(
//   withLoadingHandler(
//     compose(graphql(GET_STUDENT_LIST, {name: 'mutate'}))(StudentsTable) as any
//   )
// );
