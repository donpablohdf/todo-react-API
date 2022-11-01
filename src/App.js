import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form' // permite el manejo de formularios https://www.npmjs.com/package/react-hook-form
import { v4 as uuidv4 } from 'uuid'; // permite crear ids unicos https://www.npmjs.com/package/uuidv4

// 
import GridLoader from "react-spinners/GridLoader"; // permite crear el spinner de carga https://www.npmjs.com/package/react-spinners

console.clear()

// VARIABLES PARA LA API
const urlAPI = 'https://assets.breatheco.de/apis/fake/todos/user/alesanchezr' //url de la API

let cabeceraAPI = new Headers();
cabeceraAPI.append("Content-Type", "application/json"); // header para la API
let opcionesGETbbdd = { method: 'GET', headers: cabeceraAPI, redirect: 'follow' }
let opcionesPUT = { method: 'PUT', headers: cabeceraAPI, body: [], redirect: 'follow' } 
//opciones para repuperar datos de la API con GET
let hackBBDDaCero= [{ "label": "BORRADOS", "id": true, "done": true }] //es necesaria esta entrada fake ya que la API no permite dejar el array de objetos vacío

// VARIABLES PARA TRATAR DATOS
let transformacionTAREAS // array de objetos que sirve para transformar el array TAREAS que muestra los datos en el front-end => setTAREAS(transformacionTAREAS)
let datosParaActualizarBBDD // array de objetos que sirve para cambiar los datos en la BBDD de la API => actualizaBBDD(datosParaActualizarBBDD)

//VARIABLES PARA spinner de carga
const spinnerCSS = {
  display: "block",
  margin: "10px auto",
  borderColor: "white",
};

//**************A P P *********************************************************************A P P**************************************  */
//***********************************A P P **********************************A P P****************************************************  */
//**************A P P *********************************************************************A P P**************************************  */

