/*
 *  Vimeo Scorm Wrapper
 *  Causes a scorm completion after video playback passes a given percentage
 *  (c) 2014 CourseSuite Pty Ltd
 *  Author: tim st.clair (tim.stclair@gmail.com)
 *  Licence: MIT
 */
(function() {
    var iframe      = document.getElementById('player1'),
        player      = $f(iframe),
        _relaunch   = false,
        _seconds    = 0,
        _complete   = false,
        _started    = false,
        sReturn     = scormGetValue("cmi.core.entry"),
        sPlayed     = scormGetValue("cmi.core.lesson_location");

    _relaunch = (sReturn != "ab-initio"); // true if previously suspended
    
    player.addEvent('ready', function() {
        scormSetValue("cmi.core.exit", "suspend");
        scormSetValue("cmi.core.lesson_status", "incomplete");
        scormCommit();
        _timeSessionStart = new Date();

        // iOS bug: user must initiate playback before seekTo can be set
        if ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
            player.addEvent('play', onPlay);
        } else {
            initSeek();
        }
        player.addEvent('pause', onPause);
        player.addEvent('finish', onFinish);
        player.addEvent('playProgress', onPlayProgress);
    });

    function initSeek() {
        if (_relaunch) {
            var iSeconds = +sPlayed || 0; // http://stackoverflow.com/a/7540412/1238884
            player.api("seekTo", iSeconds); // doesn't work in Flash, known vimeo bug
            _relaunch = false;
        }
    }

    function onPlay(id) {
        if (!_started) {
            initSeek();
            _started = true;
        }
    }

    function onPause(id) {
        scormSetValue("cmi.core.lesson_location", _seconds+"");
    }

    function onFinish(id) {
        scormSetValue("cmi.core.lesson_location", _seconds+"");
        scormCommit();
    }

    function onPlayProgress(data, id) {
        _seconds = data.seconds;
        scormSetValue("cmi.core.lesson_location", _seconds+"");
        if (Math.round((_seconds / data.duration) * 100) >= _required) {
            if (!_complete) {
                scormSetValue("cmi.core.exit", "");
                scormSetValue("cmi.core.score.min", "0");
                scormSetValue("cmi.core.score.max", "100");
                scormSetValue("cmi.core.score.raw", _required);
                scormSetValue("cmi.core.lesson_status", "completed");
                scormCommit();
                _complete = true;
            }
        }
    }

}());