import React from "react"

class HotCityComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handelChange = this.handelChange.bind(this);
        this.selectRef = React.createRef();
    }

    handelChange() {
        let cityIndex = this.selectRef.current.selectedIndex;
        chrome.storage.local.set({"city": cityIndex}, undefined);
        this.props.setCity(cityIndex);
    }

    render() {
        return (
            <div>
                <label>{this.props.label}</label>
                <select data-keyid="city" onChange={this.handelChange}
                        ref={this.selectRef} value={this.props.city}>
                    {
                        Array(this.props["cityLength"]).fill(null)
                            .map((value, index) => {
                                return <option key={index} value={index}>{"配置" + index}</option>
                            })

                    }
                </select>
            </div>
        )
    }
}

export default HotCityComponent;