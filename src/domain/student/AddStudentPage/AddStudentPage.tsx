import * as React from 'react';
import { graphql, QueryProps, MutationFunc, compose } from 'react-apollo';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import * as AddStudentMutationGql from './AddStudentMutation.graphql';
import PersonalData from './PersonalData';
import ContactData from './ContactData';
import OtherContactData from './OtherContactData';
import FacilityData from './FacilityData';
import { StudentServices } from './_services';
import {
    LoadStudentFilterDataCacheType,
    AddStudentMutation,
    AddStudentInput,
    AddStudentMutationVariables,
    StudentData,
} from '../../types';

// import withLoadingHandler from '../../../components/withLoadingHandler';
import withStudentFilterDataCacheLoader from "./withStudentFilterDataCacheLoader";
// import 'bootstrap/dist/css/bootstrap.min.css';

type AddStudentPageOwnProps = RouteComponentProps<{
    collegeId: string;
    academicYearId:  string;
}> & {
    data: QueryProps & LoadStudentFilterDataCacheType; 
};
type AddStudentPageProps = AddStudentPageOwnProps & {
    mutate: MutationFunc<AddStudentMutation>;
};

function onClickHeader(e: any) {
    const { currentTarget } = e;
    const plusSign = currentTarget.querySelector(".fa-plus");
    const minusSign = currentTarget.querySelector(".fa-minus");
    const collapseContainer = currentTarget.closest(".collapse-container");
    const formContainer = collapseContainer.querySelector(".gf-form-inline");
    const style = window.getComputedStyle(formContainer);
    if (style.display === "none") {
        formContainer.style.display = "grid";
        formContainer.style.gridGap = "10px";
        formContainer.style.gridTemplateColumns = "auto auto auto";
        minusSign.style.display = "block";
        plusSign.style.display = "none";
    } else {
        formContainer.style.display = "none";
        minusSign.style.display = "none";
        plusSign.style.display = "block";
    }
}

type EditStudentProfileStates = {
    studentData: any,
    departments: any,
    branches: any,
    batches: any,
    sections: any,
    submitted: any,
    studentTypes: any,
    uploadPhoto: any,
    fileName: any,
    academicYearId: any
};

class AddStudentPage extends React.Component<AddStudentPageProps, EditStudentProfileStates>{
    constructor(props: any) {
        super(props);
        this.state = {
            studentData: {
                // college: {
                //     id: 1801 
                // },
                // academicYear: {
                //     id: 1701  
                // },
                department: {
                    id: ""
                },
                batch: {
                    id: ""
                },
                branch: {
                    id: ""
                },
                section: {
                    id: ""
                },
                studentType: {
                    id: ""
                },
            },
            departments: [],
            branches: [],
            batches: [],
            sections: [],
            studentTypes: [],
            submitted: false,
            uploadPhoto: null,
            fileName: "",
            academicYearId: 1701
        };
        this.createDepartments = this.createDepartments.bind(this);
        this.createBranches = this.createBranches.bind(this);
        this.createBatches = this.createBatches.bind(this);
        this.createSections = this.createSections.bind(this);
        this.createStudentTypeOptions = this.createStudentTypeOptions.bind(this);
    }

    createDepartments(departments: any, selectedBranchId: any) {
        let departmentsOptions = [<option key={0} value="">Select department</option>];
        for (let i = 0; i < departments.length; i++) {
        if (selectedBranchId == departments[i].branch.id ) {
            departmentsOptions.push(
            <option key={departments[i].id} value={departments[i].id}>{departments[i].name}</option>
            );
        }
        }
        return departmentsOptions;
    }
    createBranches(branches: any) {
        let branchesOptions = [<option key={0} value="">Select Branch</option>];
        for (let i = 0; i < branches.length; i++) {
            branchesOptions.push(
                <option key={branches[i].id} value={branches[i].id}>{branches[i].branchName}</option>
            );
        }
        return branchesOptions;
    }
    createBatches(batches: any, selectedDepartmentId: any) {
        let batchesOptions = [<option key={0} value="">Select Year</option>];
        for (let i = 0; i < batches.length; i++) {
            let id = batches[i].id;
            let dptId = ""+batches[i].department.id;
            if (dptId == selectedDepartmentId) {
                batchesOptions.push(
                <option key={id} value={id}>{batches[i].batch}</option>
                );
            }
        }
        return batchesOptions;
    }
    createSections(sections: any, selectedBatchId: any) {
        let sectionsOptions = [<option key={0} value="">Select Section</option>];
        for (let i = 0; i < sections.length; i++) {
            let id = sections[i].id;
            let sbthId = ""+sections[i].batch.id;
            if (sbthId == selectedBatchId) {
                sectionsOptions.push(
                <option key={id} value={id}>{sections[i].section}</option>
                );
            }
        }
        return sectionsOptions;
    }

