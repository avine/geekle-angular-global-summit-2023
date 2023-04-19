# Architecture Micro Frontends pour Angular

J'ai assisté au "Angular Global Summit' 2023" qui s'est déroulé les 14 et 15 février 2023.

Lors de cet événement en ligne, j'ai suivi avec intérêt la présentation de [Manfred Stayer](https://at.linkedin.com/in/manfred-steyer-84645821) sur les Micro Frontends.
La solution qu'il propose utilise le paquet [module-federation-plugin](https://github.com/angular-architects/module-federation-plugin) et exploite le "Module Federation" introduit dans [Webpack 5](https://webpack.js.org/).

La promesse des Micro Frontends est de permettre à plusieurs équipes de travailler en parallèle sur des applications distinctes.
Chacune de ces applications peut ainsi avoir son propre cycle de développement et de déploiement, rendant chaque équipe totalement autonome.

Dans cet article, je vais vous montrer comment configurer un workspace Angular contenant :

- une application principale appelée "shell"
- un application Micro Frontend "remote1"
- une librairie utilisée par le shell et le remote1 appelée "shared"

On peut donc imaginer qu'aujourd'hui 2 équipes distinctes travaillent respectivement sur le shell et le remote1.
Et rien ne vous empêche demain d'ajouter d'autres équipes pour travailler de nouveaux remoteN...

N'hésitez-pas à jeter un coup d'oeil au [code source de l'application](https://github.com/avine/geekle-angular-global-summit-2023) sur le repo GitHub.

## Références

https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-module-federation-in-webpack-5/

https://github.com/angular-architects/module-federation-plugin
