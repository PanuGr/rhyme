export async function sharePoem(poem) {
    await navigator.share({
        title: 'My poem with RhymeAi',
        text: poem,
        url: window.location.href,
    });
}