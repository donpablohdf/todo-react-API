import React, { useState, useEffect } from 'react';
import "./App.css"

//const urlAPI = 'https://assets.breatheco.de/apis/fake/todos/user/alesanchezr'

const urlAPI = 'http://localhost:7000/peliculas'

console.clear()

let sinDatos =[{"label":"ggfgdgfd","id":"ebd0e30f-c5ac-4813-a69c-19aeed9b597e","done":false},{"label":"fsdsf","id":"665aabab-1f17-435e-8c01-b54ffb0853dc","done":true}]
function JsonServer (){


useEffect(() => {
  //const options = { method: 'GET', headers: { "Content-type": "application/json" } };
  const options = { method: 'GET', headers: { "Content-type": "application/json" } };
  const [TAREAS, setTAREAS] = useState([])

  async function recupera() {
    await fetch(urlAPI, options)
      .then(response => {response.json()})
      .then(response => { 
          setTAREAS(response)
          console.log("Tareas"+TAREAS)
        })
      .catch(err => {
        console.log(err)
      });
  }

  recupera()
}, [TAREAS]);
}
export default JsonServer