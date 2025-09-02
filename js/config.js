const FIREBASE_DB_URL = 'https://estoque-c4f41-default-rtdb.firebaseio.com/products.json';

let WHATSAPP_NUMBER = '5511999999999';

function getWhatsAppNumber() {
    const savedNumber = localStorage.getItem('whatsappContact');

    if (savedNumber && isValidPhoneNumber(savedNumber)) {
        WHATSAPP_NUMBER = savedNumber; // substitui pelo salvo
    }

    return WHATSAPP_NUMBER;
}

function isValidPhoneNumber(number) {
    return /^\d{10,13}$/.test(number);
}

// Exemplo de uso:
