/*
VARIABLES GLOBALES
*/
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

let participantesCargados = [];

const paginaWeb = "https://nahue-prg.github.io/GastosCompartidos/";

/*
FUNCIONES
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

const limpiarTablero = () => {
  cargarParticipantesDesdeHTML();
  if (participantesCargados.length > 0) alertify.confirm('Limpiar tablero', 'Presiona "ok" para eliminar todos los participantes del tablero.', () => { realizarLimpieza() }, () => { return; });
  else generarAlerta("No hay participantes cargados para limpiar");
}

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

const cargarParticipantesYCalcular = () => {
  cargarParticipantesDesdeHTML();
  calculate();
};

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

//Realizar calculo con total y mostrarlo en un modal.. 
const calculate = () => {

  //Validar que existan participantes para calcular.. 
  if (!participantesValidos()) {
    generarAlerta("Cargue participantes para calcular");
    return;
  }

  const contenedor = document.createElement("div");
  contenedor.classList.add("container-detail");

  //Calcular total por participante y monto a pagar o recibir por cada uno
  let distribucion = calculatePayments(participantesCargados);
  let acordion = generarDetalle(distribucion);
  let descripciones = generarDescripciones(distribucion);

  contenedor.appendChild(descripciones);

  //Boton para abrir o cerrar detalle de la cuenta
  const button = document.createElement("button");
  button.classList.add("button");
  button.classList.add("blue");
  button.textContent = "Desplegar detalle";
  button.addEventListener("click", () => mostrarDetalle());
  contenedor.appendChild(button);

  //acordion con detalle de la cuenta y script para manejo de eventos click

  const script = document.createElement("script");
  script.src = "scripts/code/accordion.js"
  acordion.appendChild(script);
  contenedor.appendChild(acordion);
  alertGrande("Resultado", contenedor);
  //Establecerlo con desfasaje temporal de 150 milisegundos debido a que el script para el acordion los cierra automaticamente..  
  setTimeout(() => mostrarDetalle(), 150);
};

const generarDescripciones = (distribucion) => {
  /*distibucion = [{customer: x ,amount: 1}]
  Si amount es negativo recibe, si es positivo paga
  */
  let deudores = [];
  let cobradores = [];
  let descripciones = [];

  distribucion.forEach((participante) => {
    //Si es 0 esta saldado
    if (participante.amount > 0) {
      deudores.push(participante)
    }
    else if (participante.amount < 0) {
      cobradores.push(participante)
    }
  });

  //por cada cobrador
  cobradores.forEach((cobrador) => {
    //por cada cobrador -- mientras sea negativo le deben
    if (cobrador.amount < 0) {
      deudores.forEach((deudor) => {

        //if(cobrador.amount >= 0)return; 

        if (deudor.amount > 0) {
          //Es mayor o igual el cobro que la deuda
          if (deudor.amount <= (cobrador.amount * -1)) {
            let valor = Math.round(deudor.amount, 2);
            if (valor > 0) {
              descripciones.push(`  - ${deudor.customer} paga $${valor} a ${cobrador.customer}.`);
              cobrador.amount += deudor.amount;
              deudor.amount = 0;
            }
          }
          //Es mayor la deuda que el cobro
          else {
            let valor = Math.round(cobrador.amount * -1, 2);
            if (valor > 0) {
              descripciones.push(`  - ${deudor.customer} paga $${valor} a ${cobrador.customer}.`);
              deudor.amount -= (cobrador.amount * -1);
              cobrador.amount = 0;
            }
          }
        }
      });
    }
  });

  const contenedor = document.createElement("div");
  contenedor.classList.add("descripciones-container");

  const lista = document.createElement("ul"); // Puedes usar también <ol> para una lista ordenada
  contenedor.appendChild(lista);
  const titulo = document.createElement("li");
  titulo.innerText = "Pasos para saldar deuda.";
  lista.appendChild(titulo);

  descripciones.forEach((descripcion) => {
    const elementoLista = document.createElement("li");
    const parrafo = document.createElement("p");
    parrafo.textContent = descripcion;

    elementoLista.appendChild(parrafo);
    lista.appendChild(elementoLista);
  });

  return contenedor;
}

const generarDetalle = (distribucion) => {
  const acordion = document.createElement("div");
  acordion.classList.add("container");
  acordion.classList.add("collapse");
  distribucion.forEach((result) => {
    //Encontrar al participante para cargar detalle de gastos
    let participante = participantesCargados.find(participante => participante.name == result.customer);
    let tot = result.amount < 0 ? result.amount * -1 : result.amount;
    let detalle = document.createElement("details");
    detalle.innerHTML =
      `
    <summary>${result.customer} - ${(result.amount < 0 ? "Recibe " : "Paga ")} $${tot}</summary>
    <div class="details-wrapper">
      <div class="details-styling">        
        ${participante.gas.length > 0 ? participante.gas.map((gasto) => `<p>- ${gasto.id} - $${gasto.precio}</p>`).join('') : "<p>Sin gastos.</p>"}
      </div>
    </div>
  `;
    acordion.appendChild(detalle);
  });

  return acordion;
}

