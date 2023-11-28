const CUENTAS_NOMBRE = "Cuentas";

const Storage_agregarElemento = (nuevoElemento) => {
    let array = Storage_obtenerItem(CUENTAS_NOMBRE);
    if(array === null) array = []; 
    array.push(nuevoElemento);
    Storage_guardarItem(CUENTAS_NOMBRE, array);
}  

const Storage_guardarItem = (nombre,valor) => {
    let valorG = JSON.stringify(valor);
    localStorage.setItem(nombre,valorG);
}

const Storage_obtenerItem = (nombre) => {
    let valor = localStorage.getItem(nombre)
    let val2 =  JSON.parse(valor);
    return val2;
}

const Storage_existe = (nombre) => {
    return localStorage.getItem(nombre) !== null;
}

const Storage_cuentaExiste = (nombre, fecha) => {
    let cuentas = Storage_obtenerItem(CUENTAS_NOMBRE);
    if (cuentas  === null) return false;
    let cuenta = cuentas.find(item => item.name === nombre && item.date === fecha);
    return cuenta !== null && cuenta !== undefined;
}


const Storage_obtenerCuentas = () => {
    let valor = Storage_obtenerItem(CUENTAS_NOMBRE);
    return valor;
}

// const Storage_guardarNuevaCuenta = (valor) => {
//     Storage_agregarElemento(CUENTAS_NOMBRE,valor);
// }

const Storage_eliminarCuenta = (cuenta) => {
    let cuentas = Storage_obtenerItem(CUENTAS_NOMBRE);

    if (cuentas !== null) {
        cuentas = cuentas.filter(item => !(item.name === cuenta.name && item.date === cuenta.date));
    }
    Storage_guardarItem(CUENTAS_NOMBRE, cuentas);
}

const Storage_eliminarCuentaPorID = (nombre, fecha) => {
    let cuentas = Storage_obtenerItem(CUENTAS_NOMBRE);
    if (cuentas !== null) {
        cuentas = cuentas.filter(item => !(item.name === nombre && item.date === fecha));
    }

    Storage_guardarItem(CUENTAS_NOMBRE, cuentas);
}

const Storage_buscarCuentaPorID = (nombre, fecha) => {
    let cuentas = Storage_obtenerItem(CUENTAS_NOMBRE);
    let cuenta = null;

    if (cuentas !== null) {
        cuenta = cuentas.find(item => item.name === nombre && item.date === fecha);
    }

    return cuenta;
}

const Storage_modificarCuenta = (nombre, fecha) => {
    let cuenta = Storage_buscarCuentaPorID(nombre, fecha);
    if(cuenta === null) {
        generarAlerta("No se encontro la cuenta indicada");
        return
    };
    let cuentaCodificada = codificarDatos(cuenta);
    const enlace = `${"https://nahue-prg.github.io/SplitOrDie" + "/?data=" + cuentaCodificada}`;
    window.location.href = enlace;
}