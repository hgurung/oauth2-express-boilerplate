# api

# Creating migration
npx sequelize-cli migration:create --name name_of_migration

# Run Migration
npx sequelize-cli db:migrate

# Run Migration Undo
npx sequelize-cli db:migrate:undo

# SEEDERS

# Creating Seed
npx sequelize-cli seed:generate --name name_of_seed

# Run All Seeds
npx sequelize-cli db:seed:all

# Run single seed file

# Run any seeders file inside server/database/seeds using following commands
npx sequelize-cli db:seed --seed `filename`

# For project start

    1.clone the project from repo.
    3. Configure database.json from sample-database.json (Currently we're using postgressql database).
    4. Copy .env.example to .env file and configure accordingly.
    5. RUN `npm install` to install package dependencies.
    6. Before deploying to server check for linting your project
    7. RUN `npm run lint` if errors persist solve it and redo this process



