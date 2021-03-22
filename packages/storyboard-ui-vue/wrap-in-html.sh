#!/bin/bash

for filename in dist/css/*.css
do
    mkdir -p tmp/$filename
    rm -r tmp/$filename
    touch tmp/$filename
    echo '<style>' > tmp/$filename
    cat $filename >> tmp/$filename
    echo -e '\n</style>' >> tmp/$filename
    cp tmp/$filename $filename.html
    rm -r tmp
    rm $filename
done

for filename in dist/js/*.js
do
    mkdir -p tmp/$filename
    rm -r tmp/$filename
    touch tmp/$filename
    echo '<script>' > tmp/$filename
    cat $filename >> tmp/$filename
    echo -e '\n</script>' >> tmp/$filename
    cp tmp/$filename $filename.html
    rm -r tmp
    rm $filename
done