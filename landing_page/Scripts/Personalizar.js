import { agregar_configuracion,subir_imagen,recuperar_configuracion } from './firebase.js'
import { mostrar_notificacion,animacion_eliminar_notificacion } from './Notificaciones.js'
import { obtener_documento } from './firebase.js'
import { recuperar_identificador_unico, redirigir_con_idu, scroll_hacia } from './Herramientas.js'

const ancho_movil = 850
let idu = ''
let modo_captura = 0
    // 1 - Movil
    // 2 - Desktop
const codigo_idu_no_verificado = 
    `<i class="fa-solid fa-triangle-exclamation" advertencia></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>No se pudo verificar el identificador</span>
    <p>Porfavor asegurate de que sea correcto o intentalo una vez más</p>`
const codigo_idu_en_verificacion = 
    `<i class="fa-solid fa-fingerprint" exito></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <p>Estamos verificando el identificador</p>`
const codigo_idu_invalido = (mensaje)=>{
    return `<i class="fa-solid fa-fingerprint" exito></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>El formato del identificador es incorrecto</span>
    <p>${mensaje}</p>`
}
const codigo_archivo_no_imagen = 
    `<i class="fa-solid fa-file-circle-question" advertencia></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>El archivo elegido no es una imagen</span>
    <p>Asegurate que tus archivos tengan extensión PNG, JPG, JPEG o SVG</p>`
const codigo_redimensionando_imagen = 
    `<i class="fa-solid fa-minimize" exito></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>La imagen elegida es muy pesada</span>
    <p>Estamos redimensionando tu imagen, recuerda que tus imágenes deben pesar menos de 1.2Mb</p>`
const codigo_imagen_empresa_faltante = (elemento_faltante)=>{
    return `<i class="fa-solid fa-copyright" advertencia></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>Áun no esta completa tu imagen empresarial</span>
    <p>No olvides agregar tu ${elemento_faltante} antes de finalizar</p>`
}
const codigo_error_guardando = 
    `<i class="fa-solid fa-floppy-disk" error></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>Error en el autoguardado</span>
    <p>No pudimos guardar las modificaciones recientes, vuelve hacer las modificaciones</p>`
const codigo_cargando_imagenes =
    `<i class="fa-solid fa-spinner rotar" exito></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>Estamos guardando tu imagen</span>
    <p>Espera un momento a que se suba</p>`
const codigo_cargada_imagen = 
    `<i class="fa-solid fa-floppy-disk" exito></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>Se ha guardado exitosamente tu imagen</span>`
const codigo_error_cargando_imagenes = 
    `<i class="fa-solid fa-cloud" error></i>
    <i class="fa-solid fa-eye-slash ocultar"></i>
    <span>Error al guardar la imagen</span>
    <p>No pudimos guardar la imagen, porfavor intenta una vez más o contáctate con nosotros</p>`
    


//
//  Verificación del identificador único
//
const id_unico = document.getElementById('id_unico')
const boton_id_unico = document.getElementById('confirmar_id_unico')
const modal_idu = document.getElementById('modal_identificador_unico')
const regresar = document.getElementById('identificador_unico_regresar')

let modo_pantalla_actual = 0

document.addEventListener('DOMContentLoaded', ()=>{
    indice_paso_actual = parseInt(paso_numeracion.innerText) - 1
    visualizar_paso(indice_paso_actual)
    centrar_imagen_galeria(0,false)
    const id_aux = recuperar_identificador_unico()
    if(id_aux){
        id_unico.value = id_aux
        verificar_identificador_unico()
    }
    enlace_redes.innerText = ''
    modo_pantalla_actual = modo_pantalla()
    actualizar_placeholder_instrucciones()
    // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform))) {
    //     alert('Es movil')
    // }
})

const placeholder_pasos_procedimiento = document.getElementById('placeholder_pasos_procedimiento')
function actualizar_placeholder_instrucciones(){
    placeholder_pasos_procedimiento.style.height = `${pasos_procedimiento.getBoundingClientRect().height}px`
}

