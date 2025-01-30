export const encouragements = [
    "Oui !",
    "Bravo !",
    "C'est ça !",
    "Exactement !",
    "Quel talent !",
    "Tu es trop fort !",
    "Bien joué !",
    "Continue comme ça !",
    "Tu gères !",
    "Tu es incroyable !",
    "Félicitations !",
    "Superbe travail !",
    "Impressionnant !",
    "Tu es un champion !",
    "Tu es au top !",
    "Yes",
    "La classe la miss",
    "JPP de ton talent",
    "Tu gères sa race",
    "Tu es un demi dieu"
];

export function encourage() {
    const utterance = new SpeechSynthesisUtterance(getRandomEncouragement());
    utterance.lang = "fr-FR";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function getRandomEncouragement() {
    const randomIndex = Math.floor(Math.random() * encouragements.length);
    return encouragements[randomIndex];
}