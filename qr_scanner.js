function qr_scanner(){
    alert('prepare, dude!');

    function hasGetUserMedia() {
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
        $('#generate').prepend('<select id="videoSource"></select><video autoplay></video>');
        var videoSelect = document.querySelector("select#videoSource");
        var video = document.querySelector('video');

        var canvasElem = $('<canvas id="qr-canvas" style="display: none;" width="320px" height="180px" ></canvas>')
        $('#generate').prepend(canvasElem);
        $('#generate').prepend('<div style="width:100%; overflow:auto;" id="scan_results"></div>');
        $('#generate').prepend('<button style="width:100%;" id="scan">SCAN</button>');
        $('#generate').prepend('<div style="background-color:#EEE; font-weight:700; line-height: 70px; text-align:center; width:100%; height:70px;" id="scan_results_status">STATUS OF THE SCAN</div>');
        var canvas = canvasElem[0];
        var context = canvas.getContext('2d');

        var videoSource;

        qrcode.callback = function(data){
            var scanned_code = '<div style="color:#FFF; border-radius:5px; float:left; background-color:#00F; padding:3px; padding-left:10px; padding-right:10px; margin:1px;">' + data + '<div>';
            $('#scan_results_status').text("WOHOOO! Found " + data);
            $('#scan_results_status').css('background-color', '#070');
            $('#scan_results_status').css('color', '#FFF');
            
            $('#scan_results').append(scanned_code);            
            $('#scan').text('SCAN');
        };

        function scan(counter) {
            $('#scan').text('scanning... ('+counter+')');

            if(counter == 0){
                $('#scan').text('SCAN');
                $('#scan_results_status').text("STATUS OF THE SCAN");
                $('#scan_results_status').css('background-color', '#EEE');
                $('#scan_results_status').css('color', '#000');
            }else{
              if (videoSource) {
                context.drawImage(video, 0, 0, 307,250);
                
                try {
                  qrcode.decode();
                } catch(e) {
                  //alert('no QR found');
                    $('#scan_results_status').text("SCANNING... didnt find QR yet :(");
                    $('#scan_results_status').css('background-color', '#700');
                    $('#scan_results_status').css('color', '#FFF');
                    setTimeout(function(){scan(parseInt(counter)-1);}, 500);
                  //setTimeout(scan(count+1), 500);
                  qrcodeError(e);
                }
        
                //setTimeout(scan, 500);
              } else {
                //setTimeout(scan,500);
              }
            }
        }
        $('#scan').click(function(){ scan(10); })

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        function gotSources(sourceInfos) {
          for (var i = 0; i != sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            var option = document.createElement("option");
            option.value = sourceInfo.id;
            if (sourceInfo.kind === 'video') {
              option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
              videoSelect.appendChild(option);
            } else {
              console.log('Some other kind of source: ', sourceInfo);
            }
          }
        }

        function successCallback(stream) {
            window.stream = stream; // make stream available to console
            video.src = window.URL.createObjectURL(stream);
            video.play();
            video.onloadedmetadata = function(e) {
                // Ready to go. Do some stuff.
            };
            //setTimeout(scan,1000);
        }

        var errorCallback = function(e) {
            alert(e);
        };

        if (typeof MediaStreamTrack === 'undefined'){
          alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
        } else {
          MediaStreamTrack.getSources(gotSources);
        }

        function start(){
          if (!!window.stream) {
            video.src = null;
            window.stream.stop();
          }
          videoSource = videoSelect.value;

          var constraints = {
                video: {
                  optional: [{sourceId: videoSource}],
                    mandatory: {
                        maxWidth: 320,
                        maxHeight: 180
                    }                  
                }
          };
          navigator.getUserMedia(constraints, successCallback, errorCallback);
        }

        videoSelect.onchange = start;
        start();

    } else {
        alert('Sorry, scanner cannot be used. Probably your need a newer smartphone. Problem: new browsers support getUserMedia() and it is needed for the scanner. Your browser DOES NOT support this. Please dont be sad.');
    }
}