import CryptoJS from 'crypto-js';
// <script tag="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
window.CryptoJS = CryptoJS;
console.log("REALOADING");

async function decrypt() {
    const password = document.getElementById('password').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch('secrets.json');
        const encryptedSecrets = await response.json();

        let found = false;

        for (const encryptedText of encryptedSecrets) {
            try {
                const decrypted = CryptoJS.AES.decrypt(encryptedText, password).toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    resultDiv.textContent = `Decrypted text: ${decrypted}`;
                    found = true;
                    break;
                }
            } catch (e) {
                // Continue if decryption fails for a given text
            }
        }

        if (!found) {
            resultDiv.textContent = 'FAILED! Try better! (invalid password)';
        }
    } catch (error) {
        resultDiv.textContent = 'Error loading secrets.';
        console.error(error);
    }
}

window.decrypt = decrypt;

