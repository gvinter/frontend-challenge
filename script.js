"use strict";

var videoModule = (function(id, percentageCheck = 0.25) {

    // 
    // Get DOM Elements
    // 

    // Get video by it's ID
    var video = document.getElementById(id);
    // add `data-video-time=VIDEO_ID` to an element for displaying current time of video
    var videoTime = document.querySelector('[data-video-time='+id+']');
    // add `data-progress-bar=VIDEO_ID` to an input[type=range] to control scrub bar
    var progressBar = document.querySelector('[data-progress-bar='+id+']');
    // get child elements of progressBar
    var progressSlider = progressBar.querySelector('input[type=range]');
    var playbarProgress = progressBar.querySelector('[class=video__playbar--progress]');

    // 
    // Manage state of this video
    // 
    var state = {
        intervals: {
            watched: [],
            rewatched: [],
        },
        countRewatched: 0,
        playCount: 0,
        quarterRewatchFlag: false,
        videoWidth: 0,
        videoLength: 0,
        lastSecondPlayed: 0,
    };
    
    // 
    // Update state and interface
    // 

    function updateVideoState() {
        state.videoLength = video.duration;
        state.videoWidth = video.offsetWidth;
    }

    function updateTimeToPlayer() {
        var formattedTime = secondsToHms(video.currentTime);
        videoTime.innerText = formattedTime;
    }

    function updateProgressSlider() {
        var time = (100 / video.duration) * video.currentTime;
        progressSlider.value = time;
    }

    function updateProgressBar() {
        var progress = (100 / video.duration) * video.currentTime;
        progress += "%";
        playbarProgress.setAttribute("style","width:"+progress+"");
    }

    function updateCurrentInterval() {
        state.lastSecondPlayed = video.currentTime;
        
    }

    // 
    // Video Controls
    // 

    function playVideo() {
        video.play();
    }

    function pauseVideo() {
        video.pause();
    }

    //
    // Event Handlers
    //

    function handleProgressBarChange() {
        var time = state.videoLength * (progressSlider.value / 100);

        // Update the video time
        video.currentTime = time;
    }

    function handleVideoClick() {
        video.paused ? playVideo() : pauseVideo();
    }

    function handleProgressBarMouseDown() {
        pauseVideo();
    }

    function handleProgressBarMouseUp() {
        playVideo();
    }

    function handleVideoPlay() {
        state.lastSecondPlayed = video.currentTime;
        state.playCount++;
    }

    function handleTimeUpdate() {
        fireOnWholeSecond();
        updateCurrentInterval();
        updateProgressSlider();
        updateProgressBar();
        updateTimeToPlayer();
    }


    // Updating state
    function fireOnWholeSecond() {
        
        var lastSecond = state.lastSecondPlayed;
        var currentTime = video.currentTime;
        var lastSecondFloor = Math.floor(lastSecond);
        var currentTimeFloor = Math.floor(currentTime);

        if (lastSecondFloor < currentTimeFloor) {

            var watched = isSecondInIntervals(currentTimeFloor, 'watched');
            var rewatched = false;
            
            if (watched) {
                // console.log('Second watched, check rewatched array');
                rewatched = isSecondInIntervals(currentTimeFloor, 'rewatched');

                if (!rewatched && !state.quarterRewatchFlag) {
                    // Check if a quarter of video has been rewatched...
                    checkRewatchedSeconds();
                }
            }
        }
    }

    // Check if `second` is in a set of `ranges`
    function isSecondInIntervals(second, type = 'watched') {

        if (!state.intervals[type].length) {
            state.intervals[type].push([second, second]);
            return false;
        }

        // Check each range
        for (var i = state.intervals[type].length-1; i >= 0; i--) {
        
            // console.log(state.intervals[type][i]);

            // If more than last of range
            if (state.intervals[type][i][1] < second) {

                // If 1 more than last of range
                if (state.intervals[type][i][1] + 1 == second) {
                    // console.log('adding second to end of this range');
                    state.intervals[type][i][1] = second;
                    
                    if (type == 'rewatched'){
                        state.countRewatched++;
                    }

                    break;
                }
                // Else - just add    
                else {
                    // console.log("NEW RANGE");
                    state.intervals[type].splice(i+1, 0, [second, second]);
                    break;
                }
                
                continue;
            }
            // ELSE IF within this range
            else if (state.intervals[type][i][0] <= second && state.intervals[type][i][1] >= second) {
                // console.log('second in this range');
                return true;
            }

            // ELSE IF below this range
            else if (state.intervals[type][i][0] > second) {

                // If 1 less than first of range
                if (state.intervals[type][i][0] - 1 == second) {
                    // console.log('adding second to beginning of this range');
                    state.intervals[type][i][0] = second;

                    if (type == 'rewatched'){
                        state.countRewatched++;
                    }

                    // Check for range merge situation
                    if (state.intervals[type][i-1][1] + 1 == second) {
                        // Merge 2 arrays when filled in
                        var newRange = [ state.intervals[type][i-1][0], state.intervals[type][i][1] ];
                        state.intervals[type].splice(i-1, 2, newRange);
                    }
                    break;
                }
                
                // if this is the last one
                if (i === 0) {
                    // console.log('doesnt exist, so ADD!');
                    state.intervals[type].splice(i, 0, [second, second]);
                    if (type == 'rewatched'){
                        state.countRewatched++;
                    }
                    break;
                }

                // console.log('not found yet...');
            }
        }
        return false;
    }

    // Tracking
    function checkRewatchedSeconds() {
        // Check if seconds rewatched is over a quarter of the video's length
        if(state.countRewatched >= state.videoLength * percentageCheck) {
            console.log("You've REWATCHED 25% of this video!");
            state.quarterRewatchFlag = true;
        }
    }

    // Formatting
    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? h + ":" : "";
        var mDisplay = m > 0 ? (m < 10 ? "0" + m + ":" : m) : (h > 0 ? "00:" : "0:");
        var sDisplay = s > 0 ? (s < 10 ? "0" + s : s) : "00";
        
        return hDisplay + mDisplay + sDisplay; 
    }


    return {

        init: function() {
            // Video Listeners
            video.addEventListener("loadedmetadata", updateVideoState);
            video.addEventListener("timeupdate", handleTimeUpdate);

            video.addEventListener("click", handleVideoClick);

            video.addEventListener("play", handleVideoPlay);
            
            // Progress Slider (range input)
            // "input" event may cause issues in Firefox
            progressSlider.addEventListener("input", handleProgressBarChange);
            progressSlider.addEventListener("mousedown", handleProgressBarMouseDown);
            progressSlider.addEventListener("mouseup", handleProgressBarMouseUp);
        },

        // Just a helper for getting the video's state from the console.
        getState: function() {
            return state;
        }
    };
});

// 
// Create video object and initialize it
// 

var vid = videoModule('video1');
vid.init();