boton_id_unico.addEventListener('click',()=>{ verificar_identificador_unico() })
regresar.addEventListener('click',()=>{ redirigir_con_idu('personalizar_instrucciones.html',recuperar_identificador_unico()) })

function validar_idu(){
    let idu_aux = id_unico.value
    if(idu_aux == ''){ mostrar_notificacion(codigo_idu_invalido('El identificador esta vacío')); return false } // La cadena es vacía
    if(idu_aux.length != 7) { mostrar_notificacion(codigo_idu_invalido('Al identificador le hacen falta o restan caracteres, deben ser 7')); return false} // La longitud de cadena es distinta de 7
    if(idu_aux.indexOf('-') == -1) { mostrar_notificacion(codigo_idu_invalido('Es necesario agregar también el guión')); return false} // No se agrega el guión
    if(idu_aux.indexOf('-') == 0 || idu_aux.indexOf('-') > 3) { mostrar_notificacion(codigo_idu_invalido('El guión ha sido colocado en el lugar incorrecto')); return false} // La pocisión del guión es incorrecta
    const alfabetico = idu_aux.substring(0, idu_aux.indexOf('-'))
    const numerico = idu_aux.substring(idu_aux.indexOf('-')+1)
    let caracter_invalido = false
    Array.from(alfabetico).forEach((caracter)=>{ if(!isNaN(caracter)) caracter_invalido = true })
    if(caracter_invalido) { mostrar_notificacion(codigo_idu_invalido('Antes del guión solo se aceptan caracteres alfabético')); return false} // Hay un caracter inválido en posición incorrecta
    Array.from(numerico).forEach((numero)=>{ if(isNaN(numero)) caracter_invalido = true })
    if(caracter_invalido) { mostrar_notificacion(codigo_idu_invalido('Después del guión solo se aceptan caracteres numéricos')); return false} // Hay un caracter inválido en posición incorrecta
    return true
}
async function verificar_identificador_unico(){
    if(!validar_idu()) return false

    const id_notificacion = parseInt(Math.random()*1000).toString()
    mostrar_notificacion(codigo_idu_en_verificacion,id_notificacion)
    idu = id_unico.value.toUpperCase()
    // Se verifica con los registros que el identificador exista
    const documento = await obtener_documento(idu)

    if(documento.exists()){
        modal_idu.removeAttribute('activo')
        animacion_eliminar_notificacion(null,id_notificacion)
        recuperacion_configuracion_actual()
    }else{
        mostrar_notificacion(codigo_idu_no_verificado)
    }
}

//
//  Recuperación de configuración actual
//
const logotipo_empresa = document.getElementById('logotipo_empresa')
const nombre_empresa = document.getElementById('nombre_empresa')
const titulos = document.querySelectorAll('.titulo_landing')
const descripcion = document.getElementById('descripcion')
const enlace_redes = document.getElementById('enlace_redes')
const imagen_portada = document.getElementById('imagen_portada')
const imagen_galeria_1 = document.getElementById('imagen_galeria_1')
const imagen_galeria_2 = document.getElementById('imagen_galeria_2')
const imagen_galeria_3 = document.getElementById('imagen_galeria_3')

let redes_nuevas = {
    'FACEBOOK' : '',
    'TWITTER' : '',
    'INSTAGRAM' : '',
    'WHATSAPP' : '',
}

