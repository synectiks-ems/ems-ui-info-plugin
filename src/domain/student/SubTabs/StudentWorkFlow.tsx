import * as React from 'react';
import { Workflow, componentType } from '../Workflow';

class StudentWorkFlow extends React.Component<any, any> {
  workflowRef: any = null;
  constructor(props: any) {
    super(props);
    this.state = {
      data: [{ "title": "Personal Details", "tabTitle": "Personal Details", "subHeading": "Student Personal Details", "content": [{ "id": "studentName", "name": "studentName", "title": "First Name", "isRequired": true, "placeHolder": "student first name", "errorMessage": "please enter student name", "notice": "enter student name", "validations": [], "type": "text" }, { "id": "studentMiddleName", "name": "studentMiddleName", "title": "Middle Name", "isRequired": false, "placeHolder": "student middle name", "errorMessage": "This field is required.", "notice": "enter student middle name", "validations": [], "type": "text" }, { "id": "studentLastName", "name": "studentLastName", "title": "Last Name", "isRequired": true, "placeHolder": "student lastname", "errorMessage": "This field is required.", "notice": "enter student last name", "validations": [], "type": "text" }, { "id": "fatherName", "name": "fatherName", "title": "Father Name", "isRequired": true, "placeHolder": "father name", "errorMessage": "This field is required.", "notice": "enter father name", "validations": [], "type": "text" }, { "id": "fatherMiddleName", "name": "fatherMiddleName", "title": "Father Middle Name", "isRequired": true, "placeHolder": "father middlename", "errorMessage": "This field is required.", "notice": "enter father middle name", "validations": [], "type": "text" }, { "id": "fatherLastName", "name": "fatherLastName", "title": "Father Last Name", "isRequired": true, "placeHolder": "father lastname", "errorMessage": "This field is required.", "notice": "enter father last name", "validations": [], "type": "text" }, { "id": "studentAadharNo", "name": "studentAadharNo", "title": "Aadhar No", "isRequired": false, "placeHolder": "Aadhar No", "errorMessage": "This field is required.", "notice": "Student Aadhar Number", "validations": [], "type": "text" }, { "id": "studentPanNo", "name": "studentPanNo", "title": "PAN No", "isRequired": false, "placeHolder": "PAN No", "errorMessage": "This field is required.", "notice": "PAN No", "validations": [], "type": "text" }, { "id": "dateOfBirth", "name": "dateOfBirth", "title": "Date Of Birth", "isRequired": true, "errorMessage": "This field is required.", "notice": "Date Of Birth", "type": "date" }, { "id": "religion", "name": "religion", "title": "Religion", "isRequired": true, "options": [ { "label": "HINDU", "value": "hindu" }, { "label": "MUSLIM", "value": "muslim" }, { "label": "SIKH", "value": "sikh" }, { "label": "CHRISTIAN", "value": "chirstian" }, { "label": "BUDH", "value": "budh" }, { "label": "PARSIAN", "value": "parsian" }], "errorMessage": "Select Religion", "notice": "Select Religion", "type": "select" }, { "id": "caste", "name": "caste", "title": "CASTE", "isRequired": true, "options": [{ "label": "GENERAL", "value": "general" }, { "label": "SCHEDULED CASTES", "value": "scheduledcastes" }, { "label": "SCHEDULED TRIBES", "value": "scheduled tribes" }, { "label": "OTHER BACKWARDS CLASSES", "value": "otherbackwardclasses" }], "errorMessage": " please select caste", "notice": "caste", "type": "select" }, { "id": "sex", "name": "sex", "title": "Gender", "isRequired": true, "options": [{ "label": "Male", "value": "male" }, { "label": "Female", "value": "female" }, { "label": "Both", "value": "both" }], "errorMessage": "please select Gender", "notice": "Select Gender", "type": "select" }] },
      { "title": "contact details", "tabTitle": "Contact Details", "subHeading": "Student Contact details", "content": [{ "id": "studentLocalAddress", "name": "studentLocalAddress", "title": "Local Address", "isRequired": true, "placeHolder": "Student Local Address", "errorMessage": "This field is required.", "notice": "Student Local Address", "validations": [{ "regEx": "", "message": "" }], "type": "text" }, { "id": "studentPermanentAddress", "name": "studentPermanentAddress", "title": "Permanent Address", "isRequired": true, "placeHolder": "enter student permanent address", "errorMessage": "This field is required.", "notice": "enter student permanent address", "validations": [], "type": "text" }, { "id": "city", "name": "city", "title": "City", "isRequired": false, "placeHolder": "city", "errorMessage": "This field is required.", "notice": "enter city", "validations": [], "type": "text" }, { "id": "state", "name": "state", "title": "State", "isRequired": false, "placeHolder": "state", "errorMessage": "This field is required.", "notice": "enter state", "validations": [], "type": "text" }, { "id": "country", "name": "country", "title": "Country", "isRequired": false, "placeHolder": "country", "errorMessage": "This field is required.", "notice": "enter country", "validations": [], "type": "text" }, { "id": "studentPrimaryCellNumber", "name": "studentPrimaryCellNumber", "title": "Primary Contact Number", "isRequired": true, "placeHolder": "Contact Number", "errorMessage": "This field is required.", "notice": "Enter Contact Number", "validations": [], "type": "text" }, { "id": "studentAlternateCellNumber", "name": "studentAlternateCellNumber", "title": "Alternate Contact Number", "isRequired": false, "placeHolder": "Alternate Cell Number", "errorMessage": "This field is required.", "notice": "enter alternate cell number", "validations": [], "type": "text" }, { "id": "studentPrimaryEmailId", "name": "studentPrimaryEmailId", "title": "Primary Email Address", "isRequired": true, "placeHolder": "email address", "errorMessage": "This field is required.", "notice": "enter primary email address", "validations": [], "type": "text" }, { "id": "studentAlternateEmailId", "name": "studentAlternateEmailId", "title": "Alternate Email Address", "isRequired": false, "placeHolder": "Alternate Email Address", "errorMessage": "This field is required.", "notice": "enter alternate email address", "validations": [], "type": "text" }] },
      { "title": "Primary & Emergency Contact", "tabTitle": "Primary & Emergency Contact", "subHeading": "Primary & Emergency Contact", "content": [{ "id": "relationWithStudent", "name": "relationWithStudent", "title": "Relationship with Student", "isRequired": true, "options": [{ "label": "FATHER", "value": "father" }, { "label": "MOTHER", "value": "mother" }, { "label": "GUARDIAN", "value": "guardian" }], "errorMessage": "Error message", "notice": "select relation with student", "type": "select" }, { "id": "emergencyContactName", "name": "emergencyContactName", "title": "Emergency Contact Name", "isRequired": true, "placeHolder": "Emergency Contact Name", "errorMessage": "This field is required.", "notice": "Enter Emergency Contact Name", "validations": [], "type": "text" }, { "id": "emergencyContactMiddleName", "name": "emergencyContactMiddleName", "title": "Emergency Middle Name", "isRequired": false, "placeHolder": "Emergency Middle Name", "errorMessage": "This field is required.", "notice": "Enter Emergency Contact Middle Name", "validations": [], "type": "text" }, { "id": "emergencyContactLastName", "name": "emergencyContactLastName", "title": "Emergency Last Name", "isRequired": true, "placeHolder": "Emergency Contact Last Name", "errorMessage": "This field is required.", "notice": "Emergency Contact Last Name", "validations": [], "type": "text" }, { "id": "emergencyContactCellNumber", "name": "emergencyContactCellNumber", "title": "Emergency Contact Number", "isRequired": true, "placeHolder": "Emergency Contact Cell Number", "errorMessage": "This field is required.", "notice": "Emergency Contact Cell Number", "validations": [], "type": "text" }, { "id": "emergencyContactEmailId", "name": "emergencyContactEmailId", "title": "Emergency Email Address", "isRequired": true, "placeHolder": "enter email", "errorMessage": "This field is required.", "notice": "enter emergency email ", "validations": [], "type": "text" }] }]
    };
    this.workflowRef = React.createRef();
  }

  onClickNext = (index: any, tabData: any) => {
    setTimeout(() => {
      this.workflowRef.current.showNextTab();
    }, 3000);
  };

  onFormSubmitted = (step: any, response: any) => {
    // console.log(step, response);
  };

  onChangeComponent = (e: any, type: any, tabIndex: any, componentIndex: any) => {
    // console.log(e, type, tabIndex, componentIndex);
  }

  onChangeTab = (activeTab: any, data: any) => {
    if (activeTab === this.state.data.length - 1 ) {
      this.props.sendData(data);
    } 
    else {
      this.workflowRef.current.showNextTab();
    }
  };

  onSuccessfulCall = () => {
    this.workflowRef.current.onSuccessfulCall();
  };

  render() {
    const { data } = this.state;
    return (
      <div>
        <Workflow formData={data} onFormSubmitted={this.onFormSubmitted} ref={this.workflowRef} onChangeComponent={this.onChangeComponent} onChangeTab={this.onChangeTab} />
      </div>
    );
  }
}

export default StudentWorkFlow;
