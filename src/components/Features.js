import React from 'react'
import axios from 'axios'

class Features extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            features: []
        }
    }

    componentDidMount() {
      axios
      .get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/'+this.props.param+'.geojson', {
      })
      .then(
        response => {
          this.setState({ features: response.data.features})
        },
        error => {
        }
      );
    }

    render () {

        const mystyle = {
            color: "white",
            backgroundColor: "DodgerBlue",
            padding: "10px",
            fontFamily: "Arial",
            borderRadius: "5px",
            border: "1px solid gray"
          };

        if (this.state.features.length === 0) {
            return (
                <div>Loading...</div>
            )
        }

        return(
            <div>
                {
                this.state.features.map((f, i) => {
                    return (
                        <div>
                            <center><p style={mystyle}>{f.properties.title}</p></center>
                        </div>
                    )
                })
                }
            </div>
        )
    }
}

export default Features