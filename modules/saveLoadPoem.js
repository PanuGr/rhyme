export function savePoem(poem) {
    if (!poem) {
        console.log('empty');
    } else {
        try {
            localStorage.setItem('SavedPoem', poem);
            saveTextBtn.textContent = "Saved!";
        } catch (error) {
            saveTextBtn.textContent = "error";
        }
    }

}

export function loadPoem() {
    const textareaElement = document.getElementById('textarea');

    try {
        let savedPoem = localStorage.getItem('SavedPoem');
        if (savedPoem) {
            textareaElement.value = savedPoem;
        }
    } catch (error) {
        console.log(error);
    }
}