const App = () => {


  // eslint-disable-next-line 
  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm(); // declaracion para control de formulario con react-hook-form
  const [TAREAS, setTAREAS] = useState([]) //es el array de objetos para mostrar en el FRONT-END (quitando el primer elemento)
  // const [cambios, setCambios] = useState(false) // (descomentar si) REHACER useEffect cada vez que cambie TAREAS 
  const [errorBBDD, setErrorBBDD] = useState("Cargando...")
  const [loading, setLoading] = useState(true);

  // *********************************** 1. LLAMADAS A APIS CON FETCH***************************************************

  // **1.1 RECUPERO DATOS DE LA API CON GET al inicio (opcional: cada vez que hay cambios)***
  useEffect(() => {
    setLoading(true)
    fetch(urlAPI, opcionesGETbbdd)
        .then(response => response.json())
        .then(result => { 
          setTAREAS(result.filter(elementoTAREAS => elementoTAREAS.id !== true))
          setLoading(false) // para spinner de carga
          setErrorBBDD("La base de datos está vacía")
        }//elimino el primer elemento (array de objetos hackBBDDaCero)
        ) 
        .catch(err => setErrorBBDD("Hubo un error en la petición GET : " + err.message ));

        // return () => { setCambios(false)} // (descomentar si) REHACER useEffect cada vez que cambie TAREAS 

  }, [])
  //}, [cambios]) (sustituir linea de arriba si) REHACER useEffect cada vez que cambie TAREAS

  // **1.2. ACTUALIZAR API -> actualizo datos en la API con PUT
  const actualizaBBDD = (reciboDatosParaActualizarBBDD) => {
    setLoading(true)
    // console.clear()
    // console.log("resultado que actualiza TAREAS en actualizaBBDD")
    // console.table(transformacionTAREAS)
    // console.log("resultado de reciboDatosParaActualizarBBDD en actualizaBBDD")
    // console.table(reciboDatosParaActualizarBBDD)
    // console.log("--------------------")

    opcionesPUT.body = JSON.stringify(reciboDatosParaActualizarBBDD) // convierto lo que recibo a un string JSON y lo meto en el body del PUT

    fetch(urlAPI, opcionesPUT)
      .then(response => response.text())
      .then(result =>{setLoading(false)})  // setCambios(!cambios) <= (añadir si) REHACER useEffect cada vez que cambie TAREAS
      .catch(err => setErrorBBDD("Hubo un error en la petición PUT : " + err.message ));

  }

 //********************************2. FUNCIONES TRANSFORMADORAS DE LA BBDD*********************************************

  // 2.1 al cambiar el input o enviar el formulario añade la tarea a la BBDD
  const addTareaBBDD = (data, e) => {

    transformacionTAREAS = TAREAS

    reset({ label: '' }) //reseteo el input del formulario
    e.preventDefault() //es necesario para que el formulario no haga peticiones GET/POST (no interviene en éste caso, pero es mejor ponerlo)
    
    data.id = uuidv4() //creo una id única con uuid para crear la nueva tarea en la BBDD
    data.done = false //pongo la key done en false para que la tarea quede pendiente

    // ******para poner la tarea fake la primera y poner la última añadida, la segunda
    if(transformacionTAREAS.length === 0){ // si TAREAS está vacío

      datosParaActualizarBBDD = hackBBDDaCero.concat(data)
  
    } else { // si no está vacío, concatenamos hackBBDDaCero con los nuevos datos (data) y con los elementos que existían antes (transformacionTAREAS)

      datosParaActualizarBBDD =  hackBBDDaCero.concat(data).concat(transformacionTAREAS) 
    }
    
    // console.log("resultado de datosParaActualizarBBDD en addTareaBBDD")
    // console.table(datosParaActualizarBBDD)
    // console.log("--------------------")


    // TAREAS - TRANSFORMACIÓN PARA MOSTRAR EN EL FRONT-END
    transformacionTAREAS= datosParaActualizarBBDD.filter(elementoTAREAS => elementoTAREAS.id !== true) //elimino hackBBDDaCero para que no se muestre
    setTAREAS(transformacionTAREAS) //seteo TAREAS sin hackBBDDaCero

    actualizaBBDD(datosParaActualizarBBDD) //actualiza la BBDD

  }

  // 2.2 borrar la tarea a la BBDD
  const deleteTareaBBDD = tarea => {

    transformacionTAREAS = hackBBDDaCero.concat(TAREAS) //añado hackBBDDaCero al principio del array

    datosParaActualizarBBDD= transformacionTAREAS.filter(elementoTAREAS => elementoTAREAS.id !== tarea.id) // actualiza el array de objetos TAREAS con solo los elementos que son distintos a tarea.id usando filter
    
    // TAREAS - TRANSFORMACIÓN PARA MOSTRAR EN EL FRONT-END
    transformacionTAREAS= datosParaActualizarBBDD.filter(elementoTAREAS => elementoTAREAS.id !== true) //elimino hackBBDDaCero para que no se muestre
    setTAREAS(transformacionTAREAS) //seteo TAREAS sin hackBBDDaCero

    actualizaBBDD(datosParaActualizarBBDD) //actualiza la BBDD

  }

  //2.3 actualiza a true o false el "done" de tarea según el id
  const cambiaTareaPendiente = tarea => {

    let cogeElID
    datosParaActualizarBBDD = hackBBDDaCero.concat(TAREAS)
    for (var n = 0; n < datosParaActualizarBBDD.length; n++) {
      if (datosParaActualizarBBDD[n].id === tarea.id) {

        cogeElID=n; 
        //si la tarea que pasamos coincide con el id de la tarea en el API cambiamos el estado
        tarea.done ? tarea.done = false : tarea.done = true
      }
    }

    datosParaActualizarBBDD[cogeElID] = tarea //sustituimos el elemento en el array

    // TAREAS - TRANSFORMACIÓN PARA MOSTRAR EN EL FRONT-END
    transformacionTAREAS= datosParaActualizarBBDD.filter(elementoTAREAS => elementoTAREAS.id !== true) //elimino hackBBDDaCero para que no se muestre
    setTAREAS(transformacionTAREAS) //seteo TAREAS sin hackBBDDaCero
    
    actualizaBBDD(datosParaActualizarBBDD) //actualiza la BBDD

  }

  // 2.4 borrar TODAS las tareas
  const btnBorraTODAS = () => {

    datosParaActualizarBBDD = hackBBDDaCero

    // TAREAS - TRANSFORMACIÓN PARA MOSTRAR EN EL FRONT-END
    setTAREAS([]) //seteo TAREAS sin hackBBDDaCero

    actualizaBBDD(datosParaActualizarBBDD) //actualiza la API
  }

    // *************** 3. FUNCIONES DE RENDERIZADO CONDICIONAL*******************************

    // 3.1. COMPONENTE => BotoneraHechoPendienteBorrar: si tarea.done es true creamos los botones Realizada y Borrar. 
    //                    Si tarea.done es false nostramos el botón Pendiente
  const botoneraHechoPendienteBorrar = (tarea) => {

    if (tarea.done) { // 3.1.1 si la tarea no está pendiente permite borrarla
      return (
        <>
          <button type="button" className="btn btn-outline-success " aria-label="Close" onClick={() => cambiaTareaPendiente(tarea)}>Realizada</button>
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

  // 3.2. COMPONENTE SiHayDatos hay datos en la BBDD de la API  (recordemos la variable cambios para el fetch, la hackBBDDaCero por el hack API)
  const siHayDatos = () => {  

    return (
      <>
        {/* 4.3.1 COMPONENTE - BorrarTODAS que borra TODAS las tareas*/}
        <div className="d-flex justify-content-center my-3">
          <button type="button" className="btn btn-danger text-nowrap" onClick={() => btnBorraTODAS()}>Borrar todas las tareas</button>
        </div>

        {/* 4.3.2 COMPONENTE - DatosTareas DEL ARRAY TAREAS *********/}
        <section className="d-flex justify-content-center flex-column mb-3">
          {
            // 4.3.2.1 recorro el array de datos TAREAS para mostrarlo cuando se modifica
            TAREAS.map((tarea) =>
              <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-2" key={tarea.id}  >
                <h5 className='p-0 m-0 fw-lighter'>Tarea: {tarea.label}</h5>
                {/* 4.3.2.1.1 LLAMADA a función condicional para crear componente de los botones Borrar, Pendiente/Realizada */}
                <div>{botoneraHechoPendienteBorrar(tarea)}</div>
              </div>
            )
          }
        </section>

        {/* 4.3.3 COMPONENTE - ItemsLeft con length del array de objetos TAREAS ******************************/}
        <footer className='container ps-4'><p className='fw-lighter'>{TAREAS.length} items left</p></footer>
      </>
    )
  }

  // 3.3. COMPONENTE NoHayDatos  no hay datos en la BBDD de la API
  const noHayDatos = () => {
    return (
      <>
        <div className="d-flex justify-content-center my-3"><h4 className="text-danger parpadea m-2 fw-lighter">{errorBBDD}</h4></div>
      </>
    )
  }
// ***************************************************************************************************************
 // **************************** 4. CREACION DE COMPONENTES ******************************************************
 //*************************************************************************************************************** */
  return (
    <div className="container-md p-5">
      <div className='container p-0 m-0 d-flex flex-column bg-light shadow'>
  
        {/* 4.1. COMPONENTE Titulo *********************/}
        <header className='d-flex justify-content-center'><h1 className='fw-lighter'>todos</h1></header>

        {/* 4.2. COMPONENTE FORMULARIO CREAR NUEVA TAREA **********/}
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
        <GridLoader
        color={"#36d7b7"}
        loading={loading}
        cssOverride={spinnerCSS}
        size={15}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
        {/* 4.3. COMPONENTE MostrarTareas CREAR NUEVA TAREA => addTareaBBDD **********/}
        { (TAREAS.length === 0) ? noHayDatos() : siHayDatos() }


      </div>
    </div>
  );

}



export default App;
