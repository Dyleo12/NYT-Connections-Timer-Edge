window.addEventListener('load', () => {
    let targetButton = document.querySelector('button[data-testid="moment-btn-play"]');
    let gameDateSpan = document.querySelector('#portal-game-date');

    if (targetButton && gameDateSpan) {
        // Create the timer container
        let timerContainer = document.createElement('div');
        timerContainer.id = 'timerContainer';
        timerContainer.style.display = 'flex';
        timerContainer.style.alignItems = 'center';
        timerContainer.style.marginLeft = '20px';

        // Create the timer display
        let timerDiv = document.createElement('div');
        timerDiv.id = 'timer';
        timerDiv.innerText = '0.000';
        timerDiv.style.fontSize = '1em';
        timerDiv.style.marginRight = '10px';

        // Create the pause button
        let pauseButton = document.createElement('button');
        pauseButton.id = 'pauseButton';

        // Get the URL of the pause_icon.png file in the extension's images directory
        let imageURL = chrome.runtime.getURL('images/pause_icon.png');
        pauseButton.innerHTML = `<img src="${imageURL}" alt="Pause" style="width:20px;height:20px;">`;
        pauseButton.style.border = 'none';
        pauseButton.style.background = 'transparent';
        pauseButton.style.cursor = 'pointer';
        pauseButton.style.display = 'none';

        timerContainer.appendChild(timerDiv);
        timerContainer.appendChild(pauseButton);
        gameDateSpan.parentNode.appendChild(timerContainer);

        // Create the overlay
        let overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.99)';
        overlay.style.zIndex = '999';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);

        let resumeText = document.createElement('div');
        resumeText.innerText = 'Resume game?';
        resumeText.style.fontSize = '2em';
        resumeText.style.marginBottom = '20px';
        overlay.appendChild(resumeText);

        let resumeButton = document.createElement('button');
        resumeButton.id = 'resumeButton';
        let playButtonURL = chrome.runtime.getURL('images/play.png');
        resumeButton.innerHTML = `<img src="${playButtonURL}" alt="Play" style="width:200px;height:200px;">`;
        resumeButton.style.background = 'transparent';
        resumeButton.style.border = '0px';
        overlay.appendChild(resumeButton);

        let overlayTimer = document.createElement('div');
        overlayTimer.id = 'overlayTimer';
        overlayTimer.style.fontSize = '2em';
        overlayTimer.style.marginTop = '20px';
        overlay.appendChild(overlayTimer);

        let timer;
        let milliseconds = 0;
        let isPaused = false;

        targetButton.addEventListener('click', () => {
            pauseButton.style.display = '';
            clearInterval(timer);
            milliseconds = 0;
            isPaused = false;
            document.getElementById('timer').innerText = formatTime(milliseconds);
            timer = setInterval(() => {
                if (!isPaused) {
                    milliseconds += 10;
                    document.getElementById('timer').innerText = formatTime(milliseconds);
                }
            }, 10);
        });

        pauseButton.addEventListener('click', () => {
            isPaused = !isPaused;
            overlay.style.display = isPaused ? 'block' : 'none'; // Toggle overlay visibility
            if (isPaused) {
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlayTimer.innerText = document.getElementById('timer').innerText;
            }
        });


        resumeButton.addEventListener('click', () => {
            isPaused = !isPaused;
            overlay.style.display = isPaused ? 'flex' : 'none'; // Toggle overlay visibility
        });

        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added node is the "View Results" button
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.innerText === 'View Results') {
                            console.log('Game has ended');
                            isPaused = !isPaused;
                            clearInterval(timer);
                            pauseButton.style.display = 'none';
                            observer.disconnect(); // Stop observing once done
                        }
                    });
                }
            }
        });

        // Start observing changes in the body (or specific target where the button appears)
        observer.observe(document.body, { childList: true, subtree: true });

    } else {
        console.error('Button with data-testid "moment-btn-play" or span with id "portal-game-date" not found.');
    }
});

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let displayMilliseconds = ms % 1000;
    let displaySeconds = totalSeconds % 60;
    let displayMinutes = Math.floor(totalSeconds / 60);

    return `${displayMinutes}:${String(displaySeconds).padStart(2, '0')}.${String(displayMilliseconds).padStart(3, '0')}`;
}
