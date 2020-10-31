import * as React from 'react';
import {withApollo} from 'react-apollo';
import {GET_FACILITY_LIST} from '../_queries';

type FacilityTableStates = {
  facilityList:any;
  selectedFacilities: any;
  selectedIds?: any,
};

export interface FacilityProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  facilityList?: any;
  onSelectFacility?: any;
  
}

class FacilityList extends React.Component<FacilityProps, FacilityTableStates> {
 
  constructor(props: FacilityProps) {
    super(props);
    this.state = {
    
      facilityList: this.props.facilityList,
      // selectedFacility: '',
      selectedFacilities:[], 
      selectedIds: '',
    };
    this.onClickContinueButton = this.onClickContinueButton.bind(this);
    this.getFacility = this.getFacility.bind(this);
    this.setSelectedFacility = this.setSelectedFacility.bind(this);
  }

  async componentDidMount() {
    await this.getFacility();
  }
  
  
  async getFacility (){
    console.log("Refreshing facility list");
    const { data } =  await this.props.client.query({
        query: GET_FACILITY_LIST,
        fetchPolicy: 'no-cache'
    })
    const temp = data.getFacilities;
    this.setState({
        facilityList: temp
    });
}

 setSelectedFacility(selectedFacilities: any) {
  console.log("SELECTED Facility :::: ",selectedFacilities[0]);
  this.setState({
    selectedFacilities: selectedFacilities[0].id,
  });
 }
  
 onClickContinueButton = (e: any) => {
  this.props.onSelectFacility(this.state.selectedFacilities);
  // localStorage.setItem("selectedGrades", JSON.stringify(this.state.selectedGrades));
 }
   onClickCheckbox(index: any, arr: any, e: any) {
    this.setState({
      selectedFacilities: arr
    });
    const {id} = e.nativeEvent.target;
    let chkBox: any = document.querySelector('#' + id);
    chkBox.checked = e.nativeEvent.target.checked;
  }
  
  createFacilityRows(obj: any) {
    console.log("Facility ::::: ", obj);
    let consolidatedObj: any = {};
    if (obj === undefined || obj === null) {
      return;
    }
    const length = obj.length;
    for (let counter = 0; counter < length; counter++) {
      let facility = obj[counter];
      let facilitiesArr = consolidatedObj[facility.name] || [];
      facilitiesArr.push(facility);
      consolidatedObj[facility.name] = facilitiesArr;
    }
    const retVal = [];
    const keys = Object.keys(consolidatedObj);
    const lengthKeys = keys.length;
    for (let i = 0; i < lengthKeys; i++) {
      let facilitiesArr = consolidatedObj[keys[i]];
      for (let j = 0; j < facilitiesArr.length; j++) {
        let facility = facilitiesArr[j];
        retVal.push(
          <tr>
            {j === 0 && (
              <td rowSpan={facilitiesArr.length}>
                <input onClick={(e: any) => this.onClickCheckbox(keys[i], facilitiesArr,e)} type="radio" name="grades" id={'chk' + keys[i]} />
              </td>
            )}
            <td>{facility.name}</td>
            <td>{facility.amount}</td>
           
          </tr>
        );
      }
    }
    return retVal;
  }

  // getInput(studentObj: any) {
  //   let inputObj = {
  //     studentName: studentObj.studentName,
  //   };
  //   return inputObj;
  // }

  render() {
    const {
     
      facilityList,

    } = this.state;

    return (
      <section className="tab-container">
      
        
             
              <div>
                  <div className="form-grid">
                    <div>
                    <div style={{width:'100%', height:'250px', overflow:'auto'}}>
                    <table className="fwidth">
                    <thead >
                            <tr>
                            <th>
                        {/* <input
                          type="radio"
                          value="checkedall"
                          name=""
                          id="chkCheckedAll"
                        /> */}
                      </th>
                           <th>Facility Name</th>
                           <th>Facility Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                            { this.createFacilityRows(facilityList) }
                            {/* {this.setSelectedFacility} */}
                        </tbody>
                        </table>
                        <button className="btn btn-primary border-bottom" onClick={(e) => this.onClickContinueButton(e)}>Apply</button>
                </div>
                </div>
                </div>
               
                </div>
              
         
      </section>
    );
  }
}

export default withApollo(FacilityList);
