document.addEventListener('DOMContentLoaded', () => {

    // Adiciona o ano atual no rodapé
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    const captureWhatsAppNumberFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const whatsappNumber = urlParams.get('whatsapp');

        if (whatsappNumber) {
            if (/^\d+$/.test(whatsappNumber)) {
                localStorage.setItem('whatsappContact', whatsappNumber);
                console.log(`Número de WhatsApp ${whatsappNumber} foi salvo.`);
            }
        }
    };

    // Executa a função ao carregar a página
    captureWhatsAppNumberFromURL();
});