const mostrarDetalle = () => {
  try {
    const detalles = document.querySelectorAll("details");

    // Obtener el último detalle
    const ultimoDetalle = detalles[detalles.length - 1];

    // Verificar si el último detalle tiene el atributo 'open'
    const ultimoTieneOpen = ultimoDetalle && ultimoDetalle.hasAttribute("open");

    detalles.forEach((detalle) => {
      if (ultimoTieneOpen) {
        // Si el último detalle tiene 'open', eliminamos el atributo en todos
        detalle.removeAttribute("open");
      } else {
        // Si el último detalle no tiene 'open', agregamos el atributo en todos
        detalle.setAttribute("open", "");
      }
    });
  } catch (err) {
    console.log("Ocurrió un error al mostrar detalle: " + err);
  }
};

//Calcular por cada participante el monto adeudado o a cobrar
const calculatePayments = (participantsArray) => {
  const totalExpenses = participantsArray.reduce((sum, participant) => {
    // Calcular el total de gastos para cada participante
    const participantTotal = participant.gas.reduce(
      (total, expense) => total + expense.precio,
      0
    );
    return sum + participantTotal;
  }, 0);

  const numberOfParticipants = participantsArray.length;
  const averageExpense = totalExpenses / numberOfParticipants;

  // Calcular la deuda o el pago para cada participante
  const payments = participantsArray.map((participant) => {
    const participantTotal = participant.gas.reduce(
      (total, expense) => total + expense.precio,
      0
    );
    const debtPayment = averageExpense - participantTotal;
    return { customer: participant.name, amount: Math.round(debtPayment, 2) };
  });

  return payments;
};

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
      calculate();
      cartelExito("Informacion generada con exitó.");
    } catch (err) {
      generarAlerta("Error al cargar el codigo");
    }
  } else {
    generarAlerta("No se ingreso codigo");
  }
};

const generarHTMLdesdeArray = () => {
  const container = document.getElementById("container");
  container.innerHTML = "";
  participantesCargados.forEach((participante) => {
    const newTemplate = document.createElement("div");
    newTemplate.className = "template container-customer";
    newTemplate.innerHTML = `
      <input class="customer" type="text" placeholder="Nombre participante" value="${participante.name
      }">
      ${participante.gas !== undefined && participante.gas !== null && participante.gas.length > 0 ? participante.gas.map(
        (gasto) => `<div class='product-container'>
      <input class="product" type="text" placeholder="Producto.." value="${gasto.id}" >
      <div class="price-container">
        <input readonly value="$" class="simbolo">
        <input class="price" type="text" placeholder="100.." onchange="validatePrice(this)" oninput="validatePrice(this)" value="${gasto.precio}">
      </div>
      </div>`
      ) : productContainer}
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

const compartirPorWhatsapp = () => {
  cargarParticipantesDesdeHTML();
  if (participantesCargados.length > 0) {
    alertaEst("Comparti la información de tu tablero!", "<button onclick='enviarWP()' class='button'>Via Whatsapp <i class='fa-brands fa-whatsapp' style='width:25px'></i></button>");
    // alertaEst("Comparti la información de tu tablero!", "<button onclick='enviarWP()' class='button'>Via Whatsapp <i class='fa-brands fa-whatsapp' style='width:25px'></i></button> o <button onclick='copiarCodigo()' class='button blue'>Copiar codigo <i class='fa-solid fa-code'></i></button>");
  }
  else {
    generarAlerta("Cargue participantes para continuar.");
  }

};

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

const enviarWP = () => {
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

  let gastosCompartidos = new GastosCompartidos(nombre, fecha, participantesCargados);
  let datosDecodificados = codificarDatos(gastosCompartidos);
  const enlaceWhatsApp = `https://wa.me/?text=Ingresa al sitio ${window.location.origin + "/?data=" + datosDecodificados}`;
  window.location.href = enlaceWhatsApp;
}

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
  } catch (err) {
    console.log(err);
  }
}

get();


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

const fechaActual = () => {
  return new Date().toISOString().split('T')[0];
}

const MostrarInfo = () => {
  alertGrande("Informacion del proyecto", "Aca se deberian mostrar los integrantes..");
}

const guardarCalculo = () => {
  try {
    cargarParticipantesDesdeHTML();
    if (!participantesValidos()) generarAlerta("No hay participantes cargados para guardar..");

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

    let calculo = new GastosCompartidos(nombre, fecha, participantesCargados);

    if (Storage_cuentaExiste(calculo.name, calculo.date)) {
      alertify.confirm('Modificar cuenta', 'Ya existe una cuenta guardada con el mismo nombre y fecha, presione "ok" para modificarla.', () => { modificarCuenta(calculo) }, () => { return; });
    }
    else{
      Storage_agregarElemento(calculo);
      cartelExito("Cuenta guardada con exitó");
    }
  }
  catch (err) {
    console.log(err);
    generarAlerta("Ocurrio un error al guardar la cuenta");
  }
}

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


try { document.getElementById('cuenta-fecha').value = fechaActual(); } catch (err) { }
