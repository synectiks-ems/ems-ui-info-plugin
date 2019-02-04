import * as React from 'react';

import {withRouter, RouteComponentProps, Link} from 'react-router-dom';
import {graphql, QueryProps} from 'react-apollo';

import * as StudentListQueryGql from './StudentListQuery.graphql';
import {StudentListQuery, StudentSummaryFragment} from '../../types';
import withLoadingHandler from '../../../components/withLoadingHandler';

const StudentRow = ({student}: {student: StudentSummaryFragment}) => (
  <tr key={student.id}>
    <td>{student.studentName}</td>
    <td className="hidden-sm hidden-xs">{student.fatherName}</td>
    <td className="hidden-sm hidden-xs">{student.fatherMiddleName}</td>
    <td className="hidden-sm hidden-xs">{student.fatherLastName}</td>
  </tr>
);

const StudentsTable = ({students}: {students: StudentSummaryFragment[]}) => (
  <table className="striped-table">
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Attendance</th>
        <th>Attendance</th>
        <th>Attendance</th>
      </tr>
    </thead>
    <tbody>
      {students.map(student => <StudentRow key={student.id} student={student} />)}
    </tbody>
  </table>
);

type StudentListPageOwnProps = RouteComponentProps<{}>;
type StudentListPageProps = {
  data: QueryProps & StudentListQuery;
};

const StudentProfilePage = ({data: {students}}: StudentListPageProps) => (
  <section className="customCss">
    <h2 className="heading">
      {students.length}
      Students found
    </h2>
    <StudentsTable students={students} />
    {/* <Link to={`/plugins/xformation-petclinic-panel/page/addstudent`} className="btn customButton">
      Add Student
      </Link> */}
  </section>
);
export default graphql<StudentListQuery, StudentListPageOwnProps, StudentListPageProps>(
  StudentListQueryGql
)(withLoadingHandler(StudentProfilePage));
