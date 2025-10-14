#!/bin/sh
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Optional: Create superuser if environment variables are provided
if [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Checking for existing superuser..."
  python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
email = "${DJANGO_SUPERUSER_EMAIL}"
if not User.objects.filter(email=email).exists():
    print("Creating Django superuser...")
    User.objects.create_superuser(
        email=email,
        password="${DJANGO_SUPERUSER_PASSWORD}",
        name="${DJANGO_SUPERUSER_NAME:-Admin}",  # ✅ Required field
        age="${DJANGO_SUPERUSER_AGE:-25}",       # ✅ Optional defaults
        bio="${DJANGO_SUPERUSER_BIO:-Superuser created automatically.}"
    )
else:
    print("Superuser already exists.")
END
fi

echo "Starting Gunicorn..."
exec gunicorn blog_app.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3
