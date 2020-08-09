#!/bin/bash
set -e

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		echo >&2 "warn: both $var and $fileVar are set (but are exclusive)"
	fi
	local val="$def"
	if [ "${!fileVar:-}" ]; then
		val="$(< "${!fileVar}")"
	elif [ "${!var:-}" ]; then
		val="${!var}"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

file_env 'MONGO_INITDB_ROOT_USERNAME'
file_env 'MONGO_INITDB_ROOT_PASSWORD'
file_env 'MONGO_USER'
file_env 'MONGO_PASSWORD'
file_env 'SENDGRID_API_KEY'
file_env 'CLOUDINARY_API_KEY'
file_env 'CLOUDINARY_API_SECRET'
file_env 'VIMEO_ACCESS_TOKEN'

exec "$@"
