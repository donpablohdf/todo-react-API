import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form' // permite el manejo de formularios https://www.npmjs.com/package/react-hook-form
import { v4 as uuidv4 } from 'uuid'; // permite crear ids unicos https://www.npmjs.com/package/uuidv4
import "./App.css"
console.clear()


const urlAPI = 'https://assets.breatheco.de/apis/fake/todos/user/alesanchezr'

function App() {
  // eslint-disable-next-line
  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm(); // declaracion para react-hook-form
  const [TAREAS, setTAREAS] = useState([]) //creo un array para meter objetos con id creado por uuid y label creado por el input del formulario

  // recupero datos de la API
  useEffect(() => {
    const options = { method: 'GET' };
    async function recupera() {

      await fetch(urlAPI, options)
        .then(response => response.json())
        .then(response => { setTAREAS(response) })
        .catch(err => console.error(err));
    }

    recupera()
  }, [TAREAS.id, setTAREAS]);

  //actualizo datos en la API
  const actualizaAPI = () => {
    //console.clear()
    const convierteAJSON = JSON.stringify(TAREAS)
    const options = { method: "PUT", body: convierteAJSON, headers: { "Content-Type": "application/json" } }
    console.log(convierteAJSON)
    async function actualiza() {
      await fetch(urlAPI, options)
        .then(response => {
          console.log(response.ok); // Será true (verdad) si la respuesta es exitosa.
          console.log(response.status); // el código de estado = 200 o código = 400 etc.
        })
        .catch(err => console.error(err));
    }

    actualiza()
  }

  // al cambiar el input o enviar el formulario añade la tarea al array de objetos TAREAS
  const addTarea = async (data, e) => {
    console.clear()
    e.preventDefault() //es necesario para que el formulario no haga peticiones GET/POST(no interviene en éste caso, pero es mejor ponerlo)
    data.id = uuidv4() //creo una id única con uuid para meter en el array de objetos TAREAS
    data.done = false
    setTAREAS([...TAREAS, data]) //añado los datos al array de objetos  TAREAS
    reset({ label: '' }) //reseteamos el valor del input con react-hook-form
    actualizaAPI()
    //console.log(data);
    // console.log(watch("label"));
  }

  //borrar la tarea del array de objetos TAREAS con filter
  const deleteTarea = tarea => {
    console.clear()
    setTAREAS(TAREAS.filter(elementoTAREAS => elementoTAREAS.id !== tarea.id)) // actualiza el array de objetos TAREAS con solo los elementos que son distintos a tarea.id usando filter
    actualizaAPI() //actualiza la API
  }

  //pone a true o false el done de tarea según el id
  const cambiaEstadoTarea = tarea => {
    console.clear()
    for (var n = 0; n < TAREAS.length; n++) {
      if (TAREAS[n].id === tarea.id) { //si la tarea que pasamos coincide con el id de la tarea en el API cambiamos el estado
        tarea.done ? tarea.done = false : tarea.done = true
      }
    }
    actualizaAPI() //actualiza la API
  }
  //borrar todas las tareas
  const borrarTAREAS = () => {
    setTAREAS([]) //actualiza la API
    setTAREAS([{ id: "0", label: "0", done: true }])
    console.log(TAREAS)
    setTimeout(actualizaAPI,5000) //actualiza la API
  }

  return (
    <div className="container-md p-5">

      <div className='container p-0 m-0 d-flex flex-column bg-light shadow'>
        {/* TITULO *****************************************************************************************************************************************/}
        <header className='d-flex justify-content-center'><h1 className='fw-lighter'>todos</h1></header>
        {/* FORMULARIO *************************************************************************************************************************************/}
        <section className='d-flex justify-content-center'>
          <form onSubmit={handleSubmit(addTarea)} >
            <div className="container p-2 m-0 d-flex flex-row">
              <input
                autoComplete="off" //no permitir autocompletado del input                      
                type="text"
                className='form-control my-2'
                placeholder="Nueva tarea"
                {...register("label", { required: true })} //crear el name del input y requerido react-hook-form
              />
              <button className='btn boton ms-3 d-block' type="submit" > enviar</button>

            </div>
            {/* control de errores react-hook-form */}
            {errors.label && <span className="text-danger text-small d-block m-2 fw-lighter">El campo no puede estar vacío</span>}
          </form>

        </section>
        <div className="container d-flex justify-content-center">
          <button type="button" className="btn btn-danger" onClick={() => borrarTAREAS()}> borrar todo</button>
        </div>
        {/* DATOS DEL ARRAY TAREAS*****************************************************************************************************************************/}
        <section className="d-flex justify-content-center flex-column mb-3">
          {
            // recorro el array de datos TAREAS para mostrarlo cuando se modifica
            TAREAS.map((tarea) =>
              <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-2" key={tarea.id}  >
                <h5 className='p-0 m-0 fw-lighter'>Tarea:  {tarea.label}</h5>
                <div>
                  {/* convierte la tarea a true */}
                  <button type="button" className="btn-close " aria-label="Close" onClick={() => cambiaEstadoTarea(tarea)}></button>
                  {/* borra la tarea */}

                </div>
              </div>
            )
          }
        </section>
        {/* ITEMS LEFT con length del array de objetos TAREAS ******************************/}
        <footer className='container ps-4'><p className='fw-lighter'>{TAREAS.length} items left</p></footer>
      </div>
    </div>
  );
}

export default App;
