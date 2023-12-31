/*
-----------------------------------------------------  VARIABLES GLOBALES
*/

//Templates para participantes
const priceContent = `
<input readonly value="$" class="simbolo">
<input class="price" type="text" placeholder="100.." onchange="validatePrice(this)" oninput="validatePrice(this)">
`;

const productContainer = `
<div class="product-container">
  <input class="product" type="text" placeholder="Producto.." >
  <div class="price-container">
    ${priceContent}
  </div>
</div>
`;

const URLBASE = "https://nahue-prg.github.io/SplitOrDie/";

//info de participantes cargados en la cuenta
let participantesCargados = [];

/*
-----------------------------------------------------  FUNCIONES
*/

//Validar precio ingresado en input de precios
const validatePrice = (input) => {
  const regex = /^[0-9]+(\.[0-9]{1,2})?$/; // Acepta números enteros o decimales con hasta dos lugares decimales
  const inputValue = input.value;

  const parsedValue = parseFloat(inputValue);

  if (inputValue != "" && isNaN(parsedValue)) {
    input.value = "";
    alert("Ingrese un número válido");
  }
};

//Agregar un nuevo participante
const addTemplate = () => {
  const container = document.getElementById("container");
  const newTemplate = document.createElement("div");
  newTemplate.className = "template container-customer";
  newTemplate.innerHTML = `
      <input class="customer" type="text" placeholder="Nombre participante">
      ${productContainer}
      <button class="button add" onclick="AddInput(this)">
      Agregar gasto
      <i class="fa-solid fa-plus"></i>
    </button>
      <button class="button delete" onclick="deleteTemplate(this)">
        Eliminar
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
  container.appendChild(newTemplate);
};

//Agregar un input exta para ingresar nuevo gasto en un participante
const AddInput = (but) => {
  const template = but.parentElement;
  const product = template.querySelector(".product");
  const newProduct = product.cloneNode(true);
  newProduct.value = "";
  const div = document.createElement("div");
  div.classList.add("product-container");
  div.appendChild(newProduct);

  const divPrice = document.createElement("div");
  divPrice.classList.add("price-container");
  divPrice.innerHTML = priceContent;
  div.appendChild(divPrice);
  template.insertBefore(div, but);
};

//Eliminar a un participante
const deleteTemplate = (button) => {
  const template = button.parentNode;
  const container = document.getElementById("container");
  container.removeChild(template);
};

//mostrar cartel de confirmacion para limpiar tablero
const limpiarTablero = () => {
  cargarParticipantesDesdeHTML();
  if (participantesCargados.length > 0) alertify.confirm('Limpiar tablero', 'Presiona "ok" para eliminar todos los participantes del tablero.', () => { realizarLimpieza() }, () => { return; });
  else generarAlerta("No hay participantes cargados para limpiar");
}

//realizar limpieza de todos los participantes del tablero
const realizarLimpieza = () => {
  const container = document.getElementById("container");
  container.innerHTML = "";
}

//Cargar participantes y sus gastos
const cargarParticipantesDesdeHTML = () => {
  participantesCargados = [];
  //divsConParticipantes
  const templates = document.querySelectorAll(".template");

  templates.forEach((template) => {
    const customerName = template.querySelector(".customer").value;
    const productContainers = template.querySelectorAll(".product-container");

    let participante = new Participante(customerName);

    productContainers.forEach((product) => {
      // Obtener el contenido del input con la clase "product"
      const productName = product.querySelector(".product").value;
      // Obtener el contenido del input con la clase "price"
      let productPrice = product.querySelector(".price").value;

      if (!isNaN(parseFloat(productPrice))) {
        productPrice = parseFloat(productPrice);
        const gasto = new Gasto(productName, productPrice);
        participante.agregarGasto(gasto);
      }
    });

    participantesCargados.push(participante);
  });
};

//cargar participantes ingresados por el usuario con sus gastos y realizar calculo, mostrar pop up con resultado
const cargarParticipantesYCalcular = () => {
  cargarParticipantesDesdeHTML();

  if (!participantesValidos()) {
    generarAlerta("Cargue participantes para calcular");
    return;
  }

  calculate(participantesCargados);
};

//filtrar los participantes validos de los que no lo son, asi como tambien los gastos
const participantesValidos = () => {
  if (participantesCargados.length <= 0) return false;

  participantesCargados = participantesCargados.filter((element) => {
    return (
      //que tenga nombre o que tenga algun producto cargado.. 
      (element.name !== "" && element.name !== null && element.name !== undefined) ||
      element.gas.some((gasto) => gasto.precio !== null && gasto.precio !== undefined && gasto.precio > 0)
    );
  });

  return participantesCargados.length > 0;
}

//filtrar los participantes validos de los que no lo son, asi como tambien los gastos
const participantesValidosParam = (participantes) => {
  if (participantes.length <= 0) return false;

  participantes = participantes.filter((element) => {
    return (
      //que tenga nombre o que tenga algun producto cargado.. 
      (element.name !== "" && element.name !== null && element.name !== undefined) ||
      element.gas.some((gasto) => gasto.precio !== null && gasto.precio !== undefined && gasto.precio > 0)
    );
  });

  return participantes.length > 0;
}

//Realizar calculo con total y mostrarlo en un modal.. 
const calculate = (participantes) => {
  //Validar que existan participantes para calcular.. 
  if (!participantesValidosParam(participantes)) {
    generarAlerta("Cargue participantes validos para realizar el calculo.");
    return;
  }

  const contenedor = document.createElement("div");
  contenedor.classList.add("container-detail");

  //Calcular total por participante y monto a pagar o recibir por cada uno
  let distribucion = calculatePayments(participantes);
  let acordion = generarDetalle(distribucion, participantesCargados);
  let descripciones = generarDescripciones(distribucion);

  contenedor.appendChild(descripciones);

  //Boton para abrir o cerrar detalle de la cuenta
  const button = document.createElement("button");
  button.classList.add("button");
  button.classList.add("blue-2");
  button.innerHTML = "Desplegar detalle <i class='fa-solid fa-list'></i>";
  button.addEventListener("click", () => mostrarDetalle());
  contenedor.appendChild(button);

  const script = document.createElement("script");
  script.src = "scripts/code/accordion.js"
  acordion.appendChild(script);
  contenedor.appendChild(acordion);

  //se agrega total gastado y monto gastado promedio 2022-12-31
  let contenedorTotal = document.createElement("ul");
  let totalGastado = participantes.reduce((totalParticipante, participante) => parseFloat(totalParticipante + participante.gas.reduce((totalGastos, gasto) => parseFloat(totalGastos + gasto.precio),0 )),0);
  let totalPorParticipante = parseFloat( totalGastado / parseFloat(participantes.length));
  contenedorTotal.id = "contenedor-totales";
  contenedorTotal.innerHTML = `
    <li>
      <label class="guion descripcion"></label> Total gastado: $${ Math.round(totalGastado,2)}.
    </li>
    <li>
      <label class="guion descripcion"></label> Total por participante: $${Math.round(totalPorParticipante,2)}.
    </li>
  `;

  contenedor.appendChild(contenedorTotal);
  //termina agregado 2022-12-31

  alertGrande("Resultado", contenedor);
  //Establecerlo con desfasaje temporal de 300 milisegundos debido a que el script para el acordion los cierra automaticamente..  
  setTimeout(() => mostrarDetalle(), 600);
};

//cargar codigo con participantes y gastos (el codigo es un json codificado)
const cargarCodigo = (code) => {
  if (code.length > 0) {
    try {
      let decode = decodificarDatos(code);
      participantesCargados = [];
      participantesCargados = decode.participantes;
      const nombre = document.querySelector("#cuenta-nombre");
      const fecha = document.querySelector("#cuenta-fecha");
      nombre.value = decode.name;
      fecha.value = decode.date;
      generarHTMLdesdeArray();
      calculate(participantesCargados);
      cartelExito("Informacion generada con exitó.");
    } catch (err) {
      generarAlerta("Error al cargar el codigo");
    }
  } else {
    generarAlerta("No se ingreso codigo");
  }
};

//generar estructura html con participantes desde array de participantes con gastos
const generarHTMLdesdeArray = () => {
  const container = document.getElementById("container");
  container.innerHTML = "";
  participantesCargados.forEach((participante) => {
    const newTemplate = document.createElement("div");
    newTemplate.className = "template container-customer";
    newTemplate.innerHTML = `
      <input class="customer" type="text" placeholder="Nombre participante" value="${participante.name}">
      ${participante.gas !== undefined && participante.gas !== null && participante.gas.length > 0 ? participante.gas.map(
      (gasto) =>
        `<div class='product-container'>
          <input class="product" type="text" placeholder="Producto.." value="${gasto.id}" >
          <div class="price-container">
            <input readonly value="$" class="simbolo">
            <input class="price" type="text" placeholder="100.." onchange="validatePrice(this)" oninput="validatePrice(this)" value="${gasto.precio}">
          </div>
        </div>`
    ).join('') : productContainer}
      <button class="button add" onclick="AddInput(this)">
        Agregar gasto
        <i class="fa-solid fa-plus"></i>
      </button>
      <button class="button delete" onclick="deleteTemplate(this)">
      Eliminar
      <i class="fa-solid fa-trash"></i>
    </button>
    `;
    container.appendChild(newTemplate);
  });
};

//compartir por whatsapp el tablero cargado por el usuario
const compartirPorWhatsapp = () => {
  cargarParticipantesDesdeHTML();
  let nombre = document.querySelector("#cuenta-nombre").value;
  let fecha = document.querySelector("#cuenta-fecha").value;

  if (nombre === null || nombre == "") {
    generarAlerta("Ingrese un nombre para continuar..");
    return;
  }

  if (fecha === null || fecha == "") {
    generarAlerta("Ingrese una fecha para continuar");
    return;
  }

  if (participantesCargados.length > 0) {
    alertaEst("Comparti la información de tu tablero!", "<button onclick='enviarWP()' class='button'>Enviar por Whatsapp <i class='fa-brands fa-whatsapp' style='width:25px'></i></button>");
  }
  else {
    generarAlerta("Cargue participantes para continuar.");
  }

};

//copiarle el codigo al usuario automaticamente 
const copiarCodigo = async () => {
  // Suponiendo que datosDecodificados es una cadena de texto
  let datosDecodificados = codificarDatos(participantesCargados);

  try {
    // Intentar copiar el contenido al portapapeles utilizando el Clipboard API
    await navigator.clipboard.writeText(datosDecodificados);
    cartelExito('Datos copiados al portapapeles');
  } catch (err) {
    generarAlerta('Error al intentar copiar los datos al portapapeles', err);
  }
};

//enviar por Whatsapp 
const enviarWP = () => {
  let nombre = document.querySelector("#cuenta-nombre").value;
  let fecha = document.querySelector("#cuenta-fecha").value;
  let gastosCompartidos = new GastosCompartidos(nombre, fecha, participantesCargados);
  let datosDecodificados = codificarDatos(gastosCompartidos);
  const enlaceWhatsApp = `https://wa.me/?text=Haz%20click%20en%20el%20enlace:%20${encodeURIComponent( URLBASE + "?data=" + datosDecodificados)}`;
  window.location.href = enlaceWhatsApp;
}

