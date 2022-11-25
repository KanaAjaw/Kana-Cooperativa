export function recuperar_identificador_unico(){
    const parametros_url = new URLSearchParams(window.location.search)
    let idu = ''
    if(parametros_url.has('idu')){
        for(const [llave,valor] of parametros_url.entries()) if(llave == 'idu') idu=valor
        return idu
    }
    return false
}

export function redirigir_con_idu(pagina_landing_page, id_unico){
    if(id_unico)
        window.location.replace(`https://kanacooperativa.com.mx/landing_page/${pagina_landing_page}?idu=${id_unico}`) 
    else
        window.location.replace(`https://kanacooperativa.com.mx/landing_page/${pagina_landing_page}`)
}

export function scroll_hacia(elemento,padding_top=0){
    let posicion = elemento.offsetTop-padding_top;
    window.scrollTo({ top: posicion, behavior: 'smooth'});
}