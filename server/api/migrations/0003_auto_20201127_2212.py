# Generated by Django 3.1.3 on 2020-11-28 01:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_add_poll_type_1'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='poll',
            name='group',
        ),
        migrations.AlterField(
            model_name='option',
            name='poll',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='api.poll'),
        ),
    ]
