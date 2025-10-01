from celery import shared_task
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from posts.models import Post, Comment
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_comment_notification(self, post_id, comment_id):
    """
    Sends an email to post.author when a new comment is added.
    We pass IDs (not model instances) because Celery tasks should use serializable args.
    """
    try:
        post = get_object_or_404(Post, pk=post_id)
        comment = get_object_or_404(Comment, pk=comment_id)

        subject = f"New comment on your post: {post.title}"
        plain_message = f"{comment.author.email} commented:\n\n{comment.content}"

        recipient = [post.author.email]
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            recipient,
            fail_silently=False
        )
        return {"status": "sent", "post": post_id, "comment": comment_id}
    except Exception as exc:
        logger.exception("Failed to send comment notification")
        # retry with backoff
        raise self.retry(exc=exc)
