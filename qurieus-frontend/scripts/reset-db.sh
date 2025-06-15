#!/bin/bash

echo 'This will clean the database and reset it to the initial state.'
echo 'Are you sure you want to proceed? (y/n)'
read -n 1 -s confirm

if [ "$confirm" != "y" ]; then
    echo 'Aborting...'
    exit 1
fi

echo 'Removing migrations...'
rm -rf ./prisma/migrations

echo 'Removing prisma client...'
rm -rf ./node_modules/.prisma

echo "Resetting database..."
yarn prisma db push --force-reset

echo "Creating fresh migration..."
yarn prisma migrate dev --name init

echo 'Generating prisma client...'
yarn prisma generate

echo "Database reset and migration complete!" 