## Description

    Sample Oauth2 Node Express Boilerplate.

## Migration

## Creating migration
```bash
npx sequelize-cli migration:create --name name_of_migration
```

## Run Migration
```bash
npx sequelize-cli db:migrate
```

## Run Migration Undo
```bash
npx sequelize-cli db:migrate:undo
```

## SEEDERS

## Creating Seed
```bash
npx sequelize-cli seed:generate --name name_of_seed
```

## Run All Seeds
```bash
npx sequelize-cli db:seed:all
```

## Run any seeders file inside server/database/seeds using following commands
```bash
npx sequelize-cli db:seed --seed `filename`
```

## For project start

    - Clone the project from repo.
    - Configure database.json from sample-database.json (Currently we're using postgressql database).
    - Copy .env.example to .env file and configure accordingly.
    - RUN `npm install` to install package dependencies.
    - Before deploying to server check for linting your project
    - RUN `npm run lint` if errors persist solve it and redo this process



