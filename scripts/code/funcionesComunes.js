const codificarDatos = (participantes) => {
    // Convertir los datos a una cadena JSON
    let datosJSON = JSON.stringify(participantes);
  
    // Codificar los datos comprimidos en base64
    let datosCodificados = btoa(datosJSON);
  
    datosCodificados = encodeURIComponent(datosCodificados)
  
    console.log("Datos codificados");
    console.log(datosCodificados);
  
    return datosCodificados;
  };
  
  const decodificarDatos = (datosCodificados) => {
    // Decodificas la cadena para obtener el JSON original
    datosCodificados = decodeURIComponent(datosCodificados);
  
    // Decodificar los datos en base64
    datosCodificados = atob(datosCodificados);
  
    // Convertir los datos a un objeto JSON
    let datosJSON = JSON.parse(datosCodificados);
  
    // Puedes utilizar el objeto de datos según tus necesidades
    console.log("Datos decodificados");
    console.log(datosJSON);
  
    return datosJSON;
  };

  
const alertGrande = (titulo, contenido) => {
    alertify.alert().set({ 'startMaximized': true, 'message': contenido, 'title': titulo }).show();
  }
  
  const alertaEst = (titulo, mensaje) => {
    /*
     * @title {String or DOMElement} The dialog title.
     * @message {String or DOMElement} The dialog contents.
     *
     * alertify.alert(title, message);
     *
     */
    alertify.alert().set({ 'startMaximized': false, 'message': mensaje, 'title': titulo }).show();
  }
  
  const generarAlerta = (alerta) => {
    alertify.error(alerta);
  }
  
  const cartelExito = (mensaje) => {
    alertify.success(mensaje);
  }