# NextJS-Firebase-Material - v0.1

Esse é um projeto [Next.js](https://nextjs.org/) iniciado com [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). Ele possui autenticação com login do Google [Firebase](https://firebase.google.com) e sua interface foi criada usando a biblioteca [Material-UI - v4](https://v4.mui.com).

## Instalação

Clone este projeto com o comando:

    git clone git@github.com:hiperlogado/nextjs-firebase-material.git

Entre na pasta `nextjs-firebase-material` usando um dos comandos abaixo

```bash
npm install
# or
yarn install
```

Em seguida crie um arquivo `.env.local` na raiz do seu projeto, e coloque os parâmetros de conexão com sua conta no Firebase, como no modelo abaixo:

```
NEXT_PUBLIC_FIREBASE_APIKEY=XXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=XXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_PROJECTID=XXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=XXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=XXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_APPID=XXXXXXXXXXXXXXX
```

*Lembre-se de criar o banco de dados no serviço `Firestore Databas` e ativar o login com contas Google no serviço `Authentication`.*

## Execução

Inicie a aplicação com um dos comandos:

```bash
npm run dev
# or
yarn dev
```

Acesse o endereço [`http://localhost:3000`](http://localhost:3000) e faça login a conta Google que será usada para administrar o sistema.

![NextJS-Firebase-Material](https://nextjs-firebase-material.vercel.app/img/screenshot.png "NextJS-Firebase-Material")

*Os próximos usuários que fizerem login terão seu acesso submetido à aprovação do administrador.*

## Gestão dos usuários

Acesse a página de administração para autorizar os usuários em seu sistema.

![NextJS-Firebase-Material](https://nextjs-firebase-material.vercel.app/img/screenshot1.png "NextJS-Firebase-Material")

## Demo

Para ver esta versão em funcionamento acesse nossa [Demo](https://nextjs-firebase-material.vercel.app)

## Contato

Converse com a gente no [WhatsApp](https://wa.me/message/GZY6J3VM3AG6H1) ou entre em contato com o email `hiperlogado@gmail.com`