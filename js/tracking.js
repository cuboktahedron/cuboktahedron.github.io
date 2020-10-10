window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
Promise.all([
    new Promise((resolve) => {
        var script = document.createElement('script');
        script.src = "https://www.googletagmanager.com/gtag/js?id=UA-26499443-2";
        script.async = true;
        document.head.appendChild(script);
        resolve();
    }),
    new Promise((resolve) => {
        gtag('js', new Date());

        gtag('config', 'UA-26499443-2');
        resolve();
    })
]);
