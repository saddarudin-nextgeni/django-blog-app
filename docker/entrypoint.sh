#!/bin/sh
set -e

# wait for DB (optional simple wait-loop or use wait-for-it)
# run migrations
python manage.py migrate --noinput


# create superuser if env var set (optional)
# start gunicorn
exec gunicorn blog_app.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3
