async function getPlaylistDuration() {
    const playlistUrl = document.getElementById('playlistUrl').value;
    const playlistId = playlistUrl.split('list=')[1];

    if (!playlistId) {
        displayErrorMessage("Please provide valid yt url.");
        return;
    }

    const apiKey = 'AIzaSyDTlEFC7xyqkVovhXEfpV-DCfaU4Xx5GjM'; 
    let totalDuration = 0;
    let totalVideos = 0;
    let nextPageToken = '';
    document.getElementById("btn").innerText = "Calculating...";

    try {
        const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`);
        const playlistData = await playlistResponse.json();

        if (!playlistResponse.ok || !playlistData.items || playlistData.items.length === 0) {
            displayErrorMessage("Unable to retrieve playlist details. plz provide valid url");
            return;
        }

        const playlistTitle = playlistData.items[0].snippet.title;
        const totalVideosCount = playlistData.items[0].contentDetails.itemCount;

        do {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&pageToken=${nextPageToken}&key=${apiKey}`);
            const data = await response.json();

            if (!response.ok || !data.items || data.items.length === 0) {
                displayErrorMessage("Unable to retrieve playlist items. Please check the playlist URL and try again.");
                return;
            }

            const videoIds = data.items.map(item => item.contentDetails.videoId).join(',');
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`);
            const videoData = await videoResponse.json();

            if (!videoResponse.ok || !videoData.items || videoData.items.length === 0) {
                displayErrorMessage("Unable to retrieve video details. Please check the playlist URL and try again.");
                return;
            }

            videoData.items.forEach(video => {
                const duration = video.contentDetails.duration;
                totalDuration += convertDuration(duration);
                totalVideos++;
            });

            nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        const avgDuration = totalDuration / totalVideos;

        document.getElementById('playlistTitle').innerText = `Playlist Title: ${playlistTitle}`;
        document.getElementById('videoCount').innerText = `Number of Videos: ${totalVideosCount}`;
        document.getElementById('avgDuration').innerText = `Average Video Length: ${formatDuration(avgDuration)}`;
        document.getElementById('totalDuration').innerText = `Total Playlist Duration: ${formatDuration(totalDuration)}`;

        document.getElementById('duration125x').innerText = `At 1.25x: ${formatDuration(totalDuration / 1.25)}`;
        document.getElementById('duration15x').innerText = `At 1.5x: ${formatDuration(totalDuration / 1.5)}`;
        document.getElementById('duration175x').innerText = `At 1.75x: ${formatDuration(totalDuration / 1.75)}`;
        document.getElementById('duration2x').innerText = `At 2x: ${formatDuration(totalDuration / 2)}`;

        document.getElementById('result').style.display = 'block'; 
        document.getElementById('playlistTitle').style.display = 'block';
    } catch (error) {
        displayErrorMessage("An error occurred while processing your request. Please try again later.");
    } finally { 
        document.getElementById("btn").innerText = "Calculate";
        document.getElementById("playlistUrl").value = "";
    }
}

function convertDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    return (hours * 3600) + (minutes * 60) + seconds;
}

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60); 
    return `${hours}h ${minutes}m ${seconds}s`;
}

function displayErrorMessage(message) {
    const playlistTitleDiv = document.getElementById('playlistTitle');
    const resultDiv = document.getElementById('result');
    playlistTitleDiv.style.display = 'block';
    playlistTitleDiv.innerHTML = `<div id="errorMessage">${message}</div>`;
    document.getElementById("playlistUrl").value = "";
    resultDiv.style.display = 'none';
}

function convertTime() {
    const timeInput = document.getElementById('timeInput').value.trim();
    const resultDiv = document.getElementById('conversionResult');

    // Regular expression to match hours, minutes, and seconds
    const timePattern = /(\d+)h\s*(\d+)m\s*(\d+)s/;
    const matches = timeInput.match(timePattern);

    if (matches) {
        const hours = parseInt(matches[1], 10);
        const minutes = parseInt(matches[2], 10);
        const seconds = parseInt(matches[3], 10);

        // Convert hours, minutes, and seconds to total seconds
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        const days = totalSeconds / 86400; // 86400 seconds in a day

        resultDiv.innerHTML = `
            <p>Days: ${days.toFixed(4)}</p>   
            <p>Total Seconds: ${totalSeconds}</p> 
            <p>"  ________ " now go n work </p> 
        `;
    } else {
        resultDiv.innerHTML = '<p>Please enter a valid time in the format "114h 32m 30s".</p>';
    }
}




document.addEventListener('DOMContentLoaded', () => {
    // Check the user's system theme
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply the theme based on the system preference
    if (userPrefersDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });
});
document.querySelector('.toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});