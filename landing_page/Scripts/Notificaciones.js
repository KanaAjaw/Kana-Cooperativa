//
//  Manejo de notificaciones pop-up
//
const retardo_notificacion = 8000
const lista_notificaciones = document.getElementById('lista_notificaciones')
export const mostrar_notificacion = (codigo_notificacion, id_notificacion=0)=>{
    // Creación de la notificación
    let nueva_notificacion = document.createElement('div')
    let aun_activo = true
    if(id_notificacion != 0) nueva_notificacion.setAttribute('id',id_notificacion)
    nueva_notificacion.classList.add('notificacion')
    nueva_notificacion.innerHTML = codigo_notificacion

    nueva_notificacion.addEventListener('click',()=>{
        nueva_notificacion.style.transform = 'translateX(110%)'
        animacion_eliminar_notificacion(nueva_notificacion)
        aun_activo = false
    })
    // Se añade y muestra la notificación
    lista_notificaciones.appendChild(nueva_notificacion)
    setTimeout(()=>{ 
        if(aun_activo) {
            if(id_notificacion != 0){
                if(document.getElementById(id_notificacion) != null)
                    animacion_eliminar_notificacion(nueva_notificacion)
            } else {animacion_eliminar_notificacion(nueva_notificacion)}
        }
    }, retardo_notificacion)
}

export const animacion_eliminar_notificacion = (elemento,id_notificacion=0)=>{
    if(id_notificacion == 0){
        elemento.style.transform = 'translateX(110%)'
        setTimeout(()=>{lista_notificaciones.removeChild(elemento)},300)
        return true
    }

    elemento = document.getElementById(id_notificacion)
    if(elemento != null){
        elemento.style.transform = 'translateX(110%)'
        setTimeout(()=>{lista_notificaciones.removeChild(elemento)},300) 
    }
}