async function recuperacion_configuracion_actual(){
    try{
        const referencia = await recuperar_configuracion(idu)
        if(referencia.exists()){
            const configuracion = referencia.data()
            if(configuracion.hasOwnProperty('nombre')) nombre_empresa.innerText = configuracion.nombre
            if(configuracion.hasOwnProperty('titulo_1')) titulos[0].innerText = configuracion.titulo_1
            if(configuracion.hasOwnProperty('titulo_2')) titulos[1].innerText = configuracion.titulo_2
            if(configuracion.hasOwnProperty('descripcion')) descripcion.innerText = configuracion.descripcion
            if(configuracion.hasOwnProperty('logotipo')) logotipo_empresa.src = configuracion.logotipo
            if(configuracion.hasOwnProperty('redes')){ redes_nuevas = { ...redes_nuevas, ...configuracion.redes} }
            if(configuracion.hasOwnProperty('imagen_8:9')){
                // Móvil
                if(modo_pantalla() == 1) imagen_galeria_3.src = configuracion['imagen_8:9']
                // Escritorio
                else imagen_portada.src = configuracion['imagen_8:9']
            }
            if(configuracion.hasOwnProperty('imagen_16:9')){
                // Escritorio
                if(modo_pantalla() == 2) imagen_galeria_3.src = configuracion['imagen_16:9']
                // Móvil
                else imagen_portada.src = configuracion['imagen_16:9']
            }
            if(configuracion.hasOwnProperty('imagen_1:1')) imagen_galeria_1.src = configuracion['imagen_1:1']
            if(configuracion.hasOwnProperty('imagen_9:16')) imagen_galeria_2.src = configuracion['imagen_9:16']

            configuracion_almacenada = {...configuracion_almacenada, ...configuracion }
            console.log('configuracion reuperada',configuracion_almacenada)
        }
    }catch(error){
        console.log('Error recuperando la configuración >>',error)
    }
}



//
// Cambiar entre los pasos
//
let indice_paso_actual = 0
const paso_texto_instrucciones = [
    'Añade tu logotipo pulsando en el ícono con <img src="./Recursos/iconos/circle-plus.svg" style="width: 20px; aspect-ratio: 1 / 1; object-fit:cover;"> y/o añade tu nombre <span style="color:var(--amarillo)">(Opcional)</span>',
    'Modifica el título acorde a tu cooperativa',
    'Redacta tu introducción sobre tu empresa, quienes son y lo que hacen',
    'Ingresa los enlaces a tus redes sociales y número telefónico <span style="color:var(--amarillo)">(Opcionales)</span>',
    'Agrega o cambia tu imagen elegida para la portada pulsando en el botón <img src="./Recursos/iconos/circle-plus.svg" style="width: 20px; aspect-ratio: 1 / 1; object-fit:cover;">',
    'Añade o cambia las 3 imágenes que conformarán la galería pulsando en cada botón <img src="./Recursos/iconos/circle-plus.svg" style="width: 20px; aspect-ratio: 1 / 1; object-fit:cover;">' 
]
// Total de pasos transformado en el índice máximo
const total_pasos = paso_texto_instrucciones.length-1

const ventanas_modales = document.querySelectorAll('.modal')
const indicadores = document.querySelectorAll('.pasos_procedimiento--indicador')

const plantilla = document.querySelector('.plantilla')
const botones_pasos = document.querySelector('.pasos_procedimiento--flechas')
const paso_numeracion = document.getElementById('paso_numeracion')
const paso_instruccion = document.getElementById('paso_instruccion')
const paso_siguiente = document.getElementById('paso_siguiente')
const paso_anterior = document.getElementById('paso_anterior')
const pasos_procedimiento = document.getElementById('pasos_procedimiento')

let configuracion_almacenada = {
    'logotipo' : null,
    'nombre' : '',
    'titulo_1' : '',
    'titulo_2' : '',
    'descripcion' : '',
    'redes' : {
        'FACEBOOK' : '',
        'TWITTER' : '',
        'INSTAGRAM' : '',
        'WHATSAPP' : ''
    },
    'imagen_8:9' : null,
    'imagen_1:1' : null,
    'imagen_9:16' : null,
    'imagen_16:9' : null,
}
let configuracion_defecto = {
    'nombre' : 'AGREGA TU NOMBRE',
    'titulo_1' : 'CAMBIA ESTAS FRASES',
    'titulo_2' : 'POR TU TÍTULO',
    'descripcion' : 'Modifica este párrafo y añade la descripción acerca de tus productos y/o servicios de manera que sea claro para quien te visite a que se dedica tu empresa. Te aconsejamos que seas breve y no excedas a más de 2 párrafos.',
}

