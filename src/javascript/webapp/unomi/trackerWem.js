import {useTracker as unomiTracker} from 'apache-unomi-tracker';

export const syncTracker = () => {
    // Needed for isCrawler
    window.Buffer = window.Buffer || require('buffer').Buffer;

    const wem = {
        ...unomiTracker(),
        init: function () {
            const {
                contextServerUrl,
                trackerSessionIdCookieName = 'wem-session-id'
            } = window.digitalData.wemInitConfig;

            wem.contextServerUrl = contextServerUrl;

            if (wem.getCookie(trackerSessionIdCookieName) === null) {
                wem.setCookie(trackerSessionIdCookieName, wem.generateGuid());
            }

            wem.initTracker(window.digitalData);

            wem._registerCallback(() => {
                window.cxs = wem.getLoadedContext();
            }, 'Unomi tracker context loaded', 5);

            // Load page view event
            const pageViewEvent = wem.buildEvent(
                'view',
                wem.buildTargetPage(),
                wem.buildSource(window.digitalData.site.siteInfo.siteID, 'site')
            );
            wem._registerEvent(pageViewEvent, true);

            wem.startTracker();
            wem.loadContext();
        }
    };
    wem.init();
    return wem;
};

// NOTE build the revoke date based on consent Manager cookieDuration
// NOTE is this deprecated ?
// export const syncConsentStatus = ({typeIdentifier, scope, status}) => {
//     const statusDate = new Date();
//     const revokeDate = new Date(statusDate);
//     revokeDate.setFullYear(revokeDate.getFullYear() + 2);
//     // Console.debug('syncConsentStatus status :', status);
//
//     // TODO rewrite the event if not deprecated
//
//     // const  event = window.wem.buildEvent("click",
//     //     window.wem.buildTarget(video.id,"react-video-player",{
//     //         video:{
//     //             ...video,
//     //             duration: player.current.getDuration(),
//     //             currentTime: player.current.getCurrentTime(),
//     //             status: status
//     //         }
//     //     }),
//     //     window.wem.buildSource(quiz.id,quiz.type,{
//     //         quiz,
//     //         warmup:{
//     //             id:parentId
//     //         },
//     //
//     //     }));
//     //
//     // window.wem.collectEvent(event);
//
//     // uTracker.track('modifyConsent', {
//     //     consent: {
//     //         typeIdentifier,
//     //         scope,
//     //         status,
//     //         statusDate: statusDate.toISOString(), // "2018-05-22T09:27:09.473Z",
//     //         revokeDate: revokeDate.toISOString()// "2020-05-21T09:27:09.473Z"
//     //     }
//     // });
// };
