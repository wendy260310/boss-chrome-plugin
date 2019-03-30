import ReactDOM from "react-dom"
import React from "react"
import HotCityComponent from "HotCityComponent"
import CVFilterComponent from "CVFilterComponent"

class PopUp extends React.Component {
    constructor(props) {
        super(props);
        this.setCity = this.setCity.bind(this);
        this.state = {};
        this.handleSayHelloClick = this.handleSayHelloClick.bind(this);
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            let s = this.state;
            if (request.msg == 'success') {
                s.disable = false;
                s.msg = '';
            } else {
                s.msg = request.msg;
            }
            this.setState(s);
        });
    }

    handleSayHelloClick() {
        let s = this.state;
        s.disable = true;
        this.setState(s);
        chrome.tabs.executeScript(null, {
            file: '/react/boss-react.js'
        });
    }

    componentDidMount() {
        const self = this;
        chrome.storage.local.get("city", function (result) {
            if (result && result["city"]) {
                self.setState({
                    "city": result["city"]
                })
            } else {
                self.setState({
                    "city": 0,
                })
            }
        });
    }

    setCity(city) {
        this.setState({"city": city});
    }

    render() {
        let config;
        if (this.state['city'] !== undefined) {
            config =
                <div>
                    <HotCityComponent label="配置列表" cityLength={8}
                                      setCity={this.setCity} city={this.state.city}/>
                    <hr/>
                    <CVFilterComponent city={this.state.city}/>
                </div>
        }
        return (
            <div>
                <button onClick={this.handleSayHelloClick} id={"say-hello"} disabled={this.state.disable}>一键打招呼</button>
                <div id={'msg'}>
                    {this.state.msg}
                </div>
                <hr/>
                {config}
            </div>
        )
    }
}

ReactDOM.render(
    <PopUp/>
    , document.getElementById("main-panel"))