//intentar obtener la data como query param de la url 
const get = () => {
  try {
    // Obtener la URL completa
    const urlCompleta = window.location.href;

    // Crear una instancia de la clase URL
    const url = new URL(urlCompleta);

    // Obtener los parámetros de consulta
    const queryParams = url.searchParams;

    // Obtener el valor del parámetro "data"
    const valorData = queryParams.get("data");
    let json = decodificarDatos(valorData);
    participantesCargados = json.participantes;
    const nombre = document.querySelector("#cuenta-nombre");
    const fecha = document.querySelector("#cuenta-fecha");
    nombre.value = json.name;
    fecha.value = json.date;
    generarHTMLdesdeArray();
    calculate(participantesCargados);
  } catch (err) {
    //console.log(err);
  }
}

//ingresar codigo generador / no se esta usando
const ingresarCodigoGenerador = () => {
  /*
   * @title {String or DOMElement} The dialog title.
   * @message {String or DOMElement} The dialog contents.
   * @value {String} The default input value. 
   * @onok {Function} Invoked when the user clicks OK button.
   * @oncancel {Function} Invoked when the user clicks Cancel button or closes the dialog.
   *
   * alertify.prompt(title, message, value, onok, oncancel);
   * 
   */
  alertify.prompt('Codigo generador de información', 'Ingrese el codigo:', ''
    , function (evt, value) {
      cargarCodigo(value);
    }
    , null);

}