    createStudentTypeOptions(studentTypes: any) {
        let studentTypesOptions = [<option key={""} value="">Select Student Type</option>];
        for (let i = 0; i < studentTypes.length; i++) {
            let studentType = studentTypes[i];
            studentTypesOptions.push(
                <option key={studentTypes[i].description} value={studentTypes[i].description}>{studentTypes[i].description}</option>
            );
        }
        return studentTypesOptions;
    }

    onFormSubmit = (e: any) => {
        this.setState({
            submitted: true
        });
        const { mutate } = this.props;
        const { studentData } = this.state;
        e.preventDefault();
        if (studentData.department.id && studentData.branch.id && studentData.batch.id && studentData.studentType && studentData.section.id) {
            
            let dplStudentData = {
                ...studentData,
                batchId: studentData.batch.id,
                sectionId: studentData.section.id,
                branchId: studentData.branch.id,
                departmentId: studentData.department.id,
                uploadPhoto: studentData.uploadPhoto,
                studentType: studentData.studentType.id,
                fileName: studentData.fileName
            };
            delete dplStudentData.batch;
            delete dplStudentData.section;
            delete dplStudentData.branch;
            delete dplStudentData.department;
            delete dplStudentData.__typename;
            let btn = e.target.querySelector("button[type='submit']");
            btn.setAttribute("disabled", true);
            let dataSavedMessage: any = document.querySelector(".data-saved-message");
            dataSavedMessage.style.display = "none";
            return mutate({
                variables: { input: dplStudentData },
            }).then((data: any) => {
                btn.removeAttribute("disabled");
                dataSavedMessage.style.display = "inline-block";
                location.href = `${location.origin}/plugins/ems-student/page/students`;
            }).catch((error: any) => {
                btn.removeAttribute("disabled");
                dataSavedMessage.style.display = "inline-block";
                console.log('there was an error sending the update mutation', error);
                return Promise.reject(`Could not save student: ${error}`);
            });
        }
    }
    
    getStudentImage = (e: any) => {
        const { studentData } = this.state;
        studentData.uploadPhoto = URL.createObjectURL(e.target.files[0]);
        var r = new FileReader();
		r.onload = function (e: any){
			studentData.fileName = e.target.result;
            console.log('Image converted to base64 on upload :\n\n' + studentData.fileName);
		};
		r.readAsDataURL(e.target.files[0]);    

        this.setState({
            studentData: studentData
        })     
    }

