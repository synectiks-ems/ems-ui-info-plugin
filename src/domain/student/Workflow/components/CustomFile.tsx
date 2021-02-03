import * as React from 'react';
export class CustomFile extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    onChange = (e: any) => {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    };
    render() {
        const { containerClass, labelClass, inputClass, label, isRequired, htmlFor, id, name, value, isValid, message, type, notice } = this.props;
        return (
            <div className={containerClass}>
                <label className={labelClass} htmlFor={htmlFor}>{label}{isRequired == true && <span className="required"> * </span>}</label>
                <input type={type} className={`${inputClass} ${isValid ? '' : 'is-invalid error'}`} id={id} name={name} value={value} onChange={this.onChange} />
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
