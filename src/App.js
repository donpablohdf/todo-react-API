import React, { useState} from 'react';
import {useForm} from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid';
import "./App.css"

console.clear();
function App() {

  const { register, reset, handleSubmit, formState: { errors } } = useForm();
  const [datos, setDatos]=useState([])

  const onSubmit = (data, e) =>{
    e.target.reset()
    e.preventDefault();
    data.id = uuidv4() //creo una id única con uuid
    setDatos([...datos, data]) //añado los datos al array   
}

//borrar el todo
  const deleteTodo = todo =>{
    setDatos(datos.filter(item => item.id !== todo.id))
  }

  return (
    <div className="container-md p-5">
      
          <div className='container p-0 m-0 d-flex flex-column bg-light shadow'>
{/* TITULO *********************************************************************************/}
<header className='d-flex justify-content-center'><h1 className='fw-lighter'>todos</h1></header>
{/* FORMULARIO *********************************************************************************/}
              <div className='d-flex justify-content-center'>
                  <form onSubmit={handleSubmit(onSubmit)} >
                    <div className="container p-2 m-0 d-flex flex-row">
                      <input 
                        id='newTodo' 
                        type="text" 
                        className='form-control my-2' 
                        placeholder="Nuevo todo" 
                        {...register("newTodo", { required: true })} 
                      />
                      <button className='btn boton ms-3 d-block' type="submit" onClick={reset}> enviar</button>
                    </div>
                    {errors.newTodo && <span className="text-danger text-small d-block m-2 fw-lighter">El campo no puede estar vacío</span>}
                  </form>
              </div>
{/* DATOS****************************************/}
              <div className="d-flex justify-content-center flex-column mb-3">
                {
                    datos.map((item) =>
                      <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-2" key={item.id}  >
                        <h5 className='p-0 m-0 fw-lighter'>{item.newTodo}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={()=>deleteTodo(item)}></button>
                      </div>
                    )
                }
              </div>
              <div className='container ps-4'><p className='fw-lighter'>{datos.length} items left</p></div>
          </div>
    </div>
  );
}

export default App;
