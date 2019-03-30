import React from "react"

class CVFilterComponent extends React.Component {

    constructor(props) {
        super(props);
        this.config = {
            "salaryValue": [0, 402, 403, 404, 405, 406, 407],
            "salaryText": ['不限', '3k以下', '3k-5k', '5k-10', '10k-20k', '20k-50k', '50K以上'],
            "experienceValue": [0, 102, 103, 104, 105, 106, 107],
            "experienceText": ["不限", "应届生", "1年以内", "1-3年", "3-5年", "5-10年", "10年以上"],
            "educationValue": [0, 209, 208, 206, 202, 203, 204, 205],
            "educationText": ['不限', '初中', '中专', '高中', '大专', '本科', '硕士', '博士'],
            "filterKey": ['max-age', 'min-exp', 'max-exp', 'min-salary', 'company', 'uni-filter'],
            "filterType": ['number', 'number', 'number', 'number', 'text', 'checkbox'],
            "filterText": ['最大年龄', '最小工龄', '最大工龄', '最低待遇要求(单位千/k)', '过滤的公司(json array)', '过滤非名校'],
            "basicKey": ['job-index', 'page-count', 'message', 'config-desc'],
            "basicType": ['number', 'number', 'text', 'text'],
            "basicText": ['岗位下标', '请求候选人页数', '自定义打招呼用语', '配置说明']
        };
        this.handleRadioClick = this.handleRadioClick.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.state = {}
    }

    componentDidMount() {
        this.updateFromLocal()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps['city'] != this.props.city) {
            this.updateFromLocal();
        }
    }

    updateFromLocal() {
        let st = ['salary', 'experience', 'degree'];
        st = st.concat(this.config.filterKey);
        st = st.concat(this.config.basicKey);
        st.forEach((item, i, t) => t[i] = item + "-" + this.props.city);
        let self = this;
        chrome.storage.local.get(st, function (result) {
            self.setState(result)
        })
    }

    handleRadioClick(event) {
        let keyId = event.target.dataset.keyid + "-" + this.props.city;
        let keyValue = event.target.dataset.keyvalue;
        if (keyValue !== undefined) {
            chrome.storage.local.set({[keyId]: keyValue}, undefined);
        }
        let t = this.state;
        t[keyId] = keyValue;
        this.setState(t);
    }

    handleInputChange(event) {
        let keyId = event.target.dataset.keyid + "-" + this.props.city;
        let value = event.target.value || event.target.checked

        chrome.storage.local.set({[keyId]: value}, undefined);
        let t = this.state;
        t[keyId] = value;
        this.setState(t);
    }

    render() {
        return [
            <span>简历筛选条件：同boss</span>,
            <div className="m-t-5">薪水:</div>,
            <div className="m-t group">
                {
                    this.config['salaryValue'].map((value, i) => {
                        return [
                            <label htmlFor={'s-' + i} key={"sl" + i}>{this.config['salaryText'][i]}</label>,
                            <input type='radio' id={'s-' + i} key={"si" + i}
                                   onChange={this.handleRadioClick}
                                   checked={value == this.state['salary-' + this.props.city] ||
                                   (i == 0 && this.state['salary-' + this.props.city] == undefined)}
                                   data-keyvalue={value} name={"salary"} data-keyid="salary"/>
                        ]
                    })
                }
            </div>,
            <div className="m-t-5 group">经验:</div>,
            <div className="m-t" data-keyid="experience">
                {
                    this.config['experienceValue'].map((value, i) => {
                        return [
                            <label htmlFor={'e-' + i} key={"el" + i}>{this.config['experienceText'][i]}</label>,
                            <input type='radio' id={'e-' + i} key={"ei" + i}
                                   onChange={this.handleRadioClick}
                                   data-keyid="experience"
                                   checked={value == this.state['experience-' + this.props.city] ||
                                   (i == 0 && this.state['experience-' + this.props.city] == undefined)}
                                   data-keyvalue={value} name={"experience"}/>
                        ]
                    })
                }
            </div>,
            <div className="m-t-5 group">学历:</div>,
            <div className="m-t" data-keyid="degree">
                {
                    this.config['educationValue'].map((value, i) => {
                        return [
                            <label htmlFor={'d-' + i} key={"dl" + i}>{this.config['educationText'][i]}</label>,
                            <input type='radio' id={'d-' + i} key={"di" + i}
                                   onChange={this.handleRadioClick}
                                   data-keyid="degree"
                                   checked={value == this.state['degree-' + this.props.city] ||
                                   (i == 0 && this.state['degree-' + this.props.city] == undefined)}
                                   data-keyvalue={value} name={"education"}/>
                        ]
                    })
                }
            </div>,
            <hr/>,
            <div>
                精确筛选:
                {
                    this.config['filterKey'].map((value, i) => {
                        return [
                            <div className={"m-t-5"} key={"filter" + i}>
                                <label key={"fl" + value + i}>{this.config['filterText'][i] + ":"}</label>
                                <input key={"fi" + value + i} type={this.config['filterType'][i]}
                                       onChange={this.handleInputChange}
                                       value={(this.config['filterType'][i] === 'text' || this.config['filterType'][i] === 'number') && this.state[value + '-' + this.props.city] || ''}
                                       checked={this.config['filterType'][i] === 'checkbox' && this.state[value + '-' + this.props.city] || ''}
                                       data-keyid={value}/>
                            </div>
                        ]
                    })
                }
            </div>,
            <hr/>,
            <div>
                基本配置:
                {
                    this.config['basicKey'].map((value, i) => {
                        return (
                            <div className={'m-t-5'} key={"basic" + i}>
                                <label key={"bl" + value + i}>{this.config['basicText'][i]}</label>
                                <input key={"bi" + value + i} type={this.config['basicType'][i]}
                                       onChange={this.handleInputChange}
                                       value={this.state[value + '-' + this.props.city] || ''}
                                       data-keyid={value}/>
                            </div>
                        )
                    })
                }
            </div>
        ];
    }
}

export default CVFilterComponent;