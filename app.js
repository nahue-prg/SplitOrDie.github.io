const validatePrice = (input) => {
    const regex = /^[0-9]+(\.[0-9]{1,2})?$/; // Acepta números enteros o decimales con hasta dos lugares decimales
    const inputValue = input.value;
    
    const parsedValue = parseFloat(inputValue);
  
    if (inputValue != "" && isNaN(parsedValue)) {
      input.value= "";
      alert('Ingrese un número válido')
    }
  };
  
  const addTemplate = () => {
    const container = document.getElementById("container");
    const newTemplate = document.createElement("div");
    newTemplate.className = "template container-customer";
    newTemplate.innerHTML = `
      <input class="customer" type="text" placeholder="Participante..">
      <input class="price" type="text" placeholder="$.." onchange="validatePrice(this)" oninput="validatePrice(this)">
      <button class="button add" onclick="AddInput(this)">Agregar gasto</button>
      <button class="button delete" onclick="deleteTemplate(this)">Eliminar participante</button>
    `;
    container.appendChild(newTemplate);
  }
  
  const AddInput = (but) => {
    const template = but.parentElement;
    const priceInput = template.querySelector('.price');
    const newPriceInput = priceInput.cloneNode(true);
    newPriceInput.value = ''; // Limpia el valor del nuevo input, si es necesario
    template.insertBefore(newPriceInput, but);
  }
  
  const deleteTemplate = (button) => {
    const template = button.parentNode;
    const container = document.getElementById("container");
    container.removeChild(template);
  }
  
  const calculate = () => {
    const templates = document.querySelectorAll('.template');
    const resultArray = [];
  
    templates.forEach((template) => {
      const customerName = template.querySelector('.customer').value;
      const priceInputs = template.querySelectorAll('.price');
      
      let total = 0;
  
      priceInputs.forEach((input) => {
        const inputValue = parseFloat(input.value) || 0; // Convierte a float o usa 0 si no es un número válido
        total += inputValue;
      });
  
      resultArray.push({ customer: customerName, total: Math.round(total,2) });
    });
  
    // Inserta el total por cada cliente como último hijo del elemento con clase container-button
    const containerButton = document.querySelector('#totales');  
    containerButton.innerHTML = "";
    
    var distribucion = calculatePayments(resultArray);
    
    distribucion.forEach((result) => {
      const totalElement = document.createElement('p');
      let tot = result.amount < 0 ? result.amount * -1 : result.amount;
      totalElement.innerHTML = "<b>" + result.customer + "</b>" + " - "  +(result.amount < 0 ? "Recibe " : "Paga ") + "$" + tot ;   
      containerButton.appendChild(totalElement);
    });
  };
  
  const calculatePayments = (totalsArray) => {
    const totalGastos = totalsArray.reduce((sum, participant) => sum + participant.total, 0);
    const cantidadParticipantes = totalsArray.length;
    const pagoPromedio = totalGastos / cantidadParticipantes;
  
    // Calcular la deuda o el pago para cada participante
    const payments = totalsArray.map((participant) => {
      const deudaPago = pagoPromedio - participant.total;
      return { customer: participant.customer, amount: deudaPago };
    });
  
    return payments;
  };

