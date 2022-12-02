<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

#Execute on development mode

1. Clone the repository
2. Execute the following command:

```
yarn install
```

3. You should have installed previously nest CLI

```
npm i -g @nestjs/cli
```

4. Up the database

```
docker-compose up -d
```

5. run project on dev mode

```
yarn start:dev
```

5. Rebuild database with seed

```
http://localhost:3000/api/v2/seed
```
