import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form' // permite el manejo de formularios https://www.npmjs.com/package/react-hook-form
import { v4 as uuidv4 } from 'uuid'; // permite crear ids unicos https://www.npmjs.com/package/uuidv4
import "./App.css"
console.clear()


const urlAPI = 'https://assets.breatheco.de/apis/fake/todos/user/alesanchezr'

let cabeceraAPI = new Headers();
cabeceraAPI.append("Content-Type", "application/json");

//const urlAPI = 'http://localhost:7000/tareas'

let transformacionTAREAS // variable para las funciones addTareaBBDD, deleteTareaBBDD y borraTODAS
let opcionesGETbbdd = { method: 'GET', headers: cabeceraAPI, redirect: 'follow' }

let errorBBDD="La base de datos está vacía"

let nuevasTareas
let hackBBDDaCero= [{ "label": "BORRADOS", "id": true, "done": true }] //es necesaria esta entrada fake ya que la API no permite dejar el array de objetos a cero

function App() {
  // eslint-disable-next-line 
  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm(); // declaracion para react-hook-form
  const [TAREAS, setTAREAS] = useState([]) //creo el array de objetos TAREAS para meter tareas con id creado por uuid, done: false y label creado por el input del formulario
  const [cambios, setCambios] = useState(false) //control de cambios al actualizar en actualizaBBDD()
  const [estadoID, setEstadoID] = useState("")
  const [errores, setErrores] = useState("")
  // *********************************** 1. LLAMADAS A APIS CON FETCH********************************************************************


  // recupero datos de la API
  useEffect(() => {
    fetch(urlAPI, opcionesGETbbdd)
        .then(response => response.json())
        .then(response => { setTAREAS(response) })
        .catch(err => console.error(err));
        return () => { setCambios(false)} 
  
  }, [cambios]);

  //actualizo datos en la API
  const actualizaBBDD = (datosParaActualizarBBDD) => {
    
    setTAREAS(datosParaActualizarBBDD)
    // console.log(datosParaActualizarBBDD)
    // console.log(TAREAS)
    if(datosParaActualizarBBDD.length ===1){console.log("hola")}
    nuevasTareas = JSON.stringify(datosParaActualizarBBDD)
    let opcionesLlamadaAPI = { method: 'PUT', headers: cabeceraAPI, body: nuevasTareas, redirect: 'follow' }
    fetch(urlAPI, opcionesLlamadaAPI)
      .then(response => response.text())
      .then(result => setCambios(!cambios)) //control de cambios al actualizar en actualizaBBDD()
      .catch(error => console.log('error', error))

  }

 //********************************2. FUNCIONES TRANSFORMADORAS DE LA BBDD*********************************************

  // 2.1 al cambiar el input o enviar el formulario añade la tarea a la BBDD
  const addTareaBBDD = async (data, e) => {
    let anterior = TAREAS
    let limpio
    let transicion
    e.preventDefault() //es necesario para que el formulario no haga peticiones GET/POST(no interviene en éste caso, pero es mejor ponerlo)
    
    data.id = uuidv4() //creo una id única con uuid para crear la nueva tarea en la BBDD
    data.done = false //pongo la key done en false para que la tarea quede pendiente
    // para poner la tarea fake la primera
    if(anterior.length === 1){ 
      transformacionTAREAS = hackBBDDaCero.concat(data)
    } else {
      limpio= anterior.filter(elementoTAREAS => elementoTAREAS.id !== true) //dejamos el array sin el elemento hackBBDDaCero
      console.log(limpio)
      transicion = hackBBDDaCero.concat(data) //concatenamos con la variable de hackBBDDaCero
      transformacionTAREAS =  transicion.concat(limpio) //concatenamos la con el 
    }

    reset({ label: '' })
    console.log(transformacionTAREAS)
    actualizaBBDD(transformacionTAREAS)//actualiza la BBDD

  }

  // 2.2 borrar la tarea a la BBDD
  const deleteTareaBBDD = tarea => {

    transformacionTAREAS= TAREAS.filter(elementoTAREAS => elementoTAREAS.id !== tarea.id) // actualiza el array de objetos TAREAS con solo los elementos que son distintos a tarea.id usando filter
    actualizaBBDD(transformacionTAREAS) //actualiza la API
  }

  //pone a true o false el done de tarea según el id
  const cambiaTareaPendiente = tarea => {
    let cogeElID
    let transformacionTAREAS = TAREAS
    for (var n = 0; n < transformacionTAREAS.length; n++) {
      if (transformacionTAREAS[n].id === tarea.id) {
        cogeElID=n; //si la tarea que pasamos coincide con el id de la tarea en el API cambiamos el estado
        tarea.done ? tarea.done = false : tarea.done = true
      }
    }
    transformacionTAREAS[cogeElID] = tarea
    
    actualizaBBDD(transformacionTAREAS) //actualiza la API
  }

  //borrar todas las tareas
  const borrarTAREAS = () => {
    actualizaBBDD(hackBBDDaCero) //actualiza la API
  }

  // FUNCIONES DE RENDERIZADO CONDICIONAL ***********************************************************************************************

  // cuando tarea.id true o false

  const tareaID = (tarea) => {

    if (tarea.done) {
      return (
        <>
          <button type="button" className="btn btn-outline-success " aria-label="Close" onClick={() => cambiaTareaPendiente(tarea)}>Hecha</button>
          <button type="button" className="btn btn-outline-danger ms-2" aria-label="Close" onClick={() => deleteTareaBBDD(tarea)}>Borrar</button>
        </>
      )
    }
    else {
      
      return (
        <button type="button" className="btn btn-outline-success " aria-label="Close" onClick={() => cambiaTareaPendiente(tarea)}>Pendiente</button>
      )
    }
    
  }

//COMPONENTE ****************************************************************************************************************************
  return (
    <div className="container-md p-5">

      <div className='container p-0 m-0 d-flex flex-column bg-light shadow'>
        {/* TITULO *********************************************************************************************************************/}
        <header className='d-flex justify-content-center'><h1 className='fw-lighter'>todos</h1></header>
        {/* FORMULARIO *****************************************************************************************************************/}
        <section className='d-flex justify-content-center'>
          <form onSubmit={handleSubmit(addTareaBBDD)} >
            <div className="container p-2 m-0 d-flex flex-row">
              <input
                autoComplete="off" //no permitir autocompletado del input                      
                type="text"
                className='form-control my-2'
                placeholder="Nueva tarea"
                {...register("label", { required: true })} //crear el name del input y es requerido react-hook-form
              />
              <button className='btn boton ms-3 d-block' type="submit" > enviar</button>

            </div>
            {/* control de errores react-hook-form */}
            {errors.label && <span className="text-danger text-small d-block m-2 fw-lighter">El campo no puede estar vacío</span>}
          </form>

        </section>
        {/* BORRAR TODAS LAS TAREAS ****************************************************************************************************/}
        <div className="container d-flex justify-content-center">
          <button type="button" className="btn btn-danger" onClick={() => borrarTAREAS()}> borrar todo</button>
        </div>
        {/* DATOS DEL ARRAY TAREAS******************************************************************************************************/}
        <section className="d-flex justify-content-center flex-column mb-3">
          {
            // recorro el array de datos TAREAS para mostrarlo cuando se modifica
            TAREAS.map((tarea) =>
              <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-2" key={tarea.id}  >
                <h5 className='p-0 m-0 fw-lighter'>Tarea:  {tarea.label}</h5>
                <div>{tareaID(tarea)}</div>
              </div>
            )
          }
        </section>
        {/* ITEMS LEFT con length del array de objetos TAREAS ******************************/}
        <footer className='container ps-4'><p className='fw-lighter'>{TAREAS.length-1} items left</p></footer>
      </div>
    </div>
  );
}

export default App;