//obtener fecha actual
const fechaActual = () => {
  return new Date().toISOString().split('T')[0];
}

//lanzar pop up con informacion
const MostrarInfo = () => {
  alertGrande("Información", "Desarrollado por Nahuel Maquieyra <i class='fa-solid fa-user-ninja'></i> <br/><br/><a href='https://www.linkedin.com/in/nahuel-maquieyra-69b774253/'> Linkedin <i class='fa-brands fa-linkedin'></i></a><br/><br/><a href='https://github.com/nahue-prg'> Github <i class='fa-brands fa-github-alt'></i></a> <br/><br/><i class='fa-solid fa-wand-magic-sparkles'></i> Dividir gastos, guardar gastos, calcular multiples divisiones de gastos.<br/><br/><i class='fa-solid fa-calendar-days'></i>  2023/12");
}

//guardar calculo en storage 
const guardarCalculo = () => {
  try {
    cargarParticipantesDesdeHTML();
    if (!participantesValidos()) generarAlerta("No hay participantes cargados para guardar..");

    let nombre = document.querySelector("#cuenta-nombre").value;
    let fecha = document.querySelector("#cuenta-fecha").value;

    if (nombre === null || nombre == "") {
      generarAlerta("Ingrese un nombre de cuenta para continuar..");
      return;
    }

    if (fecha === null || fecha == "") {
      generarAlerta("Ingrese una fecha para continuar..");
      return;
    }

    let calculo = new GastosCompartidos(nombre, fecha, participantesCargados);

    if (Storage_cuentaExiste(calculo.name, calculo.date)) {
      alertify.confirm('Modificar cuenta', 'Ya existe una cuenta guardada con el mismo nombre y fecha, presione "ok" para modificarla.', () => { modificarCuenta(calculo) }, () => { return; });
    }
    else {
      Storage_agregarElemento(calculo);
      alertaEst("Guardado", "Gasto almacenado con exitó! Podes visualizarla desde el menu en la opcion 'Gastos guardados'");
      cartelExito("Cuenta guardada con exitó");
    }
  }
  catch (err) {
    console.log(err);
    generarAlerta("Ocurrio un error al guardar la cuenta");
  }
}

//cargar una cuenta del storage para edicion por el usuario
const modificarCuenta = (cuentas) => {
  try {
    Storage_eliminarCuentaPorID(cuentas.name, cuentas.date);
    Storage_agregarElemento(cuentas);
    cartelExito("Cuenta guardada con exitó");
  }
  catch (err) {
    console.log(err);
    generarAlerta("Ocurrio un error al guardar la cuenta");
  }
}


//Al iniciar la pagina.. 
document.addEventListener('DOMContentLoaded', function() {
  //establecer fecha actual
  try { 
    const calendario = document.getElementById('cuenta-fecha');
    calendario.value = fechaActual();
  } catch (err) { }

  //obtener query params si existen
  get();
});







