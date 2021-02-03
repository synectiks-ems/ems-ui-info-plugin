import * as React from 'react';
export class CustomSelectbox extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    onChange = (e: any) => {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    };

    displayOptions = (optionData: any) => {
        let retData: any = [];
        const { id } = this.props;
        Object.keys(optionData).map((key, index) => {
            retData.push(
                <option key={`${id}-${optionData[index].value}`} value={optionData[index].value}>{optionData[index].label}</option>
            )
        });
        return retData;
    }
    render() {
        const { containerClass, labelClass, inputClass, isRequired, label, htmlFor, id, name, value, isValid, message, options, notice } = this.props;
        return (
            <div className={containerClass}>
                <label className={labelClass} htmlFor={htmlFor}>{label}{isRequired == true && <span className="required"> * </span>}</label>
                <select className={`${inputClass} ${isValid ? '' : 'is-invalid error'}`} id={id} name={name} value={value} onChange={this.onChange} >
                    <option value="">Select</option>
                    {this.displayOptions(options)}
                </select>
                {
                    !isValid &&
                    <div className="invalid-feedback">
                        {message}
                    </div>
                }
                <span>{notice}</span>
            </div>
        );
    }
}