#!/usr/bin/env sh

set -o errexit
set -o nounset

CURDIR=`pwd`

cd "$1" && godog --stop-on-failure e2e.feature

cd ${CURDIR}
