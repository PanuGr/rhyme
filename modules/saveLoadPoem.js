const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function savePoem(poem, saveBtn) {
    if (!poem) {
        console.log('empty');
    } else {
        try {
            const now = new Date().getTime();
            const poemData = {
                text: poem,
                timestamp: now
            };
            localStorage.setItem('SavedPoem', JSON.stringify(poemData));
            if (saveBtn) saveBtn.textContent = "Saved!";
        } catch (error) {
            if (saveBtn) saveBtn.textContent = "error";
            console.error("Error saving poem:", error);
        }
    }
}

export function loadPoem() {
    const textareaElement = document.getElementById('textarea');
    //textareaElement.value = "";
    try {
        const savedPoem = localStorage.getItem('SavedPoem');

        if (savedPoem !== null) {
            const poemData = JSON.parse(savedPoem);
            const now = new Date().getTime();

            if (now - poemData.timestamp > EXPIRATION_TIME_MS) {
                localStorage.removeItem('SavedPoem');
                console.log('Poem expired and was deleted.');
            } else {
                textareaElement.value = poemData.text;
            }
        }
    } catch (error) {
        console.log(error);
    }
}