    onChange = (e: any) => {
        const { name, value } = e.nativeEvent.target;
        const { studentData } = this.state;
        if (name === "branch") {
            this.setState({
                studentData: {
                    ...studentData,
                    branch: {
                        id: value
                    },
                    department: {
                      id: ""
                    },
                    batch: {
                      id: ""
                    },
                    section: {
                        id: ""
                    },
                    studentType: {
                        id: ""
                    }
                }
            });
        }else if (name === "department") {
            this.setState({
                studentData: {
                    ...studentData,
                    department: {
                        id: value
                    },
                    batch: {
                        id: ""
                    },
                    section: {
                        id: ""
                    },
                    studentType: {
                        id: ""
                    }
                }
            });
        } else if (name === "batch") {
            this.setState({
                studentData: {
                    ...studentData,
                    batch: {
                        id: value
                    },
                    section: {
                        id: ""
                    },
                    studentType: {
                        id: ""
                    }
                }
            });
        } else if (name === "section") {
            this.setState({
                studentData: {
                    ...studentData,
                    section: {
                        id: value
                    },
                    studentType: {
                        id: ""
                    }
                }
            });
        } else if (name === "studentType") {
            this.setState({
                studentData: {
                    ...studentData,
                    studentType: {
                        id: value
                    }
                }
            });
        }  else {
            this.setState({
                studentData: {
                    ...studentData,
                    [name]: value
                }
            });
        }
    }
    render() {
        const { data: { createStudentFilterDataCache, refetch }, history, match, mutate } = this.props;
        const { studentData, departments, batches, branches, sections, submitted } = this.state;
        return (
            <section className="customCss">
                <h3 className="bg-heading p-1 m-b-0">
                    <i className="fa fa-university stroke-transparent mr-1" aria-hidden="true" />{' '}
                    Admin - Student Management
                </h3>
                <div className="student-profile-container">
                    <form className="gf-form-group" onSubmit={this.onFormSubmit}>
                        <div className="row m-0">
                            <div className="col-sm-12 col-xs-12 profile-header m-b-2">
                                <div className="pull-left">Student Profile</div>
                                <div className="pull-right">
                                    <span className="m-r-2 data-saved-message" style={{ fontSize: "13px", color: "#AA0000", display: "none" }}>Data Saved</span>
                                    <button className="btn bs" type="submit">Save</button>
                                </div>
                            </div>
                        </div>
                        <div className="row form-main-container m-0">
                            <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12 student-photo-container">
                                <div className="row p-1">
                                    <div className="col-md-6 col-lg-12 col-xs-12 col-sm-6 student-photo">
                                        <img className="photo" id="stPhoto" src={studentData.uploadPhoto}></img>
                                    </div>
                                    
                                    <div className="col-sm-6 col-xs-12 col-md-6 col-lg-12">
                                        
                                        <input type="file"  accept="image/*" id="stImageUpload" onChange={this.getStudentImage} ></input>
                                        
                                        
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Admission No</span>
                                            <input name="admissionNo" value={studentData.admissionNo} onChange={this.onChange} type="text" className="gf-form-input max-width-22" />
                                        </div>
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Roll No</span>
                                            <input name="rollNo" type="text" className="gf-form-input max-width-22" value={studentData.rollNo} onChange={this.onChange} />
                                        </div>
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Branch</span>
                                            <select name="branch" onChange={this.onChange} value={studentData.branch.id} className="gf-form-input max-width-22">
                                                {this.createBranches(this.props.data.createStudentFilterDataCache.branches)}
                                            </select>
                                        </div>
                                        {
                                            submitted && !studentData.branch.id &&
                                            <div>
                                                Student branch needed.
                                        </div>
                                        }
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Department</span>
                                            <select name="department" onChange={this.onChange} value={studentData.department.id} className="gf-form-input max-width-22">
                                                {this.createDepartments(this.props.data.createStudentFilterDataCache.departments, studentData.branch.id)}
                                            </select>
                                        </div>
                                        {
                                            submitted && !studentData.department.id &&
                                            <div>
                                                Student department needed.
                                            </div>
                                        }
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Year</span>
                                            <select name="batch" onChange={this.onChange} value={studentData.batch.id} className="gf-form-input max-width-22">
                                                {this.createBatches(this.props.data.createStudentFilterDataCache.batches, studentData.department.id)}
                                            </select>
                                        </div>
                                        {
                                            submitted && !studentData.batch.id &&
                                            <div>
                                                Student batch needed.
                                        </div>
                                        }
                                        
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Section</span>
                                            <select name="section" onChange={this.onChange} value={studentData.section.id} className="gf-form-input max-width-22">
                                                {this.createSections(this.props.data.createStudentFilterDataCache.sections, studentData.batch.id)}
                                            </select>
                                        </div>
                                        {
                                            submitted && !studentData.section.id &&
                                            <div>
                                                Student section needed.
                                        </div>
                                        }
                                        <div className="gf-form">
                                            <span className="gf-form-label width-8">Student Type</span>
                                            <select name="studentType" onChange={this.onChange} value={studentData.studentType.id} className="gf-form-input max-width-22">
                                                {this.createStudentTypeOptions(this.props.data.createStudentFilterDataCache.studentTypes)}
                                            </select>
                                        </div>
                                        {
                                            submitted && !this.props.data.createStudentFilterDataCache.studentTypes &&
                                            <div>
                                                Student type needed.
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12 student-profile-form">

                                <div className="collapse-container">
                                    <div className="collapse-header">
                                        <div className="collapse-title">Personal Details</div>
                                        <div className="collapse-icon" onClick={onClickHeader}>
                                            <i className="fa fa-fw fa-plus"></i>
                                            <i className="fa fa-fw fa-minus"></i>
                                        </div>
                                        <div className="clear-both"></div>
                                    </div>
                                    <PersonalData modelData={studentData} onChange={(name: any, value: any) => {
                                        this.setState({
                                            studentData: {
                                                ...studentData,
                                                [name]: value
                                            }
                                        });
                                    }} />
                                </div>
                                <div className="collapse-container">
                                    <div className="collapse-header">
                                        <div className="collapse-title">Contact Details</div>
                                        <div className="collapse-icon" onClick={onClickHeader}>
                                            <i className="fa fa-fw fa-plus"></i>
                                            <i className="fa fa-fw fa-minus"></i>
                                        </div>
                                        <div className="clear-both"></div>
                                    </div>
                                    <ContactData modelData={studentData} onChange={(name: any, value: any) => {
                                        this.setState({
                                            studentData: {
                                                ...studentData,
                                                [name]: value
                                            }
                                        });
                                    }} />
                                </div>
                                <div className="collapse-container">
                                    <div className="collapse-header">
                                        <div className="collapse-title">Primary and Emergency Contact Details</div>
                                        <div className="collapse-icon" onClick={onClickHeader}>
                                            <i className="fa fa-fw fa-plus"></i>
                                            <i className="fa fa-fw fa-minus"></i>
                                        </div>
                                        <div className="clear-both"></div>
                                    </div>
                                    <OtherContactData modelData={studentData} onChange={(name: any, value: any) => {
                                        this.setState({
                                            studentData: {
                                                ...studentData,
                                                [name]: value
                                            }
                                        });
                                    }} />
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </section>
        );
    }
}

// export default withRouter(
//     graphql<AddStudentMutation, AddStudentPageOwnProps>(AddStudentMutationGql)(
//         AddStudentPage
//     )
// );

export default withStudentFilterDataCacheLoader( 
  
    compose(
      graphql<AddStudentMutation, AddStudentPageOwnProps>(AddStudentMutationGql, {
        name: "mutate"
      })
      
    )
    (AddStudentPage) as any
  );
