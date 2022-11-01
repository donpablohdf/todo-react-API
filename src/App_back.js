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
let hackBBDDaCero= [{ "label": "BORRADOS", "id": "delete", "done": true }] //es necesaria esta entrada fake ya que la API no permite dejar el array de objetos a cero

function App() {
  // eslint-disable-next-line 
  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm(); // declaracion para react-hook-form
  const [TAREAS, setTAREAS] = useState([]) //creo el array de objetos TAREAS para meter tareas con id creado por uuid, done: false y label creado por el input del formulario
  const [cambios, setCambios] = useState(false) //control de cambios al actualizar en actualizaBBDD()
  const [estadoID, setEstadoID] = useState("")
  const [errores, setErrores] = useState("")
  // *********************************** 1. LLAMADAS A APIS CON FETCH********************************************************************

  // ***********************1.1 RECUPERO DATOS DE LA API CON GET al inicio y cada vez que hay cambios***********************

  useEffect(() => {
    
    fetch(urlAPI, opcionesGETbbdd)
      .then(response => response.json())
      .then(result => setTAREAS(result)) // meto el resultado del GET en el array de objetos TAREAS
      .catch(error => console.log('error', error))
    return () => { setCambios(false)} //control de cambios al actualizar en actualizaBBDD()

  }, [cambios])

  // *******************************1.2. ACTUALIZAR API -> actualizo datos en la API con PUT*******************************

  const actualizaBBDD = (datosParaActualizarBBDD) => {
    if (estadoID ==="delete") { datosParaActualizarBBDD.pop() } // borro la ultima posición del array debido al hack de la API
    
    nuevasTareas = JSON.stringify(datosParaActualizarBBDD)

    let opcionesLlamadaAPI = { method: 'PUT', headers: cabeceraAPI, body: nuevasTareas, redirect: 'follow' }

    fetch(urlAPI, opcionesLlamadaAPI)
      .then(response => response.text())
      .then(result => setCambios(true)) //control de cambios al actualizar en actualizaBBDD()
      .catch(error => console.log('error', error))


  }

  //********************************2. FUNCIONES TRANSFORMADORAS DE LA BBDD*********************************************

  // 2.1 al cambiar el input o enviar el formulario añade la tarea a la BBDD
  const addTareaBBDD = (data, e) => {

    e.preventDefault() //es necesario para que el formulario no haga peticiones GET/POST(no interviene en éste caso, pero es mejor ponerlo)
    
    data.id = uuidv4() //creo una id única con uuid para crear la nueva tarea en la BBDD
    data.done = false //pongo la key done en false para que la tarea quede pendiente
    setEstadoID(data.id)//control de stado debido al kack API
    transformacionTAREAS = TAREAS
    transformacionTAREAS.unshift(data) // añadir la nueva tarea al principio de la nueva tarea    

    reset({ label: '' }) //reseteamos el valor del input con react-hook-form

    actualizaBBDD(transformacionTAREAS)//actualiza la BBDD

  }

  // 2.2 borrar la tarea a la BBDD
  const deleteTareaBBDD = (tarea) => {

    transformacionTAREAS = TAREAS
    // if (transformacionTAREAS.length !==1) { setEstadoID(tarea.id)}else {setEstadoID("delete")}
    for (var n = 0; n < transformacionTAREAS.length; n++) {
      if (transformacionTAREAS[n].id === tarea.id) {
        setEstadoID(tarea.id)
        setErrores(tarea.id)
        transformacionTAREAS.splice(n, 1)
      }else{
        setErrores(estadoID)
        if (transformacionTAREAS.length !==1 && transformacionTAREAS[n].id !== "delete"){ // para hack API
          setEstadoID("delete")
          setCambios(false) //controlo los cambios
          transformacionTAREAS = hackBBDDaCero
        }
      }
    }

    actualizaBBDD(transformacionTAREAS) //actualiza la BBDD

  }

  //2.3 actualiza a true o false el "done" de tarea según el id
  const cambiaTareaPendiente = tarea => {
    setEstadoID(tarea.id) //hack API
    for (var n = 0; n < TAREAS.length; n++) {
      if (TAREAS[n].id === tarea.id) { // 2.3.1. si la tarea que pasamos coincide con el id de la tarea en el API cambiamos el estado
        tarea.done ? tarea.done = false : tarea.done = true
      }
    }
    actualizaBBDD(TAREAS) //2.3.2 actualiza la BBDD

  }

  // 2.4 borrar TODAS las tareas
  const btnBorraTODAS = () => {
    setEstadoID("delete")
    actualizaBBDD(hackBBDDaCero) // 2.4.1. actualiza la BBDD
  }

  // ********************************** 3. FUNCIONES DE RENDERIZADO CONDICIONAL*************************************************************

  // 3.1. COMPONENTE => según si tarea.id es true o es false creamos los botones correspondientes
  const tareaID = (tarea) => {

    if (tarea.done) { // 3.1.1 si la tarea no está pendiente permite borrarla
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

  // 3.2. si hay datos en la BBDD  (recordemos la variable estadoID por el hack API)
  const compHayDatosAPI = () => {  

    return (
      <>
        {/* 3.2.1 COMPONENTE - BORRAR TODAS LAS TAREAS ******************/}
        <div className="d-flex justify-content-center my-3">

        
          <button type="button" className="btn btn-danger text-nowrap" onClick={() => btnBorraTODAS()}>Borrar todas las tareas</button>
        </div>

        {/* 3.2.2 COMPONENTE - DATOS DEL ARRAY TAREAS *********/}
        <section className="d-flex justify-content-center flex-column mb-3">
          {
            // 3.2.2.1 recorro el array de datos TAREAS para mostrarlo cuando se modifica
            TAREAS.map((tarea) =>
              <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-2" key={tarea.id}  >
                <h5 className='p-0 m-0 fw-lighter'>Tarea:  {tarea.label}</h5>
                {/* 3.2.2.1.1 LLAMADA a función condicional para crear componente de los botones Borrar, Pendiente/Hecho */}
                <div>{tareaID(tarea)}</div>
              </div>
            )
          }
        </section>

        {/* 3.2.3 ITEMS LEFT con length del array de objetos TAREAS ******************************/}
        <footer className='container ps-4'><p className='fw-lighter'>{TAREAS.length} items left</p></footer>
      </>
    )
  }

  // 3.3. si no hay datos en el API
  const compSinDatosAPI = () => {
    
    return (
      <>
        <div className="d-flex justify-content-center my-3"><h4 className="text-danger parpadea m-2 fw-lighter">{errorBBDD}</h4></div>
      </>
    )
  }


  // ***************************************** 4. CREACION DE COMPONENTES ******************************************************
  return (
    <div className="container-md p-5">
      <div className='container p-0 m-0 d-flex flex-column bg-light shadow'>

        {/* 4.1. COMPONENTE TITULO *********************/}
        <header className='d-flex justify-content-center'><h1 className='fw-lighter'>todos{errores}</h1></header>

        {/* 4.2. FORMULARIO CREAR NUEVA TAREA **********/}
        <section className='d-flex justify-content-center mx-2 '>
          <form onSubmit={handleSubmit(addTareaBBDD)} >
            <div className="input-group input-group-sm">
              <span className="input-group-text">Nueva tarea</span>
              <input
                autoComplete="off" //no permitir autocompletado del input                      
                type="text"
                className='form-control bg-lighter'
                placeholder="Nueva tarea"
                {...register("label", { required: true })} //crear el name del input y es requerido react-hook-form
              />
              <button className='btn btn-primary text-nowrap' type="submit" >crear</button>
            </div>
            {/* control de errores react-hook-form */}
            {errors.label && <span className="text-danger text-small d-block m-2 fw-lighter">El campo no puede estar vacío</span>}
          </form>
        </section>

        {/* 4.3 MOSTRAR COMPONENTE SI LA BBDD ESTÁ VACÍA O NO (con el hack API)**********/}
        { 
          (estadoID!=="delete") ? compHayDatosAPI() : compSinDatosAPI()
        }
      </div>
    </div>
  );
}

export default App;

