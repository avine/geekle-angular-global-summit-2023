# Architecture Micro Frontends pour Angular

J'étais présent à l'"Angular Global Summit' 2023" qui s'est déroulé les 14 et 15 février 2023.

Lors de cet événement en ligne, j'ai suivi avec intérêt la présentation de [Manfred Stayer](https://at.linkedin.com/in/manfred-steyer-84645821) sur les Micro Frontends.
La solution qu'il propose pour Angular utilise le [module-federation-plugin](https://github.com/angular-architects/module-federation-plugin) et exploite le "Module Federation" introduit dans [Webpack 5](https://webpack.js.org/).

## Cas d'usage des Micro Frontends

La promesse des Micro Frontends est de permettre à plusieurs équipes de travailler en parallèle sur des applications distinctes (typiquement, une application par fonctionnalité métier, pour un découpage en domaines - DDD).
Chacune de ces applications peut ainsi avoir son propre cycle de développement et de déploiement, rendant chaque équipe (presque) totalement autonome.

Dans cet article, je vais vous montrer comment configurer un workspace (monorepo) Angular contenant :

- une application principale appelée "shell"
- un application Micro Frontend appelée "remote1"
- une librairie utilisée par le shell et le remote1 appelée "shared"

On peut donc imaginer qu'aujourd'hui 2 équipes distinctes travaillent respectivement sur le shell et le remote1.
Et rien ne nous empêche demain, d'ajouter d'autres équipes pour travailler sur les Micro Frontends remote2, remote3, ...

