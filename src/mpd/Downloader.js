Dash.mpd.Downloader = function (mpdFileUrl, isYouTubeVideo, downloadMpdFileOnSuccess, eventBus) {
    'use strict';

    var youTubeDomain = 'http://www.youtube.com',
        getInfoMapping = '/get_video_info?html5=1&video_id=',
        videoIdPrefix = 'v=',
        mpdEntryPrefix = 'dashmpd=',
        asyncDownloader = Dash.utils.AsyncDownloader(),

        downloadMpdFileFromURL = function () {
            asyncDownloader.download(mpdFileUrl, downloadMpdFileOnSuccess);
        },

        getMpdUrlFromResponse = function (movieDetails) {
            var urlParameters = movieDetails.split('&');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(mpdEntryPrefix) === 0) {
                    var mpdUrl = decodeURIComponent(urlParameters[i].substring(mpdEntryPrefix.length));
                    eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, 'MPD url find in response from YouTube, ' + mpdUrl);
                    return mpdUrl;
                }
            }
            eventBus.dispatchLogEvent(Dash.log.LogLevel.ERROR, 'Cannot find mpd file localization for ' + mpdFileUrl +
                '. Server respond with: ' + decodeURIComponent(movieDetails));
        },

        downloadYouTubeMpdFile = function () {
            var videoId = getYouTubeVideoId(mpdFileUrl),
                url = youTubeDomain + getInfoMapping + videoId;
            asyncDownloader.download(url, downloadYouTubeVideoDetailsOnSuccess);
        },

        downloadYouTubeVideoDetailsOnSuccess = function (request) {
            var mpdUrl = getMpdUrlFromResponse(request.responseText);

            if (mpdUrl) {
                asyncDownloader.download(mpdUrl, function (request, options) {
                    options.isYouTube = true;
                    downloadMpdFileOnSuccess(request, options);
                });
            }
        },

        getYouTubeVideoId = function (videoUrl) {
            var urlParameters = videoUrl.split('?');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(videoIdPrefix) === 0) {
                    return urlParameters[i].substring(videoIdPrefix.length);
                }
            }
        };


    return {
        downloadMpdFile: function () {
            if (isYouTubeVideo) {
                downloadYouTubeMpdFile();
            } else {
                downloadMpdFileFromURL();
            }
        }
    };
};