paso_siguiente.addEventListener('click',()=>{ if(indice_paso_actual < total_pasos) nuevo_paso(false) }) 
paso_anterior.addEventListener('click',()=>{ if(indice_paso_actual > 0) nuevo_paso() }) 

const guardar = document.getElementById('guardar')
guardar.addEventListener('click',()=>{guardar_cambios(); modal_finalizacion.setAttribute('activo','')})


function nuevo_paso(decrementar=true){
    const indice_nuevo_paso = indice_paso_actual + (decrementar ? -1 : 1)
    guardar_cambios()
    // Se limpia el paso anterior
    ventanas_modales[indice_paso_actual].setAttribute('activo','')
    if(indice_nuevo_paso <= indice_paso_actual) indicadores[indice_paso_actual].removeAttribute('activo')
    // Se muestra el siguiente paso
    visualizar_paso(indice_nuevo_paso)
    indice_paso_actual = indice_nuevo_paso
}
function visualizar_paso(indice_paso){
    scroll_hacia(ventanas_modales[indice_paso].parentNode,150)
    ventanas_modales[indice_paso].removeAttribute('activo')
    indicadores[indice_paso].setAttribute('activo','')
    paso_numeracion.innerText = (indice_paso+1).toString()
    paso_instruccion.innerHTML = paso_texto_instrucciones[indice_paso]
    // Redes sociales
    if(indice_paso == 3){
        nombre_redes.innerText = 'FACEBOOK'
        if(configuracion_almacenada.redes.FACEBOOK == undefined){
            enlace_redes.value = ''
            enlace_redes.placeholder = placeholders.FACEBOOK
        }else{ enlace_redes.value = configuracion_almacenada.redes.FACEBOOK}
    }
    // Si se trata del último paso
    if(indice_paso == total_pasos){
        botones_pasos.setAttribute('ultimo_paso','')
        plantilla.setAttribute('segunda_pagina','')
    }
    else{
        botones_pasos.removeAttribute('ultimo_paso')
        plantilla.removeAttribute('segunda_pagina')
    }
}


const en_error_imagenes = (error)=>{
    console.log('Error en guardado >>',error)
    mostrar_notificacion(codigo_error_guardando)
    console.log('Revertir configuracion')
}
const en_carga_imagenes = (porcentaje,id_notificacion)=>{ 
    if(porcentaje == 0) mostrar_notificacion(codigo_cargando_imagenes, id_notificacion) 
    if(porcentaje == 100) animacion_eliminar_notificacion(null,id_notificacion)
}
const en_exito_imagenes = (url, resolucion_imagen, elemento_imagen)=>{
    let imagenes_aux = {}
    imagenes_aux[resolucion_imagen.toString()] = url
    agregar_configuracion(idu, imagenes_aux, en_error_datos, ()=>{})
    configuracion_almacenada = { ...configuracion_almacenada, ...imagenes_aux }
    elemento_imagen.src = url
    console.log('Imagen disponible en:',url)
    mostrar_notificacion(codigo_cargada_imagen) ;
}

const en_error_datos = ()=>{ mostrar_notificacion(codigo_error_guardando) }