N'hésitez-pas à jeter un coup d'oeil au [code source de l'application](https://github.com/avine/geekle-angular-global-summit-2023) sur le repo GitHub.

## Un peu d'échafaudages

Commençons par créer les 3 grandes parties de notre monorepo, à l'aide de la CLI d'Angular :

```shell
# Créons un nouveau workspace Angular...
ng new shell

# Ajoutons une seconde application à notre workspace
ng generate application remote1

# Et une librarie transverse
ng generate library shared
```

Pour faire simple, disons que notre librairie "shared" expose de la donnée via un service :

```ts
// projects/shared/src/lib/shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SharedData {
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private _data$ = new BehaviorSubject<SharedData | null>(null);

  data$ = this._data$.asObservable();

  setData(data: SharedData) {
    this._data$.next(data);
  }
}
```

Notez qu'au départ la donnée est `null`.
Nous allons donc appeler la méthode `setData` depuis le "shell" :

```ts
// src/app/app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedService } from '@demo/shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
})
export class AppComponent implements OnInit {
  private sharedService = inject(SharedService);

  ngOnInit(): void {
    this.sharedService.setData({ value: 'Hello Micro Frontend' });
  }
}
```

Ensuite, nous allons afficher le contenu de `data$` depuis le "remote1" :

```ts
// projects/remote1/src/app/home.component.ts
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SharedService } from '@demo/shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `<p>Data exposed to Remote 1: {{ data$ | async | json }}</p>`,
})
export class HomeComponent {
  protected data$ = inject(SharedService).data$;
}
```

Notez bien que pour le moment, même si les applications "shell" et "remote1" utilisent toutes deux le code de la librairie transverse "shared", elles n'en restent pas moins indépendantes.
Vous pouvez donc les servir en parallèle sur 2 ports différents :

```shell
ng serve shell --port 4200 & ng serve remote1 --port 4201
```

Si on visite l'URL http://localhost:4201, on obtient logiquement le résultat suivant :

```html
<p>Data exposed to Remote 1: null</p>
```

## Un peu de magie

Nous allons utiliser la schematic [@angular-architects/module-federation](https://www.npmjs.com/package/@angular-architects/module-federation) pour ajouter des supers pouvoirs à nos applications :

```shell
ng add @angular-architects/module-federation --project shell --port 4200 --type dynamic-host
ng add @angular-architects/module-federation --project remote1 --port 4201 --type remote
```

L'argument `--type dynamic-host` indique que l'application "shell" est bien l'ossature de notre architecture Micro Frontends.
Et l'argument `--type remote` indique naturellement que l'application "remote1" sera accessible en tant que Micro Frontend depuis le "shell".

Plusieurs choses sont à noter dans le `package.json` que la schematic a modifié :

```json
{
  "name": "shell",
  "scripts": {
    "run:all": "node node_modules/@angular-architects/module-federation/src/server/mf-dev-server.js"
    ...
  },
  "dependencies": {
    "@angular-architects/module-federation": "^15.0.3",
    ...
  },
  "devDependencies": {
    "ngx-build-plus": "^15.0.0",
    ...
  }
}
```

La commande `npm run run:all` a été ajoutée.
Elle permet de lancer en parallèle toutes les applications du workspace.
C'est l'équivalent de la commande `ng serve shell --port 4200 & ng serve remote1 --port 4201` que nous avons utilisé plus haut...

Le paquet [ngx-build-plus](https://www.npmjs.com/package/ngx-build-plus) a été installé.
Celui-ci permet de surcharger la configuration Webpack de n'importe quel projet du workspace.
C'est très utile, car dans Angular ces fichiers de configuration ne sont pas accessible car masqués par la CLI d'Angular.

## La surchage des configurations Webpack

Voyons maintenant la surcharge des configurations Webpack.

Pour le "shell" :

```js
// webpack.config.js
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
```

Et pour le "remote1" :

```js
// projects/remote1/webpack.config.js
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'remote1',

  exposes: {
    // Notez que dans cet exemple, nous exposons un fichier de Routes qui sera donc chargé avec `loadChildren`
    './Routes': './projects/remote1/src/app/app.routes.ts',

    // Mais on aurait pu exposer un composant (standalone) qui serait alors chargé avec `loadComponent`
    /*'./HomeComponent': './projects/remote1/src/app/home.component.ts', */
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
```

Mais avant d'expliquer le contenu de ces fichiers, voyons ce que contient l'application "remote1" une fois compilée.

Si nous compilons l'application "remote1" avec la commande `ng build remote1` nous pouvons noter la présence d'un fichier spécial :
`dist/remote1/remoteEntry.js`.
C'est le fichier "magique" de notre Micro Frontend qui va être exploité par l'application "shell" (pour justement charger le "remote1") !

Revenons maintenant au contenu de ces fichiers.

La section `shared: { ...shareAll({ ... }) }` indique à Webpack que toutes les dépendances doivent être partagées.
Cela signifie par exemple que la dépendance `@angular/core` sera bien inclue dans le bundle du "shell", mais pas dans le `remoteEntry.js` du "remote1".
Pour fonctionner en tant que Micro Frontend, "remote1" compte donc sur le "shell" pour lui fournir l'implémentation de la dépendance `@angular/core`.

Le paramétrage `{ singleton: true, strictVersion: true, requiredVersion: 'auto' }` indique que les dépendances du "remote1" et du "shell" doivent être compatibles.
Dans le cas contraire, une erreur sera levée.

Notez que l'application "remote1" pouvant être compilée de manière autonome, la dépendance `@angular/core` reste bien présente dans le bundle classique `dist/remote1/main.3a762787fa7157be.js`.

## Le manifest

La schematic a également créé un manifest accessible à l'exécution (at runtime): `src/assets/mf.manifest.json`.
Celui-ci inique sans ambiguïté où aller récupérer le `remoteEntry.js` du "remote1" :

```json
{
  "remote1": "http://localhost:4201/remoteEntry.js"
}
```

Le contenu du script `src/main.ts` a été déplacé dans `src/bootstrap.ts` :

```ts
// src/bootstrap.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import APP_ROUTES from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(APP_ROUTES)],
}).catch((err) => console.error(err));
```

Et désormais, l'application est chargée dynamiquement après que le manifest et ses différents `remoteEntry.js` ont bien été téléchargées :

```ts
// src/main.ts
import { initFederation } from '@angular-architects/module-federation';

initFederation('/assets/mf.manifest.json')
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
```

La fonction `initFederation` télécharge donc le manifest et met à disposition du "shell" les différents `remoteEntry.js`.

## La navigation vers le Micro Frontend

Nous y sommes presque ! Il ne nous reste plus qu'à naviguer vers le Micro Frontend depuis le "shell" grâce à une simple `Route` Angular :

```ts
// src/app/app.routes.ts
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const APP_ROUTES: Routes = [
  ...,
  {
    path: 'remote1',
    loadChildren: () =>
      loadRemoteModule({
        type: 'manifest',

        // "remote1" correspond à la clé dans le manifest `src/assets/mf.manifest.json`
        remoteName: 'remote1',

        // "Routes" correspond à la clé du symbole exposé dans `projects/remote1/webpack.config.js`
        exposedModule: './Routes',
      }),
  },
];

export default APP_ROUTES;
```

Et voilà, si nous ouvrons l'URL `http://localhost:4200/remote1`, nous visualisons bien le "remote1" à l'intérieur du "shell".

```html
<p>Data exposed to Remote 1: { "value": "Hello Micro Frontend" }</p>
```

La donnée initialisée par le "shell" est bien celle qui est affichée dans le "remote1".
Cela prouve que le `SharedService` est bien un singleton pour le "shell" et le "remote1" !

## Conclusion

Dans cet article, vous avez découvert une manière d'implémenter les Micro Frontends dans Angular.
Et grâce au [module-federation-plugin](https://github.com/angular-architects/module-federation-plugin), l'opération ne nécessite que quelques fichiers de configuration.
Voilà, j'espère que cet article vous a plu et qu'il vous a ouvert de nouveaux horizons pour architecturer vos projets Angular.

## Références

- https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-module-federation-in-webpack-5/
- https://github.com/angular-architects/module-federation-plugin
