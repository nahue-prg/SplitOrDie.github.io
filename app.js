// import { Gasto, Participante } from './scripts/models/Participante.js';

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
      <button class="button add" onclick="AddInput(this)">Agregar gasto</button>
      <button class="button delete" onclick="deleteTemplate(this)">Eliminar participante</button>
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

//Realizar calculo con total a pagar o recibir por participante
const calculate = () => {
  // Inserta el total por cada cliente como último hijo del elemento con clase container-button
  const containerButton = document.querySelector("#totales");
  containerButton.innerHTML = "";

  var distribucion = calculatePayments(participantesCargados);

  distribucion.forEach((result) => {
    const totalElement = document.createElement("p");
    let tot = result.amount < 0 ? result.amount * -1 : result.amount;
    totalElement.innerHTML =
      "<b>" +
      result.customer +
      "</b>" +
      " - " +
      (result.amount < 0 ? "Recibe " : "Paga ") +
      "$" +
      tot;
    containerButton.appendChild(totalElement);
  });

  console.log(participantesCargados);
  codificarDatos();
  //compartirPorWhatsApp(datos);
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

const codificarDatos = () => {
  // Convertir los datos a una cadena JSON
  var datosJSON = JSON.stringify(participantesCargados);

  // Codificar los datos comprimidos en base64
  var datosCodificados = btoa(datosJSON);

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

const cargarCodigo = () => {
  const code = document.querySelector("#code").value;
  if (code.length > 0) {
    var decode = decodificarDatos(code);
    console.log("Codigo decodificado");
    try {
      participantesCargados = [];
      participantesCargados = decode;
      generarHTMLdesdeArray();
      calculate();
    } catch (err) {
      alert(
        "No fue posible cargar el codigo ingresado, verifique el codigo y vuelva a intentarlo"
      );
    }
  } else {
    alert("el codigo ingresado no es valido");
  }
};

const generarHTMLdesdeArray = () => {
  const container = document.getElementById("container");
  container.innerHTML = "";
  participantesCargados.forEach((participante) => {
    const newTemplate = document.createElement("div");
    newTemplate.className = "template container-customer";
    newTemplate.innerHTML = `
      <input class="customer" type="text" placeholder="Nombre participante" value="${
        participante.name
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
      <button class="button add" onclick="AddInput(this)">Agregar gasto</button>
      <button class="button delete" onclick="deleteTemplate(this)">Eliminar participante</button>
    `;
    container.appendChild(newTemplate);
  });
};

const compartirPorWhatsapp = () => {
  cargarParticipantesDesdeHTML();
  let datosDecodificados = codificarDatos(participantesCargados);
  // Construir el enlace de WhatsApp con el mensaje prellenado
  const enlaceWhatsApp = `https://wa.me/?text=Ingresa a ${paginaWeb + "?data=" + datosDecodificados}`;
  // Abrir la aplicación de WhatsApp
  window.location.href = enlaceWhatsApp;
};

const get = () =>{
  try{
  // Obtener la URL completa
  const urlCompleta = window.location.href;

  // Crear una instancia de la clase URL
  const url = new URL(urlCompleta);

  // Obtener los parámetros de consulta
  const queryParams = url.searchParams;

  // Obtener el valor del parámetro "data"
  const valorData = queryParams.get("data");
  let json = decodificarDatos(valorData);
  participantesCargados = json;
  generarHTMLdesdeArray();

  //console.log("Valor de 'data':", valorData);
}catch(err){
  console.log(err);
}
}


get();