async function guardar_cambios(){
    let datos_aux = {}
    switch (indice_paso_actual) {
        case 0:
            // Logotipo y nombre
            // Nombre
            const nombre = nombre_empresa.innerText.toUpperCase().replace(RegExp('\n','g'),'').trim()
            if(nombre != configuracion_almacenada.nombre){
                if(nombre != configuracion_defecto.nombre ){
                datos_aux.nombre = nombre
                agregar_configuracion(idu, datos_aux, en_error_datos, ()=>{ configuracion_almacenada = { ...configuracion_almacenada, ...datos_aux } })
                } else { mostrar_notificacion(codigo_imagen_empresa_faltante('nombre')) } 
            }
            // Logotipo
            if(Object.keys(imagen_subida).length != 0){
                if(imagen_subida.hasOwnProperty('logotipo') && imagen_subida.logotipo != configuracion_almacenada.logotipo){
                    subir_imagen(idu, 'logotipo',imagen_subida.logotipo, logotipo_empresa, en_carga_imagenes, en_error_imagenes, en_exito_imagenes)
                    logotipo_empresa.src = configuracion_almacenada.logotipo
                    limpiar_objeto(imagen_subida)
                }
                else { mostrar_notificacion(codigo_imagen_empresa_faltante('logotipo')) }
            }else if(configuracion_almacenada.logotipo == null) { mostrar_notificacion(codigo_imagen_empresa_faltante('logotipo')) }
            break;
        case 1:
            // Titulos
            for(let [i,titulo] of titulos.entries()) {
                const titulo_texto = titulo.innerText.toUpperCase().replace(RegExp('\n','g'),'').trim()
                if(titulo_texto != configuracion_defecto[`titulo_${i+1}`] && titulo_texto != configuracion_almacenada)
                    datos_aux[`titulo_${i+1}`] = titulo_texto
            }
            // Solo si ha habido modificaciones
            if(Object.keys(datos_aux).length != 0){
                agregar_configuracion(idu, datos_aux, en_error_datos, ()=>{ configuracion_almacenada = { ...configuracion_almacenada, ...datos_aux } })
            }
            break;
        case 2:
            // Descripción
            const descripcion_texto = descripcion.innerText.trim()
            if(descripcion_texto != configuracion_defecto.descripcion && descripcion_texto != configuracion_almacenada.descripcion){
                datos_aux.descripcion = descripcion_texto
                agregar_configuracion(idu, datos_aux, en_error_datos, ()=>{ configuracion_almacenada = { ...configuracion_almacenada, ...datos_aux } })
            }
            break;
        case 3:
            //Redes sociales
            datos_aux['redes'] = {}
            for(const [red,valor] of Object.entries(redes_nuevas)){
                const red_texto = valor.replace(RegExp('\n','g'),'').trim()
                if(red_texto != '' && red_texto != configuracion_almacenada.redes[red]) datos_aux.redes[red] = red_texto
            }
            // Solo si ha habido modificaciones
            if(Object.keys(datos_aux.redes).length != 0){
                agregar_configuracion(idu, datos_aux, en_error_datos, ()=>{ configuracion_almacenada = { ...configuracion_almacenada, ...datos_aux } })
            }
            break;
        case 4:
            // Portada
            const imagenes = Object.entries(imagen_subida)
            console.log('Imagenes',imagenes)
            for(const [resolucion,archivo] of Object.entries(imagen_subida)){
                console.log('Resolucion',resolucion)
                if(archivo != configuracion_almacenada[resolucion])
                    subir_imagen(idu, resolucion, archivo, imagen_portada, en_carga_imagenes, en_error_imagenes, en_exito_imagenes)
                else mostrar_notificacion(codigo_error_cargando_imagenes)
            }
            limpiar_objeto(imagen_subida)
            break;
        case 5:
            //Imagenes galería
            for(const [resolucion,archivo] of Object.entries(imagen_subida)){
                if(archivo != configuracion_almacenada[resolucion]){
                    let elemento_imagen_aux = null 
                    switch (resolucion) {
                        case 'imagen_1:1':
                            elemento_imagen_aux = imagen_galeria_1
                            break
                        case 'imagen_9:16':
                            elemento_imagen_aux = imagen_galeria_2
                            break
                        case 'imagen_16:9':
                            elemento_imagen_aux = imagen_galeria_3
                            break
                        case 'imagen_8:9':
                            elemento_imagen_aux = imagen_galeria_3
                            break
                    }
                    subir_imagen(idu, resolucion, archivo, elemento_imagen_aux, en_carga_imagenes, en_error_imagenes, en_exito_imagenes)
                }
                else mostrar_notificacion(codigo_error_cargando_imagenes)
            }
            limpiar_objeto(imagen_subida)
            break;
    }
}
function limpiar_objeto(objeto){
    for(const llave in objeto) delete objeto[llave]
}

