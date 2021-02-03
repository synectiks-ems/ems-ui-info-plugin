import * as React from 'react';
export class CustomRadioCheckbox extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    onChange = (e: any) => {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    };

    displayOptions = (optionData: any) => {
        const { name, type, inputClass, isValid, id, value } = this.props;
        let retData: any = [];
        Object.keys(optionData).map((key, i) => {
            retData.push(
                <div key={`${id}-${optionData[i].value}`} className="d-inline-block p-r-20">
                    <input type={type} name={name} id={`${id}-${optionData[i].value}`} checked={value.indexOf(optionData[i].value) !== -1} className={`${inputClass} ${isValid ? '' : 'is-invalid error'}`} onChange={this.onChange} value={optionData[i].value} />
                    <label htmlFor={`${id}-${optionData[i].value}`} className="d-inline-block w-auto p-l-5 font-w-normal">{optionData[i].label}</label>
                </div>
            )
        });
        return retData;
    }
    render() {
        const { containerClass, labelClass, label, isValid, message, options, notice, isRequired } = this.props;
        return (
            <div className={containerClass}>
                <label className={labelClass}>{label}{isRequired == true && <span className="required"> * </span>}</label>
                {this.displayOptions(options)}
                {
                    !isValid &&
                    <div className="invalid-feedback">
                        {message}
                    </div>
                }
                <span style={{ display: "block" }}>{notice}</span>
            </div>
        );
    }
}