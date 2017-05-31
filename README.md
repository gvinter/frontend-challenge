# Galen's Code test

Browser used: Chrome

### Tracking & Performance

The weakness of this approach is that it creates arrays of intervals for `watched` and `rewatched` "second" ranges. Each second that's played will get checked against one or both `watched`/`rewatched` arrays. This check will take more time as each array gets longer. This is caused by users skipping through the video creating many non-continuously watched intervals. However, for normal users the performance is high - someone who plays a video and then rewatches the video creates 1 intervals per `watched`/`rewatched` arrays.

### Modularity

I decided to implement the code as a reusable module so adding a `<video>` with a unique ID would make `init`ing multiple videos on the same page easy. Currently, the `<div class="video__playbar">` element and contents are required too, although those could be made optional.

### Reusability

Tracking a different percentage is as easy as adding a 2nd parameter of a percent given as a decimal: 
```
<!-- defaults to 25% -->
var vid = videoModule('video1');
vid.init();

<!-- Set to 10% -->
var vid = videoModule('video1', 0.1);
vid.init();
```

### Consistency

Shorter videos don't necessarily have better performance than longer ones. Length of videos hurts performance of this player/tracker only in the sense that a longer video may have a higher likelihood of having more non-continuously watched intervals as a user skips around a video.

---

## Project TODOs

### Playbar
- [X] Always show the current time of the video, next to the play head.
- [X] Clicking in the playbar should move the play head there, and seek the video accordingly.
- [X] The play head should be horizontally draggable and update the time of the video as it moves.
- [X] Visual accuracy (see the screenshot) for the general look of the playbar. Visual accuracy is nice, but we’re more concerned about it working well.

### Play/Pause
- [X] Clicking the video while it’s playing pauses the video.
- [X] Clicking the video while it’s paused plays the video.

### Tracking
- [X] Log a message to the console when 25% of the video has been rewatched (watched at least twice).
- [X] If you seek past a section of the video, the skipped section does not count as watched.
- [X] Watching a section of a video again counts as a rewatch. So if someone watches a 60 second video, then seeks to second 5 and watches until second 30, they've rewatched 25 seconds (41.7%).
- [X] Sections rewatched do not need to be contiguous to count. For example, if someone rewatched seconds 5-10 and seconds 15-20, that counts as 10 seconds rewatched.
- [X] Rewatches for the same time interval should not compound. For example, if I watch seconds 5-10 four different times, that still counts as only 5 seconds rewatched.
- [X] The solution should be accurate to at least 1 second of granularity.
- [] When performing calculations, you can assume the video can be anywhere from 1 second to 4 hours long, although the sample file below is 1 minute 46 seconds.
- [] Whatever solution you choose, please note its performance characteristics in your README.


### Bonus considerations
- [] Tracking: Do you have an idea of the time/space complexity of your approach?
- [X] Modularity: how difficult is it to put more than one video on the same page?
- [X] Reusability: how difficult is it to track a different rewatched percentage?
- [X] Consistency: How would the player/tracker behave with videos of different lengths?