//
//  Modo sticky
//
let modo_sticky = false
window.addEventListener('scroll',()=>{
    if(!modo_sticky){
        if(placeholder_pasos_procedimiento.getBoundingClientRect().top <= 0){
            modo_sticky = true
            pasos_procedimiento.classList.add('sticky')
        }
    }else if(placeholder_pasos_procedimiento.getBoundingClientRect().top > 0){
        modo_sticky = false
        pasos_procedimiento.classList.remove('sticky')
    }
})


//
//  Párrafos editables
//
const editables = document.querySelectorAll('*[contenteditable]')
editables.forEach((editable)=>{
    editable.addEventListener('focus',(evento)=>{
        setTimeout(()=>{evento.target.innerText=''},100)
    })
    editable.addEventListener('blur',(evento)=>{
        const editable_aux = evento.target
        if(editable_aux.innerText.replace(new RegExp(' ','g'),'').replace(new RegExp(' ','g'),'') == ''){
            if(configuracion_almacenada[editable_aux.attributes.llave.value] == '')
                editable.innerText = configuracion_defecto[editable_aux.attributes.llave.value]
            else
                editable.innerText = configuracion_almacenada[editable_aux.attributes.llave.value]
        }
    })
})


//
//  Captura de redes sociales
//
const iconos_redes = document.querySelectorAll('.plantilla--redes_iconos i')
const nombre_redes = document.getElementById('nombre_redes')

const placeholders = {
    'FACEBOOK' : 'https://facebook.com/mi_cooperativa',
    'TWITTER' : 'https://twitter.com/mi_cooperativa',
    'INSTAGRAM' : 'https://instagram.com/mi_cooperativa',
    'WHATSAPP' : '55 - 0000 0000',
}

iconos_redes.forEach((icono)=>{ icono.addEventListener('click',(evento)=>{ cambiar_red(evento.target) }) })
enlace_redes.addEventListener('input',()=>{ redes_nuevas[nombre_redes.innerText] = enlace_redes.value })

function cambiar_red(icono){
    const nombre = icono.attributes.nombre.value
    nombre_redes.innerText = nombre
    if(redes_nuevas[nombre] == ''){
        enlace_redes.value = ''
        enlace_redes.placeholder = placeholders[nombre]
    }
    else enlace_redes.value = redes_nuevas[nombre]
}

//
//  Carrusel de imágenes
//
const galeria = document.querySelector('.galeria_carrusel')
const imagenes_galeria = document.querySelectorAll('.galeria_carrusel label')
const flechas_galeria = document.querySelectorAll('.flechas_galeria i')
const indicadores_galeria = document.querySelectorAll('.indicadores_galeria .indicador')

const total_imagenes = indicadores_galeria.length
let indice_galeria = 0
let offset_galeria = 0
let ultimo_sentido = 0

flechas_galeria.forEach((flecha)=>{ flecha.addEventListener('click',(evento)=>{
    const flecha = evento.target
    cambiar_imagen_carrusel(flecha.hasAttribute('siguiente'))
})})

function cambiar_imagen_carrusel(incrementar=true){
    if(incrementar){
        if(indice_galeria < total_imagenes-1){
            indice_galeria += 1
            centrar_imagen_galeria(indice_galeria)
        }
    }else{
        if(indice_galeria > 0){
            indice_galeria -= 1
            centrar_imagen_galeria(indice_galeria,false)
        }
    }
}
function centrar_imagen_galeria(indice_imagen, sentido_derecha=true){
    const medidas =  imagenes_galeria[indice_imagen].getBoundingClientRect()
    let mover = 0

    if(sentido_derecha)
        mover = ((medidas.left- (document.documentElement.clientWidth / 2)) * -1) - (medidas.width / 2) + offset_galeria
    else
        mover = (document.documentElement.clientWidth / 2) - medidas.left - (medidas.width / 2) + offset_galeria
    
    ultimo_sentido = sentido_derecha ? -1 : 1
    offset_galeria = mover
    galeria.style.transform = `translateX(${mover}px)`
    indicadores_galeria[indice_galeria].setAttribute('activo','')
    indicadores_galeria[indice_galeria+ultimo_sentido].removeAttribute('activo')
}


