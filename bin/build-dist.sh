#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply the version as first parameter and the allowed peer versions as second parameter and then at least one module to build/dist"
    exit 1
fi


cd $1

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:3}"
for module in "${ADDR[@]}"
do
    cd $module

    echo =============================================================================================
    echo "VERSIONING BUILDING AND DIST  $module"
    echo =============================================================================================
    case $module in
        ##Examples
        "ag-grid-angular-example"|"ag-grid-react-example"|"ag-grid-aurelia-example"|"ag-grid-vue-example")
            echo =============================================================================================
            echo "MODULE  $module - THIS WILL GET SETUP AT THE END THROUGH release-prepare-examples $1 $2"
            echo =============================================================================================
            cd ..
            continue
    esac

    ## Replace version number
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' bower.json
    sed -i .old -e 's/.*"version".*/  "version": "'$1'",/g' package.json

    case $module in
        ##Examples
        "ag-grid-dev"|"ag-grid-docs")
            echo =============================================================================================
            echo "MODULE  $module - WE ARE DONE WITH THESE ONES FOR THE TIME BEING"
            echo =============================================================================================
            cd ..
            continue
    esac

    case $module in
        ##If it depends on ag-grid ONLY
        "ag-grid-enterprise"|"ag-grid-react"|"ag-grid-aurelia")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'"/g' package.json
            ## Since we are still NOT publishing to npm use the locally generated npm package
            npm install ../ag-grid/ag-grid-$1.tgz
            ;;
        ##If it depends on ag-grid AND OTHERS. THIS CAN BE REFACTORED FOR SURE!
        "ag-grid-angular"|"ag-grid-vue")
            echo =============================================================================================
            echo "ADDING AG-GRID DEPENDENCY TO:  $module"
            echo =============================================================================================
            ## Replace peers version number
            sed -i .old -e 's/.*"ag-grid".*/    "ag-grid": "'$2'",/g' package.json
            ## Since we are still NOT publishing to npm use the locally generated npm package
            npm install ../ag-grid/ag-grid-$1.tgz
            ;;
    esac

    ## Remove backup files from sed
    rm bower.json.old
    rm package.json.old

    cd ../..
    build-module.sh $1 $module
    dist-just-module.sh $1 $module
    if [ $? -ne 0 ]
    then
        echo "Stopping release-just-branch.sh"
        exit 1
    fi
    cd "$1/$module"

    ## After everything is committed generate the NPM local package
    npm pack

    cd ..
done

cd ..
