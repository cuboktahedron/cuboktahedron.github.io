var ga = document.createElement('script');
ga.type = 'text/javascript';
ga.async = true;
ga.src = 'https://www.googletagmanager.com/gtag/js?id=UA-26499443-2';

var head = document.querySelector('head');
head.prepend(ga);

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'UA-26499443-2');