//
//  Eventos relacionados con el cambio de ancho de la pantalla
//
const body = document.querySelector('body')
const modal_modo_captura = document.getElementById('modal_modo_captura')
const modal_mensaje = document.querySelector('.ventana_modal .mensaje p')

let captura_detenida = false

const mensajes_captura_detenida = [
    '',
    'Regresa a la resolución de movil para terminar tu personalización (Redimensiona tu pantalla o voltea el dispositivo).',
    'Regresa a la resolución de escritorio para terminar tu personalización (Redimensiona tu pantalla o voltea el dispositivo).'
]

window.addEventListener('resize',()=>{
    indice_galeria = 0; offset_galeria = 0; ultimo_sentido = 0;
    centrar_imagen_galeria(0,false)
    verificar_modo_captura()
    cambio_imagenes_movil_escritorio()
    modo_pantalla_actual = modo_pantalla()
})

function cambio_imagenes_movil_escritorio(){
    if(modo_pantalla_actual != modo_pantalla()){
        const imagen_portada_aux = imagen_portada.src
        imagen_portada.src = imagen_galeria_3.src
        imagen_galeria_3.src = imagen_portada_aux
        actualizar_placeholder_instrucciones()
    }
}
function verificar_modo_captura(){
    if(modo_captura > 0){
        // Se verifica primero si se ha regresado a la resolución en que se empezó a capturar
        if(captura_detenida){
            if(modo_captura == 1 && document.documentElement.clientWidth <= ancho_movil){
                ocultar_modal_modo_captura()
                captura_detenida = false
            }
            if(modo_captura == 2 && document.documentElement.clientWidth > ancho_movil){
                ocultar_modal_modo_captura()
                captura_detenida = false
            }

            if(!captura_detenida) body.classList.remove('evitar_navegacion')
        }
        // Se verifica se siga respetando la resolución en que si inició la captura
        else {
            if(modo_captura == 1 &&  document.documentElement.clientWidth > ancho_movil) {
                if(!captura_detenida) mostrar_modal_modo_captura()
                captura_detenida = true
            }
            
            if(modo_captura == 2 &&  document.documentElement.clientWidth <= ancho_movil) {
                if(!captura_detenida) mostrar_modal_modo_captura()
                captura_detenida = true
            }
        }
    }
}
function mostrar_modal_modo_captura(){
    body.classList.add('evitar_navegacion')
    modal_modo_captura.setAttribute('activo','')
    modal_mensaje.innerText = mensajes_captura_detenida[modo_captura]
}
function ocultar_modal_modo_captura(){
    body.classList.remove('evitar_navegacion')
    modal_modo_captura.removeAttribute('activo')
}


//
//  Archivos subidos
//

const file_logotipo = document.getElementById('file_logotipo')
const file_portada = document.getElementById('file_portada')
const file_galeria_1 = document.getElementById('file_galeria_1')
const file_galeria_2 = document.getElementById('file_galeria_2')
const file_galeria_3 = document.getElementById('file_galeria_3')

let imagen_subida = {}

file_logotipo.addEventListener('change',(evento)=>{ evento_nueva_imagen(evento, 'logotipo',logotipo_empresa) })
file_portada.addEventListener('change',(evento)=>{ evento_nueva_imagen(evento, 'imagen_8:9',imagen_portada) })
file_galeria_1.addEventListener('change',(evento)=>{ evento_nueva_imagen(evento, 'imagen_1:1',imagen_galeria_1) })
file_galeria_2.addEventListener('change',(evento)=>{ evento_nueva_imagen(evento, 'imagen_9:16',imagen_galeria_2) })
file_galeria_3.addEventListener('change',(evento)=>{ evento_nueva_imagen(evento, 'imagen_16:9',imagen_galeria_3) })

