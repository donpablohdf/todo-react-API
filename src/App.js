import React, { useState } from 'react';
import {useForm} from 'react-hook-form' // permite el manejo de formularios https://www.npmjs.com/package/react-hook-form
import { v4 as uuidv4 } from 'uuid'; // permite crear ids unicos https://www.npmjs.com/package/uuidv4
import "./App.css"

function App() {

  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm(); // declaracion para react-hook-form
  const [TODO, setDatos]=useState([]) //creo un array para meter objetos con id creado por uuid y newTask creado por el input del formulario

  const onSubmit =  (data, e) =>{  // al cambiar el input o enviar el formulario añade el task al array de objetos TODO
    
    e.preventDefault(); //es necesario para que el formulario no haga peticiones GET/POST(no interviene en éste caso, pero es mejor ponerlo)
    data.id = uuidv4() //creo una id única con uuid para meter en el array de objetos TODO
    setDatos([...TODO, data]) //añado los datos al array de objetos  TODO
    reset({newTask: ''}) //reseteamos el valor del input con react-hook-form
    // console.log(data);
    // console.log(watch("newTask"));
  }

  //borrar el task del array de objetos TODO con filter
  const deleteTodo = todo =>{
    setDatos(TODO.filter(item => item.id !== todo.id))
  }

  return (
    <div className="container-md p-5">
      
          <div className='container p-0 m-0 d-flex flex-column bg-light shadow'>
{/* TITULO *****************************************************************************************************************************************/}
            <header className='d-flex justify-content-center'><h1 className='fw-lighter'>todos</h1></header>
{/* FORMULARIO *************************************************************************************************************************************/}
              <section className='d-flex justify-content-center'>
                  <form onSubmit={handleSubmit(onSubmit)} >
                    <div className="container p-2 m-0 d-flex flex-row">
                      <input 
                        autoComplete="off" //no permitir autocompletado del input                      
                        type="text" 
                        className='form-control my-2' 
                        placeholder="Nuevo todo" 
                        {...register("newTask", { required: true })} //crear el name del input y requerido react-hook-form
                      />
                      <button className='btn boton ms-3 d-block' type="submit" > enviar</button>
                    </div>
                    {/* control de errores react-hook-form */}
                    {errors.newTask && <span className="text-danger text-small d-block m-2 fw-lighter">El campo no puede estar vacío</span>}
                  </form>
              </section>
{/* DATOS DEL ARRAY TODO*****************************************************************************************************************************/}
              <section className="d-flex justify-content-center flex-column mb-3">
                {
                  // recorro el array de datos TODO para mostrarlo cuando se modifica
                    TODO.map((item) =>
                      <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-2" key={item.id}  >
                        <h5 className='p-0 m-0 fw-lighter'>{item.newTask}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={()=>deleteTodo(item)}></button>
                      </div>
                    )
                }
              </section>
{/* ITEMS LEFT con length del array de objetos TODO ******************************/}
              <footer className='container ps-4'><p className='fw-lighter'>{ TODO.length } items left</p></footer>
          </div>
    </div>
  );
}

export default App;
