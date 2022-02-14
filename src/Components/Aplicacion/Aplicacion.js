import React, { Component } from "react";
import { Chart } from "../Chart";
import "./Aplicacion.css";

const URL = "http://localhost:3001/";

class Aplicacion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inicializado: false,
      ultimaTemperatura: "",
      ultimaPotencia: "",
      arrayTemperaturas: [],
      arrayEnergia: [],
      promedioTemperatura: [],
      promedioEnergia: [],
      myIntervalID: 0,
      horaLectura: [],
      numeroPeticiones: 0,
      graficoEnergia: {},
      graficoTemperatura: {},
      avisoTemperaturas: [],
      avisoPotencia: [],
    };
  }

  _datosGrafico = () => {
    const labels = this.state.horaLectura;
    const temperaturaMedia = this.state.promedioTemperatura;
    const energiaProducida = this.state.promedioEnergia;    

    this.setState({
      graficoEnergia: {
        labels,
        datasets: [
          {
            label: "Energia Producida (kWh)",
            data: energiaProducida,
            borderColor: "rgb(0, 204, 118)",
            backgroundColor: "rgba(0, 204, 118, 0.5)",
            yAxisID: "y",
          },
        ],
      },
    });

    this.setState({
      graficoTemperatura: {
        labels,
        datasets: [
          {
            label: "Temperatura Media (°C)",
            data: temperaturaMedia,
            borderColor: "rgb(186, 104, 200)",
            backgroundColor: "rgba(186, 104, 200, 0.5)",
            yAxisID: "y",
          },
        ],
      },
    });
  };

  _addCero = (i) => {
    if (i >= 0 && i < 10) {
      i = "0" + i;
    }
    return i;
  };

  _promedio = (array) => {
    let suma = 0;
    let promedio;
    let longitud = array.length;
    for (let i = 0; i < array.length; i++) {
      if (array[i] === null) {
        longitud = longitud - 1;
      } else {
        suma = suma + parseFloat(array[i]);
      }
    }
    if (longitud === 0) {
      promedio = "null";
    } else {
      promedio = suma / longitud;
    }
    return promedio;
  };

  _datosMinutales = (temperatura, potencia, hora) => {
    let temperaturas = this.state.arrayTemperaturas;
    let arrayMediaTemperatura = this.state.promedioTemperatura;
    let energias = this.state.arrayEnergia;
    let arrayMediaEnergia = this.state.promedioEnergia;
    let horaEntrada = this.state.horaLectura;

    temperaturas.push(temperatura);
    this.setState({ arrayTemperaturas: temperaturas });

    let energia = potencia / (60 * 12);
    energias.push(energia);
    this.setState({ arrayEnergia: energias });

    if (this.state.numeroPeticiones === 12) {
      this.setState({ arrayTemperaturas: [] });
      this.setState({ arrayEnergia: [] });
      this.setState({ numeroPeticiones: 0 });

      arrayMediaTemperatura.push(this._promedio(temperaturas));
      this.setState({ promedioTemperatura: arrayMediaTemperatura });

      arrayMediaEnergia.push(this._promedio(energias));
      this.setState({ promedioEnergia: arrayMediaEnergia });

      horaEntrada.push(hora);
      this.setState({ horaLectura: horaEntrada });

      this._datosGrafico();
    }
  };

  _recibirDatos = async () => {
    this.setState({ numeroPeticiones: this.state.numeroPeticiones + 1 });
    let alertTemperatura = this.state.avisoTemperaturas;
    let alertPotencia = this.state.avisoPotencia;
    let temperaturaCelsius;
    let potenciaKW;
    let horaMin;

    let fecha = new Date();
    let hora = this._addCero(fecha.getHours());
    let min = this._addCero(fecha.getMinutes());
    let seg = this._addCero(fecha.getSeconds());

    if (seg % 5 !== 0) {
      let redondeado = Math.floor(seg / 5) * 5;
      seg = this._addCero(redondeado);
    }

    let horaActual = `${hora}:${min}:${seg}`;

    let promesaResueltaPeticion = await fetch(`${URL}${horaActual}`);

    let json = await promesaResueltaPeticion.json();

    if (json.temperatura === null) {
      alertTemperatura.push(horaActual);
      this.setState({ avisoTemperaturas: alertTemperatura });
      temperaturaCelsius = null;
    } else {
      temperaturaCelsius = (
        parseFloat(json.temperatura.value) / 10 - 273.15).toFixed(2);
      this.setState({
        ultimaTemperatura: {
          time: json.temperatura.time,
          value: Intl.NumberFormat().format(temperaturaCelsius),
        },
      });
    }

    if (json.potencia === null) {
      alertPotencia.push(horaActual);
      this.setState({ avisoPotencia: alertPotencia });
      potenciaKW = null;
    } else {
      potenciaKW = (parseFloat(json.potencia.value) * 1000).toFixed(0);
      this.setState({
        ultimaPotencia: {
          time: json.potencia.time,
          value: Intl.NumberFormat().format(potenciaKW),
        },
      });
    }

    horaMin = `${hora}:${min}`;

    this._datosMinutales(temperaturaCelsius, potenciaKW, horaMin);
  };

  componentDidMount() {
    let myIntervalID = setInterval(this._recibirDatos, 5000);
    this.setState({ myIntervalID: myIntervalID });
  }

  componentWillUnmount() {
    clearInterval(this.state.myIntervalID);
  }

  render() {
    return (
      <>
        <div className="pagina">
          <div className="header">
            <div className="cajaLogo">
              <div className="logo"></div>
            </div>

            <div className="nombrePagina">
              <b>METEO</b>LIVE
            </div>
          </div>
          <div className="info">
            <div className="ultimosValores">
              <div className="tituloUltimosValores">
                Últimos valores recibidos
              </div>
              <div className="cajaDatos">
                <div className="datos">
                  <b>Potencia</b>
                  <div className="dato">
                    <div>Hora lectura:</div>
                    <div className="cajaDato">
                      {this.state.ultimaPotencia.time}
                    </div>
                  </div>

                  <div className="dato">
                    <div>Valor (kW):</div>
                    <div className="cajaDato">
                      {this.state.ultimaPotencia.value}
                    </div>
                  </div>
                </div>

                <div className="datos">
                  <b>Temperatura</b>
                  <div className="dato">
                    <div>Hora lectura:</div>
                    <div className="cajaDato">
                      {this.state.ultimaTemperatura.time}
                    </div>
                  </div>

                  <div className="dato">
                    <div>Valor (°C):</div>
                    <div className="cajaDato">
                      {this.state.ultimaTemperatura.value}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="avisos">
              <div className="tituloUltimosValores">Avisos</div>
              <div className="cajaAvisos">
                {this.state.avisoTemperaturas.length != 0 && (
                  <b style={{ color: "red" }}>
                    No hay datos de temperatura a las:
                  </b>
                )}
                <div>
                  {this.state.avisoTemperaturas.map((data, index) => {
                    return (
                      <span key={index}>{data}{", "}</span>
                    );
                  })}
                </div>
                {this.state.avisoPotencia.length != 0 && (
                  <b style={{ color: "red" }}>
                    No hay datos de potencia a las:
                  </b>
                )}
                <div>
                  {this.state.avisoPotencia.map((data, index) => {
                    return (
                      <span key={index}>{data}{", "}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {this.state.promedioEnergia.length != 0 ? (
            <div>
              <div className="cajaGrafico">
                <div className="textoEje">Energia (kWh)</div>
                <div>
                  <Chart chartData={this.state.graficoEnergia} />
                </div>
                <div className="textoHora">Hora lectura</div>
              </div>

              <div className="cajaGrafico">
                <div className="textoEje">Temperatura (°C)</div>
                <div>
                  <Chart chartData={this.state.graficoTemperatura} />
                </div>
                <div className="textoHora">Hora lectura</div>
              </div>
            </div>
          ) : (
            <div className="cajaGrafico">
                Esperando el cálculo de los promedios de las lecturas
            </div>            
          )}
        </div>
      </>
    );
  }
}
export default Aplicacion;