function modo_pantalla(){ return document.documentElement.clientWidth <= 850 ? 1 : 2 }
function evento_nueva_imagen(evento, resolucion_imagen, elemento_imagen){
    let archivo = evento.target.files[0]
    // Intercambio de imágenes según la resolución en la que se capturan
    if(modo_pantalla() == 1 ){ 
        if(resolucion_imagen == 'imagen_8:9') resolucion_imagen = 'imagen_16:9'
        else if(resolucion_imagen == 'imagen_16:9') resolucion_imagen = 'imagen_8:9'
    }

    if(leer_imagen(archivo,elemento_imagen,resolucion_imagen)){
        if(modo_captura == 0 && resolucion_imagen != 'logotipo'){
            modo_captura = modo_pantalla()
        }
        if(elemento_imagen.id.includes('imagen_galeria')){cambiar_imagen_carrusel()}
        imagen_subida[resolucion_imagen] = archivo
    } 
}
function leer_imagen(archivo, elemento_imagen, resolucion_imagen){
    if (archivo.type && !archivo.type.startsWith('image/')) {
        mostrar_notificacion(codigo_archivo_no_imagen)
        return false;
    }
    
    if(archivo.size > 1299999){
        const id_redimension = parseInt(Math.random()*10000).toString()
        mostrar_notificacion(codigo_redimensionando_imagen,id_redimension)
        proceso_redimension(archivo, elemento_imagen, resolucion_imagen, id_redimension)
        return false
    }

    const lector = new FileReader();
    lector.addEventListener('load', (event) => {
        elemento_imagen.src = event.target.result;
    });
    lector.readAsDataURL(archivo);
    
    return true
}


//
//  Redimensión de pantalla
//
const imagen_auxiliar = document.getElementById('auxiliar_redimension')

async function proceso_redimension(archivo,elemento_imagen,resolucion_imagen,id_notificacion){
    let canvas = null
    const factor = (1200000/archivo.size)/2

    imagen_auxiliar.src = await imagen_a_DataURL(archivo);

    if(modo_captura == 0 && resolucion_imagen != 'logotipo'){
        modo_captura = modo_pantalla()
    }

    imagen_auxiliar.addEventListener("load",async () => {
        canvas = redimensionar_imagen(imagen_auxiliar,factor)
        elemento_imagen.src = canvas.toDataURL()
        elemento_imagen.addEventListener('load',()=>{ console.log(`Dimensiones finales >> ${elemento_imagen.width}x${elemento_imagen.height}px`) })
        // Si se trata de una imagen de galería se mueve a la siguiente
        if(elemento_imagen.id.includes('imagen_galeria')){cambiar_imagen_carrusel()}
        canvas.toBlob((blob)=>{ imagen_subida[resolucion_imagen] = blob; animacion_eliminar_notificacion(null,id_notificacion)} )
    });
}

function imagen_a_DataURL(archivo) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(reader.result);
    });

    reader.readAsDataURL(archivo);
  });
}

function redimensionar_imagen(imagen_original, factor_redimension = 0.25) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const originalWidth = imagen_original.width;
  const originalHeight = imagen_original.height;

  const canvasWidth = originalWidth * factor_redimension;
  const canvasHeight = originalHeight * factor_redimension;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  context.drawImage(
    imagen_original,
    0,
    0,
    canvasWidth,
    canvasHeight
  );
  return canvas
}

//
//  Modal finalizacion
//
const modal_finalizacion = document.getElementById('modal_finalizacion')
document.getElementById('finalizacion_regresar').addEventListener('click',()=>{ modal_finalizacion.removeAttribute('activo') })