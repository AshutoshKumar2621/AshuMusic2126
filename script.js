console.log("let's Write some js");
let currentsong = new Audio();
let isPlaying = false;  // To track if a song is currently playing
let currentSongIndex = null;  // To track the current song index
let currentFolder = "songs";  // Default folder is 'songs'
let currentSongsList = [];  // Store the current list of songs dynamically

// Function to fetch songs from the current folder
async function getSongs() {
    let response = await fetch(`http://127.0.0.1:3000/${currentFolder}/`);
    let data = await response.text();

    // Parse the response and extract .mp3 files
    let div = document.createElement("div");
    div.innerHTML = data;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);  // Store all .mp3 files
        }
    }

    currentSongsList = songs;  // Store the current song list based on folder
    return songs;  // Return the list of song URLs
}

// Function to play a song
const playmusic = (trackUrl) => {
    if (currentsong.src !== trackUrl) {
        // If it's a different song, load and play the new song
        currentsong.src = trackUrl;
        currentsong.play();
        isPlaying = true;
        updatePlayButton();
        currentsong.addEventListener("timeupdate", updateTimeInfo);  // Keep updating the seekbar

        // Save the current song URL and folder to localStorage
        localStorage.setItem("lastPlayedSong", trackUrl);
        localStorage.setItem("lastOpenedPlaylist", currentFolder);  // Store the last opened playlist
    } else if (currentsong.paused) {
        // If the song is paused, resume playing
        currentsong.play();
        isPlaying = true;
        updatePlayButton();
    } else {
        // Otherwise, pause the song
        currentsong.pause();
        isPlaying = false;
        updatePlayButton();
    }

    // Extract and clean the song name to display
    let fileName = trackUrl.split("/").pop();
    let cleanSongName = decodeURIComponent(fileName)
        .replace(".mp3", "")
        .replace(/[_\d]/g, " ")
        .replace(/(?:kbps|CE|320|Kbps)/gi, "")
        .replace(/[-]+/g, " ")
        .replace(/\(.*?\)/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // Update the playbar with the current song name
    updateSongInfo(cleanSongName);
};

// Function to update the playbar with the current song name
const updateSongInfo = (songName) => {
    document.querySelector(".songinfo").innerHTML = songName;
};

// Update the play button icon depending on the play state
const updatePlayButton = () => {
    let playButton = document.getElementById("play");
    if (isPlaying) {
        playButton.src = "pause.svg";  // Change to pause icon
    } else {
        playButton.src = "play.svg";   // Change to play icon
    }
};

// Function to update both current time and duration
const updateTimeInfo = () => {
    let currentTime = currentsong.currentTime;
    let duration = currentsong.duration;

    if (!isNaN(duration)) {
        document.querySelector(".timeinfo").innerHTML = `${formatTime(currentTime)}/${formatTime(duration)}`;
    }

    // Update the position of the circle in the seekbar
    const updateSeekbar = () => {
        const seekbar = document.querySelector(".seekbar");
        const circle = document.querySelector(".seekbar .circle");

        if (!isNaN(duration)) {
            const progress = (currentTime / duration) * 100;  // Calculate progress as a percentage
            circle.style.left = `${progress}%`;  // Move the circle based on progress
        }
    };

    updateSeekbar();  // Call the seekbar update
};

// Function to format time in mm:ss
const formatTime = (timeInSeconds) => {
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = Math.floor(timeInSeconds % 60);
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
};

// Function to update the song list in the library
const updateSongList = async () => {
    let songs = await getSongs();  // Get songs from the current folder

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";  // Clear the previous song list

    if (songs.length === 0) {
        // If no songs are found, display a message
        songul.innerHTML = "<li>No songs found in this folder.</li>";
        return;
    }

    for (const song of songs) {
        let fileName = song.split("/").pop();
        let cleanSongName = decodeURIComponent(fileName)
            .replace(".mp3", "")
            .replace(/[_\d]/g, " ")
            .replace(/(?:kbps|CE|320|Kbps)/gi, "")
            .replace(/[-]+/g, " ")
            .replace(/\(.*?\)/g, "")
            .replace(/\s+/g, " ")
            .trim();

        songul.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${cleanSongName}</div>
                    <div>Artist Name</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Add click event listeners to play each song
    Array.from(songul.getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            currentSongIndex = index;
            playmusic(songs[index]);  // Play the clicked song
        });
    });
};

// Playlist switching logic
const switchFolder = async (folder) => {
    currentFolder = folder;  // Update the global current folder
    await updateSongList();  // Reload the song list based on the new folder
};

// Main function to handle everything
async function main() {
    // Load last opened playlist from localStorage
    const lastOpenedPlaylist = localStorage.getItem("lastOpenedPlaylist");
    if (lastOpenedPlaylist) {
        currentFolder = lastOpenedPlaylist;  // Set to the last opened playlist
    }

    // Preload the songs and display the correct playlist
    await updateSongList();

    // Load last played song from localStorage
    const lastPlayedSong = localStorage.getItem("lastPlayedSong");
    if (lastPlayedSong && currentSongsList.includes(lastPlayedSong)) {
        currentSongIndex = currentSongsList.indexOf(lastPlayedSong);
        playmusic(lastPlayedSong);  // Play the last played song
    }

    // Handle clicks on the "songs" playlist
    document.querySelector(".card.songs").addEventListener("click", () => {
        switchFolder("songs");  // Switch to 'songs' folder
    });

    // Handle clicks on the "srk" playlist
    document.querySelector(".card.srk").addEventListener("click", () => {
        switchFolder("srk");  // Switch to 'srk' folder
    });
    document.querySelector(".card.ajay").addEventListener("click", () => {
        switchFolder("ajay");  // Switch to 'srk' folder
    });
    document.querySelector(".card.salman").addEventListener("click", () => {
        switchFolder("salman");  // Switch to 'srk' folder
    });
    document.querySelector(".card.shahid").addEventListener("click", () => {
        switchFolder("shahid");  // Switch to 'srk' folder
    });
    document.querySelector(".card.pawan").addEventListener("click", () => {
        switchFolder("pawan");  // Switch to 'srk' folder
    });

    // Handle play/pause button
    document.getElementById("play").addEventListener("click", () => {
        if (currentSongIndex !== null) {
            playmusic(currentSongsList[currentSongIndex]);  // Use currentSongsList
        }
    });

    // Handle previous button
    document.getElementById("previous").addEventListener("click", () => {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            playmusic(currentSongsList[currentSongIndex]);  // Use currentSongsList
        }
    });

    // Handle next button
    document.getElementById("next").addEventListener("click", () => {
        if (currentSongIndex < currentSongsList.length - 1) {
            currentSongIndex++;
            playmusic(currentSongsList[currentSongIndex]);  // Use currentSongsList
        }
    });

    // Volume control functionality
    document.querySelector(".volume input").addEventListener("input", (e) => {
        currentsong.volume = parseFloat(e.target.value) / 100;  // Volume value from 0 to 1
    });

    // Seekbar click event to jump to a specific part of the song
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Hamburger menu toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close menu button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
    document.querySelector(".volume input[type='range']").addEventListener("input", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;  // Convert range value (0-100) to volume (0.0-1.0)
    });
    //load the playlist when card is cliicked
    document.getElementsByClassName("card-container").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`item.dataset.currentFolder`);
        })
    })
    
}

// Start the script
main();
