#!/bin/bash

echo "starting data generation."

if [ ! -d "./data" ]
then
    echo "create new folder ./data"
    mkdir ./data
else
    echo "./data already exists"
fi

node ./scripts/generator/code_data_generator.js 
node ./scripts/generator/calculator_data_generator.js 
node ./scripts/generator/hash_data_generator.js

echo "done."