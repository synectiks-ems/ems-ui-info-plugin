// ------------------------------------ REACT ------------------------------------
export type ReactFunctionOrComponentClass<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

// --------------------------------------
export type InstituteData = {
  name: string;
  code: string;
  year: any;
};

export type FacultyData = {
  name: string;
  lastName: string;
  address: string;
  mail: string;
  designation: string;
  mobile: any;
  status: string;
};

export type location = {
  id: any;
  name: string;
  address: string;
  appliesTo: string;
};

export type StudentData = {
  id: string;
  studentName: string;
  fatherName: string;
  fatherMiddleName: string;
  fatherLastName: string;
};
