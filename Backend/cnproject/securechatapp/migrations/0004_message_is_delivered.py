# Generated by Django 5.2 on 2025-04-29 03:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('securechatapp', '0003_remove_message_is_delivered'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='is_delivered',
            field=models.BooleanField(default=False),
        ),
    ]
